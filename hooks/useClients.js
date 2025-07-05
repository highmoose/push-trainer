import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/clients");
      setClients(response.data || []);
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
    setClients((prev) => [...prev, tempClient]);

    try {
      const response = await axios.post("/api/clients", clientData);
      const newClient = response.data;

      // Replace temporary client with real data
      setClients((prev) =>
        prev.map((client) => (client.id === tempId ? newClient : client))
      );

      return newClient;
    } catch (err) {
      // Remove temporary client on error
      setClients((prev) => prev.filter((client) => client.id !== tempId));
      setError(err.response?.data?.message || "Failed to add client");
      throw err;
    }
  }, []);

  const updateClient = useCallback(
    async (clientId, updates) => {
      // Store previous state for rollback
      const previousClients = clients;

      // Optimistic update
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId
            ? { ...client, ...updates, pending: true }
            : client
        )
      );

      try {
        const response = await axios.put(`/api/clients/${clientId}`, updates);
        const updatedClient = response.data;

        // Update with server response
        setClients((prev) =>
          prev.map((client) =>
            client.id === clientId
              ? { ...updatedClient, pending: false }
              : client
          )
        );

        return updatedClient;
      } catch (err) {
        // Rollback on error
        setClients(previousClients);
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
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId ? { ...client, deleting: true } : client
        )
      );

      try {
        await axios.delete(`/api/clients/${clientId}`);

        // Remove client from list
        setClients((prev) => prev.filter((client) => client.id !== clientId));
      } catch (err) {
        // Rollback on error
        setClients(previousClients);
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
  // Auto-fetch on mount - only once
  useEffect(() => {
    fetchClients();
  }, []); // Empty dependency array to run only once on mount

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
