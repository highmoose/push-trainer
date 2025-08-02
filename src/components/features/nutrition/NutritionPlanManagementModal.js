"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Utensils,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  User,
  AlertCircle,
  ChevronDown,
  Eye,
  Trash2,
} from "lucide-react";
import { Select, SelectItem } from "@heroui/react";
import ViewDietPlanModal from "./ViewDietPlanModal";
import DietPlanActivationModal from "./DietPlanActivationModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import useClientDietPlans from "@/hooks/clientDietPlans";
import { useDietPlans } from "@/hooks/diet";

const NutritionPlanManagementModal = ({ isOpen, onClose, client }) => {
  // Use the enhanced client diet plans hook with internal state management
  const {
    clientPlans,
    activePlan,
    loading,
    error,
    activatePlan,
    deactivatePlan,
    refetch,
  } = useClientDietPlans(client?.id);

  // Use the diet plans hook for fetching plan details
  const { fetchPlanDetails } = useDietPlans();

  // Local state for UI management
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // View diet plan modal state
  const [showViewDietPlanModal, setShowViewDietPlanModal] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
  const [loadingPlanDetails, setLoadingPlanDetails] = useState(null);

  // Activation modals state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [planToActivate, setPlanToActivate] = useState(null);
  const [activationLoading, setActivationLoading] = useState(false);

  console.log("Client Plans:", clientPlans);

  // Memoized sorted plans for better performance
  const sortedPlans = useMemo(() => {
    if (!clientPlans || clientPlans.length === 0) return [];

    return [...clientPlans].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === "created_at" || sortBy === "updated_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string sorting
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [clientPlans, sortBy, sortOrder]);

  // Handlers for plan actions
  const handleActivatePlan = async (planId) => {
    try {
      const planToActivate = clientPlans.find((plan) => plan.id === planId);
      if (!planToActivate) {
        console.error("Plan not found:", planId);
        return;
      }

      // Set the plan to activate
      setPlanToActivate(planToActivate);

      // Check if there's already an active plan
      if (activePlan) {
        // Show confirmation modal first
        setShowConfirmationModal(true);
      } else {
        // No active plan, go directly to activation modal
        setShowActivationModal(true);
      }
    } catch (error) {
      console.error("Error setting up activation:", error);
    }
  };

  const handleConfirmOverwrite = () => {
    // Close confirmation modal and open activation modal
    setShowConfirmationModal(false);
    setShowActivationModal(true);
  };

  const handleActivationConfirm = async (activationData) => {
    if (!planToActivate) return;

    try {
      setActivationLoading(true);
      console.log(
        "Activating plan:",
        planToActivate.id,
        "with data:",
        activationData
      );

      await activatePlan(planToActivate.id, activationData);

      console.log("Plan activated successfully");

      // Close modals and reset state
      setShowActivationModal(false);
      setPlanToActivate(null);
    } catch (error) {
      console.error("Error activating plan:", error);
      // You might want to show an error toast here
    } finally {
      setActivationLoading(false);
    }
  };

  const handleCancelActivation = () => {
    setShowConfirmationModal(false);
    setShowActivationModal(false);
    setPlanToActivate(null);
    setActivationLoading(false);
  };

  const handleDeactivatePlan = async () => {
    try {
      console.log("Deactivating current plan");
      await deactivatePlan();
      console.log("Plan deactivated successfully");
    } catch (error) {
      console.error("Error deactivating plan:", error);
      // You might want to show an error toast here
    }
  };

  const handleViewPlanDetails = async (planId) => {
    try {
      console.log("Viewing plan details for ID:", planId);
      setLoadingPlanDetails(planId);

      const result = await fetchPlanDetails(planId);
      console.log("Plan details response:", result);

      if (result.success) {
        setSelectedPlanDetails(result.data);
        setShowViewDietPlanModal(true);
        console.log("Plan details modal should be open", result.data);
      } else {
        console.error("Failed to fetch plan details:", result.error);
      }
    } catch (error) {
      console.error("Error fetching plan details:", error);
    } finally {
      setLoadingPlanDetails(null);
    }
  };

  const handleClosePlanDetails = () => {
    setShowViewDietPlanModal(false);
    setSelectedPlanDetails(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlanTypeColor = (planType) => {
    const colors = {
      aggressive_cut: "text-red-400 bg-red-400/10 border-red-400/20",
      moderate_cut: "text-orange-400 bg-orange-400/10 border-orange-400/20",
      maintain: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      recomp: "text-purple-400 bg-purple-400/10 border-purple-400/20",
      lean_bulk: "text-green-400 bg-green-400/10 border-green-400/20",
      aggressive_bulk:
        "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    };
    return (
      colors[planType] || "text-zinc-400 bg-zinc-400/10 border-zinc-400/20"
    );
  };

  const formatPlanType = (planType) => {
    return (
      planType?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Unknown"
    );
  };

  // Filter available plans (excluding active plan) from already sorted plans
  const sortedAvailablePlans = sortedPlans.filter((plan) => !plan.is_active);

  const sortOptions = [
    { key: "created_at|desc", label: "Newest First" },
    { key: "created_at|asc", label: "Oldest First" },
    { key: "title|asc", label: "Title A-Z" },
    { key: "title|desc", label: "Title Z-A" },
    { key: "plan_type|asc", label: "Plan Type A-Z" },
    { key: "total_calories|desc", label: "Highest Calories" },
    { key: "total_calories|asc", label: "Lowest Calories" },
  ];

  const handleSortChange = (keys) => {
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      const [field, order] = selectedKey.split("|");
      setSortBy(field);
      setSortOrder(order);
    }
  };

  if (!isOpen) return null;

  console.log("NutritionPlanManagementModal state:", {
    showViewDietPlanModal,
    selectedPlanDetails: !!selectedPlanDetails,
    loadingPlanDetails,
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-zinc-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-400/10 rounded-lg">
              <Utensils className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Nutrition Plan Management
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                {client?.name || `${client?.first_name} ${client?.last_name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Active Plan Section - Always Visible */}
          <div className="p-6 pb-0">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Currently Active Plan
            </h3>

            {activePlan ? (
              <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-white mb-2">
                      {activePlan.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Assigned {formatDate(activePlan.assigned_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {activePlan.meals_per_day} meals/day
                      </span>
                      {activePlan.total_calories && (
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {activePlan.total_calories.toLocaleString()} cal
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getPlanTypeColor(
                          activePlan.plan_type
                        )}`}
                      >
                        {formatPlanType(activePlan.plan_type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(
                          "View active plan button clicked for plan:",
                          activePlan.id
                        );
                        handleViewPlanDetails(activePlan.id);
                      }}
                      disabled={loadingPlanDetails === activePlan.id}
                      className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {loadingPlanDetails === activePlan.id
                        ? "Loading..."
                        : "View Plan"}
                    </button>
                    <button
                      onClick={handleDeactivatePlan}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-6 text-center">
                <Clock className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-zinc-400">No active nutrition plan</p>
                <p className="text-sm text-zinc-500 mt-1">
                  Select a plan below to activate it for this client
                </p>
              </div>
            )}
          </div>

          {/* Available Plans Section - Scrollable */}
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            {/* Header with Sort Options */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-400" />
                Client Diet Plans ({sortedAvailablePlans.length})
              </h3>

              <div className="min-w-[200px]">
                <Select
                  selectedKeys={new Set([`${sortBy}|${sortOrder}`])}
                  onSelectionChange={handleSortChange}
                  aria-label="Sort available nutrition plans"
                  size="sm"
                  variant="bordered"
                  classNames={{
                    base: "max-w-xs",
                    trigger:
                      "border-none bg-zinc-800/50 data-[hover=true]:border-zinc-500 rounded-lg",
                    value: "text-zinc-200",
                    popoverContent: "bg-zinc-800 border-zinc-600 rounded-lg",
                  }}
                  placeholder="Sort by..."
                  startContent={
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  }
                >
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option.key}
                      value={option.key}
                      textValue={option.label}
                      classNames={{
                        base: "data-[hover=true]:bg-zinc-700 data-[selected=true]:bg-zinc-700 rounded-lg",
                        title: "text-zinc-200",
                      }}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Scrollable Plans List */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-zinc-500">Loading plans...</p>
                </div>
              ) : sortedAvailablePlans.length === 0 ? (
                <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-6 text-center">
                  <User className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-zinc-400">
                    No diet plans assigned to this client
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Assign diet plans to this client to manage them here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedAvailablePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="border border-zinc-700/30 hover:border-zinc-600/50 rounded-lg p-4 bg-zinc-800/20 hover:bg-zinc-800/40 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-base font-medium text-white truncate">
                              {plan.title}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium border whitespace-nowrap ${getPlanTypeColor(
                                plan.plan_type
                              )}`}
                            >
                              {formatPlanType(plan.plan_type)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(plan.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {plan.meals_per_day} meals
                            </span>
                            {plan.total_calories && (
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {plan.total_calories.toLocaleString()} cal
                              </span>
                            )}
                            {plan.meal_complexity && (
                              <span className="px-1.5 py-0.5 bg-zinc-700/50 text-zinc-300 rounded text-xs">
                                {plan.meal_complexity}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(
                                "View plan button clicked for plan:",
                                plan.id
                              );
                              handleViewPlanDetails(plan.id);
                            }}
                            disabled={loadingPlanDetails === plan.id}
                            className="px-3 py-1.5 bg-zinc-600 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            {loadingPlanDetails === plan.id
                              ? "Loading..."
                              : "View Plan"}
                          </button>
                          <button
                            onClick={() => handleActivatePlan(plan.id)}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                          >
                            Activate
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-700/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* View Diet Plan Modal */}
      <ViewDietPlanModal
        isOpen={showViewDietPlanModal}
        onClose={handleClosePlanDetails}
        planDetails={selectedPlanDetails}
        zIndex="z-[60]"
      />

      {/* Confirmation Modal for Overwriting Active Plan */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCancelActivation}
        onConfirm={handleConfirmOverwrite}
        title="Replace Active Diet Plan"
        message={`There is already an active diet plan (${activePlan?.title}). This will deactivate the current plan and activate "${planToActivate?.title}". Are you sure you want to proceed?`}
        confirmText="Yes, Replace Plan"
        cancelText="Cancel"
        variant="warning"
      />

      {/* Diet Plan Activation Modal */}
      <DietPlanActivationModal
        isOpen={showActivationModal}
        onClose={handleCancelActivation}
        onConfirm={handleActivationConfirm}
        planTitle={planToActivate?.title || ""}
        loading={activationLoading}
      />
    </div>
  );
};

export default NutritionPlanManagementModal;
