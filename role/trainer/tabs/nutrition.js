"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useClients } from "@/hooks/clients";
import { useDietPlans } from "@/hooks/diet";
import {
  ChefHat,
  Search,
  Plus,
  User,
  Calendar,
  Target,
  Utensils,
  Zap,
  X,
} from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  CreatePlanModal,
  PlanDetailsModal,
} from "@/components/trainer/nutrition";
import { DataTable } from "@/components/common/tables";
import Button from "@/components/common/button";
import {
  Input,
  Tabs,
  Tab,
  AvatarGroup,
  Avatar,
  Select,
  SelectItem,
} from "@heroui/react";
import Image from "next/image";
import { Group } from "@visx/group";
import { LinePath, AreaClosed } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { LinearGradient } from "@visx/gradient";
import { curveMonotoneX } from "@visx/curve";

// VSX Chart Component for Calorie Distribution
const VSXCalorieChart = ({
  data,
  width = 140,
  height = 50,
  color = "#4BB760",
  chartId = "default",
}) => {
  if (!data || data.length === 0) return null;

  const maxCalories = Math.max(...data.map((d) => d.calories));
  const minCalories = Math.min(...data.map((d) => d.calories));

  const xScale = scaleLinear({
    domain: [0, data.length - 1],
    range: [10, width - 10],
  });

  const yScale = scaleLinear({
    domain: [minCalories * 0.9, maxCalories * 1.1],
    range: [height - 10, 10],
  });

  const points = data.map((d, i) => ({
    x: xScale(i),
    y: yScale(d.calories),
  }));

  const gradientId = `area-gradient-${chartId}`;

  return (
    <div className="flex items-center justify-center">
      <svg width={width} height={height}>
        <defs>
          <LinearGradient
            id={gradientId}
            from={color}
            to={color}
            fromOpacity={0.3}
            toOpacity={0}
          />
        </defs>
        <Group>
          {/* Area with gradient */}
          <AreaClosed
            data={points}
            x={(d) => d.x}
            y={(d) => d.y}
            yScale={yScale}
            fill={`url(#${gradientId})`}
            curve={curveMonotoneX}
          />
          {/* Smooth line */}
          <LinePath
            data={points}
            x={(d) => d.x}
            y={(d) => d.y}
            stroke={color}
            strokeWidth={2}
            fill="none"
            curve={curveMonotoneX}
          />
        </Group>
      </svg>
    </div>
  );
};

export default function Nutrition() {
  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    fetchClients,
  } = useClients();
  const {
    dietPlans,
    loading: dietPlansLoading,
    error: dietPlansError,
    generateDietPlan,
    createDietPlan,
    updateDietPlan,
    deleteDietPlan,
    fetchDietPlans,
    fetchPlanDetails,
  } = useDietPlans();

  // Use real diet plans data only
  const activeDietPlans = dietPlans;

  // State
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [clientFilter, setClientFilter] = useState(""); // Client filter state
  const [viewMode, setViewMode] = useState("list"); // View mode state

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlanDetailModal, setShowPlanDetailModal] = useState(false);
  const [planDetails, setPlanDetails] = useState(null);

  console.log("Plan Details:", planDetails);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  // Quick plan name input state
  const [quickPlanName, setQuickPlanName] = useState("");

  // Table column definitions
  const tableColumns = [
    {
      key: "name",
      label: "Plan",
      icon: ChefHat,
      className: "w-1/4", // Increased from 20% to 25% of width
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-500/20 to-zinc-600/20 flex items-center justify-center border border-zinc-600/30">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                row.title || "Plan"
              )}&size=40&background=random&color=fff&format=svg`}
              alt="Plan"
              className="w-8 h-8 rounded-full"
            />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-white flex items-center gap-2">
              <span className="truncate">{row.title}</span>
              {row.is_generating && (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-400 font-normal bg-zinc-500/10 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse"></div>
                  Creating Nutrition Plan
                </span>
              )}
              {row.has_error && (
                <span className="inline-flex items-center gap-1 text-xs text-red-400 font-normal bg-red-500/10 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  Something went wrong
                </span>
              )}
            </div>
            <div className="text-sm text-zinc-400 truncate">
              {row.client_name || ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "calories",
      label: "Calories & Distribution",
      icon: Zap,
      className: "w-1/4", // 25% of width for the main content
      render: (value, row) => {
        if (row.is_generating) {
          return (
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
              Calculating...
            </div>
          );
        }

        if (row.has_error) {
          return (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <span>Error generating plan</span>
            </div>
          );
        }

        // Use only structured data from dietPlans hook
        let calories = { daily: 0, range: "N/A" };

        // Check if we have total_calories or custom_calories from the hook data
        if (row.custom_calories && row.custom_calories > 0) {
          // Use custom calories if set
          const dailyCalories = parseInt(row.custom_calories);
          calories = {
            daily: dailyCalories,
            range: `${Math.round(dailyCalories * 0.9)}-${Math.round(
              dailyCalories * 1.1
            )}`,
          };
        } else if (row.total_calories && row.total_calories > 0) {
          // Use calculated total calories
          const dailyCalories = parseInt(row.total_calories);
          calories = {
            daily: dailyCalories,
            range: `${Math.round(dailyCalories * 0.9)}-${Math.round(
              dailyCalories * 1.1
            )}`,
          };
        } else {
          // No calorie data available
          calories = { daily: 0, range: "N/A" };
        }

        // Get chart data
        const chartData = createCalorieChartData(row);

        return (
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-white font-semibold text-lg">
                {calories.daily > 0 ? calories.daily.toLocaleString() : "N/A"}{" "}
                cal
              </div>
            </div>
            {chartData && (
              <div className="flex-shrink-0">
                <VSXCalorieChart
                  data={chartData}
                  width={190}
                  height={56}
                  chartId={`chart-${
                    row.id ||
                    row.title?.replace(/\s+/g, "-").toLowerCase() ||
                    "default"
                  }`}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "macros",
      label: "Macros",
      icon: Target,
      className: "w-1/6", // ~16.7% of width
      render: (value, row) => {
        if (row.is_generating) {
          return (
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
              Calculating...
            </div>
          );
        }

        // Calculate macros from items data only
        let macros = { protein: "N/A", carbs: "N/A", fats: "N/A" };

        if (row.items && Array.isArray(row.items) && row.items.length > 0) {
          // Sum up macros from all meal items
          const totals = row.items.reduce(
            (acc, item) => ({
              protein: acc.protein + (parseFloat(item.protein) || 0),
              carbs: acc.carbs + (parseFloat(item.carbs) || 0),
              fats: acc.fats + (parseFloat(item.fats) || 0),
            }),
            { protein: 0, carbs: 0, fats: 0 }
          );

          macros = {
            protein:
              totals.protein > 0 ? `${Math.round(totals.protein)}g` : "N/A",
            carbs: totals.carbs > 0 ? `${Math.round(totals.carbs)}g` : "N/A",
            fats: totals.fats > 0 ? `${Math.round(totals.fats)}g` : "N/A",
          };
        }

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-zinc-400">P: {macros.protein}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-zinc-400">C: {macros.carbs}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-zinc-400">F: {macros.fats}</span>
              </div>
            </div>
            <div className="text-xs text-zinc-500 capitalize">
              {row.plan_type?.replace("_", " ")}
            </div>
          </div>
        );
      },
    },
    {
      key: "meals_per_day",
      label: "Meals",
      icon: Utensils,
      className: "w-1/12", // ~8.3% of width
      render: (value, row) => {
        if (row.is_generating) {
          return (
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          );
        }
        return (
          <div className="flex justify-start">
            <div className="text-white font-semibold bg-zinc-500/20 px-2 py-1 rounded-full text-sm w-fit">
              {value || 3}
            </div>
          </div>
        );
      },
    },
    {
      key: "created_at",
      label: "Created",
      icon: Calendar,
      className: "w-1/6", // ~16.7% of width
      render: (value, row) => {
        if (row.is_generating) {
          return (
            <div className="text-sm">
              <div className="text-white font-medium">Just now</div>
              <div className="text-zinc-400 text-xs flex items-center gap-1">
                <div className="w-2 h-2 border border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </div>
            </div>
          );
        }
        return (
          <div className="text-sm">
            <div className="text-white font-medium">
              {new Date(value).toLocaleDateString()}
            </div>
            <div className="text-zinc-400 text-xs">
              {new Date(value).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      },
    },
    {
      key: "client_name",
      label: "Assigned to",
      icon: User,
      className: "w-1/6", // ~16.7% of width
      render: (value, row) => {
        if (row.is_generating) {
          return (
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 border border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          );
        }

        if (row.has_error) {
          return (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <span>—</span>
            </div>
          );
        }

        // For now, we'll show a single assigned user and placeholder for multiple assignments
        // In the future, this could be enhanced to show multiple assigned users
        const assignedUsers = [
          {
            id: row.client_id || 1,
            name: value || "Generic",
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              value || "Generic"
            )}&size=32&background=random&color=fff&format=svg`,
          },
        ];

        if (assignedUsers.length === 1) {
          return (
            <div className="flex items-center gap-2">
              <Avatar
                src={assignedUsers[0].avatar}
                alt={assignedUsers[0].name}
                size="sm"
                className="w-6 h-6"
              />
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <AvatarGroup
              isBordered
              max={3}
              size="sm"
              classNames={{
                base: "gap-2",
                count: "text-xs bg-zinc-700 text-zinc-300",
              }}
            >
              {assignedUsers.map((user) => (
                <Avatar
                  key={user.id}
                  src={user.avatar}
                  alt={user.name}
                  size="sm"
                  className="w-6 h-6"
                />
              ))}
            </AvatarGroup>
            {assignedUsers.length > 3 && (
              <span className="text-zinc-400 text-xs">
                +{assignedUsers.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  // Display plans - show all plans by default, apply filters
  const displayPlans = useMemo(() => {
    let plans = [...activeDietPlans];

    // Apply search filter
    if (searchTerm) {
      plans = plans.filter(
        (plan) =>
          plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply client filter
    if (clientFilter) {
      if (clientFilter === "template") {
        // Show only plans without clients (template plans)
        plans = plans.filter((plan) => !plan.client_id);
      } else {
        // Show plans for specific client
        plans = plans.filter(
          (plan) =>
            plan.client_id === parseInt(clientFilter) ||
            (plan.client_name &&
              plan.client_name
                .toLowerCase()
                .includes(clientFilter.toLowerCase()))
        );
      }
    }

    // Sort plans (create a copy to avoid mutating read-only array)
    plans = [...plans].sort((a, b) => {
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

    return plans;
  }, [activeDietPlans, searchTerm, sortBy, sortOrder, clientFilter]);

  // Initialize with first client if available (removed dependency on showAllPlans)
  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      setSelectedClient(clients[0]);
    }
  }, [clients, selectedClient]);
  // Fetch data on mount
  useEffect(() => {
    fetchClients();
    fetchDietPlans();
  }, [fetchClients, fetchDietPlans]);

  // View plan details
  const handleViewPlanDetails = async (plan) => {
    // Don't allow viewing details of plans that are still generating or have errors
    if (plan.is_generating || plan.has_error) {
      return;
    }

    console.log("=== View Plan Details Debug ===");
    console.log("Initial plan data:", plan);

    try {
      // Fetch full plan details from API which includes client_metrics
      const fullPlanDetails = await fetchPlanDetails(plan.id);
      console.log("Full plan details from API:", fullPlanDetails);
      console.log("Client metrics:", fullPlanDetails.client_metrics);

      setPlanDetails(fullPlanDetails);
      setShowPlanDetailModal(true);
    } catch (error) {
      console.error("Failed to fetch plan details:", error);
      // Fallback to using the plan data we have
      setPlanDetails(plan);
      setShowPlanDetailModal(true);
    }
  };

  // Simple handler to trigger generation using optimistic updates
  const handleGeneratePlan = async (planData) => {
    // Close modal immediately
    setShowCreateModal(false);

    try {
      // The generateDietPlan function will handle optimistic updates
      // Pass the clientName to the hook for proper display
      const result = await generateDietPlan({
        ...planData.dietPlanRequest,
        clientName: planData.clientName,
      });
      console.log("Diet plan generated successfully:", result);
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Failed to generate diet plan. Please try again.");
    }
  };

  // Handle delete plan confirmation
  const handleDeletePlan = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };
  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!planToDelete) return;

    try {
      await deleteDietPlan(planToDelete.id);
      console.log("Diet plan deleted successfully:", planToDelete.id);

      // Close modal and reset state
      setShowDeleteModal(false);
      setPlanToDelete(null);

      // Hook handles refresh automatically
    } catch (error) {
      console.error("Error deleting diet plan:", error);
      // Handle error appropriately - maybe show a toast notification
    }
  };

  // Handle cancel deletion
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  // Helper function to create chart data from meal plan items
  const createCalorieChartData = (row) => {
    try {
      // Use items from the hook data instead of AI response
      if (!row.items || !Array.isArray(row.items) || row.items.length === 0) {
        return null;
      }

      // Sort by meal order and create chart data
      const sortedMeals = row.items.sort(
        (a, b) => (a.meal_order || 0) - (b.meal_order || 0)
      );
      return sortedMeals.map((meal, index) => ({
        name: meal.meal_type || meal.meal_name || `Meal ${index + 1}`,
        calories: meal.calories || 0,
        index: index + 1,
      }));
    } catch (error) {
      console.error("Error creating chart data from items:", error);
      return null;
    }
  };

  // Clear/reset all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setClientFilter("");
    setSortBy("created_at");
    setSortOrder("desc");
  };

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

  return (
    <>
      <div className="relative h-screen flex flex-col bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white overflow-hidden rounded">
        {/* Subtle background pattern */}

        {/* Hero Section */}
        <div className="flex items-center justify-center min-h-[40vh] w-full z-10 px-8">
          <div className="flex flex-col gap-8 mx-auto justify-center items-center text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3  rounded-full">
                  <ChefHat className="h-20 w-20 text-white" />
                </div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-zinc-100 bg-clip-text text-transparent">
                  Nutrition Plans
                </h1>
              </div>
              <p className="text-xl text-zinc-400 max-w-2xl">
                Create personalized nutrition plans powered by AI to help your
                clients achieve their health goals
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
              <Input
                // lab 4el="Quick plan name"
                placeholder="e.g., John's Muscle Gain Plan"
                value={quickPlanName}
                onChange={(e) => setQuickPlanName(e.target.value)}
                className="flex-1"
                size="lg"
                radius="lg"
                classNames={{
                  input: "text-white",
                  inputWrapper:
                    "bg-zinc-800/50 group-data-[focus=true]:bg-zinc-800/70",
                }}
              />

              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-zinc-600 to-zinc-600 hover:from-zinc-700 hover:to-zinc-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                size="lg"
              >
                <Plus className="w-5 h-5" />
                Create Plan
              </Button>
            </div>
          </div>
        </div>
        {/* Plans Section */}
        <div className="flex-1 flex flex-col w-full mx-auto z-10 min-h-0">
          {/* Enhanced Search & Filter Bar */}
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
                  <SelectItem key="" value="">
                    All Plans
                  </SelectItem>
                  <SelectItem key="template" value="template">
                    Non-Client Plans
                  </SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </Select>

                {/* Clear Filters Button - Only show if filters are active */}
                {(searchTerm || clientFilter) && (
                  <button
                    onClick={handleClearFilters}
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
                  selectedKeys={[currentSortValue]}
                  onSelectionChange={(keys) =>
                    handleSortChange(Array.from(keys)[0])
                  }
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
                    <SelectItem key={option.value} value={option.value}>
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

          {/* Data Table */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <DataTable
              data={displayPlans}
              columns={tableColumns}
              loading={clientsLoading || dietPlansLoading}
              emptyMessage="No nutrition plans found"
              emptyDescription="Create your first AI-powered nutrition plan to help your clients achieve their health goals"
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showViewToggle={false}
              onRowClick={handleViewPlanDetails}
              onRowAction={(action, row) => {
                // Prevent actions on plans that are still generating
                if (row.is_generating) {
                  return;
                }

                // For error state, only allow delete action
                if (row.has_error) {
                  if (action === "delete") {
                    handleDeletePlan(row);
                  }
                  return;
                }

                if (action === "view") {
                  handleViewPlanDetails(row);
                } else if (action === "delete") {
                  handleDeletePlan(row);
                }
              }}
            />
          </div>
        </div>
      </div>{" "}
      {/* Create Plan Modal */}
      <CreatePlanModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setQuickPlanName(""); // Clear the quick input when modal closes
        }}
        clients={clients}
        selectedClient={selectedClient}
        onGeneratePlan={handleGeneratePlan}
        generateDietPlan={generateDietPlan}
        initialPlanName={quickPlanName}
      />
      {/* Plan Details Modal */}
      <PlanDetailsModal
        isOpen={showPlanDetailModal}
        onClose={() => {
          setShowPlanDetailModal(false);
          setPlanDetails(null);
        }}
        planDetails={planDetails}
      />{" "}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && planToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Diet Plan"
          message={`Are you sure you want to delete the diet plan "${planToDelete.title}"? This action cannot be undone.`}
          confirmText="Delete Plan"
          cancelText="Cancel"
          variant="danger"
        />
      )}
    </>
  );
}
