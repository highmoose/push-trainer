import { Clock, Dumbbell, Utensils } from "lucide-react";
import React from "react";

export default function ClientActivePlans({ selectedClient }) {
  return (
    <div className="w-full h-full p-6 bg-zinc-900/50">
      <div className="flex w-full items-center  gap-6 border border-zinc-800">
        <Clock className="w-10 h-10 text-white" />
        <div className="text-white w-full">
          <div className="w-full flex justify-between">
            <p>Check-in Plan</p>
            <div className=" flex justify-between">
              <div className="px-2 py-1 text-xs bg-zinc-800 text-lime-500">
                Active
              </div>
            </div>
          </div>
          <p>This is a the workout plan name</p>
          <div className="px-2 py-1 text-sm opacity-30">
            Assigned 9 days ago
          </div>
        </div>
      </div>
      <div className="flex w-full items-center  gap-6 border border-zinc-800">
        <Dumbbell className="w-10 h-10 text-white" />
        <div className="text-white w-full">
          <div className="w-full flex justify-between">
            <p>Training Plan</p>
            <div className=" flex justify-between">
              <div className="px-2 py-1 text-xs bg-zinc-800 text-lime-500">
                Active
              </div>
            </div>
          </div>
          <p>This is a the workout plan name</p>
          <div className="px-2 py-1 text-sm opacity-30">
            Assigned 9 days ago
          </div>
        </div>
      </div>
      <div className="flex w-full items-center  gap-6 border border-zinc-800">
        <Utensils className="w-10 h-10 text-white" />
        <div className="text-white w-full">
          <div className="w-full flex justify-between">
            <p>Nutrition Plan</p>
            <div className=" flex justify-between">
              <div className="px-2 py-1 text-xs bg-zinc-800 text-lime-500">
                Active
              </div>
            </div>
          </div>
          <p>This is a the workout plan name</p>
          <div className="px-2 py-1 text-sm opacity-30">
            Assigned 9 days ago
          </div>
        </div>
      </div>
    </div>
  );
}
