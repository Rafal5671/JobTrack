import client from "./client";
import type {
  ApiSuccess,
  Contact,
  CreateContactInput,
  UpdateContactInput,
} from "../types";

// Fetch all contacts for the authenticated user.
export const getContacts = async (): Promise<Contact[]> => {
  const { data } = await client.get<ApiSuccess<Contact[]>>("/contacts");
  return data.data;
};

// Fetch a single contact by ID.
export const getContact = async (id: number): Promise<Contact> => {
  const { data } = await client.get<ApiSuccess<Contact>>(`/contacts/${id}`);
  return data.data;
};

// Create a new contact.
export const createContact = async (
  input: CreateContactInput,
): Promise<Contact> => {
  const { data } = await client.post<ApiSuccess<Contact>>("/contacts", input);
  return data.data;
};

// Update an existing contact.
export const updateContact = async (
  id: number,
  input: UpdateContactInput,
): Promise<Contact> => {
  const { data } = await client.put<ApiSuccess<Contact>>(
    `/contacts/${id}`,
    input,
  );
  return data.data;
};

// Delete a contact by ID.
export const deleteContact = async (id: number): Promise<void> => {
  await client.delete(`/contacts/${id}`);
};
