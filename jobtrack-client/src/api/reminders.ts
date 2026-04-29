import client from "./client";
import type { ApiSuccess, Reminder, CreateReminderInput } from "../types";

// Fetch all reminders for a given application.
export const getReminders = async (
  applicationId: number,
): Promise<Reminder[]> => {
  const { data } = await client.get<ApiSuccess<Reminder[]>>(
    `/applications/${applicationId}/reminders`,
  );
  return data.data;
};

// Create a new reminder for a given application.
export const createReminder = async (
  applicationId: number,
  input: CreateReminderInput,
): Promise<Reminder> => {
  const { data } = await client.post<ApiSuccess<Reminder>>(
    `/applications/${applicationId}/reminders`,
    input,
  );
  return data.data;
};

// Delete a reminder by ID.
export const deleteReminder = async (
  applicationId: number,
  reminderId: number,
): Promise<void> => {
  await client.delete(`/applications/${applicationId}/reminders/${reminderId}`);
};
