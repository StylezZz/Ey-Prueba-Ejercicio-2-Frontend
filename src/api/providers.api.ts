/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './axios';
import type { Provider } from '../types/provider';
import type { RiskResponse } from '@/types/risk';

export const getProviders = () => {
    return api.get<Provider[]>("/Providers");
}

export const createProvider = (provider: Omit<Provider, "id" | "lastUpdated">) => {
    return api.post<Provider>("/Providers", provider);
}

export const updateProvider = (id:number, provider: Omit<Provider, "lastUpdated">) => {
    console.log("Update id => ", id);
    console.log("Payload => ", provider);
    const payload = {...provider, id};
    return api.put(`/Providers/${id}`, payload);
}

export const deleteProvider = (id:number) => {
    return api.delete("/Providers/" + id);
}

// Buscar en todas las fuentes
export const runRiskAll = (id: number) => {
    return api.post<RiskResponse>(`/risk/${id}/all`);
}

// Buscar en fuente específica
export const runRiskBySource = (id: number, source: string) => {
    return api.post<RiskResponse>(`/risk/${id}/source/${source}`);
}

// Función helper para ejecutar múltiples búsquedas
export const runRiskMultipleSources = async (id: number, sources: string[]) => {
    try {
        const promises = sources.map(source => runRiskBySource(id, source));
        const responses = await Promise.all(promises);
        
        console.log("Responses received:", responses);
        
        const combinedResult: RiskResponse = {
            entity_name: '',
            total_hits: 0,
            sources: []
        };

        responses.forEach((response, index) => {
            console.log(`Response ${index}:`, response.data);
            
            if (response.data) {
                // { source, query, hits, results, timestamp, message, error }
                const data = response.data as any;
                
                if (data.source && data.results) {
                    combinedResult.total_hits += data.hits || 0;
                    combinedResult.sources.push({
                        source: data.source,
                        hits: data.hits || 0,
                        results: Array.isArray(data.results) ? data.results : []
                    });
                }
                else if (response.data.sources && Array.isArray(response.data.sources)) {
                    combinedResult.total_hits += response.data.total_hits || 0;
                    combinedResult.sources.push(...response.data.sources);
                }
                else if (response.data.sources) {
                    combinedResult.sources.push(response.data.sources);
                }
                else {
                    console.warn(`Response ${index} doesn't have expected format:`, response.data);
                    const sourceName = sources[index];
                    combinedResult.sources.push({
                        source: sourceName,
                        hits: response.data.total_hits || 0,
                        results: []
                    });
                }
            }
        });

        console.log("Combined result:", combinedResult);
        return combinedResult;
    } catch (error) {
        console.error("Error in runRiskMultipleSources:", error);
        throw error;
    }
}