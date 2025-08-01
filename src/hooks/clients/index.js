// Individual action hooks
export { default as useFetchClients } from "./api/useFetchClients";
export { default as useCreateClient } from "./api/useCreateClient";
export { default as useUpdateClient } from "./api/useUpdateClient";
export { default as useDeleteClient } from "./api/useDeleteClient";
export { default as useInviteClient } from "./api/useInviteClient";
export { default as useGetClient } from "./api/useGetClient";

// Composite hook (main hook)
export { useClients } from "./useClients";

// Default export
export { useClients as default } from "./useClients";
