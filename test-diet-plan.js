import axios from "axios";

const testDietPlanCreation = async () => {
  try {
    console.log("Testing diet plan creation...");

    // Test data that matches your frontend
    const testData = {
      title: "Test Diet Plan",
      ai_prompt: `Create a simple maintenance diet plan with 2000 calories.

===MEAL_DATA_START===
[
  {
    "meal_name": "Test Breakfast",
    "meal_type": "breakfast",
    "meal_order": 1,
    "calories": 600,
    "protein": 30,
    "carbs": 60,
    "fats": 20,
    "ingredients": ["2 eggs", "2 slices bread", "1 banana"],
    "instructions": "Cook eggs, toast bread, slice banana"
  },
  {
    "meal_name": "Test Lunch",
    "meal_type": "lunch", 
    "meal_order": 2,
    "calories": 700,
    "protein": 40,
    "carbs": 70,
    "fats": 25,
    "ingredients": ["chicken breast", "rice", "vegetables"],
    "instructions": "Grill chicken, cook rice, steam vegetables"
  },
  {
    "meal_name": "Test Dinner",
    "meal_type": "dinner",
    "meal_order": 3,
    "calories": 700,
    "protein": 35,
    "carbs": 65,
    "fats": 30,
    "ingredients": ["salmon", "potato", "broccoli"],
    "instructions": "Bake salmon, roast potato, steam broccoli"
  }
]
===MEAL_DATA_END===`,
      client_metrics: {
        age: 30,
        weight: "75.00",
        height: "175.000",
        fitness_level: "moderately_active",
        fitness_goals: "maintain",
        fitness_experience: "intermediate",
      },
      plan_type: "maintain",
      meals_per_day: 3,
      meal_complexity: "moderate",
      total_calories: 2000,
      generated_by_ai: true,
      is_active: false,
      description: "Test diet plan",
    };

    const response = await axios.post(
      "http://127.0.0.1:8000/api/diet-plans",
      testData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Add a test token - you'll need to replace this with a real one
          Authorization: "Bearer test-token",
        },
      }
    );

    console.log("Success!", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    console.error("Status:", error.response?.status);
    console.error("Headers:", error.response?.headers);
  }
};

testDietPlanCreation();
