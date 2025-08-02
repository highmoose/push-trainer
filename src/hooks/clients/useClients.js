import { useState, useEffect, useCallback } from "react";
import useFetchClients from "./api/useFetchClients";
import useCreateClient from "./api/useCreateClient";
import useUpdateClient from "./api/useUpdateClient";
import useDeleteClient from "./api/useDeleteClient";
import useInviteClient from "./api/useInviteClient";
import useGetClient from "./api/useGetClient";

// Global cache for clients with optimistic updates
const clientsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Global refresh trigger
let globalRefreshTrigger = 0;
const refreshListeners = new Set();

const triggerGlobalRefresh = () => {
  globalRefreshTrigger++;
  refreshListeners.forEach((listener) => listener(globalRefreshTrigger));
};

export const useClients = () => {
  // State management
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Individual action hooks
  const fetchAction = useFetchClients();
  const createAction = useCreateClient();
  const updateAction = useUpdateClient();
  const deleteAction = useDeleteClient();
  const inviteAction = useInviteClient();
  const getAction = useGetClient();

  // Cache management
  const getCacheKey = () => "clients";
  const isCacheValid = (cacheItem) => {
    return cacheItem && Date.now() - cacheItem.timestamp < CACHE_DURATION;
  };

  const setCacheItem = (data) => {
    clientsCache.set(getCacheKey(), {
      data,
      timestamp: Date.now(),
    });
  };

  // Fetch clients
  const fetchClients = useCallback(
    async (forceRefresh = false) => {
      const cacheKey = getCacheKey();
      const cached = clientsCache.get(cacheKey);

      if (!forceRefresh && isCacheValid(cached)) {
        setClients(cached.data);
        return { success: true, data: cached.data };
      }

      setLoading(true);
      const result = await fetchAction.execute();

      if (result.success) {
        // Ensure result.data is always an array
        const clientsData = Array.isArray(result.data) ? result.data : [];
        setClients(clientsData);
        setCacheItem(clientsData);
        setError(null);
      } else {
        setError(result.error);
        // Use functional update to avoid dependency on clients
        setClients((prev) => (Array.isArray(prev) ? prev : []));
      }

      setLoading(false);
      return result;
    },
    [fetchAction] // Remove 'clients' from dependency array to prevent infinite loop
  );

  // Add client with optimistic update
  const addClient = useCallback(
    async (clientData) => {
      const optimisticClient = {
        id: `temp_${Date.now()}`,
        ...clientData,
        pending: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistic update
      setClients((prev) => {
        const updated = [optimisticClient, ...prev];
        setCacheItem(updated);
        return updated;
      });

      const result = await createAction.execute(clientData);

      if (result.success) {
        // Replace optimistic with real data
        setClients((prev) => {
          const updated = prev.map((client) =>
            client.id === optimisticClient.id ? result.data : client
          );
          setCacheItem(updated);
          return updated;
        });
        triggerGlobalRefresh();
      } else {
        // Revert optimistic update
        setClients((prev) => {
          const filtered = prev.filter(
            (client) => client.id !== optimisticClient.id
          );
          setCacheItem(filtered);
          return filtered;
        });
      }

      return result;
    },
    [createAction] // Remove 'clients' from dependency array to prevent infinite loop
  );

  // Update client with optimistic update
  const updateClient = useCallback(
    async (clientId, updates) => {
      // Store original for rollback
      let originalClients = [];

      // Optimistic update
      setClients((prev) => {
        originalClients = [...prev];
        return prev.map((client) =>
          client.id === clientId
            ? { ...client, ...updates, pending: true }
            : client
        );
      });

      const result = await updateAction.execute(clientId, updates);

      if (result.success) {
        setClients((prev) => {
          const updated = prev.map((client) =>
            client.id === clientId ? { ...result.data, pending: false } : client
          );
          setCacheItem(updated);
          return updated;
        });
        triggerGlobalRefresh();
      } else {
        // Revert optimistic update
        setClients(originalClients);
        setCacheItem(originalClients);
      }

      return result;
    },
    [updateAction] // Remove 'clients' from dependency array to prevent infinite loop
  );

  // Delete client with optimistic update
  const deleteClient = useCallback(
    async (clientId) => {
      // Store original for rollback
      let originalClients = [];

      // Optimistic update
      setClients((prev) => {
        originalClients = [...prev];
        return prev.map((client) =>
          client.id === clientId ? { ...client, deleting: true } : client
        );
      });

      const result = await deleteAction.execute(clientId);

      if (result.success) {
        setClients((prev) => {
          const filtered = prev.filter((client) => client.id !== clientId);
          setCacheItem(filtered);
          return filtered;
        });
        triggerGlobalRefresh();
      } else {
        // Revert optimistic update
        setClients(originalClients);
        setCacheItem(originalClients);
      }

      return result;
    },
    [deleteAction] // Remove 'clients' from dependency array to prevent infinite loop
  );

  // Invite client
  const inviteClient = useCallback(
    async (inviteData) => {
      return inviteAction.execute(inviteData);
    },
    [inviteAction]
  );

  // Get specific client
  const getClient = useCallback(
    async (clientId) => {
      // Use functional approach to check current state
      let localClient = null;
      setClients((prev) => {
        localClient = prev.find((c) => c.id === clientId);
        return prev; // Don't actually update state
      });

      if (localClient && !localClient.pending) {
        return { success: true, data: localClient };
      }

      // If not found or pending, fetch from server
      return getAction.execute(clientId);
    },
    [getAction] // Remove 'clients' from dependency array to prevent infinite loop
  );

  // Global refresh listener
  useEffect(() => {
    const handleRefresh = (trigger) => {
      setRefreshTrigger(trigger);
    };

    refreshListeners.add(handleRefresh);
    return () => refreshListeners.delete(handleRefresh);
  }, []);

  // Refresh data when global trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchClients(true);
    }
  }, [refreshTrigger, fetchClients]);

  // Initial load
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading:
      loading ||
      fetchAction.loading ||
      createAction.loading ||
      updateAction.loading ||
      deleteAction.loading,
    error:
      error ||
      fetchAction.error ||
      createAction.error ||
      updateAction.error ||
      deleteAction.error,
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    inviteClient,
    getClient,
    // Helper methods
    getClientById: useCallback(
      (id) => {
        let foundClient = null;
        setClients((prev) => {
          foundClient = prev.find((c) => c.id === id);
          return prev;
        });
        return foundClient;
      },
      [] // Remove 'clients' from dependency array
    ),
    getClientCount: useCallback(() => {
      let count = 0;
      setClients((prev) => {
        count = prev.length;
        return prev;
      });
      return count;
    }, []), // Remove 'clients' from dependency array,
  };
};
