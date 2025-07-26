// Individual action hooks
export { default as useFetchDietPlans } from "./useFetchDietPlans";
export { default as useUpdateDietPlan } from "./useUpdateDietPlan";
export { default as useDeleteDietPlan } from "./useDeleteDietPlan";
export { default as useAssignDietPlanToClients } from "./useAssignDietPlanToClients";
export { default as useRemoveClientFromDietPlan } from "./useRemoveClientFromDietPlan";
export { default as useGetDietPlanClients } from "./useGetDietPlanClients";
export { default as useGetClientDietPlans } from "./useGetClientDietPlans";
export { default as useGetDietPlanDetails } from "./useGetDietPlanDetails";
export { default as useGenerateDietPlan } from "./useGenerateDietPlan";

// Composite hooks
export { default as useDietPlans } from "./useDietPlans";

// Default export
export { default } from "./useDietPlans";
