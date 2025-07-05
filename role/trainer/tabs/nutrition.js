"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useClients } from "@/hooks/clients";
import { useDietPlans } from "@/hooks/diet";
import {
  ChefHat,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Sparkles,
  AlertCircle,
  X,
  Eye,
  Plus,
  BookOpen,
  Settings,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Utensils,
  Loader,
  Trash2,
} from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Meal Plan Display Component with enhanced formatting
const MealPlanDisplay = ({ aiResponse, items }) => {
  const [mealData, setMealData] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    console.log("=== MealPlanDisplay Debug ===");
    console.log("Raw aiResponse:", aiResponse);
    console.log("Items array:", items);
    console.log("aiResponse type:", typeof aiResponse);

    try {
      let parsedData;
      let debugSteps = [];

      // First, try to use the items array if available
      if (items && Array.isArray(items) && items.length > 0) {
        debugSteps.push("Using items array from API");

        // Convert items array to the expected meal format
        const mealsFromItems = items.map((item) => ({
          name: item.meal_name,
          type: item.meal_type,
          order: item.meal_order,
          ingredients: JSON.parse(item.ingredients || "[]"),
          instructions: item.instructions,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
        }));

        // Calculate daily totals
        const dailyTotals = items.reduce(
          (totals, item) => ({
            calories: totals.calories + (item.calories || 0),
            protein: totals.protein + (item.protein || 0),
            carbs: totals.carbs + (item.carbs || 0),
            fats: totals.fats + (item.fats || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );

        parsedData = {
          meals: mealsFromItems,
          daily_totals: dailyTotals,
        };

        debugSteps.push(
          `Successfully converted ${items.length} items to meal format`
        );
        console.log("Converted items to meals:", parsedData);
      }
      // Fallback to parsing aiResponse if items are not available
      else if (typeof aiResponse === "string") {
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
            console.log("Raw content:", content); // Parse the content (which is a JSON string with escaped characters)
            try {
              // Clean up markdown formatting before parsing
              let cleanContent = content;
              cleanContent = cleanContent.replace(/```json\s*/g, "");
              cleanContent = cleanContent.replace(/```\s*$/g, "");
              cleanContent = cleanContent.trim();

              debugSteps.push("Cleaned markdown formatting from content");
              console.log("Cleaned content:", cleanContent);

              parsedData = JSON.parse(cleanContent);
              debugSteps.push("Successfully parsed content as JSON");
              console.log("Final parsed meal data:", parsedData);
            } catch (contentParseError) {
              debugSteps.push(
                `Content JSON parse failed: ${contentParseError.message}`
              );
              console.log("Content that failed to parse:", content);

              // Try one more fallback without the original content cleaning
              try {
                // More aggressive cleaning
                let aggressiveClean = content;
                aggressiveClean = aggressiveClean.replace(/```[a-z]*\s*/g, "");
                aggressiveClean = aggressiveClean.replace(/```\s*/g, "");
                aggressiveClean = aggressiveClean.trim();

                parsedData = JSON.parse(aggressiveClean);
                debugSteps.push("Successfully parsed with aggressive cleaning");
                console.log("Aggressively cleaned and parsed:", parsedData);
              } catch (aggressiveError) {
                debugSteps.push(
                  `Aggressive cleaning also failed: ${aggressiveError.message}`
                );
              }
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
        // Normalize and validate the meal data
        const normalizedData = {
          ...parsedData,
          meals: parsedData.meals.map((meal) => ({
            ...meal,
            ingredients: meal.ingredients
              ? meal.ingredients.map((ingredient) => {
                  // Ensure each ingredient is properly formatted
                  if (typeof ingredient === "string") {
                    // Convert string to object format for consistency
                    return { name: ingredient, amount: null };
                  } else if (
                    typeof ingredient === "object" &&
                    ingredient.name
                  ) {
                    // Ensure amount exists
                    return {
                      name: ingredient.name,
                      amount: ingredient.amount || null,
                    };
                  } else {
                    // Fallback for malformed ingredients
                    return { name: String(ingredient), amount: null };
                  }
                })
              : [],
          })),
        };

        console.log("✅ Valid meal data found:", normalizedData);
        setMealData(normalizedData);
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
  }, [aiResponse, items]);

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
    <div className="space-y-3 px-2">
      {/* Daily Totals Summary */}
      {mealData.daily_totals && (
        <div className="flex items-center justify-between bg-zinc-700 rounded p-4 shadow-lg mb-4">
          <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2 ">
            <Target className="w-5 h-5 text-zinc-400" />
            Daily Nutritional Goals
          </h3>
          <div className="flex gap-10">
            <div className="text-center">
              <div className="text-lg font-bold text-zinc-100">
                {mealData.daily_totals.calories}
              </div>
              <div className="text-xs text-zinc-400">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-zinc-100">
                {mealData.daily_totals.protein}g
              </div>
              <div className="text-xs text-zinc-400">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-zinc-100">
                {mealData.daily_totals.carbs}g
              </div>
              <div className="text-xs text-zinc-400">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-zinc-100">
                {mealData.daily_totals.fats}g
              </div>
              <div className="text-xs text-zinc-400">Fats</div>
            </div>
          </div>
        </div>
      )}

      {/* Meals */}
      <div className="space-y-4  rounded shadow-xl">
        <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2 mb-4">
          <Utensils className="w-5 h-5 text-zinc-400" />
          Meal Plan
        </h3>

        {mealData.meals
          .sort((a, b) => a.order - b.order)
          .map((meal, index) => (
            <div key={index} className="bg-zinc-800  rounded shadow-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* <span className="text-zinc-400">
                    {getMealTypeIcon(meal.type)}
                  </span> */}
                  <div>
                    <h4 className="font-semibold text-zinc-100 text-base mb-0.5">
                      {meal.name}
                    </h4>
                    <span className="text-sm text-zinc-400 capitalize">
                      {meal.type}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-zinc-100">
                    {meal.calories} cal
                  </div>
                  <div className="text-sm text-zinc-500 mt-0.5">
                    Protein: {meal.protein}g · Carbs: {meal.carbs}g · Fats:{" "}
                    {meal.fats}g
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <h5 className="text-sm font-semibold text-zinc-300 mb-1">
                  Ingredients
                </h5>
                <div className="flex flex-wrap gap-2">
                  {meal.ingredients.map((ingredient, idx) => {
                    const ingredientName =
                      typeof ingredient === "object"
                        ? ingredient.name
                        : ingredient;
                    const ingredientAmount =
                      typeof ingredient === "object" ? ingredient.amount : null;

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-2 py-1.5 bg-zinc-700 rounded-md text-sm"
                      >
                        <span className="w-1 h-1 bg-zinc-500 rounded-full"></span>
                        <span className="text-zinc-300">{ingredientName}</span>
                        {ingredientAmount ? (
                          <span className="text-zinc-400 bg-zinc-800 rounded px-1  text-[12px] ml-1">
                            {ingredientAmount}
                          </span>
                        ) : (
                          <span className="text-zinc-500 italic text-[10px] ml-1">
                            amount not specified
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-zinc-300 mb-1">
                  Instructions
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

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
  const [generatingPlans, setGeneratingPlans] = useState([]); // Track plans being generated

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

    // Add generating plans to the list
    const relevantGeneratingPlans = showAllPlans
      ? generatingPlans
      : selectedClient
      ? generatingPlans.filter((plan) => plan.client_id === selectedClient.id)
      : [];

    // Combine actual plans with generating plans
    plans = [...relevantGeneratingPlans, ...plans];

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
    generatingPlans,
  ]);

  // Initialize with first client if available
  useEffect(() => {
    if (clients.length > 0 && !selectedClient && !showAllPlans) {
      setSelectedClient(clients[0]);
    }
  }, [clients, selectedClient, showAllPlans]);
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
  // Generate enhanced diet plan prompt with client data
  const buildClientAwarePrompt = () => {
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
        prompt += `- Activity Level: ${client.fitness_level.replace(
          "_",
          " "
        )}\n`;
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
    const enhancedPrompt = buildClientAwarePrompt();

    // Create a temporary loading plan item
    const tempPlanId = `temp_${Date.now()}`;
    const loadingPlan = {
      id: tempPlanId,
      title: planTitle.trim(),
      client_name: selectedClientForForm?.first_name
        ? `${selectedClientForForm.first_name} ${selectedClientForForm.last_name}`
        : selectedClient?.first_name
        ? `${selectedClient.first_name} ${selectedClient.last_name}`
        : "Generic Plan",
      client_id: clientId,
      plan_type: planType,
      meals_per_day: mealsPerDay,
      meal_complexity: mealComplexity,
      created_at: new Date().toISOString(),
      isGenerating: true,
    };

    // Close modal immediately and add loading plan
    setShowCreateModal(false);
    setGeneratingPlans((prev) => [...prev, loadingPlan]);
    try {
      const result = await generateDietPlan({
        prompt: enhancedPrompt,
        aiProvider,
        clientId,
        title: planTitle.trim(),
        planType,
        mealsPerDay,
        mealComplexity,
        customCalories: useCustomCalories ? customCalories : null,
        additionalNotes,
      });

      // Remove the loading plan and refresh the actual plans
      setGeneratingPlans((prev) => prev.filter((p) => p.id !== tempPlanId));

      // Reset form
      setPlanTitle("");
      setPlanType("");
      setSelectedClientForForm(null);
      setAdditionalNotes(""); // Refresh plans - hook handles this automatically
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

  return (
    <>
      {" "}
      <div className="h-screen flex bg-zinc-900 text-white overflow-hidden rounded">
        {/* Professional Trainer Sidebar */}
        <div className="w-80 bg-zinc-950/50 border-r border-zinc-800/50 flex flex-col h-full">
          {" "}
          {/* Sidebar Header */}{" "}
          <div className="p-3 border-b border-zinc-800/30">
            <h1 className="text-base font-bold text-zinc-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Nutrition Plans
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Manage client nutrition plans
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
            {" "}
            {!showAllPlans ? (
              <>
                {clientsLoading && (
                  <div className="p-4 text-center text-zinc-400">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Loading clients...</p>
                  </div>
                )}
                {clientsError && (
                  <div className="p-4 text-center text-red-400">
                    <p>Failed to load clients: {clientsError}</p>
                    <button
                      onClick={() => fetchClients()}
                      className="mt-2 text-sm bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {!clientsLoading && !clientsError && clients.length === 0 && (
                  <div className="p-4 text-center text-zinc-400">
                    <p>No clients found</p>
                    <button
                      onClick={() => fetchClients()}
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
                {" "}
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
                ) : clientsLoading && !showAllPlans ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Loading Clients...
                      </h2>
                      <p className="text-zinc-400 text-sm">
                        Fetching client data
                      </p>
                    </div>
                  </div>
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
            {clientsLoading && !selectedClient && !showAllPlans ? (
              <div className="text-center text-zinc-400 py-12">
                <div className="animate-spin w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-lg mb-2">Loading clients...</p>
                <p className="text-sm text-zinc-500">
                  Please wait while we fetch your client list
                </p>
              </div>
            ) : displayPlans.length === 0 ? (
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
                    className={`bg-zinc-800/50 rounded-lg px-4 py-2 transition-all duration-200 ${
                      plan.isGenerating
                        ? "border-blue-500/50 bg-blue-500/5"
                        : "border-zinc-700/50 hover:border-zinc-600/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`p-2 rounded-lg ${
                            plan.isGenerating
                              ? "bg-blue-500/20"
                              : "bg-blue-500/10"
                          }`}
                        >
                          {plan.isGenerating ? (
                            <Loader className="h-5 w-5 text-blue-400 animate-spin" />
                          ) : (
                            <ChefHat className="h-5 w-5 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                                {plan.title}
                                {plan.isGenerating && (
                                  <span className="text-sm text-blue-400 font-normal">
                                    - Developing Nutrition Plan
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-zinc-400">
                                {plan.client_name || "Generic Plan"}
                              </p>
                            </div>
                            {!plan.isGenerating && (
                              <div className="flex items-center gap-6 text-sm">
                                <div className="text-center">
                                  <span className="text-zinc-400">
                                    Plan Type
                                  </span>
                                  <p className="text-white capitalize font-medium">
                                    {plan.plan_type?.replace("_", " ")}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <span className="text-zinc-400">
                                    Meals/Day
                                  </span>
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
                            )}
                          </div>
                        </div>
                      </div>{" "}
                      <div className="flex items-center gap-2 ml-4">
                        {!plan.isGenerating && (
                          <>
                            <button
                              onClick={() => handleViewPlanDetails(plan)}
                              className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium"
                            >
                              View Plan
                            </button>
                            <button
                              onClick={() => handleViewPlanDetails(plan)}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Plan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>{" "}
      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex bg-zinc-900 items-center justify-between p-4 px-8 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">
                Create Diet Plan
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
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
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">
                    Client
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Select Client (Optional)
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
                      <option value="">
                        Select a client (or leave empty for generic plan)
                      </option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.first_name} {client.last_name} -{" "}
                          {client.email}
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
                          {(selectedClientForForm || selectedClient)
                            ?.height && (
                            <div>
                              <span className="text-zinc-500">Height:</span>
                              <span className="text-zinc-300 ml-1">
                                {
                                  (selectedClientForForm || selectedClient)
                                    .height
                                }{" "}
                                cm
                              </span>
                            </div>
                          )}
                          {(selectedClientForForm || selectedClient)
                            ?.weight && (
                            <div>
                              <span className="text-zinc-500">Weight:</span>
                              <span className="text-zinc-300 ml-1">
                                {
                                  (selectedClientForForm || selectedClient)
                                    .weight
                                }{" "}
                                kg
                              </span>
                            </div>
                          )}
                          {(selectedClientForForm || selectedClient)
                            ?.fitness_level && (
                            <div>
                              <span className="text-zinc-500">
                                Activity Level:
                              </span>
                              <span className="text-zinc-300 ml-1 capitalize">
                                {(
                                  selectedClientForForm || selectedClient
                                ).fitness_level.replace("_", " ")}
                              </span>
                            </div>
                          )}
                          {(selectedClientForForm || selectedClient)
                            ?.allergies && (
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
                              <span className="text-zinc-500">
                                Food Dislikes:
                              </span>
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
                        <p className="text-sm text-zinc-400">
                          {type.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>{" "}
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
                          onChange={(e) =>
                            setMealsPerDay(parseInt(e.target.value))
                          }
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
                              We'll calculate the total calories based on your
                              plan.
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
                                onChange={(e) =>
                                  setCustomCalories(e.target.value)
                                }
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
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>{" "}
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
      )}
      {/* Plan Details Modal */}
      {showPlanDetailModal && planDetails && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
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
                </div>{" "}
                {/* Plan Content */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-2">
                    Diet Plan Content
                  </h3>
                  <div className=" rounded p-3 ">
                    <div className="text-sm text-zinc-300 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-dark">
                      <MealPlanDisplay
                        aiResponse={planDetails.ai_response}
                        items={planDetails.items}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}{" "}
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
