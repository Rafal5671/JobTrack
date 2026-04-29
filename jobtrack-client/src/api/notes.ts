import client from "./client";
import type { ApiSuccess, Note, CreateNoteInput } from "../types";

// Fetch all notes for a given application.
export const getNotes = async (applicationId: number): Promise<Note[]> => {
  const { data } = await client.get<ApiSuccess<Note[]>>(
    `/applications/${applicationId}/notes`,
  );
  return data.data;
};

// Create a new note for a given application.
export const createNote = async (
  applicationId: number,
  input: CreateNoteInput,
): Promise<Note> => {
  const { data } = await client.post<ApiSuccess<Note>>(
    `/applications/${applicationId}/notes`,
    input,
  );
  return data.data;
};

// Update an existing note.
export const updateNote = async (
  applicationId: number,
  noteId: number,
  input: CreateNoteInput,
): Promise<Note> => {
  const { data } = await client.put<ApiSuccess<Note>>(
    `/applications/${applicationId}/notes/${noteId}`,
    input,
  );
  return data.data;
};

// Delete a note by ID.
export const deleteNote = async (
  applicationId: number,
  noteId: number,
): Promise<void> => {
  await client.delete(`/applications/${applicationId}/notes/${noteId}`);
};
