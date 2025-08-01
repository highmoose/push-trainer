import Button from "@/components/common/button";
import { Clock, Dumbbell, Utensils, Settings } from "lucide-react";
import React, { useState, useEffect } from "react";
import NutritionPlanManagementModal from "@/features/nutrition/NutritionPlanManagementModal";
import useClientDietPlans from "@/hooks/clientDietPlans";

// Progress bar component that calculates percentage based on dates
const ProgressBar = ({ startDate, endDate }) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate total duration and elapsed time
  const totalDuration = end.getTime() - start.getTime();
  const elapsedTime = now.getTime() - start.getTime();

  // Calculate percentage (0-100)
  let percentage = Math.max(
    0,
    Math.min(100, (elapsedTime / totalDuration) * 100)
  );

  // Progress bar always green, but text color changes based on percentage
  const barColor = "bg-lime-500";
  const bgColor = "bg-lime-500/20";

  // Determine text color for days remaining based on percentage
  let daysRemainingColor = "text-zinc-400"; // Default

  if (percentage >= 95) {
    daysRemainingColor = "text-red-400";
  } else if (percentage >= 90) {
    daysRemainingColor = "text-orange-400";
  }

  return (
    <div className="w-full mt-2">
      <div
        className={`w-full h-1 mb-2 bg-zinc-800/50 rounded-full overflow-hidden `}
      >
        <div
          className={`h-full  ${barColor} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-zinc-600">
          {Math.round(percentage)}% complete
        </span>
        <span className={daysRemainingColor}>
          {Math.max(0, Math.round(100 - percentage))} days remaining
        </span>
      </div>
    </div>
  );
};

export default function ClientActivePlans({ selectedClient }) {
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  // Use the dedicated client diet plans hook
  const { fetchClientDietPlans, loading } = useClientDietPlans();
  const [activePlan, setActivePlan] = useState(null);

  // Load client's diet plans when selectedClient changes
  useEffect(() => {
    if (selectedClient?.id) {
      fetchClientDietPlans(selectedClient.id)
        .then((result) => {
          if (result.success) {
            // Find the active plan
            const active = result.data?.find((plan) => plan.is_active) || null;
            setActivePlan(active);
          }
        })
        .catch((error) => {
          console.error("Error fetching client diet plans:", error);
        });
    } else {
      // Clear state if no client selected
      setActivePlan(null);
    }
  }, [selectedClient?.id, fetchClientDietPlans]);

  const handleNutritionModalClose = () => {
    setShowNutritionModal(false);
    // Refresh client's diet plans after modal closes
    if (selectedClient?.id) {
      fetchClientDietPlans(selectedClient.id).then((result) => {
        if (result.success) {
          const active = result.data?.find((plan) => plan.is_active) || null;
          setActivePlan(active);
        }
      });
    }
  };

  return (
    <div
      className="flex-1 bg-zinc-900 flex flex-col justify-between
     p-10"
    >
      <p className="text-xl font-thin ">Active Plans</p>
      <div className="flex flex-col justify-betwee gap-6 ">
        {/* <Clock className="w-10 h-10 text-white" /> */}
        <div className="text-white w-full">
          <p className="text-zinc-600 ">Check-in schedule </p>
          <p className="text-sm">This is a the workout plan name</p>
          <ProgressBar startDate="2025-06-27" endDate="2025-08-01" />
        </div>
        {/* <Dumbbell className="w-10 h-10 text-white" /> */}
        <div className="text-white w-full">
          <p className="text-zinc-600 ">Training Plan</p>
          <p className="text-sm">This is a the workout plan name</p>
          <ProgressBar startDate="2025-06-20" endDate="2025-07-15" />
        </div>
        {/* <Utensils className="w-10 h-10 text-white" /> */}
        <div className="text-white w-full">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-600">Nutrition Plan</p>
            <button
              onClick={() => setShowNutritionModal(true)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
              title="Manage Nutrition Plans"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : activePlan ? (
            <>
              <p className="text-sm font-medium text-white mb-1">
                {activePlan.title}
              </p>
              <p className="text-xs text-zinc-400 mb-2">
                {activePlan.plan_type
                  ?.replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                • {activePlan.meals_per_day} meals/day
                {activePlan.total_calories &&
                  ` • ${activePlan.total_calories.toLocaleString()} cal`}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-500">No active nutrition plan</p>
              <p className="text-xs text-zinc-600 mb-2">
                Click manage to assign a plan
              </p>
            </>
          )}
          <ProgressBar startDate="2025-06-01" endDate="2025-07-08" />
        </div>
      </div>
      <div className="flex w-full justify-start">
        <Button variant="secondary">View active plans</Button>
      </div>

      {/* Nutrition Plan Management Modal */}
      {showNutritionModal && (
        <NutritionPlanManagementModal
          isOpen={showNutritionModal}
          onClose={handleNutritionModalClose}
          client={selectedClient}
        />
      )}
    </div>
  );
}
