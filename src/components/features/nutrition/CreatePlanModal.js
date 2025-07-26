"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
} from "lucide-react";
import {
  buildDietPlanPrompt,
  DIET_PLAN_TYPES,
} from "@/lib/builders/dietPromptBuilder";

// Add UI display properties to plan types
const UI_DIET_PLAN_TYPES = DIET_PLAN_TYPES.map((type) => ({
  ...type,
  icon: type.id.includes("cut")
    ? TrendingDown
    : type.id.includes("bulk")
    ? TrendingUp
    : type.id === "maintain"
    ? Minus
    : Target,
  color:
    type.id === "aggressive_cut"
      ? "red"
      : type.id === "moderate_cut"
      ? "orange"
      : type.id === "maintain"
      ? "blue"
      : type.id === "recomp"
      ? "purple"
      : type.id === "lean_bulk"
      ? "green"
      : "emerald",
}));

const CreatePlanModal = ({
  isOpen,
  onClose,
  clients,
  selectedClient,
  initialPlanName = "",
  generateDietPlanWithPlaceholder,
}) => {
  // Use state for local loading and error tracking
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Form state
  const [selectedClientForForm, setSelectedClientForForm] = useState(null);
  console.log("Selected client for form:", selectedClientForForm);
  const [planTitle, setPlanTitle] = useState("");
  const [planType, setPlanType] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [mealComplexity, setMealComplexity] = useState("moderate");
  const [customCalories, setCustomCalories] = useState("");
  const [useCustomCalories, setUseCustomCalories] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [aiProvider, setAiProvider] = useState("openai");
  const [setAsActive, setSetAsActive] = useState(false);

  useEffect(() => {
    if (isOpen && initialPlanName) {
      setPlanTitle(initialPlanName);
    }
    if (isOpen) {
      setGenerationError(null);
      setIsGenerating(false);
    }
  }, [isOpen, initialPlanName]);

  if (!isOpen) return null;

  const resetForm = () => {
    setPlanTitle("");
    setPlanType("");
    setSelectedClientForForm(null);
    setAdditionalNotes("");
    setCustomCalories("");
    setUseCustomCalories(false);
    setSetAsActive(false);
    setMealsPerDay(4);
    setMealComplexity("moderate");
    setAiProvider("openai");
    setIsGenerating(false);
    setGenerationError(null);
  };

  // Activity level multipliers for calorie calculations
  const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light_activity: 1.375,
    moderate_activity: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  };

  // Calculate optimal calories based on client metrics and plan type
  const calculateOptimalCalories = (
    age,
    weight,
    height,
    gender,
    activityLevel,
    planType
  ) => {
    if (!age || !weight || !height) return null;

    // Calculate BMR using Harris-Benedict equation
    let bmr;
    if (gender === "male") {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }

    // Apply activity multiplier
    const multiplier =
      ACTIVITY_MULTIPLIERS[activityLevel] ||
      ACTIVITY_MULTIPLIERS.moderate_activity;
    const maintenanceCalories = Math.round(bmr * multiplier);

    // Apply plan type modifier
    const planConfig = DIET_PLAN_TYPES.find((p) => p.id === planType);
    const targetCalories = planConfig
      ? Math.round(maintenanceCalories * planConfig.calorieModifier)
      : maintenanceCalories;

    return targetCalories;
  };

  const handleGeneratePlan = async () => {
    if (!planType) {
      alert("Please select a diet plan goal");
      return;
    }

    if (!planTitle.trim()) {
      alert("Please enter a title for the diet plan");
      return;
    }

    // For AI generation, we need a client ID
    const client = selectedClientForForm || selectedClient;

    if (!client) {
      alert("Please select a client for AI diet plan generation");
      return;
    }

    if (!generateDietPlanWithPlaceholder) {
      alert("Diet plan generation is not available");
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationError(null);
      // Get client data
      const client = selectedClientForForm || selectedClient;
      const clientName = client
        ? `${client.first_name} ${client.last_name}`
        : null;

      // Extract only the essential client metrics (9 fields)
      let clientMetrics = null;
      if (client) {
        // Calculate age from date_of_birth if available
        let age = client.age;
        if (!age && client.date_of_birth) {
          const birthDate = new Date(client.date_of_birth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
        }

        clientMetrics = {
          age: age || null,
          weight: client.weight || null,
          height: client.height || null,
          fitness_level: client.fitness_level || null,
          fitness_goals: client.fitness_goals || null,
          fitness_experience: client.fitness_experience || null,
          food_likes: client.food_likes || null,
          food_dislikes: client.food_dislikes || null,
          allergies: client.allergies || null,
        };
      }

      // Calculate target calories in the modal
      let targetCalories = null;
      if (useCustomCalories && customCalories) {
        // Manual calorie override
        targetCalories = parseInt(customCalories);
      } else if (
        client &&
        clientMetrics?.age &&
        clientMetrics?.weight &&
        clientMetrics?.height
      ) {
        // Automatic calorie calculation
        const gender = client.gender || "male";
        targetCalories = calculateOptimalCalories(
          clientMetrics.age,
          clientMetrics.weight,
          clientMetrics.height,
          gender,
          clientMetrics.fitness_level || "moderate_activity",
          planType
        );
      }

      // Prepare plan options for the builder
      const planOptions = {
        planType,
        mealsPerDay,
        mealComplexity,
        additionalNotes,
      };

      // Build prompt using simplified builder
      const enhancedPrompt = buildDietPlanPrompt(
        planOptions,
        clientMetrics,
        targetCalories,
        clientName
      );

      // Prepare data for database storage - matches diet_plans table structure
      const planData = {
        title: planTitle.trim(),
        client_id: client?.id || null,
        client_name: client?.name || "", // Add client name for placeholder display
        ai_prompt: enhancedPrompt, // Complete prompt ready for AI
        client_metrics: clientMetrics, // Essential 9 client metrics for storage
        plan_type: planType,
        meals_per_day: mealsPerDay,
        meal_complexity: mealComplexity,
        total_calories: targetCalories,
        generated_by_ai: true, // Since this is AI-generated
        is_active: setAsActive, // Map set_as_active to is_active column
        description: additionalNotes || null, // Map additional_notes to description column
      };

      // Close modal immediately for better UX
      resetForm();
      onClose();

      // Create the diet plan using the generate endpoint with placeholder
      const result = await generateDietPlanWithPlaceholder(client?.id, {
        title: planTitle.trim(),
        client_name: `${client?.first_name || ""} ${
          client?.last_name || ""
        }`.trim(),
        client_metrics: clientMetrics,
        plan_type: planType,
        meals_per_day: mealsPerDay,
        meal_complexity: mealComplexity,
        total_calories: targetCalories,
        generated_by_ai: true,
        is_active: setAsActive,
        description: additionalNotes || null,
        ai_prompt: enhancedPrompt,
      });

      if (result.success) {
        console.log("Diet plan generated successfully");
        setIsGenerating(false);
      } else {
        throw new Error(result.error || "Failed to generate diet plan");
      }
    } catch (error) {
      console.error("Error creating diet plan:", error);
      setIsGenerating(false);

      const errorMessage =
        error.message || "Failed to create diet plan. Please try again.";
      setGenerationError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-950 border border-zinc-900 rounded max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex bg-zinc-900 items-center justify-between p-4 px-8 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Create Diet Plan</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded hover:bg-zinc-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-dark p-4 px-8 bg-zinc-900">
          {/* Show error if exists */}
          {generationError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-sm">
              Error: {generationError}
            </div>
          )}

          <div className="space-y-4">
            {/* Plan Title */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Plan Title
                </label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="Enter plan title"
                  className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Client Selection */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">
                Client Selection <span className="text-red-400">*</span>
              </h3>
              <p className="text-xs text-zinc-500 mb-3">
                AI diet plan generation requires client information to create
                personalized plans.
              </p>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Select Client
                </label>
                <select
                  value={selectedClientForForm?.id || selectedClient?.id || ""}
                  onChange={(e) => {
                    const clientId = e.target.value;
                    if (clientId) {
                      const client = clients.find(
                        (c) => c.id === parseInt(clientId)
                      );
                      setSelectedClientForForm(client);
                    } else {
                      setSelectedClientForForm(null);
                      setSetAsActive(false);
                    }
                  }}
                  className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                >
                  <option value="">Select a client (required)</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Profile Information */}
              {(selectedClientForForm || selectedClient) && (
                <div className="mt-3 p-3 bg-zinc-800 rounded border border-zinc-700">
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">
                    Client Profile Data
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {(selectedClientForForm || selectedClient)?.height && (
                      <div>
                        <span className="text-zinc-500">Height:</span>
                        <span className="text-zinc-300 ml-1">
                          {(selectedClientForForm || selectedClient).height} cm
                        </span>
                      </div>
                    )}
                    {(selectedClientForForm || selectedClient)?.weight && (
                      <div>
                        <span className="text-zinc-500">Weight:</span>
                        <span className="text-zinc-300 ml-1">
                          {(selectedClientForForm || selectedClient).weight} kg
                        </span>
                      </div>
                    )}
                    {(selectedClientForForm || selectedClient)
                      ?.fitness_level && (
                      <div>
                        <span className="text-zinc-500">Activity Level:</span>
                        <span className="text-zinc-300 ml-1 capitalize">
                          {(
                            selectedClientForForm || selectedClient
                          ).fitness_level.replace("_", " ")}
                        </span>
                      </div>
                    )}
                    {(selectedClientForForm || selectedClient)?.allergies && (
                      <div className="col-span-2 md:col-span-3">
                        <span className="text-zinc-500">Allergies:</span>
                        <span className="text-zinc-300 ml-1">
                          {(selectedClientForForm || selectedClient).allergies}
                        </span>
                      </div>
                    )}
                    {(selectedClientForForm || selectedClient)?.food_likes && (
                      <div className="col-span-2 md:col-span-3">
                        <span className="text-zinc-500">Food Likes:</span>
                        <span className="text-zinc-300 ml-1">
                          {(selectedClientForForm || selectedClient).food_likes}
                        </span>
                      </div>
                    )}
                    {(selectedClientForForm || selectedClient)
                      ?.food_dislikes && (
                      <div className="col-span-2 md:col-span-3">
                        <span className="text-zinc-500">Food Dislikes:</span>
                        <span className="text-zinc-300 ml-1">
                          {
                            (selectedClientForForm || selectedClient)
                              .food_dislikes
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-green-400 mt-2">
                    ✓ This data will be used to personalize the diet plan
                  </p>
                </div>
              )}

              {selectedClient && !selectedClientForForm && (
                <p className="text-sm text-blue-400 mt-1">
                  Currently creating for: {selectedClient.first_name}{" "}
                  {selectedClient.last_name}
                </p>
              )}
            </div>

            {/* Set as Active Option - Only show if client is selected */}
            {(selectedClientForForm || selectedClient) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">
                  Plan Assignment
                </h3>
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setAsActive}
                      onChange={(e) => setSetAsActive(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 focus:ring-blue-500 focus:ring-2 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-zinc-300">
                        Set as active plan for{" "}
                        {(selectedClientForForm || selectedClient)?.first_name}{" "}
                        {(selectedClientForForm || selectedClient)?.last_name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        This will automatically assign this plan as the client's
                        active nutrition plan and deactivate any existing active
                        plans.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Plan Type Selection */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">
                Diet Plan Goal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {UI_DIET_PLAN_TYPES.map((type) => {
                  const calorieIndicators = {
                    aggressive_cut: {
                      text: "-25% calories",
                      color: "text-red-400",
                    },
                    moderate_cut: {
                      text: "-15% calories",
                      color: "text-orange-400",
                    },
                    maintain: { text: "Maintenance", color: "text-blue-400" },
                    recomp: { text: "-5% calories", color: "text-purple-400" },
                    lean_bulk: {
                      text: "+10% calories",
                      color: "text-green-400",
                    },
                    aggressive_bulk: {
                      text: "+20% calories",
                      color: "text-emerald-400",
                    },
                  };

                  const indicator = calorieIndicators[type.id] || {
                    text: "",
                    color: "",
                  };

                  return (
                    <button
                      key={type.id}
                      onClick={() => setPlanType(type.id)}
                      className={`p-3 rounded border-2 transition-all text-left ${
                        planType === type.id
                          ? "border-blue-500 bg-blue-500/10 text-blue-300"
                          : "border-zinc-800 bg-zinc-900 hover:border-zinc-600 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <type.icon className="w-5 h-5" />
                          <span className="font-medium">{type.name}</span>
                        </div>
                        <span
                          className={`text-xs font-semibold ${indicator.color}`}
                        >
                          {indicator.text}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plan Settings and Calories - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plan Settings */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">
                  Plan Settings
                </h3>
                <div className="space-y-4">
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
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-zinc-500 mt-1">
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                      <span>6</span>
                    </div>
                  </div>

                  {/* Meal Complexity */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Meal Complexity
                    </label>
                    <select
                      value={mealComplexity}
                      onChange={(e) => setMealComplexity(e.target.value)}
                      className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="simple">
                        Simple - Basic recipes, minimal prep
                      </option>
                      <option value="moderate">
                        Moderate - Standard home cooking
                      </option>
                      <option value="complex">
                        Complex - Advanced recipes, longer prep
                      </option>
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Any specific requirements or preferences..."
                      rows={3}
                      className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Calories Settings */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">
                  Calories
                </h3>
                <div className="space-y-4">
                  {/* Automatic Calories Option */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="calorieOption"
                        checked={!useCustomCalories}
                        onChange={() => setUseCustomCalories(false)}
                        className="mt-1 w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <div>
                        <div className="text-sm font-medium text-zinc-300">
                          Automatic
                        </div>
                        <div className="text-xs text-zinc-500">
                          We'll calculate the total calories based on your plan.
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Manual Calories Option */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="calorieOption"
                        checked={useCustomCalories}
                        onChange={() => setUseCustomCalories(true)}
                        className="mt-1 w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-zinc-300">
                          Enter calories manually
                        </div>
                        <div className="text-xs text-zinc-500 mb-2">
                          Take full control of the calorie count.
                        </div>
                        {useCustomCalories && (
                          <input
                            type="number"
                            value={customCalories}
                            onChange={(e) => setCustomCalories(e.target.value)}
                            placeholder="e.g., 2000"
                            min="800"
                            max="5000"
                            className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 bg-zinc-900 p-4 px-8">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGeneratePlan}
            disabled={!planType || !planTitle.trim() || isGenerating}
            className="px-6 py-2 bg-zinc-800 hover:bg-white hover:text-black text-white rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "Generating Plan..." : "Generate Plan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanModal;
