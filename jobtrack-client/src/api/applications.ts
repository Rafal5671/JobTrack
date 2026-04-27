import client from "./client";
import type {
  ApiSuccess,
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationStatus,
} from "../types";

// Fetch all applications for the authenticated user.
export const getApplications = async (): Promise<Application[]> => {
  const { data } = await client.get<ApiSuccess<Application[]>>("/applications");
  return data.data;
};

// Fetch a single application by ID with notes, contacts and reminders.
export const getApplication = async (id: number): Promise<Application> => {
  const { data } = await client.get<ApiSuccess<Application>>(
    `/applications/${id}`,
  );
  return data.data;
};

// Create a new job application.
export const createApplication = async (
  input: CreateApplicationInput,
): Promise<Application> => {
  const { data } = await client.post<ApiSuccess<Application>>(
    "/applications",
    input,
  );
  return data.data;
};

// Update an existing application.
export const updateApplication = async (
  id: number,
  input: UpdateApplicationInput,
): Promise<Application> => {
  const { data } = await client.put<ApiSuccess<Application>>(
    `/applications/${id}`,
    input,
  );
  return data.data;
};

// Update only the status of an application – used by kanban drag and drop.
export const updateApplicationStatus = async (
  id: number,
  status: ApplicationStatus,
): Promise<Application> => {
  const { data } = await client.patch<ApiSuccess<Application>>(
    `/applications/${id}/status`,
    { status },
  );
  return data.data;
};

// Delete an application by ID.
export const deleteApplication = async (id: number): Promise<void> => {
  await client.delete(`/applications/${id}`);
};
