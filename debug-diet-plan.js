// Test script to help debug diet plan creation
// Run this in your browser console while on your app

async function testDietPlanCreation() {
  // First, let's check if we have an auth token
  const authToken = localStorage.getItem("auth_token");
  console.log("Auth token:", authToken ? "Present" : "Missing");

  if (!authToken) {
    console.error("No auth token found. Please log in first.");
    return;
  }

  // Test data
  const testData = {
    title: "Debug Test Plan",
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
    "ingredients": ["2 eggs", "2 slices bread"],
    "instructions": "Cook eggs, toast bread"
  }
]
===MEAL_DATA_END===`,
    plan_type: "maintain",
    meals_per_day: 1,
    meal_complexity: "moderate",
    total_calories: 600,
    generated_by_ai: true,
    is_active: false,
  };

  try {
    console.log("Testing debug endpoint first...");

    const debugResponse = await fetch(
      "http://127.0.0.1:8000/api/debug/diet-plan",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(testData),
      }
    );

    const debugResult = await debugResponse.json();
    console.log("Debug response:", debugResult);

    if (debugResponse.ok) {
      console.log("✓ Debug checks passed, trying actual diet plan creation...");

      const realResponse = await fetch("http://127.0.0.1:8000/api/diet-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(testData),
      });

      const realResult = await realResponse.json();
      console.log("Diet plan creation response:", realResult);

      if (!realResponse.ok) {
        console.error("Diet plan creation failed:", realResult);
      }
    } else {
      console.error("Debug checks failed:", debugResult);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
}

// Run the test
testDietPlanCreation();
