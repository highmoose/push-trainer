"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Diet plan types with descriptions
const DIET_PLAN_TYPES = [
  {
    id: "aggressive_cut",
    name: "Aggressive Weight Cut",
    description: "Rapid fat loss with significant calorie deficit",
    icon: TrendingDown,
    color: "red",
  },
  {
    id: "moderate_cut",
    name: "Moderate Weight Cut",
    description: "Steady fat loss while preserving muscle",
    icon: TrendingDown,
    color: "orange",
  },
  {
    id: "lean_cut",
    name: "Lean Cut",
    description: "Gentle fat loss with minimal muscle loss",
    icon: TrendingDown,
    color: "yellow",
  },
  {
    id: "maintain",
    name: "Maintain & Recomp",
    description: "Maintain weight while improving body composition",
    icon: Minus,
    color: "blue",
  },
  {
    id: "lean_bulk",
    name: "Lean Bulk",
    description: "Gradual muscle gain with minimal fat gain",
    icon: TrendingUp,
    color: "green",
  },
  {
    id: "aggressive_bulk",
    name: "Aggressive Bulk",
    description: "Maximum muscle gain with higher calorie surplus",
    icon: TrendingUp,
    color: "purple",
  },
];

// Meal complexity levels
const MEAL_COMPLEXITY = [
  {
    id: "simple",
    name: "Simple",
    description: "Quick & easy meals, minimal prep time",
    icon: Clock,
  },
  {
    id: "moderate",
    name: "Moderate",
    description: "Balanced recipes with reasonable prep time",
    icon: ChefHat,
  },
  {
    id: "complex",
    name: "Complex",
    description: "Gourmet meals with advanced preparation",
    icon: Sparkles,
  },
];

// Meals per day options
const MEALS_PER_DAY = [
  { value: 3, label: "3 Meals" },
  { value: 4, label: "4 Meals" },
  { value: 5, label: "5 Meals" },
  { value: 6, label: "6 Meals" },
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

  // Refs
  const clientSearchRef = useRef(null);

  // Form state
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [planType, setPlanType] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [mealComplexity, setMealComplexity] = useState("moderate");
  const [customCalories, setCustomCalories] = useState("");
  const [useCustomCalories, setUseCustomCalories] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [aiProvider, setAiProvider] = useState("openai"); // UI state
  const [showPlansList, setShowPlansList] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPlanDetailModal, setShowPlanDetailModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedPlanForAction, setSelectedPlanForAction] = useState(null);
  const [selectedClientsForAction, setSelectedClientsForAction] = useState([]);
  const [planDetails, setPlanDetails] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Available AI providers (can be managed in admin area later)
  const AI_PROVIDERS = [
    { id: "openai", name: "OpenAI GPT", enabled: true },
    { id: "claude", name: "Anthropic Claude", enabled: false },
    { id: "gemini", name: "Google Gemini", enabled: false },
  ];

  // Fetch clients and diet plans on component mount
  useEffect(() => {
    if (clientsStatus === "idle") {
      dispatch(fetchClients());
    }
    if (dietPlanStatus === "idle") {
      dispatch(fetchDietPlans());
    }
  }, [dispatch, clientsStatus, dietPlanStatus]);

  // Filter clients based on search
  const filteredClients = clients.filter(
    (client) =>
      client.first_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.last_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );
  // Handle client selection
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setClientSearch("");
    if (!planTitle) {
      setPlanTitle(`${client.first_name} ${client.last_name} - Diet Plan`);
    }
  };

  // Clear client selection
  const handleClearClient = () => {
    setSelectedClient(null);
    setClientSearch("");
    setPlanTitle("");
  };

  // Generate AI prompt
  const generatePrompt = () => {
    const selectedPlanType = DIET_PLAN_TYPES.find((p) => p.id === planType);
    const selectedComplexity = MEAL_COMPLEXITY.find(
      (c) => c.id === mealComplexity
    );

    let prompt = `Create a comprehensive diet plan with the following specifications:\n\n`;

    // Client information if available
    if (selectedClient) {
      prompt += `CLIENT PROFILE:\n`;
      prompt += `- Name: ${selectedClient.first_name} ${selectedClient.last_name}\n`;
      prompt += `- Email: ${selectedClient.email}\n`;

      // Physical metrics
      if (selectedClient.weight)
        prompt += `- Weight: ${selectedClient.weight} kg\n`;
      if (selectedClient.height)
        prompt += `- Height: ${selectedClient.height} cm\n`;
      if (selectedClient.age) prompt += `- Age: ${selectedClient.age} years\n`;
      if (selectedClient.body_fat)
        prompt += `- Body Fat: ${selectedClient.body_fat}%\n`;
      if (selectedClient.activity_level)
        prompt += `- Activity Level: ${selectedClient.activity_level}\n`;

      // Dietary preferences and restrictions
      if (selectedClient.allergies)
        prompt += `- ALLERGIES (CRITICAL): ${selectedClient.allergies}\n`;
      if (selectedClient.food_preferences)
        prompt += `- Food Preferences: ${selectedClient.food_preferences}\n`;
      if (selectedClient.food_dislikes)
        prompt += `- Food Dislikes: ${selectedClient.food_dislikes}\n`;
      if (selectedClient.dietary_restrictions)
        prompt += `- Dietary Restrictions: ${selectedClient.dietary_restrictions}\n`;

      // Goals and additional information
      if (selectedClient.fitness_goals)
        prompt += `- Fitness Goals: ${selectedClient.fitness_goals}\n`;
      if (selectedClient.notes)
        prompt += `- Additional Client Notes: ${selectedClient.notes}\n`;

      prompt += `\n`;
    }

    prompt += `DIET PLAN REQUIREMENTS:\n`;
    prompt += `- Goal: ${selectedPlanType.name} - ${selectedPlanType.description}\n`;
    prompt += `- Meals per day: ${mealsPerDay}\n`;
    prompt += `- Meal complexity: ${selectedComplexity.name} - ${selectedComplexity.description}\n`;

    if (useCustomCalories && customCalories) {
      prompt += `- Target calories: ${customCalories} per day\n`;
    }

    if (additionalNotes) {
      prompt += `- Additional notes: ${additionalNotes}\n`;
    }

    prompt += `\nIMPORTANT INSTRUCTIONS:\n`;
    if (selectedClient?.allergies) {
      prompt += `- AVOID ALL FOODS CONTAINING: ${selectedClient.allergies}\n`;
    }
    if (selectedClient?.food_dislikes) {
      prompt += `- DO NOT INCLUDE: ${selectedClient.food_dislikes}\n`;
    }
    if (selectedClient?.dietary_restrictions) {
      prompt += `- FOLLOW DIETARY RESTRICTIONS: ${selectedClient.dietary_restrictions}\n`;
    }
    prompt += `\nPlease provide:\n`;
    prompt += `1. Detailed meal plan with specific foods and portions for each meal\n`;
    prompt += `2. Macronutrient breakdown (protein, carbs, fats) for each meal\n`;
    prompt += `3. Total daily calories and macros summary\n`;
    prompt += `4. Meal timing recommendations\n`;
    prompt += `5. Food preparation tips and cooking instructions\n`;
    prompt += `6. Alternative food options for variety\n`;
    prompt += `7. Shopping list organized by food categories\n`;
    prompt += `\nFormat the response as a structured plan that can be easily followed.`;

    return prompt;
  };
  // Handle plan generation
  const handleGeneratePlan = async () => {
    if (!planType) {
      alert("Please select a diet plan goal");
      return;
    }

    if (!planTitle.trim()) {
      alert("Please enter a title for the diet plan");
      return;
    }

    const prompt = generatePrompt();
    try {
      const result = await dispatch(
        generateDietPlan({
          prompt,
          aiProvider,
          clientId: selectedClient?.id || null,
          title: planTitle.trim(),
          planType,
          mealsPerDay,
          mealComplexity,
          customCalories: useCustomCalories ? customCalories : null,
          additionalNotes,
        })
      );

      if (generateDietPlan.fulfilled.match(result)) {
        // Plan generated successfully
        console.log("Diet plan generated:", result.payload);
      }
    } catch (error) {
      console.error("Failed to generate plan:", error);
    }
  };
  // Handle assign plan to clients
  const handleAssignPlan = async () => {
    if (!selectedPlanForAction || selectedClientsForAction.length === 0) {
      return;
    }

    setIsAssigning(true);
    try {
      await dispatch(
        linkDietPlanToClients({
          id: selectedPlanForAction.id,
          clientIds: selectedClientsForAction,
        })
      );
      setShowAssignModal(false);
      setSelectedPlanForAction(null);
      setSelectedClientsForAction([]);
      // Refresh plans to show updated assignments
      dispatch(fetchDietPlans());
    } catch (error) {
      console.error("Failed to assign plan:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle delete plan
  const handleDeletePlan = async () => {
    if (!selectedPlanForAction) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteDietPlan(selectedPlanForAction.id));
      setShowDeleteConfirmModal(false);
      setSelectedPlanForAction(null);
      // Refresh plans after deletion
      dispatch(fetchDietPlans());
    } catch (error) {
      console.error("Failed to delete plan:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle duplicate plan
  const handleDuplicatePlan = async () => {
    if (!selectedPlanForAction || selectedClientsForAction.length === 0) {
      return;
    }

    setIsDuplicating(true);
    try {
      await dispatch(
        duplicateDietPlan({
          id: selectedPlanForAction.id,
          clientIds: selectedClientsForAction,
        })
      );
      setShowDuplicateModal(false);
      setSelectedPlanForAction(null);
      setSelectedClientsForAction([]);
      // Refresh plans to show new duplicated plans
      dispatch(fetchDietPlans());
    } catch (error) {
      console.error("Failed to duplicate plan:", error);
    } finally {
      setIsDuplicating(false);
    }
  };
  // Handle view plan details
  const handleViewPlanDetails = async (plan) => {
    try {
      const result = await dispatch(fetchPlanDetails(plan.id));
      if (fetchPlanDetails.fulfilled.match(result)) {
        setPlanDetails(result.payload);
        setShowPlanDetailModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch plan details:", error);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedClient(null);
    setClientSearch("");
    setPlanType("");
    setMealsPerDay(4);
    setMealComplexity("moderate");
    setCustomCalories("");
    setUseCustomCalories(false);
    setAdditionalNotes("");
    setPlanTitle("");
  };

  return (
    <div className="w-full h-full flex bg-zinc-900 text-white overflow-hidden rounded">
      {/* Professional Blueprints Sidebar */}
      <div className="w-80 bg-zinc-950/50 border-r border-zinc-800/50 flex flex-col h-full">
        {/* Quick Actions */}
        <div className="flex flex-col w-full p-4 space-y-3">
          <button
            onClick={handleReset}
            className="cursor-pointer flex items-center justify-center gap-2 p-2 border border-zinc-700 hover:bg-zinc-900 hover:border-white text-white rounded"
          >
            <Sparkles size={18} />
            <p className="font-semibold">Create New Plan</p>
          </button>
          <button
            onClick={() => setShowPlansList(true)}
            className="cursor-pointer flex items-center justify-center gap-2 p-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded"
          >
            <Eye size={18} />
            <p className="font-semibold">View All Plans</p>
          </button>
        </div>

        {/* AI Provider Selection */}
        <div className="p-4 border-b border-zinc-800/30">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            AI Provider
          </h3>
          <div className="space-y-2">
            {AI_PROVIDERS.filter((provider) => provider.enabled).map(
              (provider) => (
                <label
                  key={provider.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="aiProvider"
                    value={provider.id}
                    checked={aiProvider === provider.id}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="text-blue-500"
                  />
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-300">
                    {provider.name}
                  </span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Plan Overview */}
        <div className="p-4 border-b border-zinc-800/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">Plan Overview</h3>
            <div className="text-xs text-zinc-500">
              {dietPlans.length} total
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-zinc-900/50 p-3 rounded-lg">
              <div className="text-lg font-bold text-zinc-300">
                {dietPlans.filter((p) => p.status === "active").length}
              </div>
              <div className="text-xs text-zinc-500">Active Plans</div>
            </div>
            <div className="bg-zinc-900/50 p-3 rounded-lg">
              <div className="text-lg font-bold text-zinc-300">
                {clients.length}
              </div>
              <div className="text-xs text-zinc-500">Clients</div>
            </div>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="p-4 border-b border-zinc-800/30">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            Quick Templates
          </h3>
          <div className="space-y-2">
            {DIET_PLAN_TYPES.slice(0, 4).map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.id}
                  className={`flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/50 cursor-pointer group transition-all border-l-4 border-${type.color}-500`}
                  onClick={() => setPlanType(type.id)}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-zinc-400" />
                    <div className="text-xs font-medium text-zinc-300">
                      {type.name}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 group-hover:text-zinc-300">
                    +
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Plans */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">Recent Plans</h3>
            <button
              onClick={() => setShowPlansList(true)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              View All
            </button>
          </div>{" "}
          <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-dark pr-2 min-h-0">
            {dietPlans.slice(0, 10).map((plan) => (
              <div
                key={plan.id}
                className="p-3 bg-zinc-900/30 rounded-lg hover:bg-zinc-900/50 cursor-pointer transition-all"
                onClick={() => handleViewPlanDetails(plan)}
              >
                <div className="font-medium text-zinc-300 text-sm truncate">
                  {plan.title}
                </div>
                <div className="text-xs text-zinc-400 mb-1">
                  {plan.client_name || "Generic Plan"}
                </div>
                <div className="text-xs text-zinc-500">
                  {new Date(plan.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-3 mb-3">
            <ChefHat className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">AI Diet Plan Generator</h1>
          </div>
          <p className="text-zinc-400">
            Create personalized nutrition plans for your clients using AI
          </p>
        </div>

        {/* Content Area (scrolls) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-dark">
          <div className="p-6 space-y-6 max-w-4xl">
            {" "}
            {/* Client Selection */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold">
                  Select Client (Optional)
                </h2>
              </div>

              <div className="text-sm text-zinc-400 mb-4">
                Choose a client to personalize the diet plan, or leave empty to
                create a generic plan
              </div>

              {/* Client Selection UI */}
              <div className="space-y-3">
                {selectedClient ? (
                  /* Selected Client Display */
                  <div className="flex items-center justify-between bg-zinc-700 rounded p-3 border border-green-500">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-green-400">
                          {selectedClient.first_name} {selectedClient.last_name}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {selectedClient.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleClearClient}
                      className="p-1 rounded-full hover:bg-zinc-600 text-zinc-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Client Search */
                  <>
                    <div className="relative">
                      <input
                        ref={clientSearchRef}
                        type="text"
                        placeholder="Search clients..."
                        className="w-full p-3 rounded bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>

                    {/* Client Search Results */}
                    {clientSearch && (
                      <div className="max-h-40 overflow-y-auto bg-zinc-700 border border-zinc-600 rounded">
                        {filteredClients.length > 0 ? (
                          filteredClients.map((client) => (
                            <button
                              key={client.id}
                              onClick={() => handleClientSelect(client)}
                              className="w-full text-left p-3 hover:bg-zinc-600 transition-colors border-b border-zinc-600 last:border-b-0"
                            >
                              <div className="font-medium text-white">
                                {client.first_name} {client.last_name}
                              </div>
                              <div className="text-sm text-zinc-400">
                                {client.email}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-zinc-400 text-center">
                            No clients match your search
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            {/* Plan Details */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold">Plan Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Plan Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a title for this diet plan..."
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            {/* Diet Plan Type */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold">Diet Plan Goal</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DIET_PLAN_TYPES.map((plan) => {
                  const IconComponent = plan.icon;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setPlanType(plan.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        planType === plan.id
                          ? `border-${plan.color}-500 bg-${plan.color}-500/10`
                          : "border-zinc-600 hover:border-zinc-500"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent
                          className={`w-5 h-5 text-${plan.color}-400`}
                        />
                        <span className="font-medium">{plan.name}</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {plan.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Meal Configuration */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold">Meal Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meals per day */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Meals per day
                  </label>
                  <select
                    value={mealsPerDay}
                    onChange={(e) => setMealsPerDay(Number(e.target.value))}
                    className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MEALS_PER_DAY.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom calories */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <input
                      type="checkbox"
                      checked={useCustomCalories}
                      onChange={(e) => setUseCustomCalories(e.target.checked)}
                      className="mr-2"
                    />
                    Custom calorie target
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 2000"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    disabled={!useCustomCalories}
                    className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
            {/* Generation Controls */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Generate Plan</h3>

              <div className="space-y-4">
                <button
                  onClick={handleGeneratePlan}
                  disabled={!planType || !planTitle.trim() || generating}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Create Diet Plan
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-2 px-4 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors"
                >
                  Reset Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* All existing modals remain the same */}
      {/* View All Plans Modal */}
      {showPlansList && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">
                All Diet Plans
              </h2>
              <button
                onClick={() => setShowPlansList(false)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-dark">
              {dietPlans.length === 0 ? (
                <div className="text-center py-8">
                  <ChefHat className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">No diet plans created yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dietPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm truncate">
                            {plan.title}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1">
                            {plan.client_name || "Generic Plan"}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Created:{" "}
                            {new Date(plan.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 ml-3">
                          <button
                            onClick={() => handleViewPlanDetails(plan)}
                            className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPlanForAction(plan);
                              setShowAssignModal(true);
                            }}
                            className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-green-400 transition-colors"
                            title="Assign to Clients"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPlanForAction(plan);
                              setShowDuplicateModal(true);
                            }}
                            className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-yellow-400 transition-colors"
                            title="Duplicate to Clients"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPlanForAction(plan);
                              setShowDeleteConfirmModal(true);
                            }}
                            className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-zinc-700 rounded text-zinc-300">
                          {plan.plan_type?.replace("_", " ") || "Unknown Type"}
                        </span>
                        <span className="px-2 py-1 bg-zinc-700 rounded text-zinc-300">
                          {plan.meals_per_day} meals/day
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Plan Details Modal */}
      {showPlanDetailModal && planDetails && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
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
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-dark">
              <div className="space-y-6">
                {/* Plan Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-zinc-500">Client</span>
                    <p className="text-sm font-medium text-zinc-300">
                      {planDetails.client_name || "Generic Plan"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">Plan Type</span>
                    <p className="text-sm font-medium text-zinc-300">
                      {planDetails.plan_type?.replace("_", " ") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">Meals/Day</span>
                    <p className="text-sm font-medium text-zinc-300">
                      {planDetails.meals_per_day}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">Created</span>
                    <p className="text-sm font-medium text-zinc-300">
                      {new Date(planDetails.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Plan Content */}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-300 mb-3">
                    Diet Plan Content
                  </h3>
                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div
                      className="text-sm text-zinc-300 whitespace-pre-wrap max-h-96 overflow-y-auto scrollbar-thin scrollbar-dark"
                      dangerouslySetInnerHTML={{
                        __html: planDetails.content || "No content available",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Assign Plan Modal */}
      {showAssignModal && selectedPlanForAction && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">
                Assign Plan to Clients
              </h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPlanForAction(null);
                  setSelectedClientsForAction([]);
                }}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-2">
                  Plan: {selectedPlanForAction.title}
                </h3>
                <p className="text-xs text-zinc-500">
                  Select clients to assign this plan to
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-dark border border-zinc-700 rounded-lg">
                {clients.map((client) => (
                  <label
                    key={client.id}
                    className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-700 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClientsForAction.includes(client.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClientsForAction([
                            ...selectedClientsForAction,
                            client.id,
                          ]);
                        } else {
                          setSelectedClientsForAction(
                            selectedClientsForAction.filter(
                              (id) => id !== client.id
                            )
                          );
                        }
                      }}
                      className="rounded border-zinc-600 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-zinc-300">
                        {client.first_name} {client.last_name}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {client.email}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedPlanForAction(null);
                    setSelectedClientsForAction([]);
                  }}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignPlan}
                  disabled={
                    selectedClientsForAction.length === 0 || isAssigning
                  }
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-white flex items-center gap-2"
                >
                  {isAssigning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      Assign Plan ({selectedClientsForAction.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Duplicate Plan Modal */}
      {showDuplicateModal && selectedPlanForAction && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">
                Duplicate Plan to Clients
              </h2>
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  setSelectedPlanForAction(null);
                  setSelectedClientsForAction([]);
                }}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-2">
                  Plan: {selectedPlanForAction.title}
                </h3>
                <p className="text-xs text-zinc-500">
                  Create separate copies of this plan for selected clients
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-dark border border-zinc-700 rounded-lg">
                {clients.map((client) => (
                  <label
                    key={client.id}
                    className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-700 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClientsForAction.includes(client.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClientsForAction([
                            ...selectedClientsForAction,
                            client.id,
                          ]);
                        } else {
                          setSelectedClientsForAction(
                            selectedClientsForAction.filter(
                              (id) => id !== client.id
                            )
                          );
                        }
                      }}
                      className="rounded border-zinc-600 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-zinc-300">
                        {client.first_name} {client.last_name}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {client.email}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setSelectedPlanForAction(null);
                    setSelectedClientsForAction([]);
                  }}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDuplicatePlan}
                  disabled={
                    selectedClientsForAction.length === 0 || isDuplicating
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-white flex items-center gap-2"
                >
                  {isDuplicating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Duplicating...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Duplicate Plan ({selectedClientsForAction.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => {
          setShowDeleteConfirmModal(false);
          setSelectedPlanForAction(null);
        }}
        onConfirm={handleDeletePlan}
        title="Delete Diet Plan"
        message={`Are you sure you want to delete "${selectedPlanForAction?.title}"? This action cannot be undone.`}
        confirmText="Delete Plan"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
