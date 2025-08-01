// Individual action hooks
export { default as useFetchDietPlans } from "./api/useFetchDietPlans";
export { default as useUpdateDietPlan } from "./api/useUpdateDietPlan";
export { default as useDeleteDietPlan } from "./api/useDeleteDietPlan";
export { default as useAssignDietPlanToClients } from "./api/useAssignDietPlanToClients";
export { default as useRemoveClientFromDietPlan } from "./api/useRemoveClientFromDietPlan";
export { default as useGetDietPlanClients } from "./api/useGetDietPlanClients";
export { default as useGetDietPlanDetails } from "./api/useGetDietPlanDetails";
export { default as useGenerateDietPlan } from "./api/useGenerateDietPlan";

// Composite hooks
export { default as useDietPlans } from "./useDietPlans";

// Default export
export { default } from "./useDietPlans";
