import React from "react";
import { useState } from "react";
import {
  Activity,
  Apple,
  ArrowUpRight,
  Clock,
  Plus,
  Scale,
  Target,
  Users,
} from "lucide-react";
import ClientTimeline from "@/components/trainer/ClientTimeline";
import { Button } from "@heroui/react";

export default function ClientInfoPanel({ selectedClient, client }) {
  // Mock data for charts
  // More varied mock data for charts
  const weightData = [
    172.2, 171.1, 170.8, 170.0, 169.2, 168.7, 168.0, 167.8, 167.3,
  ];
  const progressData = [55, 250, 58, 70, 68, 74, 120, 80, 200];
  const weightCategories = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
  ];
  const progressCategories = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
  ];
  const [activeTab, setActiveTab] = useState("progress");

  return (
    <div className="flex-1 flex flex-col pt-28">
      {selectedClient ? (
        <>
          {" "}
          {/* Dashboard Content */}
          <div className="flex-1  overflow-hidden">
            {/* Main Dashboard */}
            <div className="h-full ">
              <div className=" h-full pb-8">
                {activeTab === "progress" && (
                  <div className="flex justify-between  h-full">
                    {/* Left Section - Overlapping Charts */}
                    <div className="w-2/3 flex flex-col justify-between p-8">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-1 bg-zinc-900/80  rounded-full p-1">
                          <button
                            onClick={() => setActiveTab("progress")}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                              activeTab === "progress"
                                ? "bg-emerald-500 text-white"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            Progress
                          </button>
                          <button
                            onClick={() => setActiveTab("timeline")}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                              activeTab === "timeline"
                                ? "bg-emerald-500 text-white"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            Timeline
                          </button>
                          <button
                            onClick={() => setActiveTab("nutrition")}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                              activeTab === "nutrition"
                                ? "bg-emerald-500 text-white"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            Nutrition
                          </button>
                          <button
                            onClick={() => setActiveTab("workouts")}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                              activeTab === "workouts"
                                ? "bg-emerald-500 text-white"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            Workouts
                          </button>
                          <button
                            onClick={() => setActiveTab("checkins")}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                              activeTab === "checkins"
                                ? "bg-emerald-500 text-white"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            Check-ins
                          </button>
                          <button
                            onClick={() => setActiveTab("plans")}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                              activeTab === "plans"
                                ? "bg-emerald-500 text-white"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            Plans
                          </button>
                        </div>
                      </div>
                      <p className="text-[60px] tracking-tight">
                        Sarah Johnson
                      </p>
                      {/* Overlapping Charts Section */}
                      <div className="relative h-[300px]">
                        {/* Background Bar Chart */}
                        <div className="absolute inset-0 opacity-20 ">
                          <ChartClient
                            options={{
                              chart: {
                                type: "bar",
                                toolbar: { show: false },
                                background: "transparent",
                                parentHeightOffset: 0,
                                zoom: { enabled: false },
                              },
                              theme: { mode: "dark" },
                              grid: { show: false },
                              xaxis: {
                                labels: { show: false },
                                axisBorder: { show: false },
                                axisTicks: { show: false },
                              },
                              yaxis: { labels: { show: false } },
                              colors: ["#3f3f46"],
                              plotOptions: {
                                bar: {
                                  columnWidth: "90%",
                                  distributed: false,
                                },
                              },
                              dataLabels: { enabled: false },
                              legend: { show: false },
                            }}
                            series={[
                              {
                                name: "Volume",
                                data: [
                                  45, 52, 38, 65, 49, 72, 58, 63, 42, 55, 67,
                                  48, 52, 38, 65, 49, 72, 58, 63, 42, 55, 67,
                                  48, 45, 52, 38, 65, 49, 72, 58,
                                ],
                              },
                            ]}
                            type="bar"
                            height={300}
                          />
                        </div>

                        {/* Main Line Chart Overlay */}
                        <div className="absolute inset-0 ">
                          <ChartClient
                            options={{
                              chart: {
                                type: "line",
                                toolbar: { show: false },
                                background: "transparent",
                                parentHeightOffset: 0,
                                zoom: { enabled: false },
                              },
                              theme: { mode: "dark" },
                              grid: {
                                show: true,
                                borderColor: "#27272a",
                                strokeDashArray: 1,
                                xaxis: { lines: { show: false } },
                                yaxis: { lines: { show: true } },
                              },
                              stroke: {
                                curve: "smooth",
                                width: 3,
                              },
                              colors: ["#baf05d"],
                              xaxis: {
                                labels: {
                                  style: {
                                    colors: "#fff",
                                    fontSize: "10px",
                                  },
                                },
                                axisBorder: { show: false },
                                axisTicks: { show: false },
                                categories: [
                                  "Jan",
                                  "Feb",
                                  "Mar",
                                  "Apr",
                                  "May",
                                  "Jun",
                                  "Jul",
                                  "Aug",
                                  "Sep",
                                ],
                              },
                              yaxis: {
                                labels: {
                                  style: {
                                    colors: "#fff",
                                    fontSize: "10px",
                                  },
                                },
                                min: 160,
                                max: 175,
                              },
                              dataLabels: { enabled: false },
                              legend: { show: false },
                              tooltip: {
                                theme: "dark",
                                style: { backgroundColor: "#18181b" },
                              },
                            }}
                            series={[
                              {
                                name: "Weight Progress",
                                data: [
                                  170, 169.5, 168.8, 167.5, 166.8, 166.2, 165.8,
                                  165.5, 165.2,
                                ],
                              },
                            ]}
                            type="line"
                            height={300}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Right Metrics Panels */}
                    <div className="w-1/3 flex flex-col justify-between gap-2 p-8">
                      <div className="flex gap-2 grow">
                        <div className="bg-white/30 w-1/2 p-8 rounded-[30px] flex flex-col justify-between">
                          <div className="w-full flex items-center justify-between">
                            <p className="text-white text-3xl">Weight</p>
                            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-black/10">
                              <ArrowUpRight className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="text-white flex items-start gap-1">
                            <p className=" text-5xl">105</p>
                            <p className=" text-xl">kg</p>
                          </div>
                          <div className="max-h-[115px] -ml-5 -mr-4 -mt-10">
                            <ChartClient
                              options={{
                                chart: {
                                  type: "line",
                                  toolbar: { show: false },
                                  background: "transparent",
                                  parentHeightOffset: 0,
                                  zoom: { enabled: false },
                                },
                                theme: { mode: "dark" },
                                grid: { show: false },
                                stroke: { curve: "smooth", width: 2 },
                                colors: ["#baf05d"],
                                xaxis: {
                                  labels: { show: false },
                                  axisBorder: { show: false },
                                  axisTicks: { show: true },
                                  categories: weightCategories,
                                },
                                yaxis: { labels: { show: false } },
                                dataLabels: { enabled: false },
                                legend: { show: false },
                                tooltip: { enabled: true },
                              }}
                              series={[
                                {
                                  name: "Weight",
                                  data: weightData,
                                },
                              ]}
                              type="line"
                              height={120}
                            />
                          </div>
                          {/* <div className="flex items-center justify-between mt-4">
                            <p className=" text-xs">Start</p>
                            <p className=" text-xs">Last</p>
                          </div> */}
                        </div>
                        {/* Progress metrics panel */}
                        <div className="bg-white/30 w-1/2 p-8 rounded-[30px] flex flex-col">
                          <div className="w-full flex items-center justify-between">
                            <p className="text-white text-3xl">Progress</p>
                            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-black/10">
                              <ArrowUpRight className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 flex items-end">
                            <ChartClient
                              options={{
                                chart: {
                                  type: "line",
                                  toolbar: { show: false },
                                  background: "transparent",
                                  parentHeightOffset: 0,
                                  zoom: { enabled: false },
                                },
                                theme: { mode: "dark" },
                                grid: { show: false },
                                stroke: { curve: "smooth", width: 2 },
                                colors: ["#6366f1"],
                                xaxis: {
                                  labels: { show: false },
                                  axisBorder: { show: false },
                                  axisTicks: { show: false },
                                  categories: progressCategories,
                                },
                                yaxis: { labels: { show: false } },
                                dataLabels: { enabled: false },
                                legend: { show: false },
                                tooltip: { enabled: false },
                              }}
                              series={[
                                {
                                  name: "Progress",
                                  data: progressData,
                                },
                              ]}
                              type="line"
                              height={120}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Bottom Metrics Panel */}
                      <div className="bg-white/30 grow flex justify-between w-full h-[134px] p-8 rounded-[30px]">
                        <div>
                          <p className="text-sm">Sessions Completed</p>
                          <div className="text-white flex items-start gap-1">
                            <p className=" text-5xl">105</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm">Weight lost</p>
                          <div className="text-white flex items-start gap-1">
                            <p className=" text-5xl">12</p>
                            <p className=" text-xl">kg</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm">Strength Increased</p>
                          <div className="text-white flex items-start gap-1">
                            <p className=" text-5xl">16</p>
                            <p className=" text-xl">%</p>
                          </div>
                        </div>
                        <div className=" flex items-center justify-between">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-black/10">
                            <ArrowUpRight className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}{" "}
                {activeTab === "timeline" && (
                  <ClientTimeline clientId={selectedClient?.id} />
                )}
                {activeTab === "nutrition" && (
                  <div className="text-center text-zinc-400 py-12">
                    <Apple className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nutrition Dashboard
                    </h3>
                    <p>Coming soon...</p>
                  </div>
                )}
                {activeTab === "workouts" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">
                        Workout Plans
                      </h3>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                        <Plus className="h-4 w-4" />
                        Assign Plan
                      </button>
                    </div>

                    {/* Active Workout Plans */}
                    <div className="space-y-4">
                      {mockClient.workoutPlans.map((plan) => (
                        <PlanCard key={plan.id} plan={plan} type="workout" />
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "checkins" && (
                  <div className="space-y-6 p-8">
                    {/* Check-ins Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                        <Scale className="h-6 w-6 text-blue-400" />
                        Check-ins & Progress Tracking
                      </h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setWeighInRequestModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          <Plus className="h-4 w-4" />
                          Request Check-in
                        </button>
                        <button
                          onClick={() => setRecurringWeighInModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          <Clock className="h-4 w-4" />
                          Schedule Recurring
                        </button>
                      </div>
                    </div>

                    {/* Check-in Schedule Status */}
                    <div className="bg-zinc-900 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-white mb-4">
                        Recurring Schedule
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-5 w-5 text-blue-400" />
                            <span className="text-sm font-medium text-zinc-300">
                              Frequency
                            </span>
                          </div>
                          <p className="text-white font-semibold">Weekly</p>
                          <p className="text-xs text-zinc-400">
                            Every Monday at 9:00 AM
                          </p>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-5 w-5 text-green-400" />
                            <span className="text-sm font-medium text-zinc-300">
                              Metrics
                            </span>
                          </div>
                          <p className="text-white font-semibold">5 Fields</p>
                          <p className="text-xs text-zinc-400">
                            Weight, body fat, mood, energy, sleep
                          </p>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-5 w-5 text-purple-400" />
                            <span className="text-sm font-medium text-zinc-300">
                              Next Check-in
                            </span>
                          </div>
                          <p className="text-white font-semibold">Tomorrow</p>
                          <p className="text-xs text-zinc-400">
                            June 25, 2025 at 9:00 AM
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Check-ins */}
                    <div className="bg-zinc-900 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-white mb-4">
                        Recent Check-ins
                      </h4>
                      <div className="space-y-4">
                        {/* Mock check-in entries */}
                        <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-green-500">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-white font-medium">
                                June 17, 2025
                              </span>
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                Completed
                              </span>
                            </div>
                            <button className="text-zinc-400 hover:text-white">
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div>
                              <span className="text-zinc-400">Weight:</span>
                              <span className="text-white ml-1">165 lbs</span>
                            </div>
                            <div>
                              <span className="text-zinc-400">Body Fat:</span>
                              <span className="text-white ml-1">18.2%</span>
                            </div>
                            <div>
                              <span className="text-zinc-400">Mood:</span>
                              <span className="text-white ml-1">Good</span>
                            </div>
                            <div>
                              <span className="text-zinc-400">Energy:</span>
                              <span className="text-white ml-1">High</span>
                            </div>
                            <div>
                              <span className="text-zinc-400">Sleep:</span>
                              <span className="text-white ml-1">7.5h</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-yellow-500">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-white font-medium">
                                June 24, 2025
                              </span>
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                                Pending
                              </span>
                            </div>
                            <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                              <Send className="h-4 w-4" />
                              Send Reminder
                            </button>
                          </div>
                          <p className="text-zinc-400 text-sm">
                            Check-in request sent - awaiting client response
                          </p>
                        </div>

                        <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-red-500">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-white font-medium">
                                June 10, 2025
                              </span>
                              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                                Missed
                              </span>
                            </div>
                            <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                              <Plus className="h-4 w-4" />
                              Request Again
                            </button>
                          </div>
                          <p className="text-zinc-400 text-sm">
                            Client did not respond to check-in request
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Check-in Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-zinc-900 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-white mb-4">
                          Compliance Rate
                        </h4>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-400 mb-2">
                            85%
                          </div>
                          <p className="text-zinc-400 text-sm">
                            Check-ins completed on time
                          </p>
                          <div className="mt-4 bg-zinc-800 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: "85%" }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-900 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-white mb-4">
                          Progress Trends
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Weight</span>
                            <div className="flex items-center gap-2">
                              <TrendingDown className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 font-medium">
                                -2.5 lbs
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Body Fat</span>
                            <div className="flex items-center gap-2">
                              <TrendingDown className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 font-medium">
                                -1.2%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Energy Level</span>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-400" />
                              <span className="text-blue-400 font-medium">
                                +15%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "plans" && (
                  <div className="text-center text-zinc-400 py-12">
                    <Target className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Training Plans
                    </h3>
                    <p>Coming soon...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-400 mb-2">
              Select a Client
            </h3>
            <p className="text-zinc-500">
              Choose a client from the sidebar to view their fitness dashboard
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
