// Application status matching backend constants.
export type ApplicationStatus =
  | "saved"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  company: string;
  role: string;
  status: ApplicationStatus;
  location: string;
  salary: string;
  job_url: string;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
  notes?: Note[];
  contacts?: Contact[];
  reminders?: Reminder[];
}

export interface Contact {
  id: number;
  user_id: number;
  name: string;
  role: string;
  company: string;
  email: string;
  linkedin: string;
  phone: string;
  notes: string;
  created_at: string;
  updated_at: string;
  applications?: Application[];
}

export interface Note {
  id: number;
  application_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: number;
  application_id: number;
  user_id: number;
  title: string;
  due_at: string;
  sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatsResult {
  total: number;
  by_status: StatusCount[];
  weekly: WeeklyCount[];
  response_rate: number;
  offer_rate: number;
}

export interface StatusCount {
  status: ApplicationStatus;
  count: number;
}

export interface WeeklyCount {
  week: string;
  count: number;
}

// API response envelopes matching backend utils/response.go
export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
}

// Form input types
export interface CreateApplicationInput {
  company: string;
  role: string;
  location?: string;
  salary?: string;
  job_url?: string;
  applied_at?: string;
}

export type UpdateApplicationInput = Partial<CreateApplicationInput> & {
  status?: ApplicationStatus;
};

export interface CreateContactInput {
  name: string;
  role?: string;
  company?: string;
  email?: string;
  linkedin?: string;
  phone?: string;
  notes?: string;
}

export type UpdateContactInput = Partial<CreateContactInput>;

export interface CreateNoteInput {
  content: string;
}

export interface CreateReminderInput {
  title: string;
  due_at: string;
}

export type UpdateReminderInput = Partial<CreateReminderInput>;
