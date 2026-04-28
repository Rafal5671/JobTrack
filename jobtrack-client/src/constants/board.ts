import type { ApplicationStatus } from "../types";

export const COLUMN_CONFIG = {
  saved: { label: "Saved", color: "text-gray-500", bg: "bg-gray-100" },
  applied: { label: "Applied", color: "text-blue-600", bg: "bg-blue-50" },
  screening: {
    label: "Screening",
    color: "text-violet-600",
    bg: "bg-brand-50",
  },
  interview: {
    label: "Interview",
    color: "text-violet-700",
    bg: "bg-brand-100",
  },
  offer: { label: "Offer", color: "text-green-600", bg: "bg-green-50" },
  rejected: { label: "Rejected", color: "text-red-500", bg: "bg-red-50" },
  withdrawn: { label: "Withdrawn", color: "text-gray-400", bg: "bg-gray-50" },
} satisfies Record<string, { label: string; color: string; bg: string }>;

export const COLUMN_ORDER: ApplicationStatus[] = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];
