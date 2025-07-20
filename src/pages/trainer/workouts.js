"use client";

import { useState, useEffect, useMemo } from "react";
import { useWorkoutPlans } from "@/hooks/workout/useWorkoutPlans";
import { useClients } from "@/api/clients";
import WorkoutPlanModal from "@/src/components/features/workouts/WorkoutPlanModal";
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  ChevronDown,
  User,
  Calendar,
  Clock,
  Target,
  Eye,
  Edit,
  Copy,
  Trash2,
  Loader,
  Star,
  MoreVertical,
} from "lucide-react";

const WORKOUT_TYPES = {
  strength: { name: "Strength", color: "bg-red-500", icon: "💪" },
  cardio: { name: "Cardio", color: "bg-orange-500", icon: "🏃" },
  hiit: { name: "HIIT", color: "bg-yellow-500", icon: "⚡" },
  flexibility: { name: "Flexibility", color: "bg-green-500", icon: "🧘" },
  powerlifting: { name: "Powerlifting", color: "bg-purple-500", icon: "🏋️" },
  bodybuilding: { name: "Bodybuilding", color: "bg-blue-500", icon: "💪" },
  functional: { name: "Functional", color: "bg-teal-500", icon: "🤸" },
  rehabilitation: { name: "Rehabilitation", color: "bg-pink-500", icon: "🩹" },
};

const FITNESS_LEVELS = {
  beginner: { name: "Beginner", color: "text-green-400" },
  intermediate: { name: "Intermediate", color: "text-yellow-400" },
  advanced: { name: "Advanced", color: "text-orange-400" },
  expert: { name: "Expert", color: "text-red-400" },
};

export default function WorkoutPlans() {
  const {
    workoutPlans,
    loading: workoutPlansLoading,
    error: workoutPlansError,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    duplicateWorkoutPlan,
    fetchWorkoutPlans,
  } = useWorkoutPlans();

  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    fetchClients,
  } = useClients();

  // State
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Filter states
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  // Sample data for development/testing
  const sampleWorkoutPlans = [
    {
      id: 1,
      title: "Strength Building Program - John",
      description: "12-week progressive strength training program",
      client_name: "John Smith",
      client_id: 1,
      workout_type: "strength",
      fitness_level: "intermediate",
      equipment_level: "full_gym",
      duration_weeks: 12,
      sessions_per_week: 4,
      session_duration: 75,
      goals: "Build muscle mass and increase overall strength",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      exercise_count: 24,
      is_favorite: false,
      is_active: true,
    },
    {
      id: 2,
      title: "Weight Loss HIIT Program",
      description: "High-intensity interval training for fat loss",
      client_name: "Sarah Johnson",
      client_id: 2,
      workout_type: "hiit",
      fitness_level: "beginner",
      equipment_level: "basic",
      duration_weeks: 8,
      sessions_per_week: 3,
      session_duration: 45,
      goals: "Lose weight and improve cardiovascular fitness",
      created_at: "2024-01-10T14:30:00Z",
      updated_at: "2024-01-12T09:15:00Z",
      exercise_count: 18,
      is_favorite: true,
      is_active: true,
    },
  ];

  // Use sample data if no real data is available
  const activeWorkoutPlans =
    workoutPlans.length > 0 ? workoutPlans : sampleWorkoutPlans;

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(
      (client) =>
        `${client.first_name} ${client.last_name}`
          .toLowerCase()
          .includes(clientSearchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );
  }, [clients, clientSearchTerm]);

  // Display plans based on selection and filters
  const displayPlans = useMemo(() => {
    let plans = showAllPlans
      ? activeWorkoutPlans
      : selectedClient
      ? activeWorkoutPlans.filter(
          (plan) => plan.client_id === selectedClient.id
        )
      : [];

    // Apply filters
    if (filterType) {
      plans = plans.filter((plan) => plan.workout_type === filterType);
    }
    if (filterLevel) {
      plans = plans.filter((plan) => plan.fitness_level === filterLevel);
    }

    // Apply search filter
    if (searchTerm) {
      plans = plans.filter(
        (plan) =>
          plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort plans
    plans = [...plans].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "created_at" || sortBy === "updated_at") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return plans;
  }, [
    activeWorkoutPlans,
    selectedClient,
    showAllPlans,
    searchTerm,
    sortBy,
    sortOrder,
    filterType,
    filterLevel,
  ]);

  // Initialize with first client if available
  useEffect(() => {
    if (clients.length > 0 && !selectedClient && !showAllPlans) {
      setSelectedClient(clients[0]);
    }
  }, [clients, selectedClient, showAllPlans]);

  // Fetch data on mount
  useEffect(() => {
    fetchClients();
    fetchWorkoutPlans();
  }, [fetchClients, fetchWorkoutPlans]);

  // Handlers
  const handlePlanCreated = (newPlan) => {
    console.log("Workout plan created:", newPlan);
    // Hook handles refresh automatically
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowEditModal(true);
  };

  const handlePlanUpdated = (updatedPlan) => {
    console.log("Workout plan updated:", updatedPlan);
    setShowEditModal(false);
    setEditingPlan(null);
    // Hook handles refresh automatically
  };

  const handleDeletePlan = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;

    try {
      await deleteWorkoutPlan(planToDelete.id);
      console.log("Workout plan deleted successfully:", planToDelete.id);
      setShowDeleteModal(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error("Error deleting workout plan:", error);
    }
  };

  const handleDuplicatePlan = async (plan) => {
    try {
      const newTitle = `${plan.title} (Copy)`;
      await duplicateWorkoutPlan(plan.id, newTitle, plan.client_id);
      console.log("Workout plan duplicated successfully");
    } catch (error) {
      console.error("Error duplicating workout plan:", error);
    }
  };

  const handleViewPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setShowPlanDetails(true);
  };

  return (
    <>
      <div className="h-screen flex bg-zinc-900 text-white overflow-hidden rounded">
        {/* Sidebar */}
        <div className="w-80 bg-zinc-950/50 border-r border-zinc-800/50 flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-3 border-b border-zinc-800/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Workout Plans
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                title="Create new workout plan"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Client/All Toggle */}
            <div className="flex bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setShowAllPlans(false)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  !showAllPlans
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                By Client
              </button>
              <button
                onClick={() => setShowAllPlans(true)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showAllPlans
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All Plans
              </button>
            </div>
          </div>

          {/* Client Selection */}
          {!showAllPlans && (
            <div className="p-3 border-b border-zinc-800/30">
              <div className="relative mb-3">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 text-white placeholder-zinc-400 rounded-lg border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {clientsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader className="animate-spin text-blue-400" size={20} />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <p className="text-zinc-400 text-sm text-center py-4">
                    No clients found
                  </p>
                ) : (
                  filteredClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className={`w-full text-left p-2 rounded-lg transition-all ${
                        selectedClient?.id === client.id
                          ? "bg-blue-600/20 border-blue-500/50 text-white"
                          : "hover:bg-zinc-800/50 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {(client.first_name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {client.first_name} {client.last_name}
                          </div>
                          <div className="text-xs text-zinc-400 truncate">
                            {
                              activeWorkoutPlans.filter(
                                (p) => p.client_id === client.id
                              ).length
                            }{" "}
                            plans
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="p-3 border-b border-zinc-800/30">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Filters</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Workout Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 bg-zinc-800 text-white text-sm rounded border border-zinc-700 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  {Object.entries(WORKOUT_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Fitness Level
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full p-2 bg-zinc-800 text-white text-sm rounded border border-zinc-700 focus:border-blue-500"
                >
                  <option value="">All Levels</option>
                  {Object.entries(FITNESS_LEVELS).map(([key, level]) => (
                    <option key={key} value={key}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-3 space-y-2 text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>Total Plans:</span>
              <span className="text-white">{displayPlans.length}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Active Plans:</span>
              <span className="text-white">
                {displayPlans.filter((p) => p.is_active).length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="bg-zinc-900 border-b border-zinc-800 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!showAllPlans && selectedClient ? (
                  <>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {(selectedClient.first_name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {selectedClient.first_name} {selectedClient.last_name}
                      </h2>
                      <p className="text-zinc-400 text-sm">
                        {displayPlans.length} workout plan
                        {displayPlans.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      All Workout Plans
                    </h2>
                    <p className="text-zinc-400 text-sm">
                      {displayPlans.length} total plan
                      {displayPlans.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Create Plan
                </button>
              </div>
            </div>

            {/* Search and Sort */}
            <div className="flex items-center gap-3 mt-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search workout plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 text-white placeholder-zinc-400 rounded-lg border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 bg-zinc-800 text-white text-sm rounded-lg border border-zinc-700 focus:border-blue-500"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="updated_at-desc">Recently Updated</option>
              </select>
            </div>
          </div>

          {/* Plans List */}
          <div className="flex-1 overflow-y-auto p-4">
            {workoutPlansLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader
                    className="animate-spin text-blue-400 mx-auto mb-4"
                    size={48}
                  />
                  <p className="text-zinc-400">Loading workout plans...</p>
                </div>
              </div>
            ) : displayPlans.length === 0 ? (
              <div className="text-center text-zinc-400 py-12">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No workout plans found</p>
                <p className="text-sm text-zinc-500 mb-4">
                  {!showAllPlans && selectedClient
                    ? `Create a workout plan for ${selectedClient.first_name}`
                    : "Create your first workout plan to get started"}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white transition-colors"
                >
                  Create Workout Plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-200"
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">
                              {WORKOUT_TYPES[plan.workout_type]?.icon || "💪"}
                            </span>
                            <h3 className="font-semibold text-white text-sm leading-tight">
                              {plan.title}
                            </h3>
                            {plan.is_favorite && (
                              <Star
                                className="text-yellow-400 fill-current"
                                size={14}
                              />
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mb-2">
                            {plan.description}
                          </p>
                        </div>

                        <div className="relative">
                          <button className="p-1 text-zinc-400 hover:text-white transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Client Info */}
                      {plan.client_name && (
                        <div className="flex items-center gap-2 mb-3">
                          <User size={14} className="text-zinc-400" />
                          <span className="text-xs text-zinc-300">
                            {plan.client_name}
                          </span>
                        </div>
                      )}

                      {/* Plan Details */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Type:</span>
                          <span
                            className={`px-2 py-1 rounded text-white text-xs ${
                              WORKOUT_TYPES[plan.workout_type]?.color ||
                              "bg-gray-500"
                            }`}
                          >
                            {WORKOUT_TYPES[plan.workout_type]?.name ||
                              plan.workout_type}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Level:</span>
                          <span
                            className={`font-medium ${
                              FITNESS_LEVELS[plan.fitness_level]?.color ||
                              "text-gray-400"
                            }`}
                          >
                            {FITNESS_LEVELS[plan.fitness_level]?.name ||
                              plan.fitness_level}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Duration:</span>
                          <span className="text-zinc-300">
                            {plan.duration_weeks} weeks
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Frequency:</span>
                          <span className="text-zinc-300">
                            {plan.sessions_per_week}x/week
                          </span>
                        </div>

                        {plan.exercise_count && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400">Exercises:</span>
                            <span className="text-zinc-300">
                              {plan.exercise_count} exercises
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 pt-3 border-t border-zinc-700/50">
                        <button
                          onClick={() => handleViewPlanDetails(plan)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-blue-400 transition-colors"
                        >
                          <Eye size={12} />
                          View
                        </button>
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-yellow-400 transition-colors"
                        >
                          <Edit size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicatePlan(plan)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-green-400 transition-colors"
                        >
                          <Copy size={12} />
                          Copy
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <WorkoutPlanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        clientId={selectedClient?.id}
        clientName={
          selectedClient
            ? `${selectedClient.first_name} ${selectedClient.last_name}`
            : null
        }
        onPlanCreated={handlePlanCreated}
      />

      {/* Edit Modal */}
      <WorkoutPlanModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPlan(null);
        }}
        clientId={editingPlan?.client_id}
        clientName={editingPlan?.client_name}
        onPlanCreated={handlePlanUpdated}
        editPlan={editingPlan}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white text-lg font-semibold mb-4">
              Delete Workout Plan
            </h3>
            <p className="text-zinc-300 mb-6">
              Are you sure you want to delete "{planToDelete?.title}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPlanToDelete(null);
                }}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
