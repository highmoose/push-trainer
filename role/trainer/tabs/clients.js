"use client";

import AddClientModal from "@/components/trainer/addClientModal";
import DeleteClientModal from "@/components/trainer/deleteClientModal";
import ClientInfoModal from "@/components/trainer/clientInfoModal";
import SearchInput from "@/components/common/searchInput";
import LinkStatusBadge from "@/components/common/LinkStatusBadge";
import dynamic from "next/dynamic";
import {
  Eye,
  Pencil,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Calendar,
  Users,
  Award,
  Dumbbell,
  Apple,
  Clock,
  BarChart3,
  PieChart,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Zap,
  Heart,
  Timer,
  Flame,
  Trophy,
  Star,
  PlayCircle,
  ChevronRight,
  Settings,
  Download,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClients } from "@/redux/slices/clientSlice";
import React, { useState, useMemo, useEffect } from "react";

// Dynamic chart imports for better performance
const ChartClient = dynamic(
  () => import("@/components/common/chart/ChartClient"),
  { ssr: false }
);

export default function Clients() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { list: clients = [], status } = useSelector((state) => state.clients);

  const [selectedClient, setSelectedClient] = useState(null);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [viewClientInfoModalOpen, setViewClientInfoModalOpen] = useState(false);
  const [deleteClientModalOpen, setDeleteClientModalOpen] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [activeTab, setActiveTab] = useState("progress");
  const [timeRange, setTimeRange] = useState("30d");
  // Fetch clients when component mounts
  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  // Mock clients for development/testing
  const mockClients = useMemo(
    () => [
      {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        role: "client",
        is_temp: false,
        created_at: "2024-01-15T10:00:00Z",
      },
      {
        id: 2,
        first_name: "Sarah",
        last_name: "Johnson",
        email: "sarah.johnson@example.com",
        role: "client",
        is_temp: false,
        created_at: "2024-02-20T14:30:00Z",
      },
      {
        id: 3,
        first_name: "Mike",
        last_name: "Wilson",
        email: "mike.wilson@example.com",
        role: "client",
        is_temp: true,
        created_at: "2024-03-10T09:15:00Z",
      },
      {
        id: 4,
        first_name: "Emma",
        last_name: "Davis",
        email: "emma.davis@example.com",
        role: "client",
        is_temp: false,
        created_at: "2024-03-25T16:45:00Z",
      },
    ],
    []
  );

  // Use mock data if no clients are loaded from API
  const clientsToUse = clients.length > 0 ? clients : mockClients;

  // Update selectedClient when clients are loaded
  useEffect(() => {
    const availableClients = clients.length > 0 ? clients : mockClients;
    if (availableClients.length > 0 && !selectedClient) {
      const firstClient = availableClients[0];
      const clientWithName = {
        ...firstClient,
        name: `${firstClient.first_name || ""} ${
          firstClient.last_name || ""
        }`.trim(),
      };
      setSelectedClient(clientWithName);
    }
  }, [clients, selectedClient, mockClients]);

  // Mock fitness data for demonstration
  const fitnessData = useMemo(
    () => ({
      progress: {
        weight: { current: 165, target: 160, change: -2.5, trend: "down" },
        bodyFat: { current: 18.2, target: 15.0, change: -1.2, trend: "down" },
        muscleMass: { current: 142, target: 150, change: +3.2, trend: "up" },
        bmi: { current: 22.8, target: 21.5, change: -0.4, trend: "down" },
      },
      workoutPlans: [
        {
          id: 1,
          name: "Strength Building",
          progress: 75,
          sessions: 12,
          nextSession: "Tomorrow 9:00 AM",
          type: "strength",
        },
        {
          id: 2,
          name: "Cardio Endurance",
          progress: 60,
          sessions: 8,
          nextSession: "Friday 7:00 AM",
          type: "cardio",
        },
        {
          id: 3,
          name: "HIIT Training",
          progress: 90,
          sessions: 6,
          nextSession: "Monday 6:00 PM",
          type: "hiit",
        },
      ],
      dietPlans: [
        {
          id: 1,
          name: "Lean Muscle Diet",
          adherence: 85,
          calories: 2200,
          protein: 165,
          status: "active",
        },
        {
          id: 2,
          name: "Cut Phase",
          adherence: 78,
          calories: 1800,
          protein: 140,
          status: "paused",
        },
      ],
      weeklyStats: {
        workouts: 5,
        calories: 3200,
        protein: 780,
        sleep: 7.2,
        steps: 68500,
      },
    }),
    []
  );

  // Chart data
  const weightProgressData = [
    {
      name: "Weight (lbs)",
      data: [170, 169, 168.5, 167.8, 166.5, 165.8, 165.2, 165],
    },
  ];

  const bodyCompositionData = [
    { name: "Muscle Mass", data: [138, 139, 140, 141, 141.5, 142] },
    { name: "Body Fat %", data: [20.1, 19.8, 19.2, 18.8, 18.5, 18.2] },
  ];

  const workoutVolumeData = [
    {
      name: "Volume (lbs)",
      data: [12500, 13200, 12800, 14100, 13800, 14500, 15200],
    },
  ];

  const chartOptions = {
    chart: { toolbar: { show: false }, background: "transparent" },
    theme: { mode: "dark" },
    grid: { borderColor: "#374151", strokeDashArray: 3 },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
    xaxis: {
      labels: { style: { colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#9ca3af" } } },
    legend: { labels: { colors: "#d1d5db" } },
    tooltip: {
      theme: "dark",
      style: { backgroundColor: "#1f2937" },
    },
  };

  const radialOptions = {
    chart: { type: "radialBar" },
    colors: ["#10b981"],
    plotOptions: {
      radialBar: {
        hollow: { size: "70%" },
        dataLabels: {
          name: { color: "#d1d5db" },
          value: { color: "#ffffff", fontSize: "20px", fontWeight: "bold" },
        },
      },
    },
  };
  const filteredClients = clientsToUse
    .filter((client) => {
      const search = (searchString ?? "").toLowerCase();
      const fullName = `${client.first_name ?? ""} ${
        client.last_name ?? ""
      }`.toLowerCase();
      const email = (client.email ?? "").toLowerCase();
      return fullName.includes(search) || email.includes(search);
    })
    .map((client) => ({
      ...client,
      name: `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim(),
      created_at: new Date(client.created_at).toLocaleDateString(),
      role:
        client.role?.charAt(0).toUpperCase() + client.role?.slice(1) ||
        "Client",
      is_temp_badge: <LinkStatusBadge isTemp={client.is_temp} />,
    }));

  // Debug logging
  console.log("Clients Debug:", {
    clients,
    clientsToUse,
    filteredClients,
    status,
    clientsLength: clients.length,
    mockClientsLength: mockClients.length,
  });

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setAddClientModalOpen(true);
  };

  const handleDeleteClient = (client) => {
    setSelectedClient(client);
    setDeleteClientModalOpen(true);
  };
  const MetricCard = ({
    title,
    value,
    change,
    trend,
    icon: Icon,
    color = "emerald",
  }) => (
    <div className="bg-zinc-900/70 rounded-lg p-4 border border-zinc-800/60 hover:bg-zinc-900/90 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 text-${color}-400 opacity-70`} />
          <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">
            {title}
          </span>
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            trend === "up" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-xl font-semibold text-white">{value}</div>
    </div>
  );

  const PlanCard = ({ plan, type }) => (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              type === "workout" ? "bg-blue-500/10" : "bg-orange-500/10"
            }`}
          >
            {type === "workout" ? (
              <Dumbbell className="h-5 w-5 text-blue-400" />
            ) : (
              <Apple className="h-5 w-5 text-orange-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{plan.name}</h3>
            <p className="text-sm text-zinc-400">
              {type === "workout"
                ? `${plan.sessions} sessions`
                : `${plan.calories} cal/day`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-white">
            {type === "workout" ? `${plan.progress}%` : `${plan.adherence}%`}
          </div>
          <div className="text-xs text-zinc-400">
            {type === "workout" ? "Complete" : "Adherence"}
          </div>
        </div>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full ${
            type === "workout" ? "bg-blue-500" : "bg-orange-500"
          }`}
          style={{
            width: `${type === "workout" ? plan.progress : plan.adherence}%`,
          }}
        />
      </div>
      {type === "workout" && plan.nextSession && (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Calendar className="h-4 w-4" />
          Next: {plan.nextSession}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">
              Client Fitness Dashboard
            </h1>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg">
              <Users className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-300">
                {clients.length} Active Clients
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-800 rounded-lg p-1">
              {["30d", "90d", "1y"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                    timeRange === range
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAddClientModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Client
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Left Sidebar - Client List (25% width) */}
        <div className="w-1/4 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <SearchInput
              placeholder="Search clients..."
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {status === "loading" && (
              <div className="p-4 text-center text-zinc-400">
                <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading clients...
              </div>
            )}

            {status === "failed" && (
              <div className="p-4 text-center text-red-400">
                <p>Failed to load clients</p>
                <button
                  onClick={() => dispatch(fetchClients())}
                  className="mt-2 text-sm bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700"
                >
                  Retry
                </button>
              </div>
            )}

            {status === "succeeded" && filteredClients.length === 0 && (
              <div className="p-4 text-center text-zinc-400">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No clients found</p>
                <button
                  onClick={() => setAddClientModalOpen(true)}
                  className="mt-2 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Add your first client
                </button>
              </div>
            )}

            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-4 border-b border-zinc-800/50 cursor-pointer transition-all hover:bg-zinc-800/50 ${
                  selectedClient?.id === client.id
                    ? "bg-zinc-800 border-l-4 border-l-emerald-500"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{client.name}</h3>
                    <p className="text-sm text-zinc-400">{client.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-emerald-400" />
                        <span className="text-xs text-zinc-400">3 Goals</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-blue-400" />
                        <span className="text-xs text-zinc-400">Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setViewClientInfoModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClient(client);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Dashboard Area (75% width) */}
        <div className="flex-1 flex flex-col">
          {selectedClient ? (
            <>
              {" "}              {/* Client Header */}
              <div className="bg-zinc-900 border-b border-zinc-800 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {(
                        selectedClient?.name ||
                        selectedClient?.first_name ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {selectedClient?.name ||
                          `${selectedClient?.first_name || ""} ${
                            selectedClient?.last_name || ""
                          }`.trim() ||
                          "Unknown Client"}
                      </h2>
                      <p className="text-zinc-400">
                        Member since {selectedClient?.created_at || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-zinc-300">
                        85% Goal Progress
                      </span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                  </div>
                </div>
              </div>              {/* Dashboard Content */}
              <div className="flex-1 bg-zinc-950 overflow-hidden">
                {/* Main Dashboard */}
                <div className="h-full relative">
                  {/* Header Navigation Pills */}
                  <div className="absolute top-6 left-8 z-10">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1 bg-zinc-900/80 backdrop-blur-sm rounded-full p-1">
                        <button className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-full font-medium">
                          Progress
                        </button>
                        <button className="px-3 py-1.5 text-zinc-400 text-xs hover:text-white transition-colors">
                          Nutrition
                        </button>
                        <button className="px-3 py-1.5 text-zinc-400 text-xs hover:text-white transition-colors">
                          Workouts
                        </button>
                        <button className="px-3 py-1.5 text-zinc-400 text-xs hover:text-white transition-colors">
                          Plans
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Time Period Selector */}
                  <div className="absolute top-6 right-8 z-10">
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span>Weekly</span>
                      <span>Monthly</span>
                      <span className="text-emerald-400 font-medium">Quarterly</span>
                      <span>Year</span>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="pt-20 px-8 pb-8 h-full">
                    {/* Large Metric Display */}
                    <div className="mb-12">
                      <div className="text-7xl font-light text-white tracking-tight mb-2">
                        165.2<span className="text-3xl text-zinc-500 ml-3">lbs</span>
                      </div>
                      <div className="text-zinc-400 text-sm font-medium">Current Weight</div>
                    </div>

                    {/* Overlapping Charts Section */}
                    <div className="relative mb-8" style={{ height: '300px' }}>
                      {/* Background Bar Chart */}
                      <div className="absolute inset-0 opacity-20">
                        <ChartClient
                          options={{
                            chart: {
                              type: 'bar',
                              toolbar: { show: false },
                              background: 'transparent',
                              parentHeightOffset: 0,
                            },
                            theme: { mode: 'dark' },
                            grid: { show: false },
                            xaxis: {
                              labels: { show: false },
                              axisBorder: { show: false },
                              axisTicks: { show: false },
                            },
                            yaxis: { labels: { show: false } },
                            colors: ['#3f3f46'],
                            plotOptions: {
                              bar: {
                                columnWidth: '60%',
                                distributed: false,
                              }
                            },
                            dataLabels: { enabled: false },
                            legend: { show: false },
                          }}
                          series={[{
                            name: 'Volume',
                            data: [45, 52, 38, 65, 49, 72, 58, 63, 42, 55, 67, 48, 52, 38, 65, 49, 72, 58, 63, 42, 55, 67, 48, 45, 52, 38, 65, 49, 72, 58]
                          }]}
                          type="bar"
                          height={300}
                        />
                      </div>

                      {/* Main Line Chart Overlay */}
                      <div className="absolute inset-0">
                        <ChartClient
                          options={{
                            chart: {
                              type: 'line',
                              toolbar: { show: false },
                              background: 'transparent',
                              parentHeightOffset: 0,
                            },
                            theme: { mode: 'dark' },
                            grid: {
                              show: true,
                              borderColor: '#27272a',
                              strokeDashArray: 1,
                              xaxis: { lines: { show: false } },
                              yaxis: { lines: { show: true } },
                            },
                            stroke: {
                              curve: 'smooth',
                              width: 3,
                            },
                            colors: ['#10b981'],
                            xaxis: {
                              labels: {
                                style: { colors: '#71717a', fontSize: '10px' },
                              },
                              axisBorder: { show: false },
                              axisTicks: { show: false },
                              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
                            },
                            yaxis: {
                              labels: {
                                style: { colors: '#71717a', fontSize: '10px' },
                              },
                              min: 160,
                              max: 175,
                            },
                            dataLabels: { enabled: false },
                            legend: { show: false },
                            tooltip: {
                              theme: 'dark',
                              style: { backgroundColor: '#18181b' },
                            },
                          }}
                          series={[{
                            name: 'Weight Progress',
                            data: [170, 169.5, 168.8, 167.5, 166.8, 166.2, 165.8, 165.5, 165.2]
                          }]}
                          type="line"
                          height={300}
                        />
                      </div>

                      {/* Chart Legend/Label */}
                      <div className="absolute top-4 left-4 bg-emerald-500/20 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-xs text-emerald-400 font-medium">$113k</span>
                        <span className="text-xs text-zinc-400 ml-1">+12%</span>
                      </div>
                    </div>

                    {/* Bottom Metrics Grid */}
                    <div className="grid grid-cols-4 gap-6">
                      {/* Sales Forecast Card */}
                      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Body Fat %</span>
                          <div className="flex items-center gap-1">
                            <ChevronRight className="h-3 w-3 text-zinc-600" />
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-semibold text-white">18.2%</span>
                          <span className="text-xs text-emerald-400">↓ 1.2%</span>
                        </div>
                        <div className="text-xs text-zinc-500">Target: 15%</div>
                        
                        {/* Mini Progress Chart */}
                        <div className="mt-3 h-12">
                          <div className="flex items-end justify-between h-full">
                            {[8, 12, 6, 15, 9, 18, 14, 11].map((height, i) => (
                              <div
                                key={i}
                                className="bg-zinc-700 rounded-sm"
                                style={{
                                  height: `${height}px`,
                                  width: '8px',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Monthly Expenses Card */}
                      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Workouts</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-semibold text-white">24</span>
                          <span className="text-xs text-emerald-400">+8%</span>
                        </div>
                        <div className="text-xs text-zinc-500">This month</div>

                        {/* Stacked Progress Bars */}
                        <div className="mt-3 space-y-1">
                          <div className="flex gap-1">
                            <div className="h-1 bg-blue-400 rounded-full flex-1"></div>
                            <div className="h-1 bg-orange-400 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-500">
                            <span>Strength</span>
                            <span>Cardio</span>
                          </div>
                        </div>
                      </div>

                      {/* Project Budget Card */}
                      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Nutrition</span>
                          <div className="flex items-center gap-1">
                            <ChevronRight className="h-3 w-3 text-zinc-600" />
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-semibold text-white">2,180</span>
                          <span className="text-xs text-red-400">-3%</span>
                        </div>
                        <div className="text-xs text-zinc-500">Avg daily calories</div>

                        {/* Donut Chart */}
                        <div className="mt-3 relative">
                          <div className="w-16 h-16 mx-auto">
                            <ChartClient
                              options={{
                                chart: { type: 'donut' },
                                colors: ['#10b981', '#f59e0b', '#ef4444'],
                                dataLabels: { enabled: false },
                                legend: { show: false },
                                plotOptions: {
                                  pie: {
                                    donut: {
                                      size: '70%',
                                    }
                                  }
                                },
                                stroke: { width: 0 },
                              }}
                              series={[40, 35, 25]}
                              type="donut"
                              height={64}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Profit Card with Circular Progress */}
                      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Goal Progress</span>
                          <button className="text-zinc-600 hover:text-zinc-400">
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-semibold text-white mb-1">85%</div>
                            <div className="text-xs text-zinc-500">Overall</div>
                          </div>
                          <div className="w-12 h-12">
                            <ChartClient
                              options={{
                                chart: { type: 'radialBar' },
                                colors: ['#10b981'],
                                plotOptions: {
                                  radialBar: {
                                    hollow: { size: '60%' },
                                    dataLabels: { show: false },
                                    track: {
                                      background: '#3f3f46',
                                      strokeWidth: '100%',
                                    }
                                  }
                                },
                                stroke: { lineCap: 'round' },
                              }}
                              series={[85]}
                              type="radialBar"
                              height={48}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
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
                  Choose a client from the sidebar to view their fitness
                  dashboard
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {addClientModalOpen && (
        <AddClientModal
          close={() => {
            setAddClientModalOpen(false);
            setSelectedClient(null);
          }}
          selectedClient={selectedClient}
        />
      )}

      {deleteClientModalOpen && (
        <DeleteClientModal
          close={() => {
            setDeleteClientModalOpen(false);
            setSelectedClient(null);
          }}
          clientName={selectedClient?.name}
          clientId={selectedClient?.id}
          onConfirm={() => {
            // Handle delete logic here
            setDeleteClientModalOpen(false);
            setSelectedClient(null);
          }}
        />
      )}

      {viewClientInfoModalOpen && (
        <ClientInfoModal
          close={() => setViewClientInfoModalOpen(false)}
          client={selectedClient}
        />
      )}
    </div>
  );
}
