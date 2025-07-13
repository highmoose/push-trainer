"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  AlertCircle,
  Target,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Group } from "@visx/group";
import { Bar, LinePath, AreaClosed } from "@visx/shape";
import { scaleLinear, scaleBand } from "@visx/scale";
import { Pie } from "@visx/shape";
import { Text } from "@visx/text";
import { LinearGradient } from "@visx/gradient";
import { curveMonotoneX } from "@visx/curve";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { bisector } from "d3-array";
import { Tabs, Tab } from "@heroui/react";

// VSX Multi-Line Chart Component for Nutrition Data
const VSXNutritionChart = ({ data, width = 600, height = 300 }) => {
  const [selectedMetric, setSelectedMetric] = useState("calories");

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  if (!data || data.length === 0) return null;

  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Calculate max values for each metric
  const maxValues = {
    calories: Math.max(...data.map((d) => d.calories)),
    protein: Math.max(...data.map((d) => d.protein)),
    carbs: Math.max(...data.map((d) => d.carbs)),
    fats: Math.max(...data.map((d) => d.fats)),
  };

  // Get current metric data
  const currentMetric = data.map((d, i) => ({
    index: i,
    name: d.name || d.type || `Meal ${i + 1}`,
    value: d[selectedMetric],
  }));

  const xScale = scaleLinear({
    domain: [0, data.length - 1],
    range: [0, xMax],
  });

  const yScale = scaleLinear({
    domain: [0, maxValues[selectedMetric] * 1.1],
    range: [yMax, 0],
  });

  const metrics = [
    { key: "calories", color: "#3b82f6", label: "Calories" },
    { key: "protein", color: "#ef4444", label: "Protein" },
    { key: "carbs", color: "#10b981", label: "Carbs" },
    { key: "fats", color: "#f59e0b", label: "Fats" },
  ];

  const currentMetricConfig = metrics.find((m) => m.key === selectedMetric);

  // Create bisector for tooltip
  const bisectIndex = bisector((d) => d.index).left;

  // Generate y-axis ticks
  const yTicks = [];
  const maxVal = maxValues[selectedMetric] * 1.1;
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push((maxVal / tickCount) * i);
  }

  // Tooltip styles
  const tooltipStyles = {
    ...defaultStyles,
    background: "rgba(0, 0, 0, 0.9)",
    border: "1px solid #374151",
    color: "white",
    borderRadius: "4px",
  };

  // Tooltip handler
  const handleTooltip = useCallback(
    (event) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);
      const index = bisectIndex(currentMetric, x0, 1);
      const d0 = currentMetric[index - 1];
      const d1 = currentMetric[index];
      let d = d0;
      if (d1 && d0) {
        d = x0 - d0.index > d1.index - x0 ? d1 : d0;
      }
      if (d) {
        showTooltip({
          tooltipData: d,
          tooltipLeft: xScale(d.index),
          tooltipTop: yScale(d.value),
        });
      }
    },
    [xScale, yScale, currentMetric, bisectIndex, showTooltip]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={width} height={height}>
          <defs>
            <LinearGradient
              id={`area-gradient-${selectedMetric}`}
              from={currentMetricConfig.color}
              to={currentMetricConfig.color}
              fromOpacity={0.2}
              toOpacity={0}
            />
          </defs>
          <Group left={margin.left} top={margin.top}>
            {/* Grid lines */}
            {yTicks.map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={xMax}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#374151"
                strokeOpacity={0.3}
                strokeWidth={1}
              />
            ))}

            {/* Y-axis labels */}
            {yTicks.map((tick) => (
              <Text
                key={tick}
                x={-10}
                y={yScale(tick)}
                textAnchor="end"
                verticalAnchor="middle"
                fontSize={12}
                fill="#9ca3af"
              >
                {Math.round(tick)}
              </Text>
            ))}

            {/* Render current selected metric */}
            {(() => {
              const points = currentMetric.map((d) => ({
                x: xScale(d.index),
                y: yScale(d.value),
              }));

              return (
                <Group key={selectedMetric}>
                  {/* Area with gradient */}
                  <AreaClosed
                    data={points}
                    x={(d) => d.x}
                    y={(d) => d.y}
                    yScale={yScale}
                    fill={`url(#area-gradient-${selectedMetric})`}
                    curve={curveMonotoneX}
                  />
                  {/* Line */}
                  <LinePath
                    data={points}
                    x={(d) => d.x}
                    y={(d) => d.y}
                    stroke={currentMetricConfig.color}
                    strokeWidth={2}
                    fill="none"
                    curve={curveMonotoneX}
                  />
                  {/* Points */}
                  {points.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r={3}
                      fill={currentMetricConfig.color}
                      stroke="#1f2937"
                      strokeWidth={2}
                    />
                  ))}

                  {/* Highlight point when tooltip is active */}
                  {tooltipOpen && tooltipData && (
                    <circle
                      cx={xScale(tooltipData.index)}
                      cy={yScale(tooltipData.value)}
                      r={5}
                      fill={currentMetricConfig.color}
                      stroke="white"
                      strokeWidth={2}
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                </Group>
              );
            })()}

            {/* X-axis labels */}
            {currentMetric.map((d, i) => (
              <Text
                key={i}
                x={xScale(i)}
                y={yMax + 20}
                textAnchor="middle"
                fontSize={12}
                fill="#9ca3af"
              >
                {d.name.length > 8 ? d.name.substring(0, 8) + "..." : d.name}
              </Text>
            ))}

            {/* Invisible overlay for tooltip interaction */}
            <rect
              width={xMax}
              height={yMax}
              fill="transparent"
              onMouseMove={handleTooltip}
              onMouseLeave={() => hideTooltip()}
              onTouchStart={handleTooltip}
              onTouchMove={handleTooltip}
            />
          </Group>
        </svg>

        {/* Tooltip - render outside SVG */}
        {tooltipOpen && tooltipData && (
          <TooltipWithBounds
            key={Math.random()}
            top={tooltipTop + margin.top}
            left={tooltipLeft + margin.left}
            style={tooltipStyles}
          >
            <div>
              <div className="font-semibold mb-2">{tooltipData.name}</div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentMetricConfig.color }}
                  />
                  <span className="text-sm">{currentMetricConfig.label}</span>
                </div>
                <span className="text-sm font-medium">
                  {selectedMetric === "calories"
                    ? `${Math.round(tooltipData.value)} cal`
                    : `${Math.round(tooltipData.value)}g`}
                </span>
              </div>
            </div>
          </TooltipWithBounds>
        )}
      </div>

      {/* Metric selector using Hero UI Tabs */}
      <Tabs
        selectedKey={selectedMetric}
        onSelectionChange={setSelectedMetric}
        size="sm"
        radius="lg"
        classNames={{
          tabList: "bg-zinc-800/50 border border-zinc-700/50",
          tab: "text-zinc-400 data-[selected=true]:text-white",
          cursor: "bg-zinc-600/50",
        }}
      >
        {metrics.map((metric) => (
          <Tab key={metric.key} title={metric.label} />
        ))}
      </Tabs>
    </div>
  );
};

// Enhanced Meal Plan Display Component with single meal navigation
const MealPlanDisplay = ({ aiResponse, items, activeTab }) => {
  const [mealData, setMealData] = useState(null);
  const [error, setError] = useState(null);
  const [currentMealIndex, setCurrentMealIndex] = useState(0);

  useEffect(() => {
    try {
      let parsedData;

      // First, try to use the items array if available
      if (items && Array.isArray(items) && items.length > 0) {
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
      } else if (aiResponse) {
        // Parse AI response
        const response =
          typeof aiResponse === "string" ? JSON.parse(aiResponse) : aiResponse;
        const content = response.choices?.[0]?.message?.content;

        if (content) {
          parsedData = JSON.parse(content);
        }
      }

      if (parsedData && parsedData.meals && Array.isArray(parsedData.meals)) {
        // Normalize meal data
        const normalizedData = {
          ...parsedData,
          meals: parsedData.meals.map((meal) => ({
            ...meal,
            ingredients: meal.ingredients
              ? meal.ingredients.map((ingredient) => {
                  if (typeof ingredient === "string") {
                    return { name: ingredient, amount: null };
                  } else if (
                    typeof ingredient === "object" &&
                    ingredient.name
                  ) {
                    return {
                      name: ingredient.name,
                      amount: ingredient.amount || null,
                    };
                  } else {
                    return { name: String(ingredient), amount: null };
                  }
                })
              : [],
          })),
        };

        setMealData(normalizedData);
        setError(null);
        setCurrentMealIndex(0); // Reset to first meal
      } else {
        setError("Invalid meal plan format - no meals array found");
      }
    } catch (err) {
      console.error("Error parsing meal plan:", err);
      setError(`Failed to parse meal plan data: ${err.message}`);
    }
  }, [aiResponse, items]);

  if (error) {
    return (
      <div className="text-center text-red-400 py-8">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  if (!mealData) {
    return (
      <div className="text-center text-zinc-500 py-8">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p>Loading meal plan...</p>
      </div>
    );
  }

  const sortedMeals = mealData.meals.sort((a, b) => a.order - b.order);
  const currentMeal = sortedMeals[currentMealIndex];
  const totalMeals = sortedMeals.length;

  const nextMeal = () => {
    setCurrentMealIndex((prev) => (prev + 1) % totalMeals);
  };

  const prevMeal = () => {
    setCurrentMealIndex((prev) => (prev - 1 + totalMeals) % totalMeals);
  };

  const goToMeal = (index) => {
    setCurrentMealIndex(index);
  };

  // Metrics Tab Content
  const MetricsTab = () => (
    <div className="space-y-6">
      {/* Daily Nutritional Goals */}
      {mealData.daily_totals && (
        <div className="bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 rounded-xl p-6 border border-zinc-700/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Daily Nutritional Goals
            </h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {mealData.daily_totals.calories}
                </div>
                <div className="text-xs text-zinc-400 uppercase tracking-wide">
                  Calories
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">
                  {mealData.daily_totals.protein}g
                </div>
                <div className="text-xs text-zinc-400 uppercase tracking-wide">
                  Protein
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">
                  {mealData.daily_totals.carbs}g
                </div>
                <div className="text-xs text-zinc-400 uppercase tracking-wide">
                  Carbs
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">
                  {mealData.daily_totals.fats}g
                </div>
                <div className="text-xs text-zinc-400 uppercase tracking-wide">
                  Fats
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {mealData.daily_totals && (
        <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/30">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Nutrition Distribution Across Meals
          </h4>
          <div className="w-full">
            <VSXNutritionChart
              data={sortedMeals.map((meal, i) => ({
                name: meal.type || `Meal ${i + 1}`,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fats: meal.fats,
              }))}
              width={900}
              height={300}
            />
          </div>
        </div>
      )}
    </div>
  );

  // Meals Tab Content
  const MealsTab = () => (
    <div className="space-y-4">
      {/* Meal Progress Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Utensils className="w-5 h-5 text-orange-400" />
          Meal Plan ({totalMeals} meals)
        </h3>
        <div className="flex items-center gap-2">
          {sortedMeals.map((_, index) => (
            <button
              key={index}
              onClick={() => goToMeal(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentMealIndex
                  ? "bg-orange-400 shadow-lg shadow-orange-400/30"
                  : "bg-zinc-600 hover:bg-zinc-500"
              }`}
              title={`Meal ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Current Meal Display */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/30 overflow-hidden">
        {/* Meal Header */}
        <div className="bg-gradient-to-r from-zinc-700/50 to-zinc-800/50 p-6 border-b border-zinc-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={prevMeal}
                disabled={totalMeals <= 1}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Meal"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h4 className="text-xl font-semibold text-white mb-1">
                  {currentMeal.name}
                </h4>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span className="capitalize flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {currentMeal.type}
                  </span>
                  <span>
                    Meal {currentMealIndex + 1} of {totalMeals}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {currentMeal.calories}
                </div>
                <div className="text-xs text-zinc-400 uppercase tracking-wide">
                  calories
                </div>
              </div>
              <button
                onClick={nextMeal}
                disabled={totalMeals <= 1}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Meal"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Meal Content */}
        <div className="p-6 space-y-6">
          {/* Macros */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-zinc-400">Protein:</span>
              <span className="font-semibold text-white">
                {currentMeal.protein}g
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-zinc-400">Carbs:</span>
              <span className="font-semibold text-white">
                {currentMeal.carbs}g
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-zinc-400">Fats:</span>
              <span className="font-semibold text-white">
                {currentMeal.fats}g
              </span>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h5 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
              Ingredients
            </h5>
            <div className="grid grid-cols-2 gap-3">
              {currentMeal.ingredients.map((ingredient, idx) => {
                const ingredientName =
                  typeof ingredient === "object" ? ingredient.name : ingredient;
                const ingredientAmount =
                  typeof ingredient === "object" ? ingredient.amount : null;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-zinc-700/30 rounded-lg p-3"
                  >
                    <span className="text-white font-medium">
                      {ingredientName}
                    </span>
                    {ingredientAmount && (
                      <span className="text-zinc-400 text-sm">
                        {ingredientAmount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          {currentMeal.instructions && (
            <div>
              <h5 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
                Instructions
              </h5>
              <div className="bg-zinc-700/30 rounded-lg p-4">
                <p className="text-zinc-200 leading-relaxed">
                  {currentMeal.instructions}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return <div>{activeTab === "metrics" ? <MetricsTab /> : <MealsTab />}</div>;
};

// Main Modal Component
const PlanDetailsModal = ({ isOpen, onClose, planDetails }) => {
  const [activeTab, setActiveTab] = useState("meals");

  if (!isOpen || !planDetails) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-zinc-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700/30">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {planDetails.title}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Diet Plan Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plan Info */}
        <div className="px-6 pt-6">
          <div className="grid grid-cols-4 gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
            <div>
              <span className="text-sm text-zinc-400 uppercase tracking-wide">
                Client
              </span>
              <p className="text-base font-medium text-white mt-1">
                {planDetails.client_name || "Generic Plan"}
              </p>
            </div>
            <div>
              <span className="text-sm text-zinc-400 uppercase tracking-wide">
                Plan Type
              </span>
              <p className="text-base font-medium text-white mt-1 capitalize">
                {planDetails.plan_type?.replace("_", " ") || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-zinc-400 uppercase tracking-wide">
                Meals/Day
              </span>
              <p className="text-base font-medium text-white mt-1">
                {planDetails.meals_per_day}
              </p>
            </div>
            <div>
              <span className="text-sm text-zinc-400 uppercase tracking-wide">
                Created
              </span>
              <p className="text-base font-medium text-white mt-1">
                {new Date(planDetails.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-6">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={setActiveTab}
            size="lg"
            radius="lg"
            classNames={{
              tabList: "bg-zinc-800/50 border border-zinc-700/50",
              tab: "text-zinc-400 data-[selected=true]:text-white px-6 py-3",
              cursor: "bg-zinc-600/50",
            }}
          >
            <Tab
              key="meals"
              title={
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Meals
                </div>
              }
            />
            <Tab
              key="metrics"
              title={
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Metrics
                </div>
              }
            />
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <MealPlanDisplay
            aiResponse={planDetails.ai_response}
            items={planDetails.items}
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsModal;
