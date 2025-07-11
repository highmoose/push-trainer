import Button from "@/components/common/button";
import {
  Clock,
  Dumbbell,
  Utensils,
  Scale,
  MessageSquare,
  TrendingUp,
  User,
} from "lucide-react";
import React from "react";

export default function ClientActivityLog({ selectedClient }) {
  // Minimal activity data
  const activities = [
    {
      id: 1,
      title: "Check-in completed",
      time: "2h",
      icon: Scale,
    },
    {
      id: 2,
      title: "Workout finished",
      time: "1d",
      icon: Dumbbell,
    },
    {
      id: 3,
      title: "Message sent",
      time: "2d",
      icon: MessageSquare,
    },
    {
      id: 4,
      title: "Nutrition updated",
      time: "3d",
      icon: Utensils,
    },
    {
      id: 5,
      title: "Progress milestone",
      time: "1w",
      icon: TrendingUp,
    },
    {
      id: 6,
      title: "Workout missed",
      time: "1w",
      icon: Dumbbell,
    },
  ];

  return (
    <div className="flex-1 p-10 flex flex-col h-full bg-zinc-900">
      <p className="text-xl font-thin">Activity</p>

      {!selectedClient ? (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
          <User className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs text-center">No client activity</p>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col gap-2 mt-6">
            {activities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 py-1 px-1 rounded hover:bg-zinc-700/50 transition-colors"
                >
                  <div className=" rounded">
                    <IconComponent size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs truncate">
                      {activity.title}
                    </p>
                  </div>
                  <span className="text-zinc-500 text-xs">{activity.time}</span>
                </div>
              );
            })}
          </div>

          <div className="flex w-full justify-start mt-6">
            <Button variant="secondary">View activity details</Button>
          </div>
        </>
      )}
    </div>
  );
}
