/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RiskSourceResult{
    source: string;
    hits: number;
    results: any[];
}

export interface RiskResponse{
    entity_name: string;
    total_hits: number;
    sources: RiskSourceResult[];
}