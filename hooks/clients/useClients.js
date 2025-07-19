import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

// Global cache for clients
const clientsCache = new Map();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes
const CACHE_KEY = "all_clients";

// Cache management utilities
const isCacheValid = (key) => {
  const cacheItem = clientsCache.get(key);
  return cacheItem && Date.now() - cacheItem.timestamp < CACHE_DURATION;
};

const setCacheItem = (key, data) => {
  clientsCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

const getCacheItem = (key) => {
  const cacheItem = clientsCache.get(key);
  return isCacheValid(key) ? cacheItem.data : null;
};

const clearCache = () => {
  clientsCache.clear();
};

// Make cache clearing available globally
if (typeof window !== "undefined") {
  window.clearClientsCache = clearCache;
}

// Global refresh system
let globalRefreshTrigger = 0;
const refreshListeners = new Set();

const triggerGlobalRefresh = () => {
  globalRefreshTrigger++;
  refreshListeners.forEach((listener) => listener(globalRefreshTrigger));
};

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchClients = useCallback(async (forceRefresh = false) => {
    const CACHE_KEY = "all_clients";

    // Check cache first unless forced refresh
    if (!forceRefresh) {
      const cachedClients = getCacheItem(CACHE_KEY);
      if (cachedClients) {
        setClients(cachedClients);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/trainer/clients");
      const clientsData = response.data.clients || [];
      setClients(clientsData);
      setCacheItem(CACHE_KEY, clientsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  }, []);

  const addClient = useCallback(async (clientData) => {
    // Generate temporary ID for optimistic update
    const tempId = `temp_${Date.now()}`;
    const tempClient = { ...clientData, id: tempId, pending: true };

    // Optimistic update
    setClients((prev) => {
      const newClients = [...prev, tempClient];
      setCacheItem("all_clients", newClients);
      return newClients;
    });

    try {
      const response = await axios.post("/api/trainer/clients", clientData);
      const newClient = response.data;

      // Replace temporary client with real data
      setClients((prev) => {
        const updatedClients = prev.map((client) =>
          client.id === tempId ? newClient : client
        );
        setCacheItem("all_clients", updatedClients);
        return updatedClients;
      });

      // Trigger global refresh for all hook instances
      triggerGlobalRefresh();

      return newClient;
    } catch (err) {
      // Remove temporary client on error
      setClients((prev) => {
        const revertedClients = prev.filter((client) => client.id !== tempId);
        setCacheItem("all_clients", revertedClients);
        return revertedClients;
      });
      setError(err.response?.data?.message || "Failed to add client");
      throw err;
    }
  }, []);

  const updateClient = useCallback(
    async (clientId, updates) => {
      // Store previous state for rollback
      const previousClients = clients;

      // Optimistic update
      setClients((prev) => {
        const updatedClients = prev.map((client) =>
          client.id === clientId
            ? { ...client, ...updates, pending: true }
            : client
        );
        setCacheItem(CACHE_KEY, updatedClients);
        return updatedClients;
      });

      try {
        const response = await axios.put(
          `/api/trainer/clients/${clientId}`,
          updates
        );
        const updatedClient = response.data;

        // Update with server response
        setClients((prev) => {
          const updatedClients = prev.map((client) =>
            client.id === clientId
              ? { ...updatedClient, pending: false }
              : client
          );
          setCacheItem(CACHE_KEY, updatedClients);
          return updatedClients;
        });

        // Trigger global refresh for all hook instances
        triggerGlobalRefresh();

        return updatedClient;
      } catch (err) {
        // Rollback on error
        setClients(previousClients);
        setCacheItem(CACHE_KEY, previousClients);
        setError(err.response?.data?.message || "Failed to update client");
        throw err;
      }
    },
    [clients]
  );

  const deleteClient = useCallback(
    async (clientId) => {
      // Store previous state for rollback
      const previousClients = clients;

      // Optimistic update - mark as deleting
      setClients((prev) => {
        const updatedClients = prev.map((client) =>
          client.id === clientId ? { ...client, deleting: true } : client
        );
        setCacheItem(CACHE_KEY, updatedClients);
        return updatedClients;
      });

      try {
        await axios.delete(`/api/trainer/clients/${clientId}`);

        // Remove client from list
        setClients((prev) => {
          const updatedClients = prev.filter(
            (client) => client.id !== clientId
          );
          setCacheItem(CACHE_KEY, updatedClients);
          return updatedClients;
        });

        // Trigger global refresh for all hook instances
        triggerGlobalRefresh();
      } catch (err) {
        // Rollback on error
        setClients(previousClients);
        setCacheItem(CACHE_KEY, previousClients);
        setError(err.response?.data?.message || "Failed to delete client");
        throw err;
      }
    },
    [clients]
  );

  const inviteClient = useCallback(async (inviteData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/invite-client", inviteData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to invite client");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount with cache loading
  useEffect(() => {
    // Load from cache first
    const cachedData = getCacheItem(CACHE_KEY);
    if (cachedData) {
      setClients(cachedData);
      // Still fetch fresh data if cache is expired
      if (!isCacheValid(CACHE_KEY)) {
        fetchClients();
      }
    } else {
      fetchClients();
    }
  }, [fetchClients]);

  // Global refresh listener
  useEffect(() => {
    const handleGlobalRefresh = () => {
      const cachedData = getCacheItem(CACHE_KEY);
      if (cachedData) {
        setClients(cachedData);
      }
    };

    window.addEventListener("clientsGlobalRefresh", handleGlobalRefresh);
    return () => {
      window.removeEventListener("clientsGlobalRefresh", handleGlobalRefresh);
    };
  }, []);

  return {
    clients,
    loading,
    error,
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    inviteClient,
    // Helper methods
    getClient: useCallback((id) => clients.find((c) => c.id === id), [clients]),
    getClientCount: useCallback(() => clients.length, [clients]),
  };
};
