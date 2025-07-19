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
    description:
      "Fast fat loss with 25% calorie deficit - High protein, lower carbs",
    icon: TrendingDown,
    color: "red",
  },
  {
    id: "moderate_cut",
    name: "Moderate Weight Cut",
    description: "Steady fat loss with 15% calorie deficit - Balanced approach",
    icon: TrendingDown,
    color: "orange",
  },
  {
    id: "maintain",
    name: "Maintenance",
    description: "Maintain current weight and composition - Balanced macros",
    icon: Minus,
    color: "blue",
  },
  {
    id: "recomp",
    name: "Body Recomposition",
    description: "Lose fat while gaining muscle - High protein, slight deficit",
    icon: Target,
    color: "purple",
  },
  {
    id: "lean_bulk",
    name: "Lean Bulk",
    description: "Clean muscle gain with 10% surplus - Quality calories",
    icon: TrendingUp,
    color: "green",
  },
  {
    id: "aggressive_bulk",
    name: "Aggressive Muscle Gain",
    description: "Fast muscle gain with 20% surplus - High carbs and calories",
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

  let prompt = `=== DIET PLAN GENERATION REQUEST ===\n`;
  prompt += `PLAN TYPE: ${selectedPlanType?.name || planType} (${planType})\n`;
  prompt += `GOAL: ${selectedPlanType?.description || ""}\n\n`;

  prompt += `Create a comprehensive ${
    selectedPlanType?.name || planType
  } diet plan with the following specifications:\n\n`;

  // Plan specifications
  prompt += `PLAN REQUIREMENTS:\n`;
  prompt += `- Goal: ${selectedPlanType?.name || planType} - ${
    selectedPlanType?.description || ""
  }\n`;
  prompt += `- Meals per day: ${mealsPerDay}\n`;
  prompt += `- Meal complexity: ${mealComplexity}\n`;

  // Client-specific information and caloric calculations
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

    // Calculate BMR and add specific caloric guidelines based on plan type
    if (client.height && client.weight) {
      prompt += `\nCALORIC CALCULATIONS REQUIRED:\n`;
      prompt += `STEP 1: Calculate BMR using Harris-Benedict equation:\n`;
      prompt += `- For men: BMR = 88.362 + (13.397 × weight in kg) + (4.799 × height in cm) - (5.677 × age)\n`;
      prompt += `- For women: BMR = 447.593 + (9.247 × weight in kg) + (3.098 × height in cm) - (4.330 × age)\n`;
      prompt += `STEP 2: Apply activity level multiplier:\n`;
      prompt += `- Sedentary: BMR × 1.2\n`;
      prompt += `- Light activity: BMR × 1.375\n`;
      prompt += `- Moderate activity: BMR × 1.55\n`;
      prompt += `- Very active: BMR × 1.725\n`;
      prompt += `- Extremely active: BMR × 1.9\n`;

      // Specific caloric adjustments based on plan type
      switch (planType) {
        case "aggressive_cut":
          prompt += `\nSTEP 3: AGGRESSIVE CUT CALCULATION:\n`;
          prompt += `- Take maintenance calories (BMR × activity) and multiply by 0.75\n`;
          prompt += `- This creates a 25% caloric deficit for rapid fat loss\n`;
          prompt += `- EXAMPLE: If maintenance = 2400 cal, target = 1800 cal\n`;
          prompt += `- Macro split: 40% protein, 30% carbs, 30% fats\n`;
          prompt += `- Focus on high-protein, low-calorie dense foods\n`;
          prompt += `- CRITICAL: The final plan MUST be significantly lower in calories than maintenance\n`;
          break;
        case "moderate_cut":
          prompt += `\nSTEP 3: MODERATE CUT CALCULATION:\n`;
          prompt += `- Take maintenance calories (BMR × activity) and multiply by 0.85\n`;
          prompt += `- This creates a 15% caloric deficit for steady fat loss\n`;
          prompt += `- EXAMPLE: If maintenance = 2400 cal, target = 2040 cal\n`;
          prompt += `- Macro split: 35% protein, 35% carbs, 30% fats\n`;
          prompt += `- Balanced approach with moderate calorie restriction\n`;
          break;
        case "maintain":
          prompt += `\nSTEP 3: MAINTENANCE CALCULATION:\n`;
          prompt += `- Use maintenance calories (BMR × activity level)\n`;
          prompt += `- No deficit or surplus - maintain current weight\n`;
          prompt += `- EXAMPLE: If maintenance = 2400 cal, target = 2400 cal\n`;
          prompt += `- Macro split: 30% protein, 40% carbs, 30% fats\n`;
          prompt += `- Focus on balanced nutrition for current weight\n`;
          break;
        case "recomp":
          prompt += `\nSTEP 3: RECOMPOSITION CALCULATION:\n`;
          prompt += `- Take maintenance calories (BMR × activity) and multiply by 0.95\n`;
          prompt += `- This creates a 5% deficit for body recomposition\n`;
          prompt += `- EXAMPLE: If maintenance = 2400 cal, target = 2280 cal\n`;
          prompt += `- Macro split: 35% protein, 35% carbs, 30% fats\n`;
          prompt += `- High protein for muscle preservation during fat loss\n`;
          break;
        case "lean_bulk":
          prompt += `\nSTEP 3: LEAN BULK CALCULATION:\n`;
          prompt += `- Take maintenance calories (BMR × activity) and multiply by 1.1\n`;
          prompt += `- This creates a 10% surplus for clean muscle gain\n`;
          prompt += `- EXAMPLE: If maintenance = 2400 cal, target = 2640 cal\n`;
          prompt += `- Macro split: 30% protein, 45% carbs, 25% fats\n`;
          prompt += `- Clean foods, controlled surplus for muscle gain\n`;
          prompt += `- CRITICAL: The final plan MUST be higher in calories than maintenance\n`;
          break;
        case "aggressive_bulk":
          prompt += `\nSTEP 3: AGGRESSIVE BULK CALCULATION:\n`;
          prompt += `- Take maintenance calories (BMR × activity) and multiply by 1.2\n`;
          prompt += `- This creates a 20% surplus for rapid muscle gain\n`;
          prompt += `- EXAMPLE: If maintenance = 2400 cal, target = 2880 cal\n`;
          prompt += `- Macro split: 25% protein, 50% carbs, 25% fats\n`;
          prompt += `- Higher calorie density, focus on muscle building foods\n`;
          prompt += `- CRITICAL: The final plan MUST be significantly higher in calories than maintenance\n`;
          break;
      }

      prompt += `\nMANDATORY: Display the calculated target calories prominently in the plan\n`;
      prompt += `MANDATORY: Ensure meal portions add up to the target calorie amount\n`;
    } else {
      // If no client metrics available, provide general guidance
      switch (planType) {
        case "aggressive_cut":
          prompt += `\nGENERAL AGGRESSIVE CUT GUIDANCE:\n`;
          prompt += `- Target approximately 1400-1600 calories per day\n`;
          prompt += `- High protein (40%), moderate carbs (30%), moderate fats (30%)\n`;
          break;
        case "moderate_cut":
          prompt += `\nGENERAL MODERATE CUT GUIDANCE:\n`;
          prompt += `- Target approximately 1600-1800 calories per day\n`;
          prompt += `- Balanced macros: 35% protein, 35% carbs, 30% fats\n`;
          break;
        case "maintain":
          prompt += `\nGENERAL MAINTENANCE GUIDANCE:\n`;
          prompt += `- Target approximately 2000-2200 calories per day\n`;
          prompt += `- Balanced macros: 30% protein, 40% carbs, 30% fats\n`;
          break;
        case "recomp":
          prompt += `\nGENERAL RECOMPOSITION GUIDANCE:\n`;
          prompt += `- Target approximately 1900-2100 calories per day\n`;
          prompt += `- High protein: 35% protein, 35% carbs, 30% fats\n`;
          break;
        case "lean_bulk":
          prompt += `\nGENERAL LEAN BULK GUIDANCE:\n`;
          prompt += `- Target approximately 2400-2600 calories per day\n`;
          prompt += `- Higher carbs: 30% protein, 45% carbs, 25% fats\n`;
          break;
        case "aggressive_bulk":
          prompt += `\nGENERAL AGGRESSIVE BULK GUIDANCE:\n`;
          prompt += `- Target approximately 2800-3200 calories per day\n`;
          prompt += `- Very high carbs: 25% protein, 50% carbs, 25% fats\n`;
          break;
      }
    }
  }

  // Custom calorie override
  if (useCustomCalories && customCalories) {
    prompt += `\nCALORIE OVERRIDE:\n`;
    prompt += `- Use exactly ${customCalories} calories total per day\n`;
    prompt += `- Adjust macro split according to plan type while hitting calorie target\n`;
  }

  // Additional notes
  if (additionalNotes && additionalNotes.trim()) {
    prompt += `\nADDITIONAL REQUIREMENTS:\n${additionalNotes}\n`;
  }

  // Output format requirements
  prompt += `\nCRITICAL OUTPUT REQUIREMENTS:\n`;
  prompt += `1. STRICTLY AVOID any foods mentioned in allergies or food dislikes\n`;
  prompt += `2. Prioritize foods mentioned in food preferences when possible\n`;
  prompt += `3. MANDATORY: Calculate and display the EXACT target calories for this plan type\n`;
  prompt += `4. MANDATORY: Show a calorie summary at the top of the plan\n`;
  prompt += `5. MANDATORY: Ensure all meals add up to the target calorie amount\n`;
  prompt += `6. Include detailed macronutrient breakdown for each meal\n`;
  prompt += `7. Provide specific portion sizes and cooking instructions\n`;
  prompt += `8. Consider the client's activity level for appropriate caloric intake\n`;
  prompt += `9. Meal complexity should be ${mealComplexity} - adjust recipes accordingly\n`;
  prompt += `10. Format as a detailed, easy-to-follow meal plan\n`;
  prompt += `11. DOUBLE-CHECK: Verify that your calorie total matches the plan goal\n`;

  // Add explicit calorie verification based on plan type
  switch (planType) {
    case "aggressive_cut":
      prompt += `12. VERIFICATION: This is an AGGRESSIVE CUT - calories must be 25% below maintenance\n`;
      break;
    case "moderate_cut":
      prompt += `12. VERIFICATION: This is a MODERATE CUT - calories must be 15% below maintenance\n`;
      break;
    case "maintain":
      prompt += `12. VERIFICATION: This is MAINTENANCE - calories should match maintenance level\n`;
      break;
    case "recomp":
      prompt += `12. VERIFICATION: This is RECOMPOSITION - calories must be 5% below maintenance\n`;
      break;
    case "lean_bulk":
      prompt += `12. VERIFICATION: This is a LEAN BULK - calories must be 10% above maintenance\n`;
      break;
    case "aggressive_bulk":
      prompt += `12. VERIFICATION: This is an AGGRESSIVE BULK - calories must be 20% above maintenance\n`;
      break;
  }

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
  const [setAsActive, setSetAsActive] = useState(false);
  const [tailorToClient, setTailorToClient] = useState(false);

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

    // Use the selected client from the form or sidebar only if tailoring to client
    const clientId = tailorToClient
      ? selectedClientForForm?.id || selectedClient?.id || null
      : null;
    const client = tailorToClient
      ? selectedClientForForm || selectedClient
      : null;
    const clientName = client
      ? `${client.first_name} ${client.last_name}`
      : null;

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

    // Debug: Log the prompt to see what's being sent
    console.log("=== DIET PLAN PROMPT DEBUG ===");
    console.log("Plan Type:", planType);
    console.log("Client:", client);
    console.log("Client Height:", client?.height);
    console.log("Client Weight:", client?.weight);
    console.log("Client Fitness Level:", client?.fitness_level);
    console.log("Use Custom Calories:", useCustomCalories);
    console.log("Custom Calories:", customCalories);
    console.log("Full Prompt:", enhancedPrompt);
    console.log("===============================");

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
        setAsActive: tailorToClient ? setAsActive : false, // Only allow setting as active if tailoring to client
      },
    };

    // Reset form
    setPlanTitle("");
    setPlanType("");
    setSelectedClientForForm(null);
    setAdditionalNotes("");
    setCustomCalories("");
    setUseCustomCalories(false);
    setSetAsActive(false);
    setTailorToClient(false);
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
              {/* Tailor to Client Checkbox */}
              <div className="mb-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tailorToClient}
                    onChange={(e) => {
                      setTailorToClient(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedClientForForm(null);
                        setSetAsActive(false); // Can't set as active without client
                      }
                    }}
                    className="mt-1 w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 focus:ring-blue-500 focus:ring-2 rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-zinc-300">
                      Tailor to client
                    </div>
                    <div className="text-xs text-zinc-500">
                      Enable to customize this plan for a specific client's
                      profile and goals
                    </div>
                  </div>
                </label>
              </div>

              {/* Client Selection Dropdown - Only shown when tailorToClient is enabled */}
              {tailorToClient && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Select Client
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
                    className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name} - {client.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Client Profile Information */}
              {tailorToClient && (selectedClientForForm || selectedClient) && (
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

              {tailorToClient && selectedClient && !selectedClientForForm && (
                <p className="text-sm text-blue-400 mt-1">
                  Currently creating for: {selectedClient.first_name}{" "}
                  {selectedClient.last_name}
                </p>
              )}
            </div>

            {/* Set as Active Option - Only show if tailoring to client */}
            {tailorToClient && (selectedClientForForm || selectedClient) && (
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
                {DIET_PLAN_TYPES.map((type) => {
                  // Add calorie indicator based on plan type
                  let calorieIndicator = "";
                  let indicatorColor = "";

                  switch (type.id) {
                    case "aggressive_cut":
                      calorieIndicator = "-25% calories";
                      indicatorColor = "text-red-400";
                      break;
                    case "moderate_cut":
                      calorieIndicator = "-15% calories";
                      indicatorColor = "text-orange-400";
                      break;
                    case "maintain":
                      calorieIndicator = "Maintenance";
                      indicatorColor = "text-blue-400";
                      break;
                    case "recomp":
                      calorieIndicator = "-5% calories";
                      indicatorColor = "text-purple-400";
                      break;
                    case "lean_bulk":
                      calorieIndicator = "+10% calories";
                      indicatorColor = "text-green-400";
                      break;
                    case "aggressive_bulk":
                      calorieIndicator = "+20% calories";
                      indicatorColor = "text-emerald-400";
                      break;
                  }

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
                          className={`text-xs font-semibold ${indicatorColor}`}
                        >
                          {calorieIndicator}
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
