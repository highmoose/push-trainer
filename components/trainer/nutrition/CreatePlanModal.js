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
  {
    id: "lean_bulk",
    name: "Lean Bulk",
    description: "Muscle gain with minimal fat gain",
    icon: TrendingUp,
    color: "green",
  },
  {
    id: "aggressive_bulk",
    name: "Aggressive Muscle Gain",
    description: "Rapid muscle gain with significant caloric surplus",
    icon: TrendingUp,
    color: "emerald",
  },
];

// Generate enhanced diet plan prompt with client data
const buildClientAwarePrompt = (
  selectedClientForForm,
  selectedClient,
  planType,
  mealsPerDay,
  mealComplexity,
  useCustomCalories,
  customCalories,
  additionalNotes
) => {
  const client = selectedClientForForm || selectedClient;
  const selectedPlanType = DIET_PLAN_TYPES.find((p) => p.id === planType);

  let prompt = `Create a comprehensive ${
    selectedPlanType?.name || planType
  } diet plan with the following specifications:\n\n`;

  // Plan specifications
  prompt += `PLAN REQUIREMENTS:\n`;
  prompt += `- Goal: ${selectedPlanType?.name || planType} - ${
    selectedPlanType?.description || ""
  }\n`;
  prompt += `- Meals per day: ${mealsPerDay}\n`;
  prompt += `- Meal complexity: ${mealComplexity}\n`;

  if (useCustomCalories && customCalories) {
    prompt += `- Target daily calories: ${customCalories}\n`;
  }

  // Client-specific information
  if (client) {
    prompt += `\nCLIENT PROFILE:\n`;
    prompt += `- Name: ${client.first_name} ${client.last_name}\n`;

    if (client.height) {
      prompt += `- Height: ${client.height} cm\n`;
    }

    if (client.weight) {
      prompt += `- Weight: ${client.weight} kg\n`;
    }

    if (client.fitness_level) {
      prompt += `- Activity Level: ${client.fitness_level.replace("_", " ")}\n`;
    }

    if (client.allergies && client.allergies.trim()) {
      prompt += `- ALLERGIES (CRITICAL): ${client.allergies}\n`;
    }

    if (client.food_likes && client.food_likes.trim()) {
      prompt += `- Food Preferences: ${client.food_likes}\n`;
    }

    if (client.food_dislikes && client.food_dislikes.trim()) {
      prompt += `- Foods to Avoid: ${client.food_dislikes}\n`;
    }

    if (client.medical_conditions && client.medical_conditions.trim()) {
      prompt += `- Medical Considerations: ${client.medical_conditions}\n`;
    }
  }

  // Additional notes
  if (additionalNotes && additionalNotes.trim()) {
    prompt += `\nADDITIONAL REQUIREMENTS:\n${additionalNotes}\n`;
  }

  // Output format requirements
  prompt += `\nIMPORTANT INSTRUCTIONS:\n`;
  prompt += `1. STRICTLY AVOID any foods mentioned in allergies or food dislikes\n`;
  prompt += `2. Prioritize foods mentioned in food preferences when possible\n`;
  prompt += `3. Calculate calories based on height, weight, and activity level if provided\n`;
  prompt += `4. Include detailed macronutrient breakdown for each meal\n`;
  prompt += `5. Provide specific portion sizes and cooking instructions\n`;
  prompt += `6. Consider the client's activity level for appropriate caloric intake\n`;
  prompt += `7. Format as a detailed, easy-to-follow meal plan\n`;

  return prompt;
};

const CreatePlanModal = ({
  isOpen,
  onClose,
  clients,
  selectedClient,
  onGeneratePlan,
  generateDietPlan,
  initialPlanName = "",
}) => {
  // Internal state management
  const [selectedClientForForm, setSelectedClientForForm] = useState(null);
  const [planTitle, setPlanTitle] = useState("");
  const [planType, setPlanType] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [mealComplexity, setMealComplexity] = useState("moderate");
  const [customCalories, setCustomCalories] = useState("");
  const [useCustomCalories, setUseCustomCalories] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [aiProvider, setAiProvider] = useState("openai");

  // Populate plan title when modal opens with initialPlanName
  useEffect(() => {
    if (isOpen && initialPlanName) {
      setPlanTitle(initialPlanName);
    }
  }, [isOpen, initialPlanName]);

  if (!isOpen) return null;

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

    // Use the selected client from the form or sidebar
    const clientId = selectedClientForForm?.id || selectedClient?.id || null;
    const client = selectedClientForForm || selectedClient;
    const clientName = client
      ? `${client.first_name} ${client.last_name}`
      : "Generic Plan";

    const enhancedPrompt = buildClientAwarePrompt(
      selectedClientForForm,
      selectedClient,
      planType,
      mealsPerDay,
      mealComplexity,
      useCustomCalories,
      customCalories,
      additionalNotes
    );

    const planData = {
      title: planTitle.trim(),
      clientName,
      clientId,
      planType,
      mealsPerDay,
      mealComplexity,
      dietPlanRequest: {
        prompt: enhancedPrompt,
        aiProvider,
        clientId,
        title: planTitle.trim(),
        planType,
        mealsPerDay,
        mealComplexity,
        customCalories: useCustomCalories ? customCalories : null,
        additionalNotes,
      },
    };

    // Reset form
    setPlanTitle("");
    setPlanType("");
    setSelectedClientForForm(null);
    setAdditionalNotes("");
    setCustomCalories("");
    setUseCustomCalories(false);
    setMealsPerDay(4);
    setMealComplexity("moderate");
    setAiProvider("openai");

    // Call the parent's generation handler
    await onGeneratePlan(planData);
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
          <div className="space-y-4">
            {/* Plan Title */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">
                Plan Details
              </h3>
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
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Client</h3>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Select Client (Optional)
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
                    }
                  }}
                  className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                            {(selectedClientForForm || selectedClient).height}{" "}
                            cm
                          </span>
                        </div>
                      )}
                      {(selectedClientForForm || selectedClient)?.weight && (
                        <div>
                          <span className="text-zinc-500">Weight:</span>
                          <span className="text-zinc-300 ml-1">
                            {(selectedClientForForm || selectedClient).weight}{" "}
                            kg
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
                            {
                              (selectedClientForForm || selectedClient)
                                .allergies
                            }
                          </span>
                        </div>
                      )}
                      {(selectedClientForForm || selectedClient)
                        ?.food_likes && (
                        <div className="col-span-2 md:col-span-3">
                          <span className="text-zinc-500">Food Likes:</span>
                          <span className="text-zinc-300 ml-1">
                            {
                              (selectedClientForForm || selectedClient)
                                .food_likes
                            }
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
            </div>

            {/* Plan Type Selection */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">
                Diet Plan Goal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DIET_PLAN_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPlanType(type.id)}
                    className={`p-3 rounded border-2 transition-all text-left ${
                      planType === type.id
                        ? "border-blue-500 bg-blue-500/10 text-blue-300"
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-600 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <type.icon className="w-5 h-5" />
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{type.description}</p>
                  </button>
                ))}
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
            disabled={!planType || !planTitle.trim()}
            className="px-6 py-2 bg-zinc-800 hover:bg-white hover:text-black text-white rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            Generate Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanModal;
