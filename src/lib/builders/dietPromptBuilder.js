const DIET_PLAN_TYPES = [
  {
    id: "aggressive_cut",
    name: "Aggressive Weight Cut",
    description:
      "Fast fat loss with 25% calorie deficit - High protein, lower carbs",
    calorieModifier: 0.75,
    macroSplit: { protein: 40, carbs: 30, fats: 30 },
  },
  {
    id: "moderate_cut",
    name: "Moderate Weight Cut",
    description: "Steady fat loss with 15% calorie deficit - Balanced approach",
    calorieModifier: 0.85,
    macroSplit: { protein: 35, carbs: 35, fats: 30 },
  },
  {
    id: "maintain",
    name: "Maintenance",
    description: "Maintain current weight and composition - Balanced macros",
    calorieModifier: 1.0,
    macroSplit: { protein: 30, carbs: 40, fats: 30 },
  },
  {
    id: "recomp",
    name: "Body Recomposition",
    description: "Lose fat while gaining muscle - High protein, slight deficit",
    calorieModifier: 0.95,
    macroSplit: { protein: 35, carbs: 35, fats: 30 },
  },
  {
    id: "lean_bulk",
    name: "Lean Bulk",
    description: "Clean muscle gain with 10% surplus - Quality calories",
    calorieModifier: 1.1,
    macroSplit: { protein: 30, carbs: 45, fats: 25 },
  },
  {
    id: "aggressive_bulk",
    name: "Aggressive Muscle Gain",
    description: "Fast muscle gain with 20% surplus - High carbs and calories",
    calorieModifier: 1.2,
    macroSplit: { protein: 25, carbs: 50, fats: 25 },
  },
];

// Single function to build diet plan prompt
export const buildDietPlanPrompt = (
  planOptions,
  clientMetrics,
  targetCalories,
  clientName
) => {
  const { planType, mealsPerDay, mealComplexity, additionalNotes } =
    planOptions;

  const selectedPlanType = DIET_PLAN_TYPES.find((p) => p.id === planType);

  // Conditional prompt based on meal complexity
  let prompt = "";

  if (mealComplexity === "simple") {
    prompt = `=== SIMPLE DIET PLAN REQUEST ===\n`;
    prompt += `Create a simple, easy-to-follow ${
      selectedPlanType?.name || planType
    } diet plan.\n`;
    prompt += `Focus on basic ingredients, minimal prep time, and straightforward cooking methods.\n\n`;
  } else if (mealComplexity === "complex") {
    prompt = `=== ADVANCED DIET PLAN REQUEST ===\n`;
    prompt += `Create an advanced ${
      selectedPlanType?.name || planType
    } diet plan with sophisticated recipes.\n`;
    prompt += `Include complex cooking techniques, varied ingredients, and gourmet-style meals.\n\n`;
  } else {
    prompt = `=== DIET PLAN GENERATION REQUEST ===\n`;
    prompt += `Create a comprehensive ${
      selectedPlanType?.name || planType
    } diet plan.\n`;
    prompt += `Use standard home cooking methods with moderate preparation complexity.\n\n`;
  }

  prompt += `PLAN TYPE: ${selectedPlanType?.name || planType} (${planType})\n`;
  prompt += `GOAL: ${selectedPlanType?.description || ""}\n\n`;

  // Plan specifications
  prompt += `PLAN REQUIREMENTS:\n`;
  prompt += `- Goal: ${selectedPlanType?.name || planType} - ${
    selectedPlanType?.description || ""
  }\n`;
  prompt += `- Meals per day: ${mealsPerDay}\n`;
  prompt += `- Meal complexity: ${mealComplexity}\n`;

  // Target calories
  if (targetCalories) {
    prompt += `- Target Calories: ${targetCalories} calories\n`;
    prompt += `- CRITICAL: The total calories for all meals must equal ${targetCalories} calories\n`;
  }

  // Macro targets
  prompt += `- ENSURE all macro calculations are accurate for each meal\n`;

  // Client-specific information
  if (clientMetrics) {
    prompt += `\nCLIENT PROFILE:\n`;
    if (clientName) prompt += `- Name: ${clientName}\n`;

    if (clientMetrics.height)
      prompt += `- Height: ${clientMetrics.height} cm\n`;
    if (clientMetrics.weight)
      prompt += `- Weight: ${clientMetrics.weight} kg\n`;
    if (clientMetrics.age) prompt += `- Age: ${clientMetrics.age} years\n`;
    if (clientMetrics.fitness_level)
      prompt += `- Activity Level: ${clientMetrics.fitness_level.replace(
        "_",
        " "
      )}\n`;
    if (clientMetrics.fitness_goals)
      prompt += `- Fitness Goals: ${clientMetrics.fitness_goals.replace(
        "_",
        " "
      )}\n`;
    if (clientMetrics.fitness_experience)
      prompt += `- Fitness Experience: ${clientMetrics.fitness_experience}\n`;
    if (clientMetrics.allergies?.trim())
      prompt += `- ALLERGIES (CRITICAL): ${clientMetrics.allergies}\n`;
    if (clientMetrics.food_likes?.trim())
      prompt += `- Food Preferences: ${clientMetrics.food_likes}\n`;
    if (clientMetrics.food_dislikes?.trim())
      prompt += `- Foods to Avoid: ${clientMetrics.food_dislikes}\n`;

    // Add macro targets if we have target calories
    if (targetCalories && selectedPlanType?.macroSplit) {
      const macros = selectedPlanType.macroSplit;
      prompt += `\nMACRO TARGETS:\n`;
      prompt += `- Protein: ${Math.round(
        (targetCalories * (macros.protein / 100)) / 4
      )}g (${macros.protein}%)\n`;
      prompt += `- Carbs: ${Math.round(
        (targetCalories * (macros.carbs / 100)) / 4
      )}g (${macros.carbs}%)\n`;
      prompt += `- Fats: ${Math.round(
        (targetCalories * (macros.fats / 100)) / 9
      )}g (${macros.fats}%)\n`;
    }
  }

  // Additional notes
  if (additionalNotes?.trim()) {
    prompt += `\nADDITIONAL REQUIREMENTS:\n${additionalNotes}\n`;
  }

  // Output format requirements - conditional based on complexity
  if (mealComplexity === "simple") {
    prompt += `\nCRITICAL OUTPUT REQUIREMENTS:\n`;
    prompt += `1. SIMPLE RECIPES ONLY - Maximum 5 ingredients per meal\n`;
    prompt += `2. Preparation time under 15 minutes per meal\n`;
    prompt += `3. Basic cooking methods: baking, grilling, steaming, boiling\n`;
    prompt += `4. Common grocery store ingredients only\n`;
    prompt += `6. Provide simple portion measurements (cups, pieces, etc.)\n`;
    prompt += `7. Detailed and accurate macronutrient breakdown for each meal\n`;
    prompt += `8. Step-by-step basic instructions\n`;
  } else if (mealComplexity === "complex") {
    prompt += `\nCRITICAL OUTPUT REQUIREMENTS:\n`;
    prompt += `1. ADVANCED RECIPES - Use 8+ ingredients with varied techniques\n`;
    prompt += `2. Gourmet ingredients and specialty items encouraged\n`;
    prompt += `3. Professional cooking techniques and flavor combinations\n`;
    prompt += `4. Detailed and accurate macronutrient breakdown for each meal\n`;
  } else {
    prompt += `\nCRITICAL OUTPUT REQUIREMENTS:\n`;
    prompt += `1. MODERATE COMPLEXITY - 4-7 ingredients per meal\n`;
    prompt += `2. Standard home cooking methods\n`;
    prompt += `3. Reasonable prep time (15-30 minutes)\n`;
    prompt += `4. Accessible ingredients from regular grocery stores\n`;
    prompt += `5. Clear portion sizes and cooking instructions\n`;
    prompt += `6. Detailed and accurate macronutrient breakdown for each meal\n`;
  }

  prompt += `STRICTLY AVOID any foods mentioned in allergies or food dislikes\n`;
  prompt += `Prioritize foods mentioned in food preferences when possible\n`;
  prompt += `MANDATORY: Food measurements must be in grams (g), milliliters (ml), teaspoons (tsp), or tablespoons (tbsp)\n`;

  prompt += `MEAL DATA REQUIREMENTS:\n`;
  prompt += `- meal_name: Clear, descriptive name for the meal\n`;
  prompt += `- meal_type: MUST be one of: "breakfast", "lunch", "dinner", "snack", "bedtime", "pre_workout", "post_workout"\n`;
  prompt += `- meal_order: Sequential number (1, 2, 3, etc.) representing the order of meals in the day\n`;
  prompt += `- calories: Exact calorie count (integer)\n`;
  prompt += `- protein: Protein grams (integer)\n`;
  prompt += `- carbs: Carbohydrate grams (integer)\n`;
  prompt += `- fats: Fat grams (integer)\n`;
  prompt += `- ingredients: Array of specific ingredients with measurements\n`;
  prompt += `- instructions: Cooking/preparation instructions\n`;
  prompt += `- CRITICAL: Each macronutrient value must be in grams\n`;
  prompt += `- Macronutrient values must be based on trusted food composition data, prioritising McCance & Widdowson (UK) or USDA FoodData Central if unavailable.\n`;
  prompt += `- For each ingredient, provide the McCance & Widdowson 7th Edition (2019) values per 100g for protein, carbs, and fat.`;
  prompt += `- All macro values (protein, carbs, fats) per meal must be based on real food data per gram weight. NO estimations or assumptions.\n`;
  prompt += `- Distribute total daily calories optimally across meals based on standard nutritional timing principles (e.g. higher calories for main meals, lighter for snacks, less calories for bedtime )\n`;

  // Add structured response format requirements
  prompt += `\nCRITICAL: The response must be in the following format as a JSON object. No other text should be included. This will be parsed programmatically.\n`;
  prompt += `===MEAL_DATA_START===\n`;
  prompt += `[\n`;
  prompt += `  {\n`;
  prompt += `    "meal_name": "Protein Pancakes with Berries",\n`;
  prompt += `    "meal_type": "Breakfast",\n`;
  prompt += `    "meal_order": 1,\n`;
  prompt += `    "calories": 452,\n`;
  prompt += `    "protein": 37,\n`;
  prompt += `    "carbs": 48,\n`;
  prompt += `    "fats": 13,\n`;
  prompt += `    "ingredients": [\n`;
  prompt += `      { "name": "Eggs", "amount": "2 large" },\n`;
  prompt += `      { "name": "Protein Powder", "amount": "40g" },\n`;
  prompt += `      { "name": "Oats", "amount": "100g" },\n`;
  prompt += `      { "name": "Blueberries", "amount": "60g" },\n`;
  prompt += `      { "name": "Almond butter", "amount": "1 tbsp" }\n`;
  prompt += `    ],\n`;
  prompt += `    "instructions": "Blend eggs, protein powder and oats. Cook pancakes in pan until golden brown. Top with berries and almond butter."\n`;
  prompt += `  },\n`;
  prompt += `  {\n`;
  prompt += `    "meal_name": "Grilled Chicken Salad",\n`;
  prompt += `    "meal_type": "Lunch",\n`;
  prompt += `    "meal_order": 2,\n`;
  prompt += `    "calories": 511,\n`;
  prompt += `    "protein": 42,\n`;
  prompt += `    "carbs": 23,\n`;
  prompt += `    "fats": 27,\n`;
  prompt += `    "ingredients": [\n`;
  prompt += `      { "name": "Chicken Breast", "amount": "210g" },\n`;
  prompt += `      { "name": "Mixed Greens", "amount": "130g" },\n`;
  prompt += `      { "name": "Avocado", "amount": "110g" },\n`;
  prompt += `      { "name": "Olive Oil", "amount": "1 tbsp" },\n`;
  prompt += `      { "name": "Balsamic Vinegar", "amount": "1 tbsp" }\n`;
  prompt += `    ],\n`;
  prompt += `    "instructions": "Grill chicken breast until cooked through. Combine greens with dressing.Top with sliced chicken and avocado."\n`;
  prompt += `  }\n`;
  prompt += `]\n`;
  prompt += `===MEAL_DATA_END===\n\n`;

  return prompt;
};

export { DIET_PLAN_TYPES };
