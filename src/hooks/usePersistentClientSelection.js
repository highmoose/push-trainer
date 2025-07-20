import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "selectedClientId";

export const usePersistentClientSelection = (clients = []) => {
  const [selectedClient, setSelectedClientState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved client selection from localStorage
  useEffect(() => {
    if (typeof window === "undefined" || clients.length === 0) return;

    try {
      const savedClientId = localStorage.getItem(STORAGE_KEY);

      if (savedClientId) {
        const savedClient = clients.find(
          (client) => String(client.id) === String(savedClientId)
        );

        if (savedClient) {
          setSelectedClientState(savedClient);
          setIsInitialized(true);
          return;
        } else {
          // If saved client no longer exists, clear the stored ID
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      // If no saved client or saved client doesn't exist, select first available
      if (clients.length > 0) {
        setSelectedClientState(clients[0]);
        localStorage.setItem(STORAGE_KEY, String(clients[0].id));
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading saved client selection:", error);
      // Fallback to first client if localStorage fails
      if (clients.length > 0) {
        setSelectedClientState(clients[0]);
      }
      setIsInitialized(true);
    }
  }, [clients]);

  // Set selected client with persistence
  const setSelectedClient = useCallback((client) => {
    if (!client) {
      setSelectedClientState(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      return;
    }

    try {
      setSelectedClientState(client);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, String(client.id));
      }
    } catch (error) {
      console.error("Error saving client selection:", error);
      // Still set the state even if localStorage fails
      setSelectedClientState(client);
    }
  }, []);

  // Clear selection (useful for cleanup or logout)
  const clearSelection = useCallback(() => {
    setSelectedClientState(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing client selection:", error);
      }
    }
  }, []);

  return {
    selectedClient,
    setSelectedClient,
    clearSelection,
    isInitialized, // Useful to prevent premature rendering
  };
};

// Export a utility function to clear client selection from anywhere in the app
export const clearStoredClientSelection = () => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing stored client selection:", error);
    }
  }
};
