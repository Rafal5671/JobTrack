import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} from "../api/applications";
import type { CreateApplicationInput, ApplicationStatus } from "../types";

// Query key factory – keeps cache keys consistent across the app.
export const applicationKeys = {
  all: ["applications"] as const,
  detail: (id: number) => ["applications", id] as const,
};

// Fetch all applications for the authenticated user.
export const useApplications = () => {
  return useQuery({
    queryKey: applicationKeys.all,
    queryFn: getApplications,
  });
};

// Create a new application and invalidate the list cache.
export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateApplicationInput) => createApplication(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
};

// Update application status – used by kanban drag and drop.
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApplicationStatus }) =>
      updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
};

// Delete an application and invalidate the list cache.
export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
};
