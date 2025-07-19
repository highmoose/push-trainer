"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { LinePath, AreaClosed } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { Text } from "@visx/text";
import { LinearGradient } from "@visx/gradient";
import { curveMonotoneX } from "@visx/curve";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { bisector } from "d3-array";
import { Tabs, Tab } from "@heroui/react";

// Constants
const CHART_METRICS = [
  { key: "calories", color: "#3B82F6", label: "Calories" },
  { key: "protein", color: "#EF4444", label: "Protein" },
  { key: "carbs", color: "#F59E0B", label: "Carbs" },
  { key: "fats", color: "#8B5CF6", label: "Fats" },
];

const TOOLTIP_STYLES = {
  ...defaultStyles,
  background: "rgba(0, 0, 0, 0.9)",
  border: "1px solid #374151",
  color: "white",
  borderRadius: "4px",
};

// Utility Functions
const generateYTicks = (maxValue, tickCount = 5) => {
  const ticks = [];
  for (let i = 0; i <= tickCount; i++) {
    ticks.push((maxValue / tickCount) * i);
  }
  return ticks;
};

const formatMetricValue = (value, metric) => {
  return metric === "calories"
    ? `${Math.round(value)} cal`
    : `${Math.round(value)}g`;
};

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

  // Memoize expensive calculations
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    // Calculate max values for each metric
    const maxValues = Object.fromEntries(
      CHART_METRICS.map(({ key }) => [
        key,
        Math.max(...data.map((d) => d[key] || 0)),
      ])
    );

    // Transform data for current metric
    const currentMetric = data.map((d, i) => ({
      index: i,
      name: d.name || d.type || `Meal ${i + 1}`,
      value: d[selectedMetric] || 0,
    }));

    // Scales
    const xScale = scaleLinear({
      domain: [0, data.length - 1],
      range: [0, xMax],
    });

    const yScale = scaleLinear({
      domain: [0, maxValues[selectedMetric] * 1.1],
      range: [yMax, 0],
    });

    const currentMetricConfig = CHART_METRICS.find(
      (m) => m.key === selectedMetric
    );
    const yTicks = generateYTicks(maxValues[selectedMetric] * 1.1);

    // Transform data to points for rendering
    const points = currentMetric.map((d) => ({
      x: xScale(d.index),
      y: yScale(d.value),
    }));

    return {
      margin,
      xMax,
      yMax,
      maxValues,
      currentMetric,
      xScale,
      yScale,
      currentMetricConfig,
      yTicks,
      points,
    };
  }, [data, width, height, selectedMetric]);

  if (!chartData) return null;

  const {
    margin,
    xMax,
    yMax,
    currentMetric,
    xScale,
    yScale,
    currentMetricConfig,
    yTicks,
    points,
  } = chartData;

  const bisectIndex = bisector((d) => d.index).left;

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
            style={TOOLTIP_STYLES}
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
                  {formatMetricValue(tooltipData.value, selectedMetric)}
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
        {CHART_METRICS.map((metric) => (
          <Tab key={metric.key} title={metric.label} />
        ))}
      </Tabs>
    </div>
  );
};

// Utility Functions (continued)
const normalizeIngredient = (ingredient) => {
  if (typeof ingredient === "string") {
    return { name: ingredient, amount: null };
  } else if (typeof ingredient === "object" && ingredient.name) {
    return {
      name: ingredient.name,
      amount: ingredient.amount || null,
    };
  } else {
    return { name: String(ingredient), amount: null };
  }
};

const processMealData = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("No meal data available");
  }

  const meals = items.map((item) => ({
    name: item.meal_name,
    type: item.meal_type,
    order: item.meal_order,
    ingredients: JSON.parse(item.ingredients || "[]").map(normalizeIngredient),
    instructions: item.instructions,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fats: item.fats,
  }));

  const daily_totals = items.reduce(
    (totals, item) => ({
      calories: totals.calories + (item.calories || 0),
      protein: totals.protein + (item.protein || 0),
      carbs: totals.carbs + (item.carbs || 0),
      fats: totals.fats + (item.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return { meals, daily_totals };
};

// Loading Component
const LoadingSpinner = () => (
  <div className="text-center text-zinc-500 py-8">
    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
    <p>Loading meal plan...</p>
  </div>
);

// Error Component
const ErrorDisplay = ({ error }) => (
  <div className="text-center text-red-400 py-8">
    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
    <p className="font-semibold">{error}</p>
  </div>
);

// Enhanced Meal Plan Display Component with single meal navigation
const MealPlanDisplay = ({ items, activeTab }) => {
  const [mealData, setMealData] = useState(null);
  const [error, setError] = useState(null);
  const [currentMealIndex, setCurrentMealIndex] = useState(0);

  useEffect(() => {
    try {
      const processedData = processMealData(items);
      setMealData(processedData);
      setError(null);
      setCurrentMealIndex(0);
    } catch (err) {
      console.error("Error parsing meal plan:", err);
      setError(err.message || "Failed to parse meal plan data");
      setMealData(null);
    }
  }, [items]);

  if (error) return <ErrorDisplay error={error} />;
  if (!mealData) return <LoadingSpinner />;

  const sortedMeals = mealData.meals.sort((a, b) => a.order - b.order);
  const totalMeals = sortedMeals.length;

  // Navigation functions
  const navigationHandlers = {
    nextMeal: () => setCurrentMealIndex((prev) => (prev + 1) % totalMeals),
    prevMeal: () =>
      setCurrentMealIndex((prev) => (prev - 1 + totalMeals) % totalMeals),
    goToMeal: (index) => setCurrentMealIndex(index),
  };

  return (
    <div>
      {activeTab === "metrics" ? (
        <MetricsTab mealData={mealData} sortedMeals={sortedMeals} />
      ) : (
        <MealsTab
          sortedMeals={sortedMeals}
          currentMealIndex={currentMealIndex}
          totalMeals={totalMeals}
          navigationHandlers={navigationHandlers}
        />
      )}
    </div>
  );
};

// Metrics Tab Component
const MetricsTab = ({ mealData, sortedMeals }) => (
  <div className="space-y-6">
    {/* Daily Nutritional Goals */}
    <NutritionalGoals daily_totals={mealData.daily_totals} />

    {/* Charts Section */}
    <NutritionChart sortedMeals={sortedMeals} />
  </div>
);

// Nutritional Goals Component
const NutritionalGoals = ({ daily_totals }) => (
  <div className="bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 rounded-xl p-6 border border-zinc-700/30">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-400" />
        Daily Nutritional Goals
      </h3>
      <div className="flex items-center gap-6">
        <NutritionStat
          value={daily_totals.calories}
          label="Calories"
          color="white"
        />
        <NutritionStat
          value={`${daily_totals.protein}g`}
          label="Protein"
          color="blue"
        />
        <NutritionStat
          value={`${daily_totals.carbs}g`}
          label="Carbs"
          color="green"
        />
        <NutritionStat
          value={`${daily_totals.fats}g`}
          label="Fats"
          color="yellow"
        />
      </div>
    </div>
  </div>
);

// Nutrition Stat Component
const NutritionStat = ({ value, label, color }) => {
  const colorClasses = {
    white: "text-white text-2xl",
    blue: "text-blue-400 text-xl",
    green: "text-green-400 text-xl",
    yellow: "text-yellow-400 text-xl",
  };

  return (
    <div className="text-center">
      <div className={`font-bold ${colorClasses[color]}`}>{value}</div>
      <div className="text-xs text-zinc-400 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
};

// Nutrition Chart Component
const NutritionChart = ({ sortedMeals }) => (
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
);

// Meals Tab Component
const MealsTab = ({
  sortedMeals,
  currentMealIndex,
  totalMeals,
  navigationHandlers,
}) => {
  const currentMeal = sortedMeals[currentMealIndex];

  return (
    <div className="space-y-4">
      <MealHeader
        totalMeals={totalMeals}
        currentMealIndex={currentMealIndex}
        goToMeal={navigationHandlers.goToMeal}
      />
      <MealDisplay
        currentMeal={currentMeal}
        currentMealIndex={currentMealIndex}
        totalMeals={totalMeals}
        nextMeal={navigationHandlers.nextMeal}
        prevMeal={navigationHandlers.prevMeal}
      />
    </div>
  );
};

// Meal Header Component
const MealHeader = ({ totalMeals, currentMealIndex, goToMeal }) => (
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
      <Utensils className="w-5 h-5 text-orange-400" />
      Meal Plan ({totalMeals} meals)
    </h3>
    <div className="flex items-center gap-2">
      {Array.from({ length: totalMeals }).map((_, index) => (
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
);

// Meal Display Component
const MealDisplay = ({
  currentMeal,
  currentMealIndex,
  totalMeals,
  nextMeal,
  prevMeal,
}) => (
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
      <MacroDisplay currentMeal={currentMeal} />
      <IngredientsDisplay ingredients={currentMeal.ingredients} />
      {currentMeal.instructions && (
        <InstructionsDisplay instructions={currentMeal.instructions} />
      )}
    </div>
  </div>
);

// Macro Display Component
const MacroDisplay = ({ currentMeal }) => (
  <div className="flex items-center gap-6">
    <MacroItem color="blue" label="Protein" value={`${currentMeal.protein}g`} />
    <MacroItem color="green" label="Carbs" value={`${currentMeal.carbs}g`} />
    <MacroItem color="yellow" label="Fats" value={`${currentMeal.fats}g`} />
  </div>
);

// Macro Item Component
const MacroItem = ({ color, label, value }) => {
  const colorClass = `bg-${color}-400`;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 ${colorClass} rounded-full`}></div>
      <span className="text-sm text-zinc-400">{label}:</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
};

// Ingredients Display Component
const IngredientsDisplay = ({ ingredients }) => (
  <div>
    <h5 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
      Ingredients
    </h5>
    <div className="flex flex-wrap gap-3">
      {ingredients.map((ingredient, idx) => {
        const ingredientName =
          typeof ingredient === "object" ? ingredient.name : ingredient;
        const ingredientAmount =
          typeof ingredient === "object" ? ingredient.amount : null;

        return (
          <div
            key={idx}
            className="flex w-fit gap-2 items-center justify-between bg-zinc-700/30 rounded-lg p-3"
          >
            <span className="text-white font-medium capitalize">
              {ingredientName}
            </span>
            {ingredientAmount && (
              <span className="text-zinc-400 text-sm">{ingredientAmount}</span>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

// Instructions Display Component
const InstructionsDisplay = ({ instructions }) => (
  <div>
    <h5 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
      Instructions
    </h5>
    <div className="bg-zinc-700/30 rounded-lg p-4">
      <p className="text-zinc-200 leading-relaxed">{instructions}</p>
    </div>
  </div>
);

// Plan Details Section Components
const PlanInfoSection = ({ planDetails }) => (
  <div className="px-6 pt-6">
    <BasicPlanInfo planDetails={planDetails} />
    {planDetails.client_metrics && (
      <ClientMetrics client_metrics={planDetails.client_metrics} />
    )}
    <GenerationDetails planDetails={planDetails} />
    {planDetails.additional_notes && (
      <AdditionalNotes notes={planDetails.additional_notes} />
    )}
  </div>
);

// Basic Plan Info Component
const BasicPlanInfo = ({ planDetails }) => (
  <div className="grid grid-cols-4 gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/30 mb-4">
    <InfoItem label="Client" value={planDetails.client_name || ""} />
    <InfoItem
      label="Plan Type"
      value={planDetails.plan_type?.replace("_", " ") || "N/A"}
      capitalize
    />
    <InfoItem label="Meals/Day" value={planDetails.meals_per_day} />
    <InfoItem
      label="Created"
      value={new Date(planDetails.created_at).toLocaleDateString()}
    />
  </div>
);

// Info Item Component
const InfoItem = ({ label, value, capitalize = false }) => (
  <div>
    <span className="text-sm text-zinc-400 uppercase tracking-wide">
      {label}
    </span>
    <p
      className={`text-base font-medium text-white mt-1 ${
        capitalize ? "capitalize" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

// Client Metrics Component
const ClientMetrics = ({ client_metrics }) => {
  const [clientMetricsOpen, setClientMetricsOpen] = useState(false);

  const metrics = client_metrics
    .split("\n")
    .filter((line) => line.trim())
    .map((metric, index) => {
      const [label, value] = metric.split(":").map((s) => s.trim());
      if (!label || !value || label === "Client") return null;
      return { label, value, index };
    })
    .filter(Boolean);

  return (
    <>
      {clientMetricsOpen ? (
        <div
          onClick={() => setClientMetricsOpen(false)}
          className="p-4  bg-green-500/10 rounded mb-4 cursor-pointer"
        >
          <div className="flex w-full justify-between text-sm">
            <h3 className="  font-semibold text-green-300 uppercase tracking-wide mb-3">
              Client Metrics Used in Generation
            </h3>
            <p>Hide Details</p>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {metrics.map(({ label, value, index }) => (
              <div key={index} className="flex gap-4 items-center">
                <span className="text-xs text-zinc-400 uppercase tracking-wide block">
                  {label}
                </span>
                <p className="text-sm font-medium text-white capitalize">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          onClick={() => setClientMetricsOpen(true)}
          className="flex justify-between w-full p-2 px-4 text-sm bg-green-500/10 rounded mb-4 cursor-pointer"
        >
          <h3 className="  font-semibold text-green-300 uppercase tracking-wide ">
            Client Metrics Used in Generation
          </h3>
          <p>Show Details</p>
        </div>
      )}
    </>
  );
};

// Generation Details Component
const GenerationDetails = ({ planDetails }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-800/20 rounded-lg border border-zinc-700/20">
    <InfoItem
      label="Complexity"
      value={planDetails.meal_complexity || "N/A"}
      capitalize
    />
    {planDetails.custom_calories && (
      <InfoItem
        label="Custom Calories"
        value={planDetails.custom_calories.toLocaleString()}
      />
    )}
    <InfoItem label="Total Calories" value={getTotalCalories(planDetails)} />
    <InfoItem
      label="AI Generated"
      value={planDetails.generated_by_ai ? "Yes" : "No"}
    />
  </div>
);

// Helper function for total calories
const getTotalCalories = (planDetails) => {
  if (planDetails.custom_calories && planDetails.custom_calories > 0) {
    return planDetails.custom_calories.toLocaleString();
  } else if (planDetails.total_calories && planDetails.total_calories > 0) {
    return planDetails.total_calories.toLocaleString();
  }
  return "N/A";
};

// Additional Notes Component
const AdditionalNotes = ({ notes }) => (
  <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-4">
    <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wide mb-2">
      Additional Notes
    </h3>
    <p className="text-sm text-zinc-300">{notes}</p>
  </div>
);

// Main Modal Component
const PlanDetailsModal = ({
  isOpen,
  onClose,
  planDetails,
  zIndex = "z-50",
}) => {
  const [activeTab, setActiveTab] = useState("meals");

  if (!isOpen || !planDetails) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center ${zIndex} p-4`}
    >
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-zinc-700/50">
        <ModalHeader title={planDetails.title} onClose={onClose} />
        <PlanInfoSection planDetails={planDetails} />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 overflow-y-auto p-6">
          <MealPlanDisplay items={planDetails.items} activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

// Modal Header Component
const ModalHeader = ({ title, onClose }) => (
  <div className="flex items-center justify-between p-6 border-b border-zinc-700/30">
    <div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
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
);

// Tab Navigation Component
const TabNavigation = ({ activeTab, setActiveTab }) => (
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
);

export default PlanDetailsModal;
