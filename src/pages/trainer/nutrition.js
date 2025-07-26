"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useClients } from "@/hooks/clients";
import { useDietPlans } from "@/hooks/diet";
import useFetchDietPlans from "@/hooks/diet/useFetchDietPlans";
import useUpdateDietPlan from "@/hooks/diet/useUpdateDietPlan";
import useDeleteDietPlan from "@/hooks/diet/useDeleteDietPlan";
import useGetDietPlanDetails from "@/hooks/diet/useGetDietPlanDetails";
import ConfirmationModal from "@/common/ConfirmationModal";
import { DataTable } from "@/common/tables";
import CreatePlanModal from "@/features/nutrition/CreatePlanModal";
import PlanDetailsModal from "@/features/nutrition/PlanDetailsModal";
import NutritionHeroSection from "@/features/nutrition/NutritionHeroSection";
import NutritionSearchFilters from "@/features/nutrition/NutritionSearchFilters";
import { getNutritionTableColumns } from "@/features/nutrition/NutritionTableColumns";
import {
  filterAndSortPlans,
  clearAllFilters,
} from "@/features/nutrition/nutritionUtils";
import { set } from "date-fns";
import PlanAssignModal from "@/src/components/features/nutrition/planAssignModal";

export default function Nutrition() {
  // Use composite hook for data and individual action hooks for actions
  const { clients, fetchClients } = useClients();

  // Debug clients loading
  useEffect(() => {
    console.log("Clients state changed:", {
      clientsCount: clients?.length || 0,
      clients: clients,
      hasClients: Array.isArray(clients) && clients.length > 0,
    });
  }, [clients]);

  const {
    dietPlans,
    loading: dietPlansLoading,
    error: dietPlansError,
    generateDietPlanWithPlaceholder,
  } = useDietPlans();

  // Individual action hooks
  const fetchDietPlansAction = useFetchDietPlans();
  const updateDietPlanAction = useUpdateDietPlan();
  const deleteDietPlanAction = useDeleteDietPlan();
  const getDietPlanDetailsAction = useGetDietPlanDetails();

  // Use real diet plans data only - ensure it's always an array
  const activeDietPlans = Array.isArray(dietPlans) ? dietPlans : [];

  // State
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [clientFilter, setClientFilter] = useState(""); // Client filter state
  const [viewMode, setViewMode] = useState("list"); // View mode state

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlanDetailModal, setShowPlanDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [planDetails, setPlanDetails] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  // Quick plan name input state
  const [quickPlanName, setQuickPlanName] = useState("");

  // Get table columns

  // Display plans - show all plans by default, apply filters
  const displayPlans = useMemo(() => {
    return filterAndSortPlans(
      activeDietPlans,
      searchTerm,
      clientFilter,
      sortBy,
      sortOrder
    );
  }, [activeDietPlans, searchTerm, sortBy, sortOrder, clientFilter, dietPlans]);

  // Initialize with first client if available
  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      setSelectedClient(clients[0]);
    }
  }, [clients, selectedClient]);

  // Fetch data on mount - Let useClients hook handle the fetching automatically
  useEffect(() => {
    // The useClients hook handles fetching automatically via its internal useEffect
    // Just log what we're getting
    console.log("Nutrition page mounted, clients hook should auto-fetch");
  }, []);

  const handleOpenAssignModal = (planData) => {
    setPlanDetails(planData); // Set the selected plan
    setShowAssignModal(true); // Open the modal
  };

  const tableColumns = getNutritionTableColumns(handleOpenAssignModal);

  // View plan details
  const handleViewPlanDetails = async (plan) => {
    // Don't allow viewing details of plans that are still generating or have errors
    if (plan.is_generating || plan.has_error) {
      return;
    }
    try {
      // Fetch full plan details from API which includes client_metrics
      const result = await getDietPlanDetailsAction.execute(plan.id);

      if (result.success) {
        setPlanDetails(result.data);
        setShowPlanDetailModal(true);
      } else {
        console.error("Failed to fetch plan details:", result.error);
        // Fallback to using the plan data we have
        setPlanDetails(plan);
        setShowPlanDetailModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch plan details:", error);
      // Fallback to using the plan data we have
      setPlanDetails(plan);
      setShowPlanDetailModal(true);
    }
  };

  // Handle delete plan confirmation
  const handleDeletePlan = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };
  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!planToDelete) return;

    try {
      const result = await deleteDietPlanAction.execute(planToDelete.id);

      if (result.success) {
        console.log("Diet plan deleted successfully:", planToDelete.id);
        // Close modal and reset state
        setShowDeleteModal(false);
        setPlanToDelete(null);
      } else {
        console.error("Error deleting diet plan:", result.error);
        // Handle error appropriately - maybe show a toast notification
      }
    } catch (error) {
      console.error("Error deleting diet plan:", error);
      // Handle error appropriately - maybe show a toast notification
    }
  };

  // Handle cancel deletion
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  // Clear/reset all filters
  const handleClearFilters = () => {
    clearAllFilters(setSearchTerm, setClientFilter, setSortBy, setSortOrder);
  };

  return (
    <>
      <div className="relative h-screen flex flex-col bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white overflow-hidden rounded">
        {/* Hero Section */}
        <NutritionHeroSection
          quickPlanName={quickPlanName}
          setQuickPlanName={setQuickPlanName}
          onCreatePlan={() => setShowCreateModal(true)}
        />

        {/* Plans Section */}
        <div className="flex-1 flex flex-col w-full mx-auto z-10 min-h-0">
          {/* Search & Filter Bar */}
          <NutritionSearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clientFilter={clientFilter}
            setClientFilter={setClientFilter}
            clients={clients}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onClearFilters={handleClearFilters}
          />

          {/* Data Table */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <DataTable
              data={displayPlans}
              columns={tableColumns}
              loading={fetchDietPlansAction.loading || dietPlansLoading}
              emptyMessage="No nutrition plans found"
              emptyDescription="Create your first AI-powered nutrition plan to help your clients achieve their health goals"
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showViewToggle={false}
              onRowClick={handleViewPlanDetails}
              showAssignModal={showAssignModal}
              onRowAction={(action, row) => {
                // Prevent actions on plans that are still generating
                if (row.is_generating) {
                  return;
                }

                // For error state, only allow delete action
                if (row.has_error) {
                  if (action === "delete") {
                    handleDeletePlan(row);
                  }
                  return;
                }

                if (action === "view") {
                  handleViewPlanDetails(row);
                } else if (action === "delete") {
                  handleDeletePlan(row);
                }
              }}
            />
          </div>
        </div>
      </div>{" "}
      {/* Create Plan Modal */}
      <CreatePlanModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setQuickPlanName(""); // Clear the quick input when modal closes
        }}
        clients={clients}
        selectedClient={selectedClient}
        initialPlanName={quickPlanName}
        generateDietPlanWithPlaceholder={generateDietPlanWithPlaceholder}
      />
      {/* Plan Details Modal */}
      <PlanDetailsModal
        isOpen={showPlanDetailModal}
        onClose={() => {
          setShowPlanDetailModal(false);
          setPlanDetails(null);
        }}
        planDetails={planDetails}
      />{" "}
      <PlanAssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        selectedPlan={planDetails}
        onSuccess={() => {
          setShowAssignModal(false);
          setPlanDetails(null);
        }}
      />
      {/* Delete Confirmation Modal */}
      {showDeleteModal && planToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Diet Plan"
          message={`Are you sure you want to delete the diet plan "${planToDelete.title}"? This action cannot be undone.`}
          confirmText="Delete Plan"
          cancelText="Cancel"
          variant="danger"
        />
      )}
    </>
  );
}
