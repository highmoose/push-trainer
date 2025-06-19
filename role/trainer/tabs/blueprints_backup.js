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

// Meal Plan Display Component
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
      
      if (typeof aiResponse === 'string') {
        debugSteps.push("Input is string");
        
        // First, try to parse the OpenAI response structure
        try {
          const openAiResponse = JSON.parse(aiResponse);
          debugSteps.push("Successfully parsed OpenAI response structure");
          console.log("OpenAI response structure:", openAiResponse);
          
          if (openAiResponse.choices && openAiResponse.choices[0] && openAiResponse.choices[0].message) {
            const content = openAiResponse.choices[0].message.content;
            debugSteps.push("Found content in choices[0].message.content");
            console.log("Raw content:", content);
            
            // Parse the content (which is a JSON string with escaped characters)
            try {
              parsedData = JSON.parse(content);
              debugSteps.push("Successfully parsed content as JSON");
              console.log("Final parsed meal data:", parsedData);
            } catch (contentParseError) {
              debugSteps.push(`Content JSON parse failed: ${contentParseError.message}`);
              console.log("Content that failed to parse:", content);
            }
          } else {
            debugSteps.push("No valid choices/message structure found");
          }
        } catch (openAiParseError) {
          debugSteps.push(`OpenAI structure parse failed: ${openAiParseError.message}`);
          
          // Fallback: try to parse as direct JSON
          try {
            parsedData = JSON.parse(aiResponse);
            debugSteps.push("Successfully parsed as direct JSON (fallback)");
            console.log("Direct JSON parse result:", parsedData);
          } catch (directParseError) {
            debugSteps.push(`Direct JSON parse also failed: ${directParseError.message}`);
          }
        }
      } else if (typeof aiResponse === 'object' && aiResponse !== null) {
        debugSteps.push("Input is object");
        parsedData = aiResponse;
      }

      setDebugInfo({
        steps: debugSteps,
        rawData: aiResponse,
        parsedData: parsedData,
        hasMeals: parsedData && parsedData.meals ? parsedData.meals.length : 0
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
        hasMeals: 0
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
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-zinc-400 mb-1">Parse Steps:</div>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  {debugInfo.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <div className="text-zinc-400 mb-1">Data Type: {typeof debugInfo.rawData}</div>
                <div className="text-zinc-400 mb-1">Meals Found: {debugInfo.hasMeals}</div>
              </div>
              
              <div>
                <div className="text-zinc-400 mb-1">Raw Data Preview:</div>
                <pre className="p-2 bg-zinc-800 rounded text-zinc-400 overflow-x-auto max-h-32">
                  {typeof debugInfo.rawData === 'string' 
                    ? debugInfo.rawData.substring(0, 500) + (debugInfo.rawData.length > 500 ? '...' : '')
                    : JSON.stringify(debugInfo.rawData, null, 2)
                  }
                </pre>
              </div>
              
              {debugInfo.parsedData && (
                <div>
                  <div className="text-zinc-400 mb-1">Parsed Data Structure:</div>
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
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const getMealTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      case 'lunch': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'dinner': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'snack': return 'text-green-400 border-green-400/30 bg-green-400/10';
      default: return 'text-zinc-400 border-zinc-400/30 bg-zinc-400/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Totals Summary */}
      {mealData.daily_totals && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Daily Nutritional Goals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{mealData.daily_totals.calories}</div>
              <div className="text-xs text-zinc-400">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{mealData.daily_totals.protein}g</div>
              <div className="text-xs text-zinc-400">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{mealData.daily_totals.carbs}g</div>
              <div className="text-xs text-zinc-400">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{mealData.daily_totals.fats}g</div>
              <div className="text-xs text-zinc-400">Fats</div>
            </div>
          </div>
        </div>
      )}

      {/* Meals */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-300 flex items-center">
          <ChefHat className="w-5 h-5 mr-2" />
          Meal Plan
        </h3>
        
        {mealData.meals
          .sort((a, b) => a.order - b.order)
          .map((meal, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getMealTypeColor(meal.type)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{getMealTypeIcon(meal.type)}</span>
                  <div>
                    <h4 className="font-semibold text-white">{meal.name}</h4>
                    <span className="text-xs text-zinc-400 capitalize">{meal.type}</span>
                  </div>
                </div>                <div className="text-right">
                  <div className="text-sm font-medium text-white">{meal.calories} cal</div>
                  <div className="text-xs text-zinc-400">
                    Protein: {meal.protein}g • Carbs: {meal.carbs}g • Fats: {meal.fats}g
                  </div>
                </div>
              </div>              <div className="mb-3">
                <h5 className="text-sm font-medium text-zinc-300 mb-2">Ingredients:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {meal.ingredients.map((ingredient, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 bg-zinc-800/60 rounded-md text-xs">
                      <span className="text-zinc-300">
                        {typeof ingredient === 'object' ? ingredient.name : ingredient}
                      </span>
                      {typeof ingredient === 'object' && ingredient.amount && (
                        <span className="text-zinc-500 font-medium">
                          {ingredient.amount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-zinc-300 mb-2">Instructions:</h5>
                <p className="text-sm text-zinc-400 leading-relaxed">{meal.instructions}</p>
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

  // Sample data for testing (remove when real data is available)
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
      is_archived: false,      ai_response: JSON.stringify({
        "id": "chatcmpl-sample1",
        "object": "chat.completion",
        "created": 1750287440,
        "model": "gpt-3.5-turbo-0125",
        "choices": [{
          "index": 0,
          "message": {
            "role": "assistant",
            "content": "{\n  \"meals\": [\n    {\n      \"name\": \"Protein-Packed Breakfast Bowl\",\n      \"type\": \"breakfast\",\n      \"order\": 1,\n      \"ingredients\": [\"egg whites\", \"spinach\", \"quinoa\", \"cherry tomatoes\", \"avocado\"],\n      \"instructions\": \"Scramble egg whites with spinach, serve with quinoa, cherry tomatoes, and sliced avocado.\",\n      \"calories\": 400,\n      \"protein\": 25,\n      \"carbs\": 45,\n      \"fats\": 15\n    },\n    {\n      \"name\": \"Grilled Chicken Salad\",\n      \"type\": \"lunch\",\n      \"order\": 2,\n      \"ingredients\": [\"grilled chicken breast\", \"mixed greens\", \"cucumber\", \"bell pepper\", \"balsamic vinaigrette\"],\n      \"instructions\": \"Grill chicken breast and slice. Toss with mixed greens, cucumber, and bell pepper. Drizzle with balsamic vinaigrette.\",\n      \"calories\": 450,\n      \"protein\": 30,\n      \"carbs\": 20,\n      \"fats\": 25\n    },\n    {\n      \"name\": \"Greek Yogurt with Berries\",\n      \"type\": \"snack\",\n      \"order\": 3,\n      \"ingredients\": [\"greek yogurt\", \"mixed berries\", \"honey\"],\n      \"instructions\": \"Top Greek yogurt with mixed berries and a drizzle of honey.\",\n      \"calories\": 250,\n      \"protein\": 20,\n      \"carbs\": 25,\n      \"fats\": 10\n    },\n    {\n      \"name\": \"Baked Salmon with Vegetables\",\n      \"type\": \"dinner\",\n      \"order\": 4,\n      \"ingredients\": [\"salmon fillet\", \"asparagus\", \"sweet potato\", \"lemon\", \"olive oil\"],\n      \"instructions\": \"Marinate salmon with lemon and olive oil. Bake with asparagus and roasted sweet potato.\",\n      \"calories\": 500,\n      \"protein\": 35,\n      \"carbs\": 30,\n      \"fats\": 25\n    }\n  ],\n  \"daily_totals\": {\n    \"calories\": 1600,\n    \"protein\": 110,\n    \"carbs\": 120,\n    \"fats\": 75\n  }\n}",
            "refusal": null,
            "annotations": []
          },
          "logprobs": null,
          "finish_reason": "stop"
        }],
        "usage": {
          "prompt_tokens": 241,
          "completion_tokens": 496,
          "total_tokens": 737
        }
      })
    },
    {
      id: 2,
      title: "Muscle Building Plan - John",
      client_name: "John Smith",
      client_id: 2,
      plan_type: "lean_bulk",
      meals_per_day: 5,
      meal_complexity: "moderate",
      created_at: "2024-01-10T14:30:00Z",
      updated_at: "2024-01-10T14:30:00Z",
      is_favorite: true,
      is_archived: false,
      ai_response: JSON.stringify({
        meals: [
          {
            name: "Power Breakfast",
            type: "breakfast",
            order: 1,
            ingredients: ["Oatmeal", "Protein powder", "Banana", "Almonds", "Cinnamon"],
            instructions: "Cook oatmeal, mix in protein powder, top with sliced banana and almonds.",
            calories: 550,
            protein: 35,
            carbs: 60,
            fats: 18
          },
          {
            name: "Pre-Workout Boost",
            type: "snack",
            order: 2,
            ingredients: ["Protein shake", "Apple", "Peanut butter"],
            instructions: "Blend protein shake, eat apple with peanut butter on the side.",
            calories: 350,
            protein: 25,
            carbs: 30,
            fats: 15
          },
          {
            name: "Muscle-Building Lunch",
            type: "lunch",
            order: 3,
            ingredients: ["Lean beef", "Brown rice", "Broccoli", "Olive oil"],
            instructions: "Grill lean beef, serve with brown rice and steamed broccoli drizzled with olive oil.",
            calories: 650,
            protein: 45,
            carbs: 55,
            fats: 22
          },
          {
            name: "Post-Workout Recovery",
            type: "snack",
            order: 4,
            ingredients: ["Greek yogurt", "Granola", "Berries", "Honey"],
            instructions: "Mix Greek yogurt with granola and berries, drizzle with honey.",
            calories: 300,
            protein: 20,
            carbs: 35,
            fats: 12
          },
          {
            name: "Power Dinner",
            type: "dinner",
            order: 5,
            ingredients: ["Chicken breast", "Quinoa", "Green beans", "Avocado"],
            instructions: "Bake chicken breast, serve with quinoa and green beans, top with avocado slices.",
            calories: 600,
            protein: 45,
            carbs: 40,
            fats: 25
          }
        ],
        daily_totals: {
          calories: 2450,
          protein: 170,
          carbs: 220,
          fats: 92
        }
      })
    },
    {
      id: 3,
      title: "Generic Maintenance Plan",
      client_name: null,
      client_id: null,
      plan_type: "maintain",
      meals_per_day: 3,
      meal_complexity: "simple",
      created_at: "2024-01-05T09:15:00Z",
      updated_at: "2024-01-05T09:15:00Z",
      is_favorite: false,
      is_archived: false,
      ai_response: JSON.stringify({
        meals: [
          {
            name: "Balanced Breakfast",
            type: "breakfast",
            order: 1,
            ingredients: ["Greek yogurt", "Granola", "Fresh fruit", "Honey"],
            instructions: "Layer Greek yogurt with granola and fresh fruit, drizzle with honey.",
            calories: 400,
            protein: 20,
            carbs: 50,
            fats: 15
          },
          {
            name: "Hearty Lunch",
            type: "lunch",
            order: 2,
            ingredients: ["Turkey", "Whole grain bread", "Lettuce", "Tomato", "Avocado"],
            instructions: "Build sandwich with turkey, lettuce, tomato, and avocado on whole grain bread.",
            calories: 450,
            protein: 25,
            carbs: 40,
            fats: 20
          },
          {
            name: "Comfort Dinner",
            type: "dinner",
            order: 3,
            ingredients: ["Pasta", "Marinara sauce", "Ground turkey", "Parmesan", "Basil"],
            instructions: "Cook pasta with marinara sauce and ground turkey, top with parmesan and fresh basil.",
            calories: 550,
            protein: 30,
            carbs: 65,
            fats: 18
          }
        ],
        daily_totals: {
          calories: 1400,
          protein: 75,
          carbs: 155,
          fats: 53
        }
      })
    }
  ];

  // Use sample data if no real data is available
  const activeDietPlans = dietPlans.length > 0 ? dietPlans : sampleDietPlans;
  // Refs
  const clientSearchRef = useRef(null);

  // UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlanDetailModal, setShowPlanDetailModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showArchiveConfirmModal, setShowArchiveConfirmModal] = useState(false);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Selected items for bulk actions
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);

  // Action state
  const [selectedPlanForAction, setSelectedPlanForAction] = useState(null);
  const [selectedClientsForAction, setSelectedClientsForAction] = useState([]);
  const [planDetails, setPlanDetails] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // Create/Edit Form State
  const [selectedClientForForm, setSelectedClientForForm] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [planType, setPlanType] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [mealComplexity, setMealComplexity] = useState("moderate");
  const [customCalories, setCustomCalories] = useState("");
  const [useCustomCalories, setUseCustomCalories] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [aiProvider, setAiProvider] = useState("openai");

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
  }, [dispatch, clientsStatus, dietPlanStatus]);  // Additional state for client management
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [showAllPlans, setShowAllPlans] = useState(false);

  // Filtered clients based on search
  const filteredClients = React.useMemo(() => {
    return clients.filter(client => 
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );
  }, [clients, clientSearchTerm]);

  // Filter and sort diet plans with client focus
  const filteredAndSortedPlans = React.useMemo(() => {
    let filtered = activeDietPlans;
    
    // Filter by selected client or show all
    if (!showAllPlans && selectedClient) {
      filtered = filtered.filter(plan => plan.client_id === selectedClient.id);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((plan) => {
        const matchesSearch =
          plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    }

    // Apply type filter
    const matchesFilter =
      filterType === "all" ||
      plan.plan_type === filterType ||
      (filterType === "assigned" && plan.client_id) ||
      (filterType === "unassigned" && !plan.client_id) ||
      (filterType === "favorite" && plan.is_favorite) ||
      (filterType === "archived" && plan.is_archived);

    filtered = filtered.filter(plan => matchesFilter);

    // Sort the filtered results
    filtered.sort((a, b) => {
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

    return filtered;
  }, [activeDietPlans, selectedClient, showAllPlans, searchTerm, filterType, sortBy, sortOrder]);

  // Initialize with first client if available
  React.useEffect(() => {
    if (clients.length > 0 && !selectedClient && !showAllPlans) {
      setSelectedClient(clients[0]);
    }
  }, [clients, selectedClient, showAllPlans]);
  // Get assigned clients for a plan
  const getAssignedClients = (planId) => {
    const plan = activeDietPlans.find((p) => p.id === planId);
    if (!plan || !plan.client_id) return [];

    const client = clients.find((c) => c.id === plan.client_id);
    return client ? [client] : [];
  };

  // Generate avatar circles for assigned clients
  const renderClientAvatars = (planId) => {
    const assignedClients = getAssignedClients(planId);

    if (assignedClients.length === 0) {
      return (
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center">
            <User className="w-3 h-3 text-zinc-400" />
          </div>
          <span className="text-xs text-zinc-500 ml-2">Unassigned</span>
        </div>
      );
    }

    const displayClients = assignedClients.slice(0, 3);
    const remainingCount = assignedClients.length - 3;

    return (
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {displayClients.map((client, index) => (
            <div
              key={client.id}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-zinc-800 flex items-center justify-center text-xs font-medium text-white"
              style={{ zIndex: displayClients.length - index }}
              title={`${client.first_name} ${client.last_name}`}
            >
              {client.first_name?.[0]}
              {client.last_name?.[0]}
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="w-6 h-6 rounded-full bg-zinc-600 border-2 border-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-300">
              +{remainingCount}
            </div>
          )}
        </div>
        <span className="text-xs text-zinc-400 ml-2">
          {assignedClients.length} client
          {assignedClients.length !== 1 ? "s" : ""}
        </span>
      </div>
    );
  };

  // Toggle plan selection for bulk actions
  const togglePlanSelection = (planId) => {
    setSelectedPlans((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
  };

  // Select all filtered plans
  const selectAllPlans = () => {
    setSelectedPlans(filteredAndSortedPlans.map((plan) => plan.id));
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedPlans([]);
    setBulkActionMode(false);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedPlans.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedPlans.length} diet plans? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      for (const planId of selectedPlans) {
        await dispatch(deleteDietPlan(planId));
      }
      clearAllSelections();
      dispatch(fetchDietPlans());
    } catch (error) {
      console.error("Error bulk deleting plans:", error);
    }
  };

  // Handle bulk duplicate
  const handleBulkDuplicate = async () => {
    if (selectedPlans.length === 0) return;

    // For now, show an alert - in a real app you'd want a modal to select clients
    alert(
      `Bulk duplicate feature would create copies of ${selectedPlans.length} plans`
    );
    clearAllSelections();
  };

  // Reset create form
  const resetCreateForm = () => {
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

  // Fetch clients and diet plans on component mount
  useEffect(() => {
    if (clientsStatus === "idle") {
      dispatch(fetchClients());
    }
    if (dietPlanStatus === "idle") {
      dispatch(fetchDietPlans());
    }
  }, [dispatch, clientsStatus, dietPlanStatus]);
  // Filter clients based on search for form
  const filteredClientsForForm = clients.filter(
    (client) =>
      client.first_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.last_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );
  // Handle client selection  const handleClientSelect = (client) => {
    setSelectedClientForForm(client);
    setClientSearch("");
    if (!planTitle) {
      setPlanTitle(`${client.first_name} ${client.last_name} - Diet Plan`);
    }
  };

  // Clear client selection
  const handleClearClient = () => {
    setSelectedClientForForm(null);
    setClientSearch("");
    setPlanTitle("");
  };

  // Enhanced AI prompt with client metrics highlighted
  const generatePrompt = () => {
    const selectedPlanType = DIET_PLAN_TYPES.find((p) => p.id === planType);
    const selectedComplexity = MEAL_COMPLEXITY.find(
      (c) => c.id === mealComplexity
    );

    let prompt = `Create a comprehensive diet plan with the following specifications:\n\n`;    // Client information if available
    if (selectedClientForForm) {
      prompt += `CLIENT PROFILE:\n`;
      prompt += `- Name: ${selectedClientForForm.first_name} ${selectedClientForForm.last_name}\n`;
      prompt += `- Email: ${selectedClientForForm.email}\n`;

      // Physical metrics
      if (selectedClientForForm.weight)
        prompt += `- Weight: ${selectedClientForForm.weight} kg\n`;
      if (selectedClientForForm.height)
        prompt += `- Height: ${selectedClientForForm.height} cm\n`;
      if (selectedClientForForm.age) prompt += `- Age: ${selectedClientForForm.age} years\n`;
      if (selectedClientForForm.body_fat)
        prompt += `- Body Fat: ${selectedClientForForm.body_fat}%\n`;
      if (selectedClientForForm.activity_level)
        prompt += `- Activity Level: ${selectedClientForForm.activity_level}\n`;

      // Dietary preferences and restrictions - HIGHLIGHTED FOR SAFETY
      if (selectedClientForForm.allergies)
        prompt += `- ⚠️ ALLERGIES (CRITICAL - MUST AVOID): ${selectedClientForForm.allergies}\n`;
      if (selectedClientForForm.food_preferences)
        prompt += `- Food Preferences: ${selectedClientForForm.food_preferences}\n`;
      if (selectedClientForForm.food_dislikes)
        prompt += `- Food Dislikes: ${selectedClientForForm.food_dislikes}\n`;
      if (selectedClientForForm.dietary_restrictions)
        prompt += `- Dietary Restrictions: ${selectedClientForForm.dietary_restrictions}\n`;

      // Goals and additional information
      if (selectedClientForForm.fitness_goals)
        prompt += `- Fitness Goals: ${selectedClientForForm.fitness_goals}\n`;
      if (selectedClientForForm.notes)
        prompt += `- Additional Client Notes: ${selectedClientForForm.notes}\n`;

      prompt += `\n`;
    }

    prompt += `DIET PLAN REQUIREMENTS:\n`;
    prompt += `- Goal: ${selectedPlanType?.name} - ${selectedPlanType?.description}\n`;
    prompt += `- Meals per day: ${mealsPerDay}\n`;
    prompt += `- Meal complexity: ${selectedComplexity?.name} - ${selectedComplexity?.description}\n`;

    if (useCustomCalories && customCalories) {
      prompt += `- Target calories: ${customCalories} per day\n`;
    }

    if (additionalNotes) {
      prompt += `- Additional notes: ${additionalNotes}\n`;
    }

    prompt += `\nCRITICAL SAFETY INSTRUCTIONS:\n`;
    if (selectedClient?.allergies) {
      prompt += `- ⚠️ ABSOLUTELY AVOID ALL FOODS CONTAINING: ${selectedClient.allergies}\n`;
    }
    if (selectedClient?.food_dislikes) {
      prompt += `- DO NOT INCLUDE: ${selectedClient.food_dislikes}\n`;
    }
    if (selectedClient?.dietary_restrictions) {
      prompt += `- STRICTLY FOLLOW DIETARY RESTRICTIONS: ${selectedClient.dietary_restrictions}\n`;
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
          clientId: selectedClientForForm?.id || null,
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
        resetCreateForm();
        dispatch(fetchDietPlans()); // Refresh plans
      }    } catch (error) {
      console.error("Error generating plan:", error);
    }
  };
  
  // Handle plan actions
  const handleViewPlanDetails = async (plan) => {
    console.log("=== View Plan Details Debug ===");
    console.log("Initial plan data:", plan);
    console.log("Plan has ai_response:", !!plan.ai_response);
    console.log("Plan has content:", !!plan.content);
    console.log("AI response preview:", plan.ai_response?.substring(0, 100));
    
    setSelectedPlanForAction(plan);
    setShowPlanDetailModal(true);

    // Use plan data immediately while fetching details
    setPlanDetails(plan);

    try {
      const result = await dispatch(fetchPlanDetails(plan.id));
      console.log("Fetch plan details result:", result);
      if (result.type === "dietPlans/fetchDetails/fulfilled") {
        console.log("Fetched plan details:", result.payload);
        console.log("Fetched plan ai_response:", result.payload?.ai_response?.substring(0, 100));
        setPlanDetails(result.payload);
      }
    } catch (error) {
      console.error("Error fetching plan details:", error);
      // Keep the basic plan data as fallback
    }
  };

  const handleAssignPlan = async () => {
    if (!selectedPlanForAction || selectedClientsForAction.length === 0) return;

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
      dispatch(fetchDietPlans()); // Refresh plans
    } catch (error) {
      console.error("Error assigning plan:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDuplicatePlan = async () => {
    if (!selectedPlanForAction || selectedClientsForAction.length === 0) return;

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
      dispatch(fetchDietPlans()); // Refresh plans
    } catch (error) {
      console.error("Error duplicating plan:", error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlanForAction) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteDietPlan(selectedPlanForAction.id));
      setShowDeleteConfirmModal(false);
      setSelectedPlanForAction(null);
      dispatch(fetchDietPlans()); // Refresh plans
    } catch (error) {
      console.error("Error deleting plan:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFavorite = async (plan) => {
    try {
      await dispatch(
        updateDietPlan({
          id: plan.id,
          data: { is_favorite: !plan.is_favorite },
        })
      );
      dispatch(fetchDietPlans()); // Refresh plans
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleArchivePlan = async (plan) => {
    setIsArchiving(true);
    try {
      await dispatch(
        updateDietPlan({
          id: plan.id,
          data: { is_archived: !plan.is_archived },
        })
      );
      setSelectedPlanForAction(null);
      setShowArchiveConfirmModal(false);
      dispatch(fetchDietPlans()); // Refresh plans
    } catch (error) {
      console.error("Error archiving plan:", error);
    } finally {
      setIsArchiving(false);
    }
  };
  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-500" />
              Diet Plan Blueprints
            </h1>
            <p className="text-zinc-400 mt-1">
              Manage and create personalized diet plans for your clients
            </p>
          </div>

          <div className="flex items-center gap-3">
            {bulkActionMode && selectedPlans.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                <span className="text-sm text-blue-300">
                  {selectedPlans.length} selected
                </span>
                <button
                  onClick={handleBulkDuplicate}
                  className="p-1 hover:bg-blue-500/20 rounded text-blue-400"
                  title="Bulk Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="p-1 hover:bg-red-500/20 rounded text-red-400"
                  title="Bulk Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAllSelections}
                  className="p-1 hover:bg-zinc-700 rounded text-zinc-400"
                  title="Clear Selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => setBulkActionMode(!bulkActionMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                bulkActionMode
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
              }`}
            >
              {bulkActionMode ? "Exit Bulk Mode" : "Bulk Actions"}
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium text-white transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create New Plan
            </button>
          </div>
        </div>
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search diet plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Plans</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
              <option value="favorite">Favorites</option>
              <option value="aggressive_cut">Aggressive Cut</option>
              <option value="moderate_cut">Moderate Cut</option>
              <option value="lean_cut">Lean Cut</option>
              <option value="maintain">Maintenance</option>
              <option value="lean_bulk">Lean Bulk</option>
              <option value="aggressive_bulk">Aggressive Bulk</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="title-asc">Name A-Z</option>
              <option value="title-desc">Name Z-A</option>
            </select>

            <div className="flex items-center border border-zinc-700 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {/* Diet Plans Grid/List */}
        <div className="flex-1">
          {dietPlanStatus === "loading" ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-b-transparent"></div>
            </div>
          ) : filteredAndSortedPlans.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-zinc-300 mb-2">
                {searchTerm || filterType !== "all"
                  ? "No plans match your criteria"
                  : "No diet plans created yet"}
              </h3>
              <p className="text-zinc-400 mb-6">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first diet plan to get started"}
              </p>
              {!searchTerm && filterType === "all" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white transition-colors"
                >
                  Create Your First Plan
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredAndSortedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-zinc-900/50 border rounded-xl p-6 hover:bg-zinc-900/70 transition-all ${
                    bulkActionMode
                      ? selectedPlans.includes(plan.id)
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-zinc-700 hover:border-zinc-600"
                      : "border-zinc-700 hover:border-zinc-600"
                  } ${viewMode === "list" ? "flex items-center gap-6" : ""}`}
                >
                  {/* Plan Header */}
                  <div
                    className={`${
                      viewMode === "list" ? "flex-1" : ""
                    } flex items-start justify-between mb-4`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {bulkActionMode && (
                          <input
                            type="checkbox"
                            checked={selectedPlans.includes(plan.id)}
                            onChange={() => togglePlanSelection(plan.id)}
                            className="rounded border-zinc-600 text-blue-500 focus:ring-blue-500"
                          />
                        )}
                        <h3 className="font-semibold text-white text-lg truncate">
                          {plan.title}
                        </h3>
                        {plan.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 mb-1">
                        {plan.client_name || "Generic Plan"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Created:{" "}
                        {new Date(plan.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {!bulkActionMode && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleFavorite(plan)}
                          className={`p-2 rounded-lg transition-colors ${
                            plan.is_favorite
                              ? "text-yellow-500 hover:bg-yellow-500/10"
                              : "text-zinc-400 hover:bg-zinc-700 hover:text-yellow-400"
                          }`}
                          title="Toggle Favorite"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              plan.is_favorite ? "fill-current" : ""
                            }`}
                          />
                        </button>

                        <div className="relative group">
                          <button className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu */}
                          <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                              onClick={() => handleViewPlanDetails(plan)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 rounded-t-lg"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPlanForAction(plan);
                                setShowAssignModal(true);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                            >
                              <Users className="w-4 h-4" />
                              Assign to Clients
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPlanForAction(plan);
                                setShowDuplicateModal(true);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleArchivePlan(plan)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                            >
                              <Archive className="w-4 h-4" />
                              {plan.is_archived ? "Unarchive" : "Archive"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPlanForAction(plan);
                                setShowDeleteConfirmModal(true);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-b-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Plan Info */}
                  <div
                    className={`${
                      viewMode === "list"
                        ? "flex items-center gap-6"
                        : "space-y-3 mb-4"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-zinc-700/50 rounded text-xs text-zinc-300 border border-zinc-600">
                        {plan.plan_type?.replace("_", " ") || "Unknown Type"}
                      </span>
                      <span className="px-2 py-1 bg-zinc-700/50 rounded text-xs text-zinc-300 border border-zinc-600">
                        {plan.meals_per_day} meals/day
                      </span>
                      {plan.meal_complexity && (
                        <span className="px-2 py-1 bg-zinc-700/50 rounded text-xs text-zinc-300 border border-zinc-600">
                          {plan.meal_complexity}
                        </span>
                      )}
                    </div>

                    {/* Assigned Clients */}
                    <div>
                      <span className="text-xs text-zinc-500 block mb-1">
                        Assigned to:
                      </span>
                      {renderClientAvatars(plan.id)}
                    </div>
                  </div>

                  {/* Plan Actions */}
                  {!bulkActionMode && viewMode === "grid" && (
                    <div className="flex gap-2 pt-3 border-t border-zinc-800">
                      <button
                        onClick={() => handleViewPlanDetails(plan)}
                        className="flex-1 px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-600/30 transition-colors text-sm font-medium"
                      >
                        View Plan
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPlanForAction(plan);
                          setShowAssignModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-600/30 transition-colors text-sm font-medium"
                      >
                        Assign
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Show pagination or load more if needed */}
          {filteredAndSortedPlans.length > 0 && (
            <div className="text-center mt-8 text-sm text-zinc-400">
              Showing {filteredAndSortedPlans.length} of {dietPlans.length}{" "}
              plans
            </div>
          )}
        </div>
        {/* Create New Plan Modal */}
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
        </div>{" "}
        {/* Main Content Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-dark p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-zinc-600/50 transition-all hover:shadow-lg p-6"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-white text-lg mb-1">
                      {plan.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <span>{plan.client_name || "Generic Plan"}</span>
                      <span>•</span>
                      <span>
                        {new Date(plan.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-zinc-700/50 rounded text-xs text-zinc-300 border border-zinc-600">
                      {plan.plan_type?.replace("_", " ") || "Unknown Type"}
                    </span>
                    <span className="px-2 py-1 bg-zinc-700/50 rounded text-xs text-zinc-300 border border-zinc-600">
                      {plan.meals_per_day} meals/day
                    </span>
                  </div>

                  {renderClientAvatars(plan.id)}
                </div>
              ))}
            </div>
          </div>
        </div>{" "}
      </div>{" "}
      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">
                Create New Diet Plan
              </h2>{" "}
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh] scrollbar-thin scrollbar-dark space-y-6">
              {/* Plan Title */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Plan Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter a title for this diet plan..."
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Diet Plan Type */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Diet Plan Goal *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {DIET_PLAN_TYPES.map((plan) => {
                    const IconComponent = plan.icon;
                    return (
                      <button
                        key={plan.id}
                        onClick={() => setPlanType(plan.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          planType === plan.id
                            ? `border-${plan.color}-500 bg-${plan.color}-500/10`
                            : "border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent
                            className={`w-5 h-5 text-${plan.color}-400`}
                          />
                          <div>
                            <span className="font-medium text-white">
                              {plan.name}
                            </span>
                            <p className="text-sm text-zinc-400 mt-1">
                              {plan.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                {" "}
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePlan}
                  disabled={!planType || !planTitle.trim() || generating}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Create Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Create New Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">
                Create New Diet Plan
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Plan Title */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Plan Title
                </label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="Enter diet plan title"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Select Client (Optional)
                </label>
                {selectedClient ? (
                  <div className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {selectedClient.first_name?.[0]}
                        {selectedClient.last_name?.[0]}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {selectedClient.first_name} {selectedClient.last_name}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {selectedClient.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleClearClient}
                      className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      ref={clientSearchRef}
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search for a client..."
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                    />
                    {clientSearch && filteredClients.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                        {filteredClients.map((client) => (
                          <button
                            key={client.id}
                            onClick={() => handleClientSelect(client)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-zinc-700 text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                              {client.first_name?.[0]}
                              {client.last_name?.[0]}
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {client.first_name} {client.last_name}
                              </div>
                              <div className="text-sm text-zinc-400">
                                {client.email}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Client Metrics Display */}
              {selectedClient && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">
                    Client Metrics & Preferences
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {selectedClient.weight && (
                      <div>
                        <span className="text-zinc-500">Weight:</span>
                        <span className="text-white ml-1">
                          {selectedClient.weight} kg
                        </span>
                      </div>
                    )}
                    {selectedClient.height && (
                      <div>
                        <span className="text-zinc-500">Height:</span>
                        <span className="text-white ml-1">
                          {selectedClient.height} cm
                        </span>
                      </div>
                    )}
                    {selectedClient.age && (
                      <div>
                        <span className="text-zinc-500">Age:</span>
                        <span className="text-white ml-1">
                          {selectedClient.age} years
                        </span>
                      </div>
                    )}
                    {selectedClient.activity_level && (
                      <div>
                        <span className="text-zinc-500">Activity:</span>
                        <span className="text-white ml-1">
                          {selectedClient.activity_level}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Highlight allergies and preferences */}
                  {selectedClient.allergies && (
                    <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-red-400 font-medium mb-1">
                        <AlertCircle className="w-4 h-4" />
                        Allergies (Critical)
                      </div>
                      <div className="text-sm text-red-300">
                        {selectedClient.allergies}
                      </div>
                    </div>
                  )}

                  {selectedClient.food_preferences && (
                    <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="text-green-400 font-medium mb-1">
                        Food Preferences
                      </div>
                      <div className="text-sm text-green-300">
                        {selectedClient.food_preferences}
                      </div>
                    </div>
                  )}

                  {selectedClient.food_dislikes && (
                    <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <div className="text-yellow-400 font-medium mb-1">
                        Food Dislikes
                      </div>
                      <div className="text-sm text-yellow-300">
                        {selectedClient.food_dislikes}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        planType === type.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <type.icon
                          className={`w-5 h-5 ${
                            planType === type.id
                              ? "text-blue-400"
                              : "text-zinc-400"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            planType === type.id
                              ? "text-blue-300"
                              : "text-white"
                          }`}
                        >
                          {type.name}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {type.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Meals per Day
                  </label>
                  <select
                    value={mealsPerDay}
                    onChange={(e) => setMealsPerDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {MEALS_PER_DAY.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Meal Complexity
                  </label>
                  <select
                    value={mealComplexity}
                    onChange={(e) => setMealComplexity(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {MEAL_COMPLEXITY.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Calories */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                  <input
                    type="checkbox"
                    checked={useCustomCalories}
                    onChange={(e) => setUseCustomCalories(e.target.checked)}
                    className="rounded border-zinc-600 text-blue-500 focus:ring-blue-500"
                  />
                  Set Custom Calorie Target
                </label>
                {useCustomCalories && (
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    placeholder="Enter daily calorie target"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional requirements or notes for the AI..."
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePlan}
                  disabled={!planType || !planTitle.trim() || generating}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed rounded-lg font-medium transition-all text-white flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Diet Plan
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
                </div>{" "}
                {/* Plan Content */}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-300 mb-3">
                    Diet Plan Content
                  </h3>                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="text-sm text-zinc-300 max-h-96 overflow-y-auto scrollbar-thin scrollbar-dark">
                      {(planDetails.ai_response || planDetails.content) ? (
                        <MealPlanDisplay aiResponse={planDetails.ai_response || planDetails.content} />
                      ) : (
                        <div className="text-center text-zinc-500 py-8">
                          No content available
                        </div>
                      )}
                    </div>
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
      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        isOpen={showArchiveConfirmModal}
        onClose={() => {
          setShowArchiveConfirmModal(false);
          setSelectedPlanForAction(null);
        }}
        onConfirm={() => handleArchivePlan(selectedPlanForAction)}
        title={`${
          selectedPlanForAction?.is_archived ? "Unarchive" : "Archive"
        } Diet Plan`}
        message={`Are you sure you want to ${
          selectedPlanForAction?.is_archived ? "unarchive" : "archive"
        } "${selectedPlanForAction?.title}"?`}
        confirmText={`${
          selectedPlanForAction?.is_archived ? "Unarchive" : "Archive"
        } Plan`}
        cancelText="Cancel"        variant={selectedPlanForAction?.is_archived ? "success" : "warning"}
        isLoading={isArchiving}      />
    </>
  );
}
