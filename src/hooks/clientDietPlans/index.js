// Main client diet plans hook with state management
export { default as useClientDietPlans } from "./useClientDietPlans";

// Individual API hooks
export { default as useGetClientDietPlans } from "./api/useGetClientDietPlans";
export { default as useActivateClientDietPlan } from "./api/useActivateClientDietPlan";
export { default as useDeactivateClientDietPlan } from "./api/useDeactivateClientDietPlan";

// Standalone functions for backwards compatibility
export {
  activateDietPlan,
  deactivateDietPlan,
} from "./api/useGetClientDietPlans";

// Default export
export { default } from "./useClientDietPlans";
