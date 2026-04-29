import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from "../api/contacts";
import type { CreateContactInput, UpdateContactInput } from "../types";

// Query key factory for contacts.
export const contactKeys = {
  all: ["contacts"] as const,
  detail: (id: number) => ["contacts", id] as const,
};

// Fetch all contacts for the authenticated user.
export const useContacts = () => {
  return useQuery({
    queryKey: contactKeys.all,
    queryFn: getContacts,
  });
};

// Create a new contact and invalidate the list cache.
export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactInput) => createContact(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
};

// Update a contact and invalidate its cache.
export const useUpdateContact = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateContactInput) => updateContact(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) });
    },
  });
};

// Delete a contact and invalidate the list cache.
export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
};
