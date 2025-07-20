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
  }

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
    prompt += `5. MANDATORY: Calculate and display the EXACT target calories\n`;
    prompt += `6. Provide simple portion measurements (cups, pieces, etc.)\n`;
    prompt += `7. Step-by-step basic instructions\n`;
  } else if (mealComplexity === "complex") {
    prompt += `\nCRITICAL OUTPUT REQUIREMENTS:\n`;
    prompt += `1. ADVANCED RECIPES - Use 8+ ingredients with varied techniques\n`;
    prompt += `2. Include complex cooking methods: sous vide, braising, reduction sauces\n`;
    prompt += `3. Gourmet ingredients and specialty items encouraged\n`;
    prompt += `4. Detailed preparation steps with precise timing\n`;
    prompt += `5. MANDATORY: Calculate and display the EXACT target calories\n`;
    prompt += `6. Professional cooking techniques and flavor combinations\n`;
    prompt += `7. Detailed macronutrient breakdown for each component\n`;
  } else {
    prompt += `\nCRITICAL OUTPUT REQUIREMENTS:\n`;
    prompt += `1. MODERATE COMPLEXITY - 4-7 ingredients per meal\n`;
    prompt += `2. Standard home cooking methods\n`;
    prompt += `3. Reasonable prep time (15-30 minutes)\n`;
    prompt += `4. Accessible ingredients from regular grocery stores\n`;
    prompt += `5. MANDATORY: Calculate and display the EXACT target calories\n`;
    prompt += `6. Clear portion sizes and cooking instructions\n`;
    prompt += `7. Detailed macronutrient breakdown for each meal\n`;
  }

  prompt += `8. STRICTLY AVOID any foods mentioned in allergies or food dislikes\n`;
  prompt += `9. Prioritize foods mentioned in food preferences when possible\n`;
  prompt += `10. MANDATORY: Show a calorie summary at the top of the plan\n`;
  prompt += `11. MANDATORY: Ensure all meals add up to the target calorie amount\n`;
  prompt += `12. Consider the client's activity level for appropriate caloric intake\n`;
  prompt += `13. Format as a detailed, easy-to-follow meal plan\n`;
  prompt += `14. DOUBLE-CHECK: Verify that your calorie total matches the plan goal\n`;

  // Add plan-specific verification
  const verificationMap = {
    aggressive_cut: "AGGRESSIVE CUT - calories must be 25% below maintenance",
    moderate_cut: "MODERATE CUT - calories must be 15% below maintenance",
    maintain: "MAINTENANCE - calories should match maintenance level",
    recomp: "RECOMPOSITION - calories must be 5% below maintenance",
    lean_bulk: "LEAN BULK - calories must be 10% above maintenance",
    aggressive_bulk: "AGGRESSIVE BULK - calories must be 20% above maintenance",
  };

  if (verificationMap[planType]) {
    prompt += `15. VERIFICATION: This is a ${verificationMap[planType]}\n`;
  }

  return prompt;
};

export { DIET_PLAN_TYPES };
