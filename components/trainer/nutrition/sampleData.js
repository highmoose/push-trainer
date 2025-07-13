// Sample diet plans data for testing
export const sampleDietPlans = [
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
              '{\n  "meals": [\n    {\n      "name": "Protein-Packed Breakfast Bowl",\n      "type": "breakfast",\n      "order": 1,\n      "ingredients": [{"name": "egg whites", "amount": "4 large"}, {"name": "spinach", "amount": "1 cup"}, {"name": "quinoa", "amount": "1/2 cup cooked"}, {"name": "cherry tomatoes", "amount": "1/2 cup"}, {"name": "avocado", "amount": "1/4 medium"}],\n      "instructions": "Heat a non-stick pan over medium heat. Scramble the egg whites until fluffy. Add spinach and cook until wilted. Serve over cooked quinoa and top with cherry tomatoes and sliced avocado. Season with salt and pepper to taste.",\n      "calories": 400,\n      "protein": 25,\n      "carbs": 45,\n      "fats": 15\n    },\n    {\n      "name": "Grilled Chicken Salad",\n      "type": "lunch",\n      "order": 2,\n      "ingredients": [{"name": "chicken breast", "amount": "4 oz"}, {"name": "mixed greens", "amount": "2 cups"}, {"name": "cucumber", "amount": "1/2 cup"}, {"name": "olive oil", "amount": "1 tbsp"}],\n      "instructions": "Season chicken breast with herbs and grill until cooked through. Slice and serve over mixed greens with cucumber. Drizzle with olive oil and lemon juice.",\n      "calories": 350,\n      "protein": 30,\n      "carbs": 10,\n      "fats": 20\n    }\n  ],\n  "daily_totals": {\n    "calories": 1600,\n    "protein": 110,\n    "carbs": 120,\n    "fats": 75\n  }\n}',
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
  {
    id: 2,
    title: "Muscle Building Plan - Mike",
    client_name: "Mike Thompson",
    client_id: 2,
    plan_type: "bulk",
    meals_per_day: 5,
    meal_complexity: "moderate",
    created_at: "2024-01-16T14:30:00Z",
    updated_at: "2024-01-16T14:30:00Z",
    is_favorite: true,
    is_archived: false,
    ai_response: JSON.stringify({
      id: "chatcmpl-sample2",
      object: "chat.completion",
      created: 1750287500,
      model: "gpt-3.5-turbo-0125",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content:
              '{\n  "meals": [\n    {\n      "name": "Power Breakfast",\n      "type": "breakfast",\n      "order": 1,\n      "ingredients": [{"name": "oats", "amount": "1 cup"}, {"name": "protein powder", "amount": "1 scoop"}, {"name": "banana", "amount": "1 large"}, {"name": "almonds", "amount": "30g"}],\n      "instructions": "Cook oats according to package directions. Mix in protein powder while hot. Top with sliced banana and chopped almonds. Add a drizzle of honey if desired.",\n      "calories": 650,\n      "protein": 35,\n      "carbs": 80,\n      "fats": 18\n    },\n    {\n      "name": "Post-Workout Shake",\n      "type": "snack",\n      "order": 2,\n      "ingredients": [{"name": "whey protein", "amount": "2 scoops"}, {"name": "whole milk", "amount": "1 cup"}, {"name": "berries", "amount": "1/2 cup"}],\n      "instructions": "Blend all ingredients until smooth. Consume within 30 minutes post-workout for optimal muscle recovery.",\n      "calories": 400,\n      "protein": 45,\n      "carbs": 25,\n      "fats": 8\n    },\n    {\n      "name": "Steak and Rice",\n      "type": "dinner",\n      "order": 3,\n      "ingredients": [{"name": "lean beef", "amount": "6 oz"}, {"name": "brown rice", "amount": "1 cup cooked"}, {"name": "broccoli", "amount": "1 cup"}, {"name": "olive oil", "amount": "1 tbsp"}],\n      "instructions": "Grill steak to desired doneness. Steam broccoli until tender. Serve steak over brown rice with steamed broccoli on the side. Drizzle vegetables with olive oil.",\n      "calories": 800,\n      "protein": 50,\n      "carbs": 65,\n      "fats": 25\n    }\n  ],\n  "daily_totals": {\n    "calories": 2850,\n    "protein": 180,\n    "carbs": 320,\n    "fats": 95\n  }\n}',
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
  {
    id: 3,
    title: "Maintenance Plan - Emma",
    client_name: "Emma Wilson",
    client_id: 3,
    plan_type: "maintenance",
    meals_per_day: 3,
    meal_complexity: "simple",
    created_at: "2024-01-17T09:15:00Z",
    updated_at: "2024-01-17T09:15:00Z",
    is_favorite: false,
    is_archived: false,
    ai_response: JSON.stringify({
      id: "chatcmpl-sample3",
      object: "chat.completion",
      created: 1750287600,
      model: "gpt-3.5-turbo-0125",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content:
              '{\n  "meals": [\n    {\n      "name": "Balanced Breakfast",\n      "type": "breakfast",\n      "order": 1,\n      "ingredients": [{"name": "whole grain toast", "amount": "2 slices"}, {"name": "greek yogurt", "amount": "150g"}, {"name": "berries", "amount": "1/2 cup"}, {"name": "honey", "amount": "1 tbsp"}],\n      "instructions": "Toast bread until golden brown. Serve with a side of Greek yogurt topped with fresh berries and a drizzle of honey. Perfect balance of carbs and protein.",\n      "calories": 450,\n      "protein": 20,\n      "carbs": 60,\n      "fats": 12\n    },\n    {\n      "name": "Mediterranean Lunch",\n      "type": "lunch",\n      "order": 2,\n      "ingredients": [{"name": "salmon fillet", "amount": "4 oz"}, {"name": "quinoa", "amount": "1/2 cup"}, {"name": "roasted vegetables", "amount": "1 cup"}, {"name": "tahini", "amount": "1 tbsp"}],\n      "instructions": "Bake salmon with herbs at 400°F for 15 minutes. Serve over quinoa with a variety of roasted vegetables. Drizzle with tahini for extra flavor and healthy fats.",\n      "calories": 550,\n      "protein": 35,\n      "carbs": 45,\n      "fats": 25\n    },\n    {\n      "name": "Light Dinner",\n      "type": "dinner",\n      "order": 3,\n      "ingredients": [{"name": "turkey breast", "amount": "4 oz"}, {"name": "sweet potato", "amount": "1 medium"}, {"name": "green beans", "amount": "1 cup"}, {"name": "coconut oil", "amount": "1 tsp"}],\n      "instructions": "Roast turkey breast until fully cooked. Bake sweet potato until tender. Steam green beans and toss with a small amount of coconut oil. A well-balanced, satisfying dinner.",\n      "calories": 500,\n      "protein": 40,\n      "carbs": 50,\n      "fats": 18\n    }\n  ],\n  "daily_totals": {\n    "calories": 2200,\n    "protein": 140,\n    "carbs": 220,\n    "fats": 85\n  }\n}',
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
