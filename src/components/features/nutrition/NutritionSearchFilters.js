import React from "react";
import { Search, X } from "lucide-react";
import { Select, SelectItem, Tabs, Tab } from "@heroui/react";

/**
 * Search and Filter Component for Nutrition Page
 * Handles search, client filtering, sorting, and view mode
 */
const NutritionSearchFilters = ({
  searchTerm,
  setSearchTerm,
  clientFilter,
  setClientFilter,
  clients,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
  onClearFilters,
}) => {
  // Combined sort options
  const sortOptions = [
    { value: "created_at-desc", label: "Newest First" },
    { value: "created_at-asc", label: "Oldest First" },
    { value: "updated_at-desc", label: "Recently Updated" },
    { value: "updated_at-asc", label: "Least Recently Updated" },
    { value: "title-asc", label: "Title A-Z" },
    { value: "title-desc", label: "Title Z-A" },
  ];

  // Handle combined sort change
  const handleSortChange = (value) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
  };

  // Get current sort value
  const currentSortValue = `${sortBy}-${sortOrder}`;

  // Get selected client name for search placeholder
  const selectedClientName =
    clientFilter === "template"
      ? "Non-Client Plans"
      : clientFilter
      ? clients.find((client) => client.id === parseInt(clientFilter))
          ?.first_name +
        " " +
        clients.find((client) => client.id === parseInt(clientFilter))
          ?.last_name
      : null;

  // Generate search placeholder text
  const searchPlaceholder = selectedClientName
    ? `Searching ${selectedClientName}...`
    : "Search by plan name or client...";

  return (
    <div className="p-4 mb-6 flex-shrink-0">
      <div className="flex items-center gap-3 w-full">
        {/* Left Side: Search, Client Select, Clear Button */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4 z-10" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-zinc-800/50 border-0 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-0 transition-all duration-200 text-sm"
            />
          </div>

          {/* Client Filter Dropdown */}
          <Select
            placeholder="All Plans"
            aria-label="Filter nutrition plans by client"
            selectedKeys={clientFilter ? [clientFilter] : []}
            onSelectionChange={(keys) =>
              setClientFilter(Array.from(keys)[0] || "")
            }
            className="w-52"
            size="sm"
            variant="flat"
            renderValue={(items) => {
              if (items.length === 0) return "All Plans";
              if (items[0].key === "template") return "Non-Client Plans";
              const selectedClient = clients.find(
                (client) => client.id.toString() === items[0].key
              );
              return selectedClient
                ? `${selectedClient.first_name} ${selectedClient.last_name}`
                : "All Plans";
            }}
            classNames={{
              trigger:
                "bg-zinc-800/50 border-0 data-[hover=true]:bg-zinc-700/50 h-10",
              value: "text-white text-sm",
              listbox: "bg-zinc-800 text-white",
              popoverContent: "bg-zinc-800 border border-zinc-700",
            }}
          >
            <SelectItem key="" value="" textValue="All Plans">
              All Plans
            </SelectItem>
            <SelectItem
              key="template"
              value="template"
              textValue="Non-Client Plans"
            >
              Non-Client Plans
            </SelectItem>
            {clients.map((client) => (
              <SelectItem
                key={client.id}
                value={client.id.toString()}
                textValue={`${client.first_name} ${client.last_name}`}
              >
                {client.first_name} {client.last_name}
              </SelectItem>
            ))}
          </Select>

          {/* Clear Filters Button - Only show if filters are active */}
          {(searchTerm || clientFilter) && (
            <button
              onClick={onClearFilters}
              className="p-2.5 bg-zinc-800/50 border-0 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 flex items-center justify-center h-10 w-10"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right Side: Sort Dropdown and View Mode Tabs */}
        <div className="flex items-center gap-2">
          {/* Combined Sort Dropdown */}
          <Select
            placeholder="Sort by"
            aria-label="Sort nutrition plans"
            selectedKeys={[currentSortValue]}
            onSelectionChange={(keys) => handleSortChange(Array.from(keys)[0])}
            className="w-52"
            size="sm"
            variant="flat"
            classNames={{
              trigger:
                "bg-zinc-800/50 border-0 data-[hover=true]:bg-zinc-700/50 h-10",
              value: "text-white text-sm",
              listbox: "bg-zinc-800 text-white",
              popoverContent: "bg-zinc-800 border border-zinc-700",
            }}
          >
            {sortOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                textValue={option.label}
              >
                {option.label}
              </SelectItem>
            ))}
          </Select>

          {/* View Mode Tabs */}
          <Tabs
            selectedKey={viewMode}
            onSelectionChange={setViewMode}
            variant="solid"
            color="default"
            size="sm"
            classNames={{
              base: "bg-zinc-800/50 rounded-lg p-0.5 h-10",
              tabList: "gap-0.5 h-full",
              tab: "px-3 py-1.5 h-full",
              tabContent:
                "text-zinc-400 group-data-[selected=true]:text-white text-xs font-medium",
              cursor: "bg-zinc-600",
            }}
          >
            <Tab key="list" title="List" />
            <Tab key="grid" title="Grid" />
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NutritionSearchFilters;
