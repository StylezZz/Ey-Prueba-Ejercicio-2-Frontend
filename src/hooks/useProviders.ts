import { useEffect, useState } from "react";
import type { Provider } from "../types/provider";
import {
    getProviders,
    createProvider,
    updateProvider,
    deleteProvider,
} from "../api/providers.api"

export default function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProviders = async () => {
    console.log("Cargando proveedores...");
    setLoading(true);
    try {
      const res = await getProviders();
      const sortedProviders = res.data.sort((a,b)=>{
        const dateA = new Date(a.lastUpdated).getTime();
        const dateB = new Date(b.lastUpdated).getTime();
        return dateB - dateA;
      });
      setProviders(sortedProviders);
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setLoading(false);
    }
  };

    const addProvider = async (provider: Omit<Provider, "id" | "lastUpdated">) => {
        await createProvider(provider);
        await loadProviders();
    };

    const editProvider = async (id: number, provider: Omit<Provider, "id" | "lastUpdated">) => {
        await updateProvider(id, provider);
        await loadProviders();
    };

    const removeProvider = async (id: number) => {
        await deleteProvider(id);
        await loadProviders();
    };

    useEffect(() => {
        loadProviders();
    }, []);

    return {
        providers,
        loading,
        addProvider,
        editProvider,
        removeProvider,
    };
}