# Diet Plan Generation Flow - Clean Architecture

## Overview

The diet plan generation has been refactored to have a clean separation of concerns:

1. **Frontend Form** (`CreatePlanModal.js`) - Collects user input
2. **Prompt Builder** (`utils/dietPromptBuilder.js`) - Builds AI prompts and extracts client metrics
3. **API Controller** (`DietPlanController.php`) - Processes requests and stores data
4. **Database** - Stores plans with client preferences for later display

## Data Flow

### 1. User Input Collection

```javascript
// CreatePlanModal.js
const createModalData = {
  planType,
  mealsPerDay,
  mealComplexity,
  useCustomCalories,
  customCalories,
  additionalNotes,
  client,
  tailorToClient,
};
```

### 2. Prompt Building & Metrics Extraction

```javascript
// utils/dietPromptBuilder.js
const enhancedPrompt = buildDietPlanPrompt(createModalData);
const clientMetrics = extractClientMetrics(createModalData);
```

### 3. API Request

```javascript
// Sent to API
const planData = {
  title: planTitle,
  clientName,
  clientId,
  planType,
  mealsPerDay,
  mealComplexity,
  clientMetrics, // <- Extracted client metrics
  dietPlanRequest: {
    prompt: enhancedPrompt,
    // ... other fields
    clientMetrics, // <- Also in request
  },
};
```

### 4. Database Storage

```php
// DietPlanController.php - savePlanToDatabase()
DB::table('diet_plans')->insertGetId([
  // ... other fields
  'client_preferences' => $request->client_metrics ? json_encode($request->client_metrics) : null,
]);
```

### 5. Display in Diet Plan Details

```php
// When retrieving plans
'client_preferences' => $plan->client_preferences ? json_decode($plan->client_preferences, true) : null,
```

## Client Metrics Structure

```javascript
{
  clientData: {
    height: 180,
    weight: 75,
    fitness_level: "moderate_activity",
    allergies: "nuts, dairy",
    food_likes: "chicken, rice",
    food_dislikes: "seafood",
    medical_conditions: "diabetes"
  },
  calculatedMetrics: {
    bmr: 1800,
    maintenanceCalories: 2790,
    targetCalories: 2371,
    calorieDeficitSurplus: -419
  },
  planConfiguration: {
    planType: "moderate_cut",
    planName: "Moderate Weight Cut",
    calorieModifier: 0.85,
    macroSplit: { protein: 35, carbs: 35, fats: 30 }
  }
}
```

## Benefits

### ✅ Clean Separation

- Prompt building logic is isolated and reusable
- Client metrics extraction is centralized
- API only handles request processing

### ✅ Persistent Client Data

- Client preferences and calculated metrics stored with each plan
- Can display personalized metrics in diet plan details modal
- Historical tracking of client's metrics over time

### ✅ Reduced Code Complexity

- Removed 200+ lines of inline prompt building from CreatePlanModal
- Single source of truth for diet plan types and calculations
- Easier to maintain and extend

### ✅ Better User Experience

- Diet plan details show personalized client metrics
- Clear indication of calorie calculations used
- Maintains context of why plan was designed that way

## Files Changed

### Frontend

- `components/trainer/nutrition/CreatePlanModal.js` - Simplified and cleaned
- `utils/dietPromptBuilder.js` - New file with all prompt logic

### Backend

- `app/Http/Controllers/DietPlanController.php` - Added client_metrics handling
- `database/migrations/2025_07_20_091248_add_client_preferences_to_diet_plans_table.php` - New column

### Database Schema

- `diet_plans.client_preferences` - JSON column storing client metrics and calculations
