"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown,
  Scale,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Dumbbell,
  Apple,
  MessageSquare,
  Plus,
  Bell,
  BarChart3,
  Crown,
  Team,
} from "lucide-react";
import { useClients } from "@/hooks/clients";
import { useSelector } from "react-redux";

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  // const { team, userRole } = useTeamManagement();
  const { clients } = useClients();

  const [dashboardMetrics, setDashboardMetrics] = useState({
    activeClients: 0,
    upcomingSessions: 0,
    teamMembers: 0,
    completionRate: 0,
    weeklyProgress: 0,
  });

  // Calculate metrics
  useEffect(() => {
    const activeClients =
      (clients || []).filter((client) => client.status === "active")?.length ||
      0;

    setDashboardMetrics({
      activeClients,
      upcomingSessions: 8, // Mock data
      completionRate: 85, // Mock data
      weeklyProgress: 12, // Mock data
    });
  }, [clients]);

  const MetricCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800/50 transition-colors mt-28">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-zinc-400 text-sm">{title}</p>
        {subtitle && <p className="text-zinc-500 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    color,
    onClick,
  }) => (
    <button
      onClick={onClick}
      className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800/50 transition-colors text-left group"
    >
      <div
        className={`p-3 rounded-lg ${color} w-fit mb-4 group-hover:scale-110 transition-transform`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm">{description}</p>
    </button>
  );

  const AlertCard = ({ type, message, timestamp, action }) => (
    <div
      className={`bg-zinc-900 rounded-3xl p-4 border-l-4 ${
        type === "warning"
          ? "border-yellow-500"
          : type === "success"
          ? "border-green-500"
          : "border-blue-500"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              type === "warning"
                ? "bg-yellow-500/20 text-yellow-400"
                : type === "success"
                ? "bg-green-500/20 text-green-400"
                : "bg-blue-500/20 text-blue-400"
            }`}
          >
            {type === "warning" ? (
              <AlertCircle className="h-4 w-4" />
            ) : type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
          </div>
          <div>
            <p className="text-white text-sm">{message}</p>
            <p className="text-zinc-500 text-xs mt-1">{timestamp}</p>
          </div>
        </div>
        {action && (
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            {action}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-zinc-400">
            Welcome back! Here's an overview of your training business.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            Quick Action
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Clients"
          value={dashboardMetrics.activeClients}
          icon={Users}
          color="bg-blue-600"
          subtitle="Currently training"
          trend={8}
        />
        <MetricCard
          title="Pending Check-ins"
          value={dashboardMetrics.pendingCheckIns}
          icon={Scale}
          color="bg-yellow-600"
          subtitle="Awaiting responses"
        />
        <MetricCard
          title="Upcoming Sessions"
          value={dashboardMetrics.upcomingSessions}
          icon={Calendar}
          color="bg-green-600"
          subtitle="Next 7 days"
          trend={15}
        />
        <MetricCard
          title="Completion Rate"
          value={`${dashboardMetrics.completionRate}%`}
          icon={Target}
          color="bg-purple-600"
          subtitle="Client adherence"
          trend={5}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Add New Client"
            description="Invite or register a new client"
            icon={Users}
            color="bg-blue-600"
            onClick={() => console.log("Add client")}
          />
          <QuickActionCard
            title="Create Workout Plan"
            description="Design a new training program"
            icon={Dumbbell}
            color="bg-green-600"
            onClick={() => console.log("Create workout")}
          />
          <QuickActionCard
            title="Request Check-in"
            description="Send progress tracking request"
            icon={Scale}
            color="bg-yellow-600"
            onClick={() => console.log("Request checkin")}
          />
          <QuickActionCard
            title="Schedule Session"
            description="Book training appointments"
            icon={Calendar}
            color="bg-purple-600"
            onClick={() => console.log("Schedule session")}
          />
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Alerts */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            AI Insights & Alerts
          </h2>
          <div className="space-y-4">
            <AlertCard
              type="warning"
              message="Client Sarah M. has missed 2 consecutive check-ins"
              timestamp="2 hours ago"
              action="Send Reminder"
            />
            <AlertCard
              type="success"
              message="John D. has exceeded his weight loss goal by 15%"
              timestamp="1 day ago"
              action="Congratulate"
            />
            <AlertCard
              type="info"
              message="3 clients are ready for workout plan progression"
              timestamp="2 days ago"
              action="Review Plans"
            />
          </div>
        </div>

        {/* Recent Check-ins */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Check-ins
          </h2>
          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Mike Johnson</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  Completed
                </span>
              </div>
              <div className="text-sm text-zinc-400">
                Weight: 175 lbs (-2 lbs) • Energy: High • Mood: Excellent
              </div>
              <div className="text-xs text-zinc-500 mt-1">2 hours ago</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Lisa Chen</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                  In Progress
                </span>
              </div>
              <div className="text-sm text-zinc-400">
                Started check-in process • 3 of 5 fields completed
              </div>
              <div className="text-xs text-zinc-500 mt-1">1 hour ago</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">David Wilson</span>
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                  Overdue
                </span>
              </div>
              <div className="text-sm text-zinc-400">
                Check-in was due yesterday • No response yet
              </div>
              <div className="text-xs text-zinc-500 mt-1">1 day ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Performance Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Client Progress Trends
            </h3>
            <div className="h-48 flex items-center justify-center text-zinc-400">
              <BarChart3 className="h-16 w-16 mb-2" />
              <p>Chart coming soon...</p>
            </div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Check-in Compliance
            </h3>
            <div className="h-48 flex items-center justify-center text-zinc-400">
              <BarChart3 className="h-16 w-16 mb-2" />
              <p>Chart coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
