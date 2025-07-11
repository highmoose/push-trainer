import Button from "@/components/common/button";
import { Clock, Dumbbell, Utensils } from "lucide-react";
import React from "react";

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
          <p className="text-zinc-600 ">Nutrition Plan</p>
          <p className="text-sm">This is a the workout plan name</p>
          <ProgressBar startDate="2025-06-01" endDate="2025-07-08" />
        </div>
      </div>
      <div className="flex w-full justify-start">
        <Button variant="secondary">View active plans</Button>
      </div>
    </div>
  );
}
