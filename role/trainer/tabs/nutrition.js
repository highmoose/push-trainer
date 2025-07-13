"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useClients } from "@/hooks/clients";
import { useDietPlans } from "@/hooks/diet";
import {
  ChefHat,
  Search,
  Eye,
  Plus,
  BookOpen,
  SortAsc,
  SortDesc,
  Loader,
  Trash2,
  User,
  Calendar,
  Target,
  Utensils,
  TrendingUp,
  Zap,
  X,
} from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  CreatePlanModal,
  PlanDetailsModal,
  sampleDietPlans,
} from "@/components/trainer/nutrition";
import { DataTable } from "@/components/common/tables";
import Button from "@/components/common/button";
import { Input, Tabs, Tab, AvatarGroup, Avatar, Select, SelectItem } from "@heroui/react";
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
  color = "#3b82f6",
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
  } = useDietPlans();

  // Use sample data if no real data is available
  const activeDietPlans = dietPlans.length > 0 ? dietPlans : sampleDietPlans;

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  // Track plans being generated
  const [generatingPlans, setGeneratingPlans] = useState([]);

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
              {row.isGenerating && (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-400 font-normal bg-zinc-500/10 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse"></div>
                  Generating...
                </span>
              )}
            </div>
            <div className="text-sm text-zinc-400 truncate">
              {row.client_name || "Generic Plan"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "macros",
      label: "Macros",
      icon: Target,
      className: "w-1/6", // ~16.7% of width
      render: (value, row) => {
        if (row.isGenerating) {
          return <div className="text-zinc-500 text-sm">Calculating...</div>;
        }

        // Extract nutritional data from ai_response
        const getNutritionalData = (row) => {
          try {
            if (!row.ai_response) {
              return null;
            }

            const aiResponse =
              typeof row.ai_response === "string"
                ? JSON.parse(row.ai_response)
                : row.ai_response;

            const content = aiResponse.choices?.[0]?.message?.content;
            if (!content) return null;

            const nutritionData = JSON.parse(content);
            return nutritionData.daily_totals;
          } catch (error) {
            console.error("Error parsing nutritional data:", error);
            return null;
          }
        };

        const nutritionalData = getNutritionalData(row);

        // Fallback to mock data if no real data available - always in grams
        const getMacros = (planType) => {
          // Calculate grams based on calories and percentages
          const calories =
            planType === "weight_loss" || planType === "moderate_cut"
              ? 1800
              : planType === "muscle_gain" || planType === "bulk"
              ? 2800
              : 2200;
          const proteinCals =
            calories *
            (planType === "weight_loss" || planType === "moderate_cut"
              ? 0.4
              : planType === "muscle_gain" || planType === "bulk"
              ? 0.3
              : 0.25);
          const carbsCals =
            calories *
            (planType === "weight_loss" || planType === "moderate_cut"
              ? 0.3
              : planType === "muscle_gain" || planType === "bulk"
              ? 0.45
              : 0.4);
          const fatsCals =
            calories *
            (planType === "weight_loss" || planType === "moderate_cut"
              ? 0.3
              : planType === "muscle_gain" || planType === "bulk"
              ? 0.25
              : 0.35);

          return {
            protein: `${Math.round(proteinCals / 4)}g`,
            carbs: `${Math.round(carbsCals / 4)}g`,
            fats: `${Math.round(fatsCals / 9)}g`,
          };
        };

        let macros;

        if (nutritionalData) {
          // Use real data from diet plan - always show in grams
          macros = {
            protein: `${nutritionalData.protein}g`,
            carbs: `${nutritionalData.carbs}g`,
            fats: `${nutritionalData.fats}g`,
          };
        } else {
          // Fallback to mock data
          macros = getMacros(row.plan_type);
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
      key: "calories",
      label: "Calories & Distribution",
      icon: Zap,
      className: "w-1/4", // 25% of width for the main content
      render: (value, row) => {
        if (row.isGenerating) {
          return <div className="text-zinc-500 text-sm">Calculating...</div>;
        }

        // Extract nutritional data from ai_response
        const getNutritionalData = (row) => {
          try {
            if (!row.ai_response) {
              return null;
            }

            const aiResponse =
              typeof row.ai_response === "string"
                ? JSON.parse(row.ai_response)
                : row.ai_response;

            const content = aiResponse.choices?.[0]?.message?.content;
            if (!content) return null;

            const nutritionData = JSON.parse(content);
            return nutritionData.daily_totals;
          } catch (error) {
            console.error("Error parsing nutritional data:", error);
            return null;
          }
        };

        const nutritionalData = getNutritionalData(row);

        // Fallback to mock data if no real data available
        const getCalories = (planType) => {
          switch (planType) {
            case "weight_loss":
            case "moderate_cut":
              return { daily: 1800, range: "1600-2000" };
            case "muscle_gain":
            case "bulk":
              return { daily: 2800, range: "2600-3000" };
            case "maintenance":
              return { daily: 2200, range: "2000-2400" };
            default:
              return { daily: 2200, range: "2000-2400" };
          }
        };

        let calories;

        if (nutritionalData) {
          // Use real data from diet plan
          const dailyCalories = nutritionalData.calories;
          const rangeMin = Math.round(dailyCalories * 0.9);
          const rangeMax = Math.round(dailyCalories * 1.1);

          calories = {
            daily: dailyCalories,
            range: `${rangeMin}-${rangeMax}`,
          };
        } else {
          // Fallback to mock data
          calories = getCalories(row.plan_type);
        }

        // Get chart data
        const chartData = createCalorieChartData(row);
        let finalChartData = chartData;

        if (!chartData) {
          // Fallback chart data for non-AI plans (deterministic based on row data)
          const mealCount = row.meals_per_day || 3;
          const avgCalories =
            row.plan_type === "weight_loss"
              ? 600
              : row.plan_type === "muscle_gain"
              ? 900
              : 730;

          // Use row ID or title hash for deterministic random-like data
          const seed = row.id || row.title?.length || 0;
          const pseudoRandom = (index) => {
            const x = Math.sin(seed + index) * 10000;
            return x - Math.floor(x);
          };

          finalChartData = Array.from({ length: mealCount }, (_, i) => ({
            name: `Meal ${i + 1}`,
            calories: Math.round(avgCalories + (pseudoRandom(i) * 200 - 100)),
            index: i + 1,
          }));
        }

        return (
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-white font-semibold text-lg">
                {calories.daily.toLocaleString()} cal
              </div>
            </div>
            <div className="flex-shrink-0">
              <VSXCalorieChart
                data={finalChartData}
                width={140}
                height={56}
                chartId={`chart-${
                  row.id ||
                  row.title?.replace(/\s+/g, "-").toLowerCase() ||
                  "default"
                }`}
              />
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
        if (row.isGenerating) {
          return <div className="text-zinc-500 text-sm">-</div>;
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
        if (row.isGenerating) {
          return <div className="text-zinc-500 text-sm">Just now</div>;
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

    // Add generating plans to the list
    const relevantGeneratingPlans = [...generatingPlans];

    // Combine actual plans with generating plans
    plans = [...relevantGeneratingPlans, ...plans];

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
      plans = plans.filter(
        (plan) =>
          plan.client_id === parseInt(clientFilter) ||
          plan.client_name?.toLowerCase().includes(clientFilter.toLowerCase())
      );
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
  }, [
    activeDietPlans,
    searchTerm,
    sortBy,
    sortOrder,
    generatingPlans,
    clientFilter,
  ]);

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
    console.log("=== View Plan Details Debug ===");
    console.log("Initial plan data:", plan);
    console.log("Plan has ai_response:", !!plan.ai_response);
    console.log("AI response preview:", plan.ai_response?.substring(0, 100));
    setPlanDetails(plan);
    setShowPlanDetailModal(true);

    // TODO: Implement fetchPlanDetails in useDietPlans hook if needed for additional details
    console.log("Using plan data directly:", plan);
  };

  // Simple handler to create loading plan and trigger generation
  const handleGeneratePlan = async (planData) => {
    // Create a temporary loading plan item
    const tempPlanId = `temp_${Date.now()}`;
    const loadingPlan = {
      id: tempPlanId,
      title: planData.title,
      client_name: planData.clientName,
      client_id: planData.clientId,
      plan_type: planData.planType,
      meals_per_day: planData.mealsPerDay,
      meal_complexity: planData.mealComplexity,
      created_at: new Date().toISOString(),
      isGenerating: true,
    };

    // Close modal and add loading plan
    setShowCreateModal(false);
    setGeneratingPlans((prev) => [...prev, loadingPlan]);

    try {
      const result = await generateDietPlan(planData.dietPlanRequest);

      // Remove the loading plan and refresh the actual plans
      setGeneratingPlans((prev) => prev.filter((p) => p.id !== tempPlanId));

      console.log("Diet plan generated successfully:", result);
    } catch (error) {
      console.error("Error generating plan:", error);

      // Remove the loading plan on error
      setGeneratingPlans((prev) => prev.filter((p) => p.id !== tempPlanId));

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

  // Helper function to create chart data from meal plan
  const createCalorieChartData = (row) => {
    try {
      if (!row.ai_response) return null;

      const aiResponse =
        typeof row.ai_response === "string"
          ? JSON.parse(row.ai_response)
          : row.ai_response;

      const content = aiResponse.choices?.[0]?.message?.content;
      if (!content) return null;

      const nutritionData = JSON.parse(content);
      if (!nutritionData.meals) return null;

      const sortedMeals = nutritionData.meals.sort((a, b) => a.order - b.order);
      return sortedMeals.map((meal, index) => ({
        name: meal.type,
        calories: meal.calories,
        index: index + 1,
      }));
    } catch (error) {
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
  const selectedClientName = clientFilter 
    ? clients.find(client => client.id === parseInt(clientFilter))?.first_name + " " + 
      clients.find(client => client.id === parseInt(clientFilter))?.last_name
    : null;

  // Generate search placeholder text
  const searchPlaceholder = selectedClientName 
    ? `Searching ${selectedClientName} plans...`
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
      <div className="relative h-screen flex flex-col bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white overflow-hidden rounded">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/5 via-transparent to-zinc-500/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(59,130,246,0.1)_0%,_transparent_50%)] pointer-events-none" />

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
                label="Quick plan name"
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
                  placeholder="All Clients"
                  selectedKeys={clientFilter ? [clientFilter] : []}
                  onSelectionChange={(keys) => setClientFilter(Array.from(keys)[0] || "")}
                  className="w-52"
                  size="sm"
                  variant="flat"
                  renderValue={(items) => {
                    if (items.length === 0) return "All Clients";
                    const selectedClient = clients.find(client => client.id.toString() === items[0].key);
                    return selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : "All Clients";
                  }}
                  classNames={{
                    trigger: "bg-zinc-800/50 border-0 data-[hover=true]:bg-zinc-700/50 h-10",
                    value: "text-white text-sm",
                    listbox: "bg-zinc-800 text-white",
                    popoverContent: "bg-zinc-800 border border-zinc-700",
                  }}
                >
                  <SelectItem key="" value="">All Clients</SelectItem>
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
                  onSelectionChange={(keys) => handleSortChange(Array.from(keys)[0])}
                  className="w-52"
                  size="sm"
                  variant="flat"
                  classNames={{
                    trigger: "bg-zinc-800/50 border-0 data-[hover=true]:bg-zinc-700/50 h-10",
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
                    tabContent: "text-zinc-400 group-data-[selected=true]:text-white text-xs font-medium",
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
