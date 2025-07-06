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
    <div className="w-full h-full bg-zinc-900 p-6">
      <div className="p-6">
        {!selectedClient ? (
          <div className="flex flex-col items-center justify-center h-32 text-zinc-500">
            <User className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs text-center">Select a client</p>
          </div>
        ) : (
          <div className="">
            <p className="text-zinc-500 text-sm">Client activity log</p>
            {activities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 py-1 px-1 rounded hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="p-1.5 rounded">
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
        )}
      </div>
    </div>
  );
}
