import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} from "../api/applications";
import { getNotes, createNote, deleteNote } from "../api/notes";
import { getReminders, createReminder, deleteReminder } from "../api/reminders";
import type {
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationStatus,
  CreateNoteInput,
  CreateReminderInput,
} from "../types";

// Query key factory – keeps cache keys consistent across the app.
export const applicationKeys = {
  all: ["applications"] as const,
  detail: (id: number) => ["applications", id] as const,
  notes: (id: number) => ["applications", id, "notes"] as const,
  reminders: (id: number) => ["applications", id, "reminders"] as const,
};

// Fetch all applications for the authenticated user.
export const useApplications = () => {
  return useQuery({
    queryKey: applicationKeys.all,
    queryFn: getApplications,
  });
};

// Fetch a single application by ID.
export const useApplication = (id: number) => {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => getApplication(id),
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

// Update an application and invalidate its cache.
export const useUpdateApplication = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateApplicationInput) => updateApplication(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
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

// Fetch all notes for an application.
export const useNotes = (applicationId: number) => {
  return useQuery({
    queryKey: applicationKeys.notes(applicationId),
    queryFn: () => getNotes(applicationId),
  });
};

// Create a note and invalidate notes cache.
export const useCreateNote = (applicationId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => createNote(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.notes(applicationId),
      });
    },
  });
};

// Delete a note and invalidate notes cache.
export const useDeleteNote = (applicationId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: number) => deleteNote(applicationId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.notes(applicationId),
      });
    },
  });
};

// Fetch all reminders for an application.
export const useReminders = (applicationId: number) => {
  return useQuery({
    queryKey: applicationKeys.reminders(applicationId),
    queryFn: () => getReminders(applicationId),
  });
};

// Create a reminder and invalidate reminders cache.
export const useCreateReminder = (applicationId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReminderInput) =>
      createReminder(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.reminders(applicationId),
      });
    },
  });
};

// Delete a reminder and invalidate reminders cache.
export const useDeleteReminder = (applicationId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: number) =>
      deleteReminder(applicationId, reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.reminders(applicationId),
      });
    },
  });
};
