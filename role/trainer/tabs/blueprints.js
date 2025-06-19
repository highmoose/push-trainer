"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchClients } from "@/redux/slices/clientSlice";
import {
  generateDietPlan,
  createDietPlan,
  fetchDietPlans,
  fetchPlanDetails,
  duplicateDietPlan,
  linkDietPlanToClients,
  deleteDietPlan,
  updateDietPlan,
} from "@/redux/slices/dietPlanSlice";
import {
  User,
  ChefHat,
  Target,
  Clock,
  Zap,
  Scale,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Copy,
  Link,
  Save,
  Eye,
  Users,
  Trash2,
  Edit3,
  Calendar,
  Plus,
  Filter,
  MoreHorizontal,
  Download,
  Upload,
  Star,
  Archive,
  BookOpen,
  Settings,
  SortAsc,
  SortDesc,
  Grid,
  List,
} from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Meal Plan Display Component with enhanced formatting
const MealPlanDisplay = ({ aiResponse }) => {
  const [mealData, setMealData] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    console.log("=== MealPlanDisplay Debug ===");
    console.log("Raw aiResponse:", aiResponse);
    console.log("aiResponse type:", typeof aiResponse);

    try {
      let parsedData;
      let debugSteps = [];

      if (typeof aiResponse === "string") {
        debugSteps.push("Input is string");

        // Parse the OpenAI response structure
        try {
          const openAiResponse = JSON.parse(aiResponse);
          debugSteps.push("Successfully parsed OpenAI response structure");
          console.log("OpenAI response structure:", openAiResponse);

          if (
            openAiResponse.choices &&
            openAiResponse.choices[0] &&
            openAiResponse.choices[0].message
          ) {
            const content = openAiResponse.choices[0].message.content;
            debugSteps.push("Found content in choices[0].message.content");
            console.log("Raw content:", content);

            // Parse the content (which is a JSON string with escaped characters)
            try {
              parsedData = JSON.parse(content);
              debugSteps.push("Successfully parsed content as JSON");
              console.log("Final parsed meal data:", parsedData);
            } catch (contentParseError) {
              debugSteps.push(
                `Content JSON parse failed: ${contentParseError.message}`
              );
              console.log("Content that failed to parse:", content);
            }
          } else {
            debugSteps.push("No valid choices/message structure found");
          }
        } catch (openAiParseError) {
          debugSteps.push(
            `OpenAI structure parse failed: ${openAiParseError.message}`
          );

          // Fallback: try to parse as direct JSON
          try {
            parsedData = JSON.parse(aiResponse);
            debugSteps.push("Successfully parsed as direct JSON (fallback)");
            console.log("Direct JSON parse result:", parsedData);
          } catch (directParseError) {
            debugSteps.push(
              `Direct JSON parse also failed: ${directParseError.message}`
            );
          }
        }
      } else if (typeof aiResponse === "object" && aiResponse !== null) {
        debugSteps.push("Input is object");
        parsedData = aiResponse;
      }

      setDebugInfo({
        steps: debugSteps,
        rawData: aiResponse,
        parsedData: parsedData,
        hasMeals: parsedData && parsedData.meals ? parsedData.meals.length : 0,
      });

      if (parsedData && parsedData.meals && Array.isArray(parsedData.meals)) {
        console.log("✅ Valid meal data found:", parsedData);
        setMealData(parsedData);
        setError(null);
      } else {
        console.log("❌ Invalid meal plan format:", parsedData);
        setError("Invalid meal plan format - no meals array found");
      }
    } catch (err) {
      console.error("❌ Error parsing meal plan:", err);
      setError(`Failed to parse meal plan data: ${err.message}`);
      setDebugInfo({
        steps: [`Fatal error: ${err.message}`],
        rawData: aiResponse,
        parsedData: null,
        hasMeals: 0,
      });
    }
  }, [aiResponse]);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center text-red-400 py-4">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
        </div>

        {/* Detailed Debug Information */}
        <div className="bg-zinc-900/80 border border-zinc-700 rounded-lg p-4">
          <h4 className="text-zinc-300 font-semibold mb-3 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Debug Information
          </h4>

          {debugInfo && (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-zinc-400 mb-1">Parse Steps:</div>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  {debugInfo.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-zinc-400 mb-1">
                  Data Type: {typeof debugInfo.rawData}
                </div>
                <div className="text-zinc-400 mb-1">
                  Meals Found: {debugInfo.hasMeals}
                </div>
              </div>

              <div>
                <div className="text-zinc-400 mb-1">Raw Data Preview:</div>
                <pre className="p-2 bg-zinc-800 rounded text-zinc-400 overflow-x-auto max-h-32">
                  {typeof debugInfo.rawData === "string"
                    ? debugInfo.rawData.substring(0, 500) +
                      (debugInfo.rawData.length > 500 ? "..." : "")
                    : JSON.stringify(debugInfo.rawData, null, 2)}
                </pre>
              </div>

              {debugInfo.parsedData && (
                <div>
                  <div className="text-zinc-400 mb-1">
                    Parsed Data Structure:
                  </div>
                  <pre className="p-2 bg-zinc-800 rounded text-zinc-400 overflow-x-auto max-h-32">
                    {JSON.stringify(debugInfo.parsedData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!mealData) {
    return (
      <div className="text-center text-zinc-500 py-4">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p>Loading meal plan...</p>
      </div>
    );
  }

  const getMealTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "☀️";
      case "dinner":
        return "🌙";
      case "snack":
        return "🍎";
      default:
        return "🍽️";
    }
  };

  const getMealTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "breakfast":
        return "text-orange-400 border-orange-400/30 bg-orange-400/10";
      case "lunch":
        return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      case "dinner":
        return "text-blue-400 border-blue-400/30 bg-blue-400/10";
      case "snack":
        return "text-green-400 border-green-400/30 bg-green-400/10";
      default:
        return "text-zinc-400 border-zinc-400/30 bg-zinc-400/10";
    }
  };
  return (
    <div className="space-y-3">
      {/* Daily Totals Summary */}
      {mealData.daily_totals && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded p-3">
          <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-1" />
            Daily Nutritional Goals
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {mealData.daily_totals.calories}
              </div>
              <div className="text-sm text-zinc-400">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {mealData.daily_totals.protein}g
              </div>
              <div className="text-sm text-zinc-400">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">
                {mealData.daily_totals.carbs}g
              </div>
              <div className="text-sm text-zinc-400">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {mealData.daily_totals.fats}g
              </div>
              <div className="text-sm text-zinc-400">Fats</div>
            </div>
          </div>
        </div>
      )}

      {/* Meals */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center">
          <ChefHat className="w-4 h-4 mr-1" />
          Meal Plan
        </h3>

        {mealData.meals
          .sort((a, b) => a.order - b.order)
          .map((meal, index) => (
            <div
              key={index}
              className={`border rounded p-3 ${getMealTypeColor(meal.type)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-sm mr-2">
                    {getMealTypeIcon(meal.type)}
                  </span>
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {meal.name}
                    </h4>
                    <span className="text-sm text-zinc-400 capitalize">
                      {meal.type}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {meal.calories} cal
                  </div>
                  <div className="text-sm text-zinc-400">
                    P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <h5 className="text-sm font-medium text-zinc-300 mb-1">
                  Ingredients:
                </h5>
                <div className="grid grid-cols-1 gap-1">
                  {meal.ingredients.map((ingredient, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2 py-1 bg-zinc-800/60 rounded text-sm"
                    >
                      <span className="text-zinc-300">
                        {typeof ingredient === "object"
                          ? ingredient.name
                          : ingredient}
                      </span>
                      {typeof ingredient === "object" && ingredient.amount && (
                        <span className="text-zinc-500 font-medium">
                          {ingredient.amount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-zinc-300 mb-1">
                  Instructions:
                </h5>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {meal.instructions}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

// Diet plan types with descriptions
const DIET_PLAN_TYPES = [
  {
    id: "aggressive_cut",
    name: "Aggressive Weight Cut",
    description: "Rapid fat loss with significant caloric deficit",
    icon: TrendingDown,
    color: "red",
  },
  {
    id: "moderate_cut",
    name: "Moderate Weight Cut",
    description: "Steady fat loss with moderate caloric deficit",
    icon: TrendingDown,
    color: "orange",
  },
  {
    id: "lean_bulk",
    name: "Lean Bulk",
    description: "Muscle gain with minimal fat gain",
    icon: TrendingUp,
    color: "green",
  },
  {
    id: "maintain",
    name: "Maintenance",
    description: "Maintain current weight and composition",
    icon: Minus,
    color: "blue",
  },
  {
    id: "recomp",
    name: "Body Recomposition",
    description: "Simultaneously lose fat and gain muscle",
    icon: Target,
    color: "purple",
  },
];

const MEAL_COMPLEXITY = [
  {
    id: "simple",
    name: "Simple",
    description: "Quick and easy meals with minimal prep",
  },
  {
    id: "moderate",
    name: "Moderate",
    description: "Balanced complexity with some cooking required",
  },
  {
    id: "complex",
    name: "Complex",
    description: "Advanced meals with detailed preparation",
  },
];

export default function Blueprints() {
  const dispatch = useDispatch();
  const { list: clients = [], status: clientsStatus } = useSelector(
    (state) => state.clients
  );
  const {
    list: dietPlans = [],
    current: currentPlan,
    generating,
    status: dietPlanStatus,
  } = useSelector((state) => state.dietPlans);

  // Sample data for testing
  const sampleDietPlans = [
    {
      id: 1,
      title: "Weight Loss Plan - Sarah",
      client_name: "Sarah Johnson",
      client_id: 1,
      plan_type: "moderate_cut",
      meals_per_day: 4,
      meal_complexity: "simple",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      is_favorite: false,
      is_archived: false,
      ai_response: JSON.stringify({
        id: "chatcmpl-sample1",
        object: "chat.completion",
        created: 1750287440,
        model: "gpt-3.5-turbo-0125",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content:
                '{\n  "meals": [\n    {\n      "name": "Protein-Packed Breakfast Bowl",\n      "type": "breakfast",\n      "order": 1,\n      "ingredients": [{"name": "egg whites", "amount": "4 large"}, {"name": "spinach", "amount": "1 cup"}, {"name": "quinoa", "amount": "1/2 cup cooked"}, {"name": "cherry tomatoes", "amount": "1/2 cup"}, {"name": "avocado", "amount": "1/4 medium"}],\n      "instructions": "Scramble egg whites with spinach, serve with quinoa, cherry tomatoes, and sliced avocado.",\n      "calories": 400,\n      "protein": 25,\n      "carbs": 45,\n      "fats": 15\n    }\n  ],\n  "daily_totals": {\n    "calories": 1600,\n    "protein": 110,\n    "carbs": 120,\n    "fats": 75\n  }\n}',
              refusal: null,
              annotations: [],
            },
            logprobs: null,
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 241,
          completion_tokens: 496,
          total_tokens: 737,
        },
      }),
    },
  ];

  // Use sample data if no real data is available
  const activeDietPlans = dietPlans.length > 0 ? dietPlans : sampleDietPlans;

  // State
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlanDetailModal, setShowPlanDetailModal] = useState(false);
  const [planDetails, setPlanDetails] = useState(null);

  // Form states
  const [selectedClientForForm, setSelectedClientForForm] = useState(null);
  const [planTitle, setPlanTitle] = useState("");
  const [planType, setPlanType] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [mealComplexity, setMealComplexity] = useState("moderate");
  const [customCalories, setCustomCalories] = useState("");
  const [useCustomCalories, setUseCustomCalories] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [aiProvider, setAiProvider] = useState("openai");

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(
      (client) =>
        `${client.first_name} ${client.last_name}`
          .toLowerCase()
          .includes(clientSearchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );
  }, [clients, clientSearchTerm]);

  // Display plans based on selection
  const displayPlans = useMemo(() => {
    let plans = showAllPlans
      ? activeDietPlans
      : selectedClient
      ? activeDietPlans.filter((plan) => plan.client_id === selectedClient.id)
      : [];

    // Apply search filter
    if (searchTerm) {
      plans = plans.filter(
        (plan) =>
          plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } // Sort plans (create a copy to avoid mutating read-only array)
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
    selectedClient,
    showAllPlans,
    searchTerm,
    sortBy,
    sortOrder,
  ]);

  // Initialize with first client if available
  useEffect(() => {
    if (clients.length > 0 && !selectedClient && !showAllPlans) {
      setSelectedClient(clients[0]);
    }
  }, [clients, selectedClient, showAllPlans]);

  // Fetch data on mount
  useEffect(() => {
    if (clientsStatus === "idle") {
      dispatch(fetchClients());
    }
    if (dietPlanStatus === "idle") {
      dispatch(fetchDietPlans());
    }
  }, [dispatch, clientsStatus, dietPlanStatus]);

  // View plan details
  const handleViewPlanDetails = async (plan) => {
    console.log("=== View Plan Details Debug ===");
    console.log("Initial plan data:", plan);
    console.log("Plan has ai_response:", !!plan.ai_response);
    console.log("AI response preview:", plan.ai_response?.substring(0, 100));

    setPlanDetails(plan);
    setShowPlanDetailModal(true);

    try {
      const result = await dispatch(fetchPlanDetails(plan.id));
      console.log("Fetch plan details result:", result);
      if (result.type === "dietPlans/fetchDetails/fulfilled") {
        console.log("Fetched plan details:", result.payload);
        setPlanDetails(result.payload);
      }
    } catch (error) {
      console.error("Error fetching plan details:", error);
    }
  };

  // Generate diet plan
  const handleGeneratePlan = async () => {
    if (!planType) {
      alert("Please select a diet plan goal");
      return;
    }

    if (!planTitle.trim()) {
      alert("Please enter a title for the diet plan");
      return;
    }

    // Use the selected client from the sidebar if no specific client is selected for the form
    const clientId = selectedClientForForm?.id || selectedClient?.id || null;

    try {
      const result = await dispatch(
        generateDietPlan({
          prompt: "Generate a diet plan",
          aiProvider,
          clientId,
          title: planTitle.trim(),
          planType,
          mealsPerDay,
          mealComplexity,
          customCalories: useCustomCalories ? customCalories : null,
          additionalNotes,
        })
      );

      if (result.type === "dietPlans/generate/fulfilled") {
        setShowCreateModal(false);
        // Reset form
        setPlanTitle("");
        setPlanType("");
        setSelectedClientForForm(null);
        setAdditionalNotes("");
        // Refresh plans
        dispatch(fetchDietPlans());
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Failed to generate diet plan. Please try again.");
    }
  };

  return (
    <>
      {" "}
      <div className="h-screen flex bg-zinc-900 text-white overflow-hidden rounded">
        {/* Professional Trainer Sidebar */}
        <div className="w-80 bg-zinc-950/50 border-r border-zinc-800/50 flex flex-col h-full">
          {" "}
          {/* Sidebar Header */}
          <div className="p-3 border-b border-zinc-800/30">
            <h1 className="text-base font-bold text-zinc-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Diet Plan Blueprints
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Manage client diet plans
            </p>
          </div>{" "}
          {/* View Toggle */}
          <div className="p-3 border-b border-zinc-800/30">
            <h3 className="text-sm font-medium text-zinc-300 mb-2">
              View Options
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowAllPlans(false)}
                className={`px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                  !showAllPlans
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-900/50 text-zinc-400 hover:text-white"
                }`}
              >
                By Client
              </button>
              <button
                onClick={() => setShowAllPlans(true)}
                className={`px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                  showAllPlans
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-900/50 text-zinc-400 hover:text-white"
                }`}
              >
                All Plans
              </button>
            </div>
          </div>{" "}
          {/* Client Search */}
          {!showAllPlans && (
            <div className="p-3 border-b border-zinc-800/30">
              <h3 className="text-sm font-medium text-zinc-300 mb-2">
                Search Clients
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/50 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none text-sm placeholder:text-sm"
                />
              </div>
            </div>
          )}
          {/* Client List */}
          <div className="flex-1 overflow-y-auto">
            {!showAllPlans ? (
              <>
                {clientsStatus === "loading" && (
                  <div className="p-4 text-center text-zinc-400">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Loading clients...</p>
                  </div>
                )}
                {clientsStatus === "failed" && (
                  <div className="p-4 text-center text-zinc-400">
                    <p>Failed to load clients</p>
                    <button
                      onClick={() => dispatch(fetchClients())}
                      className="mt-2 text-sm bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700"
                    >
                      Retry
                    </button>
                  </div>
                )}{" "}
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-2 border-b border-zinc-800/30 cursor-pointer transition-all hover:bg-zinc-900/30 ${
                      selectedClient?.id === client.id
                        ? "bg-zinc-900/50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {(client.first_name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-zinc-300 text-sm">
                          {client.first_name} {client.last_name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-zinc-500 truncate mr-2">
                            {client.email}
                          </p>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-2 w-2 text-blue-400" />
                            <span className="text-sm text-zinc-500">
                              {
                                activeDietPlans.filter(
                                  (p) => p.client_id === client.id
                                ).length
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-4 text-center text-zinc-400">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Showing all diet plans</p>
                <p className="text-sm text-zinc-500 mt-1">
                  {activeDietPlans.length} total plans
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area (75% width) */}
        <div className="flex-1 flex flex-col">
          {" "}
          {/* Header with Client Info and Actions */}
          <div className="bg-zinc-900 border-b border-zinc-800 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!showAllPlans && selectedClient ? (
                  <>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {(selectedClient.first_name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {selectedClient.first_name} {selectedClient.last_name}
                      </h2>
                      <p className="text-zinc-400 text-sm">
                        {displayPlans.length} diet plan
                        {displayPlans.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      All Diet Plans
                    </h2>
                    <p className="text-zinc-400 text-sm">
                      {displayPlans.length} total plan
                      {displayPlans.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded font-medium text-white transition-all flex items-center gap-2 shadow-lg text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Plan
                </button>
              </div>
            </div>
          </div>{" "}
          {/* Search and Sort Controls */}
          <div className="bg-zinc-900/50 border-b border-zinc-800 p-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search diet plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="created_at">Created Date</option>
                  <option value="updated_at">Updated Date</option>
                  <option value="title">Title</option>
                </select>

                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 hover:text-white"
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-3 h-3" />
                  ) : (
                    <SortDesc className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>{" "}
          {/* Diet Plans List */}
          <div className="flex-1 overflow-y-auto p-3">
            {displayPlans.length === 0 ? (
              <div className="text-center text-zinc-400 py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No diet plans found</p>
                <p className="text-sm text-zinc-500 mb-4">
                  {!showAllPlans && selectedClient
                    ? `Create a diet plan for ${selectedClient.first_name}`
                    : "Create your first diet plan to get started"}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white transition-colors"
                >
                  Create Diet Plan
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <ChefHat className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white text-lg">
                                {plan.title}
                              </h3>
                              <p className="text-sm text-zinc-400">
                                {plan.client_name || "Generic Plan"}
                              </p>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <span className="text-zinc-400">Plan Type</span>
                                <p className="text-white capitalize font-medium">
                                  {plan.plan_type?.replace("_", " ")}
                                </p>
                              </div>
                              <div className="text-center">
                                <span className="text-zinc-400">Meals/Day</span>
                                <p className="text-white font-medium">
                                  {plan.meals_per_day}
                                </p>
                              </div>
                              <div className="text-center">
                                <span className="text-zinc-400">Created</span>
                                <p className="text-white font-medium">
                                  {new Date(
                                    plan.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleViewPlanDetails(plan)}
                          className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium"
                        >
                          View Plan
                        </button>
                        <button
                          onClick={() => handleViewPlanDetails(plan)}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">
                Create Diet Plan
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {" "}
                {/* Plan Title */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Plan Title
                  </label>
                  <input
                    type="text"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    placeholder="Enter plan title"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                {/* Client Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Client (Optional)
                  </label>
                  <select
                    value={
                      selectedClientForForm?.id || selectedClient?.id || ""
                    }
                    onChange={(e) => {
                      const clientId = e.target.value;
                      if (clientId) {
                        const client = clients.find(
                          (c) => c.id === parseInt(clientId)
                        );
                        setSelectedClientForForm(client);
                      } else {
                        setSelectedClientForForm(null);
                      }
                    }}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">
                      Select a client (or leave empty for generic plan)
                    </option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name} - {client.email}
                      </option>
                    ))}
                  </select>
                  {selectedClient && !selectedClientForForm && (
                    <p className="text-sm text-blue-400 mt-1">
                      Currently creating for: {selectedClient.first_name}{" "}
                      {selectedClient.last_name}
                    </p>
                  )}
                </div>
                {/* Plan Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">
                    Diet Plan Goal
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DIET_PLAN_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setPlanType(type.id)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          planType === type.id
                            ? "border-blue-500 bg-blue-500/10 text-blue-300"
                            : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <type.icon className="w-5 h-5" />
                          <span className="font-medium">{type.name}</span>
                        </div>
                        <p className="text-sm text-zinc-400">
                          {type.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Meals Per Day */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Meals Per Day: {mealsPerDay}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="6"
                    value={mealsPerDay}
                    onChange={(e) => setMealsPerDay(parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-zinc-500 mt-1">
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6</span>
                  </div>
                </div>
                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any specific requirements or preferences..."
                    rows={3}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePlan}
                  disabled={generating}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium text-white transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Plan Details Modal */}
      {showPlanDetailModal && planDetails && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">
                {planDetails.title}
              </h2>
              <button
                onClick={() => {
                  setShowPlanDetailModal(false);
                  setPlanDetails(null);
                }}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>{" "}
            <div className="p-4 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-dark">
              <div className="space-y-3">
                {/* Plan Info */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <span className="text-sm text-zinc-500">Client</span>
                    <p className="text-sm font-medium text-zinc-300">
                      {planDetails.client_name || "Generic Plan"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-500">Plan Type</span>
                    <p className="text-sm font-medium text-zinc-300">
                      {planDetails.plan_type?.replace("_", " ") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-500">Meals/Day</span>
                    <p className="text-sm font-medium text-zinc-300">
                      {planDetails.meals_per_day}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-500">Created</span>
                    <p className="text-sm font-medium text-zinc-300">
                      {new Date(planDetails.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Plan Content */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-2">
                    Diet Plan Content
                  </h3>
                  <div className="bg-zinc-800/50 rounded p-3 border border-zinc-700">
                    <div className="text-sm text-zinc-300 max-h-80 overflow-y-auto scrollbar-thin scrollbar-dark">
                      <MealPlanDisplay aiResponse={planDetails.ai_response} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
