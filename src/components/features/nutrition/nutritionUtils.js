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
    filteredPlans = filteredPlans.filter(
      (plan) =>
        plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply client filter
  if (clientFilter) {
    if (clientFilter === "template") {
      // Show only plans without clients (template plans)
      filteredPlans = filteredPlans.filter((plan) => !plan.client_id);
    } else {
      // Show plans for specific client
      filteredPlans = filteredPlans.filter(
        (plan) =>
          plan.client_id === parseInt(clientFilter) ||
          (plan.client_name &&
            plan.client_name.toLowerCase().includes(clientFilter.toLowerCase()))
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
