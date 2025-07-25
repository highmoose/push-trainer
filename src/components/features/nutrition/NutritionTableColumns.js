import React from "react";
import {
  ChefHat,
  User,
  Calendar,
  Target,
  Utensils,
  Zap,
  Plus,
} from "lucide-react";
import { AvatarGroup, Avatar } from "@heroui/react";
import VSXCalorieChart from "./VSXCalorieChart";

/**
 * Table Column Definitions for Nutrition Plans
 * Defines how each column should render and behave
 */
export const getNutritionTableColumns = (onAssignClick) => [
  {
    key: "name",
    label: "Plan",
    icon: ChefHat,
    className: "w-1/4", // Increased from 20% to 25% of width
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-500/20 to-zinc-600/20 flex items-center justify-center border border-zinc-600/30">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              row.title || "Plan"
            )}&size=40&background=random&color=fff&format=svg`}
            alt="Plan"
            className="w-8 h-8 rounded-full"
          />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-white flex items-center gap-2">
            <span className="truncate">{row.title}</span>
            {row.is_generating && (
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400 font-normal bg-zinc-500/10 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse"></div>
                Creating Nutrition Plan
              </span>
            )}
            {row.has_error && (
              <span className="inline-flex items-center gap-1 text-xs text-red-400 font-normal bg-red-500/10 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                Something went wrong
              </span>
            )}
          </div>
          <div className="text-sm text-zinc-400 truncate">
            {row.client_name || ""}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "calories",
    label: "Calories & Distribution",
    icon: Zap,
    className: "w-1/4", // 25% of width for the main content
    render: (value, row) => {
      if (row.is_generating) {
        return (
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
            Calculating...
          </div>
        );
      }

      if (row.has_error) {
        return (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <span>Error generating plan</span>
          </div>
        );
      }
      // Get chart data
      const chartData = createCalorieChartData(row);
      return (
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="text-white font-semibold text-lg">
              {row.total_calories} cal
            </div>
          </div>
          {chartData && chartData.length > 0 ? (
            <div className="flex-shrink-0">
              <VSXCalorieChart
                data={chartData}
                width={190}
                height={56}
                chartId={`chart-${
                  row.id ||
                  row.title?.replace(/\s+/g, "-").toLowerCase() ||
                  "default"
                }`}
              />
            </div>
          ) : (
            <div className="text-xs text-zinc-500">No chart data</div>
          )}
        </div>
      );
    },
  },
  {
    key: "macros",
    label: "Macros",
    icon: Target,
    className: "w-1/6", // ~16.7% of width
    render: (value, row) => {
      if (row.is_generating) {
        return (
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
            Calculating...
          </div>
        );
      }

      // Calculate macros from items data only
      let macros = { protein: "N/A", carbs: "N/A", fats: "N/A" };

      if (
        row.meal_items &&
        Array.isArray(row.meal_items) &&
        row.meal_items.length > 0
      ) {
        // Sum up macros from all meal items
        const totals = row.meal_items.reduce(
          (acc, item) => ({
            protein: acc.protein + (parseFloat(item.protein) || 0),
            carbs: acc.carbs + (parseFloat(item.carbs) || 0),
            fats: acc.fats + (parseFloat(item.fats) || 0),
          }),
          { protein: 0, carbs: 0, fats: 0 }
        );

        macros = {
          protein:
            totals.protein > 0 ? `${Math.round(totals.protein)}g` : "N/A",
          carbs: totals.carbs > 0 ? `${Math.round(totals.carbs)}g` : "N/A",
          fats: totals.fats > 0 ? `${Math.round(totals.fats)}g` : "N/A",
        };
      }

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-zinc-400">P: {macros.protein}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-zinc-400">C: {macros.carbs}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-zinc-400">F: {macros.fats}</span>
            </div>
          </div>
          <div className="text-xs text-zinc-500 capitalize">
            {row.plan_type?.replace("_", " ")}
          </div>
        </div>
      );
    },
  },
  {
    key: "meals_per_day",
    label: "Meals",
    icon: Utensils,
    className: "w-1/12", // ~8.3% of width
    render: (value, row) => {
      if (row.is_generating) {
        return (
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      }
      return (
        <div className="flex justify-start">
          <div className="text-white font-semibold bg-zinc-500/20 px-2 py-1 rounded-full text-sm w-fit">
            {value || 3}
          </div>
        </div>
      );
    },
  },
  {
    key: "created_at",
    label: "Created",
    icon: Calendar,
    className: "w-1/6", // ~16.7% of width
    render: (value, row) => {
      if (row.is_generating) {
        return (
          <div className="text-sm">
            <div className="text-white font-medium">Just now</div>
            <div className="text-zinc-400 text-xs flex items-center gap-1">
              <div className="w-2 h-2 border border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
              Creating...
            </div>
          </div>
        );
      }
      return (
        <div className="text-sm">
          <div className="text-white font-medium">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-zinc-400 text-xs">
            {new Date(value).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      );
    },
  },
  {
    key: "client_name",
    label: "Assigned to",
    icon: User,
    className: "w-1/6", // ~16.7% of width
    render: (value, row) => {
      if (row.is_generating) {
        return (
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        );
      }
      [];

      if (row.has_error) {
        return (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <span>—</span>
          </div>
        );
      }

      // For now, we'll show a single assigned user and placeholder for multiple assignments
      const assignedUsers = [
        {
          id: row.client_id || 1,
          name: value || "Generic",
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            value || "Generic"
          )}&size=32&background=random&color=fff&format=svg`,
        },
      ];

      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              onAssignClick(row); // Pass the row data
            }}
            className="flex items-center justify-center bg-black/20 hover:bg-black/40 h-10 w-10 rounded-full mr-2 "
          >
            <Plus className=" text-white/50" size={20} />
          </button>
          <AvatarGroup
            isBordered
            max={3}
            size="sm"
            classNames={{
              base: "gap-2",
              count: "text-xs bg-zinc-700 text-zinc-300",
            }}
          >
            {assignedUsers.map((user) => (
              <Avatar
                key={user.id}
                src={user.avatar}
                alt={user.name}
                size="sm"
                className="w-6 h-6"
              />
            ))}
          </AvatarGroup>
          {assignedUsers.length > 3 && (
            <span className="text-zinc-400 text-xs">
              +{assignedUsers.length - 3}
            </span>
          )}
        </div>
      );
    },
  },
];

/**
 * Helper function to create chart data from meal plan items
 */
export const createCalorieChartData = (row) => {
  try {
    // Use items from the hook data instead of AI response
    if (
      !row.meal_items ||
      !Array.isArray(row.meal_items) ||
      row.meal_items.length === 0
    ) {
      return null;
    }

    // Sort by meal order and create chart data
    const sortedMeals = row.meal_items.sort(
      (a, b) => (a.meal_order || 0) - (b.meal_order || 0)
    );
    return sortedMeals.map((meal, index) => ({
      name: meal.meal_type || meal.meal_name || `Meal ${index + 1}`,
      calories: meal.calories || 0,
      index: index + 1,
    }));
  } catch (error) {
    console.error("Error creating chart data from items:", error);
    return null;
  }
};
