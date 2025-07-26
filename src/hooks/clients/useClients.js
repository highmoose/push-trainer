import { useState, useEffect, useCallback } from "react";
import useFetchClients from "./useFetchClients";
import useCreateClient from "./useCreateClient";
import useUpdateClient from "./useUpdateClient";
import useDeleteClient from "./useDeleteClient";
import useInviteClient from "./useInviteClient";
import useGetClient from "./useGetClient";

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
        // Ensure clients remains an array even on error
        if (!Array.isArray(clients)) {
          setClients([]);
        }
      }

      setLoading(false);
      return result;
    },
    [fetchAction, clients]
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
      setClients((prev) => [optimisticClient, ...prev]);
      setCacheItem([optimisticClient, ...clients]);

      const result = await createAction.execute(clientData);

      if (result.success) {
        // Replace optimistic with real data
        setClients((prev) =>
          prev.map((client) =>
            client.id === optimisticClient.id ? result.data : client
          )
        );
        setCacheItem(
          clients.map((client) =>
            client.id === optimisticClient.id ? result.data : client
          )
        );
        triggerGlobalRefresh();
      } else {
        // Revert optimistic update
        setClients((prev) =>
          prev.filter((client) => client.id !== optimisticClient.id)
        );
        setCacheItem(
          clients.filter((client) => client.id !== optimisticClient.id)
        );
      }

      return result;
    },
    [createAction, clients]
  );

  // Update client with optimistic update
  const updateClient = useCallback(
    async (clientId, updates) => {
      // Optimistic update
      const originalClients = [...clients];
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId
            ? { ...client, ...updates, pending: true }
            : client
        )
      );

      const result = await updateAction.execute(clientId, updates);

      if (result.success) {
        setClients((prev) =>
          prev.map((client) =>
            client.id === clientId ? { ...result.data, pending: false } : client
          )
        );
        setCacheItem(
          clients.map((client) =>
            client.id === clientId ? { ...result.data, pending: false } : client
          )
        );
        triggerGlobalRefresh();
      } else {
        // Revert optimistic update
        setClients(originalClients);
        setCacheItem(originalClients);
      }

      return result;
    },
    [updateAction, clients]
  );

  // Delete client with optimistic update
  const deleteClient = useCallback(
    async (clientId) => {
      // Optimistic update
      const originalClients = [...clients];
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId ? { ...client, deleting: true } : client
        )
      );

      const result = await deleteAction.execute(clientId);

      if (result.success) {
        setClients((prev) => prev.filter((client) => client.id !== clientId));
        setCacheItem(clients.filter((client) => client.id !== clientId));
        triggerGlobalRefresh();
      } else {
        // Revert optimistic update
        setClients(originalClients);
        setCacheItem(originalClients);
      }

      return result;
    },
    [deleteAction, clients]
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
      // First check if client is in local state
      const localClient = clients.find((c) => c.id === clientId);
      if (localClient && !localClient.pending) {
        return { success: true, data: localClient };
      }

      // If not found or pending, fetch from server
      return getAction.execute(clientId);
    },
    [getAction, clients]
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
      (id) => clients.find((c) => c.id === id),
      [clients]
    ),
    getClientCount: useCallback(() => clients.length, [clients]),
  };
};
