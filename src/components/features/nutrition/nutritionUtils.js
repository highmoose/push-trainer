/**
 * Utility functions for Nutrition components
 */

/**
 * Filter and sort nutrition plans based on search term, client filter, and sort options
 */
export const filterAndSortPlans = (
  plans,
  searchTerm,
  clientFilter,
  sortBy,
  sortOrder
) => {
  let filteredPlans = [...plans];

  // Apply search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredPlans = filteredPlans.filter((plan) => {
      // Search in plan title
      const titleMatch = plan.title?.toLowerCase().includes(searchLower);

      // Search in assigned client names
      const clientMatch = plan.assigned_clients?.some((client) =>
        client.name?.toLowerCase().includes(searchLower)
      );

      // Also check legacy client_name field for backward compatibility
      const legacyClientMatch = plan.client_name
        ?.toLowerCase()
        .includes(searchLower);

      return titleMatch || clientMatch || legacyClientMatch;
    });
  }

  // Apply client filter
  if (clientFilter) {
    if (clientFilter === "template") {
      // Show only plans without assigned clients (template plans)
      filteredPlans = filteredPlans.filter(
        (plan) => !plan.assigned_clients || plan.assigned_clients.length === 0
      );
    } else {
      // Show plans assigned to specific client
      const targetClientId = parseInt(clientFilter);
      filteredPlans = filteredPlans.filter(
        (plan) =>
          plan.assigned_clients &&
          plan.assigned_clients.some((client) => client.id === targetClientId)
      );
    }
  }

  // Sort plans (create a copy to avoid mutating read-only array)
  filteredPlans = [...filteredPlans].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === "created_at" || sortBy === "updated_at") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return filteredPlans;
};

/**
 * Clear all filters and reset to default state
 */
export const clearAllFilters = (
  setSearchTerm,
  setClientFilter,
  setSortBy,
  setSortOrder
) => {
  setSearchTerm("");
  setClientFilter("");
  setSortBy("created_at");
  setSortOrder("desc");
};

/**
 * Check if any filters are currently active
 */
export const hasActiveFilters = (searchTerm, clientFilter) => {
  return Boolean(searchTerm || clientFilter);
};

/**
 * Get display name for selected client filter
 */
export const getSelectedClientName = (clientFilter, clients) => {
  if (clientFilter === "template") {
    return "Non-Client Plans";
  }

  if (clientFilter) {
    const selectedClient = clients.find(
      (client) => client.id === parseInt(clientFilter)
    );
    return selectedClient
      ? `${selectedClient.first_name} ${selectedClient.last_name}`
      : null;
  }

  return null;
};

/**
 * Generate search placeholder text based on current filters
 */
export const getSearchPlaceholder = (clientFilter, clients) => {
  const selectedClientName = getSelectedClientName(clientFilter, clients);
  return selectedClientName
    ? `Searching ${selectedClientName}...`
    : "Search by plan name or client...";
};
