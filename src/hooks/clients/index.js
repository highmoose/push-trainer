// Individual action hooks
export { default as useFetchClients } from "./useFetchClients";
export { default as useCreateClient } from "./useCreateClient";
export { default as useUpdateClient } from "./useUpdateClient";
export { default as useDeleteClient } from "./useDeleteClient";
export { default as useInviteClient } from "./useInviteClient";
export { default as useGetClient } from "./useGetClient";

// Composite hook (main hook)
export { useClients } from "./useClients";

// Default export
export { useClients as default } from "./useClients";
