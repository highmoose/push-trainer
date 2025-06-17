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
} from "lucide-react";

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
  const [aiProvider, setAiProvider] = useState("openai");
  // UI state
  const [showPlansList, setShowPlansList] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showPlanDetailModal, setShowPlanDetailModal] = useState(false);
  const [selectedPlanForAction, setSelectedPlanForAction] = useState(null);
  const [selectedClientsForAction, setSelectedClientsForAction] = useState([]);
  const [planDetails, setPlanDetails] = useState(null);

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

  // Handle duplicate plan
  const handleDuplicatePlan = async () => {
    if (!selectedPlanForAction || selectedClientsForAction.length === 0) {
      return;
    }

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
    } catch (error) {
      console.error("Failed to duplicate plan:", error);
    }
  };

  // Handle link plan to clients
  const handleLinkPlan = async () => {
    if (!selectedPlanForAction || selectedClientsForAction.length === 0) {
      return;
    }

    try {
      await dispatch(
        linkDietPlanToClients({
          id: selectedPlanForAction.id,
          clientIds: selectedClientsForAction,
        })
      );
      setShowLinkModal(false);
      setSelectedPlanForAction(null);
      setSelectedClientsForAction([]);
    } catch (error) {
      console.error("Failed to link plan:", error);
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
    <div className="w-full h-full bg-zinc-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <ChefHat className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">AI Diet Plan Generator</h1>
          </div>
          <p className="text-gray-400">
            Create personalized nutrition plans for your clients using AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
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

              {/* Client Selection */}
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
            {/* Client Preferences Display */}
            {selectedClient && (
              <div className="bg-zinc-800 rounded-lg p-6 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-semibold">
                    Client Profile & Preferences
                  </h2>
                </div>

                <div className="text-sm text-blue-400 mb-4">
                  This information will be used to create a personalized diet
                  plan
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Physical Metrics */}
                  <div className="bg-zinc-700/50 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-green-400" />
                      Physical Metrics
                    </h3>
                    <div className="space-y-2 text-sm">
                      {selectedClient.weight && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Weight:</span>
                          <span className="text-white">
                            {selectedClient.weight} kg
                          </span>
                        </div>
                      )}
                      {selectedClient.height && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Height:</span>
                          <span className="text-white">
                            {selectedClient.height} cm
                          </span>
                        </div>
                      )}
                      {selectedClient.age && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Age:</span>
                          <span className="text-white">
                            {selectedClient.age} years
                          </span>
                        </div>
                      )}
                      {selectedClient.body_fat && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Body Fat:</span>
                          <span className="text-white">
                            {selectedClient.body_fat}%
                          </span>
                        </div>
                      )}
                      {selectedClient.activity_level && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Activity Level:</span>
                          <span className="text-white capitalize">
                            {selectedClient.activity_level}
                          </span>
                        </div>
                      )}
                      {!selectedClient.weight &&
                        !selectedClient.height &&
                        !selectedClient.age &&
                        !selectedClient.body_fat &&
                        !selectedClient.activity_level && (
                          <div className="text-zinc-500 italic">
                            No physical metrics available
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Dietary Information */}
                  <div className="bg-zinc-700/50 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      Dietary Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      {selectedClient.allergies && (
                        <div>
                          <div className="text-zinc-400 mb-1">Allergies:</div>
                          <div className="text-white bg-red-500/20 border border-red-500/30 rounded px-2 py-1">
                            {selectedClient.allergies}
                          </div>
                        </div>
                      )}
                      {selectedClient.food_preferences && (
                        <div>
                          <div className="text-zinc-400 mb-1">
                            Food Preferences:
                          </div>
                          <div className="text-white bg-green-500/20 border border-green-500/30 rounded px-2 py-1">
                            {selectedClient.food_preferences}
                          </div>
                        </div>
                      )}
                      {selectedClient.dietary_restrictions && (
                        <div>
                          <div className="text-zinc-400 mb-1">
                            Dietary Restrictions:
                          </div>
                          <div className="text-white bg-yellow-500/20 border border-yellow-500/30 rounded px-2 py-1">
                            {selectedClient.dietary_restrictions}
                          </div>
                        </div>
                      )}
                      {selectedClient.food_dislikes && (
                        <div>
                          <div className="text-zinc-400 mb-1">
                            Food Dislikes:
                          </div>
                          <div className="text-white bg-orange-500/20 border border-orange-500/30 rounded px-2 py-1">
                            {selectedClient.food_dislikes}
                          </div>
                        </div>
                      )}
                      {!selectedClient.allergies &&
                        !selectedClient.food_preferences &&
                        !selectedClient.dietary_restrictions &&
                        !selectedClient.food_dislikes && (
                          <div className="text-zinc-500 italic">
                            No dietary information available
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Goals & Notes */}
                {(selectedClient.fitness_goals || selectedClient.notes) && (
                  <div className="mt-4 bg-zinc-700/50 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      Goals & Additional Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      {selectedClient.fitness_goals && (
                        <div>
                          <div className="text-zinc-400 mb-1">
                            Fitness Goals:
                          </div>
                          <div className="text-white">
                            {selectedClient.fitness_goals}
                          </div>
                        </div>
                      )}
                      {selectedClient.notes && (
                        <div>
                          <div className="text-zinc-400 mb-1">
                            Additional Notes:
                          </div>
                          <div className="text-white">
                            {selectedClient.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-300">
                      <strong>AI Integration:</strong> All this information will
                      be automatically included in the AI prompt to generate a
                      highly personalized diet plan tailored specifically for{" "}
                      {selectedClient.first_name}.
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Plan Title */}
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

                {/* AI Provider Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    AI Provider
                  </label>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {AI_PROVIDERS.filter((provider) => provider.enabled).map(
                      (provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      )
                    )}
                  </select>
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
            {/* Meal Complexity */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold">Meal Complexity</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MEAL_COMPLEXITY.map((complexity) => {
                  const IconComponent = complexity.icon;
                  return (
                    <button
                      key={complexity.id}
                      onClick={() => setMealComplexity(complexity.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        mealComplexity === complexity.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-zinc-600 hover:border-zinc-500"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="w-5 h-5 text-blue-400" />
                        <span className="font-medium">{complexity.name}</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {complexity.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Additional Notes */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold">Additional Notes</h2>
              </div>

              <textarea
                placeholder="Any specific requirements, preferences, or notes for the AI to consider..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={4}
                className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            {/* Generation Controls */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Generate Plan</h3>

              <div className="space-y-4">
                {" "}
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
            {/* Configuration Summary */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Configuration Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Client:</span>{" "}
                  <span className="text-right">
                    {selectedClient
                      ? `${selectedClient.first_name} ${selectedClient.last_name}`
                      : "Generic Plan"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Goal:</span>
                  <span className="text-right">
                    {planType
                      ? DIET_PLAN_TYPES.find((p) => p.id === planType)?.name
                      : "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Meals:</span>
                  <span>{mealsPerDay} per day</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Complexity:</span>
                  <span className="capitalize">{mealComplexity}</span>
                </div>

                {useCustomCalories && customCalories && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Calories:</span>
                    <span>{customCalories} kcal</span>
                  </div>
                )}
              </div>
            </div>{" "}
            {/* Generated Plan Preview */}
            {currentPlan && (
              <div className="bg-green-900/20 border border-green-600 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-green-400">
                    Plan Generated!
                  </h3>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  {currentPlan.title} has been successfully generated
                  {currentPlan.client_name && ` for ${currentPlan.client_name}`}
                </p>{" "}
                <div className="space-y-2">
                  <button
                    onClick={() => handleViewPlanDetails(currentPlan)}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors text-sm"
                  >
                    View Full Plan
                  </button>
                  <button className="w-full py-2 px-4 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors text-sm">
                    Save & Assign
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plan Management Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold">Existing Diet Plans</h2>
            </div>
            <button
              onClick={() => setShowPlansList(!showPlansList)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors"
            >
              {showPlansList ? "Hide Plans" : "Show Plans"}
            </button>
          </div>

          {showPlansList && (
            <div className="bg-zinc-800 rounded-lg p-6">
              {dietPlans.length === 0 ? (
                <div className="text-center py-8">
                  <ChefHat className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">No diet plans created yet</p>
                  <p className="text-sm text-zinc-500 mt-2">
                    Create your first AI-generated diet plan above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dietPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-zinc-700 rounded-lg p-4 border border-zinc-600"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">
                            {plan.title}
                          </h3>
                          {plan.client_name && (
                            <p className="text-sm text-green-400 mb-1">
                              For: {plan.client_name}
                            </p>
                          )}
                          <p className="text-xs text-zinc-400">
                            {plan.plan_type &&
                              DIET_PLAN_TYPES.find(
                                (t) => t.id === plan.plan_type
                              )?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
                        <span>{plan.meals_per_day} meals/day</span>
                        <span className="capitalize">
                          {plan.meal_complexity}
                        </span>
                      </div>{" "}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewPlanDetails(plan)}
                          className="flex-1 px-3 py-2 bg-zinc-600 hover:bg-zinc-500 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                          title="View full plan details"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPlanForAction(plan);
                            setShowDuplicateModal(true);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                          title="Duplicate this plan"
                        >
                          <Copy className="w-3 h-3" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPlanForAction(plan);
                            setShowLinkModal(true);
                          }}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                          title="Link to clients"
                        >
                          <Link className="w-3 h-3" />
                          Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Duplicate Plan Modal */}
        {showDuplicateModal && selectedPlanForAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Duplicate Plan</h3>
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setSelectedPlanForAction(null);
                    setSelectedClientsForAction([]);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-zinc-400 mb-4">
                Select clients to create copies of "
                {selectedPlanForAction.title}" for:
              </p>

              <div className="max-h-64 overflow-y-auto mb-4">
                {clients.map((client) => (
                  <label
                    key={client.id}
                    className="flex items-center gap-3 p-3 hover:bg-zinc-700 rounded cursor-pointer"
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
                      className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {client.first_name} {client.last_name}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {client.email}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setSelectedPlanForAction(null);
                    setSelectedClientsForAction([]);
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDuplicatePlan}
                  disabled={selectedClientsForAction.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Link Plan Modal */}
        {showLinkModal && selectedPlanForAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Link Plan to Clients</h3>
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setSelectedPlanForAction(null);
                    setSelectedClientsForAction([]);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-zinc-400 mb-4">
                Select clients to link "{selectedPlanForAction.title}" to:
              </p>

              <div className="max-h-64 overflow-y-auto mb-4">
                {clients.map((client) => (
                  <label
                    key={client.id}
                    className="flex items-center gap-3 p-3 hover:bg-zinc-700 rounded cursor-pointer"
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
                      className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {client.first_name} {client.last_name}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {client.email}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setSelectedPlanForAction(null);
                    setSelectedClientsForAction([]);
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkPlan}
                  disabled={selectedClientsForAction.length === 0}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plan Details Modal */}
        {showPlanDetailModal && planDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-zinc-800 border-b border-zinc-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {planDetails.title}
                    </h3>
                    {planDetails.client_name && (
                      <p className="text-sm text-green-400">
                        For: {planDetails.client_name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowPlanDetailModal(false);
                      setPlanDetails(null);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Plan Overview */}
                {planDetails.ai_input && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Plan Overview
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-zinc-700 rounded-lg p-3">
                        <div className="text-zinc-400">Goal</div>
                        <div className="text-white font-medium">
                          {DIET_PLAN_TYPES.find(
                            (t) => t.id === planDetails.ai_input.plan_type
                          )?.name || planDetails.ai_input.plan_type}
                        </div>
                      </div>
                      <div className="bg-zinc-700 rounded-lg p-3">
                        <div className="text-zinc-400">Meals/Day</div>
                        <div className="text-white font-medium">
                          {planDetails.ai_input.meals_per_day}
                        </div>
                      </div>
                      <div className="bg-zinc-700 rounded-lg p-3">
                        <div className="text-zinc-400">Complexity</div>
                        <div className="text-white font-medium capitalize">
                          {planDetails.ai_input.meal_complexity}
                        </div>
                      </div>
                      {planDetails.ai_input.custom_calories && (
                        <div className="bg-zinc-700 rounded-lg p-3">
                          <div className="text-zinc-400">Target Calories</div>
                          <div className="text-white font-medium">
                            {planDetails.ai_input.custom_calories} kcal
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Daily Totals */}
                {planDetails.ai_content?.daily_totals && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Daily Nutrition Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-3">
                        <div className="text-blue-400">Calories</div>
                        <div className="text-white font-medium text-lg">
                          {planDetails.ai_content.daily_totals.calories}
                        </div>
                      </div>
                      <div className="bg-green-900/20 border border-green-600 rounded-lg p-3">
                        <div className="text-green-400">Protein</div>
                        <div className="text-white font-medium text-lg">
                          {planDetails.ai_content.daily_totals.protein}g
                        </div>
                      </div>
                      <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
                        <div className="text-yellow-400">Carbs</div>
                        <div className="text-white font-medium text-lg">
                          {planDetails.ai_content.daily_totals.carbs}g
                        </div>
                      </div>
                      <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-3">
                        <div className="text-purple-400">Fats</div>
                        <div className="text-white font-medium text-lg">
                          {planDetails.ai_content.daily_totals.fats}g
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meals */}
                {planDetails.ai_content?.meals && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Meal Plan
                    </h4>
                    <div className="space-y-4">
                      {planDetails.ai_content.meals.map((meal, index) => (
                        <div key={index} className="bg-zinc-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-white">
                              Meal {meal.meal_number}: {meal.name}
                            </h5>
                            <div className="text-sm text-zinc-400">
                              {meal.preparation_time}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                            <div className="text-blue-400">
                              {meal.calories} cal
                            </div>
                            <div className="text-green-400">
                              {meal.protein}g protein
                            </div>
                            <div className="text-yellow-400">
                              {meal.carbs}g carbs
                            </div>
                            <div className="text-purple-400">
                              {meal.fats}g fats
                            </div>
                          </div>

                          <div className="mb-2">
                            <div className="text-sm text-zinc-400 mb-1">
                              Ingredients:
                            </div>
                            <div className="text-sm text-white">
                              {meal.ingredients.join(", ")}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-zinc-400 mb-1">
                              Instructions:
                            </div>
                            <div className="text-sm text-white">
                              {meal.instructions}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shopping List */}
                {planDetails.ai_content?.shopping_list && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Shopping List
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(planDetails.ai_content.shopping_list).map(
                        ([category, items]) => (
                          <div
                            key={category}
                            className="bg-zinc-700 rounded-lg p-4"
                          >
                            <h5 className="font-semibold text-white mb-2">
                              {category}
                            </h5>
                            <ul className="text-sm text-zinc-300 space-y-1">
                              {items.map((item, index) => (
                                <li key={index}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Meal Timing */}
                {planDetails.ai_content?.meal_timing && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Recommended Meal Timing
                    </h4>
                    <div className="bg-zinc-700 rounded-lg p-4">
                      <ul className="text-sm text-zinc-300 space-y-2">
                        {planDetails.ai_content.meal_timing.map(
                          (timing, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-400" />
                              {timing}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Preparation Tips */}
                {planDetails.ai_content?.preparation_tips && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Preparation Tips
                    </h4>
                    <div className="bg-zinc-700 rounded-lg p-4">
                      <ul className="text-sm text-zinc-300 space-y-2">
                        {planDetails.ai_content.preparation_tips.map(
                          (tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <ChefHat className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              {tip}{" "}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
