import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  IconArrowLeft,
  IconLoader2,
  IconMapPin,
  IconCurrencyDollar,
  IconExternalLink,
  IconTrash,
  IconPlus,
  IconBell,
  IconNote,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  useApplication,
  useUpdateApplication,
  useNotes,
  useCreateNote,
  useDeleteNote,
  useReminders,
  useCreateReminder,
  useDeleteReminder,
} from "../hooks/useApplication";
import { COLUMN_CONFIG, COLUMN_ORDER } from "../constants/board";
import type { ApplicationStatus } from "../types";

// Validation schema for the note form.
const noteSchema = z.object({
  content: z
    .string()
    .min(1, "Note cannot be empty")
    .max(5000, "Note is too long"),
});

// Validation schema for the reminder form.
const reminderSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

type NoteFormData = z.infer<typeof noteSchema>;
type ReminderFormData = z.infer<typeof reminderSchema>;

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appId = parseInt(id ?? "0");

  const { data: application, isLoading, isError } = useApplication(appId);
  const updateApplication = useUpdateApplication(appId);
  const { data: notes } = useNotes(appId);
  const createNote = useCreateNote(appId);
  const deleteNote = useDeleteNote(appId);
  const { data: reminders } = useReminders(appId);
  const createReminder = useCreateReminder(appId);
  const deleteReminder = useDeleteReminder(appId);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const noteForm = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  });

  const reminderForm = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: { time: "09:00" },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <IconLoader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm">
        Application not found.
      </div>
    );
  }

  const config = COLUMN_CONFIG[application.status];

  // Start editing an inline field.
  const handleEditStart = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  // Save an inline field edit.
  const handleEditSave = async (field: string) => {
    await updateApplication.mutateAsync({ [field]: editValue });
    setEditingField(null);
  };

  // Cancel an inline field edit.
  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  // Update the application status from the dropdown.
  const handleStatusChange = (status: ApplicationStatus) => {
    updateApplication.mutate({ status });
  };

  // Add a new note.
  const handleAddNote = async (data: NoteFormData) => {
    await createNote.mutateAsync({ content: data.content });
    noteForm.reset();
  };

  // Add a new reminder.
  const handleAddReminder = async (data: ReminderFormData) => {
    await createReminder.mutateAsync({
      title: data.title,
      due_at: new Date(`${data.date}T${data.time}`).toISOString(),
    });
    reminderForm.reset({ time: "09:00" });
  };

  const inputClass =
    "w-full border border-border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-surface";

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Topbar */}
      <div className="bg-surface border-b border-border px-6 py-3.5 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate("/board")}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Back to board"
        >
          <IconArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium text-gray-900 truncate">
            {application.company} — {application.role}
          </h1>
        </div>
        <select
          value={application.status}
          onChange={(e) =>
            handleStatusChange(e.target.value as ApplicationStatus)
          }
          className={`text-xs font-medium px-3 py-1.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-brand-500 ${config.bg} ${config.color}`}
        >
          {COLUMN_ORDER.map((status) => (
            <option key={status} value={status}>
              {COLUMN_CONFIG[status].label}
            </option>
          ))}
        </select>
      </div>

      <div className="p-6 grid grid-cols-3 gap-6 flex-1">
        {/* Left column – application details */}
        <div className="col-span-2 space-y-4">
          {/* Details card */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
              Details
            </p>
            <div className="space-y-3">
              <InlineEditField
                label="Company"
                value={application.company}
                field="company"
                editingField={editingField}
                editValue={editValue}
                onEditStart={handleEditStart}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onEditValueChange={setEditValue}
              />
              <InlineEditField
                label="Role"
                value={application.role}
                field="role"
                editingField={editingField}
                editValue={editValue}
                onEditStart={handleEditStart}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onEditValueChange={setEditValue}
              />
              <div className="flex items-center gap-2 text-sm">
                <IconMapPin size={14} className="text-gray-400 shrink-0" />
                <InlineEditField
                  label="Location"
                  value={application.location || "—"}
                  field="location"
                  editingField={editingField}
                  editValue={editValue}
                  onEditStart={handleEditStart}
                  onEditSave={handleEditSave}
                  onEditCancel={handleEditCancel}
                  onEditValueChange={setEditValue}
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconCurrencyDollar
                  size={14}
                  className="text-gray-400 shrink-0"
                />
                <InlineEditField
                  label="Salary"
                  value={application.salary || "—"}
                  field="salary"
                  editingField={editingField}
                  editValue={editValue}
                  onEditStart={handleEditStart}
                  onEditSave={handleEditSave}
                  onEditCancel={handleEditCancel}
                  onEditValueChange={setEditValue}
                />
              </div>
              {application.job_url && (
                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <IconExternalLink size={13} />
                  View job listing
                </a>
              )}
              <div className="pt-2 border-t border-border text-xs text-gray-400 space-y-1">
                <p>
                  Added:{" "}
                  {format(new Date(application.created_at), "dd MMM yyyy")}
                </p>
                {application.applied_at && (
                  <p>
                    Applied:{" "}
                    {format(new Date(application.applied_at), "dd MMM yyyy")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes card */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <IconNote size={14} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </p>
            </div>

            {/* Add note form */}
            <form
              onSubmit={noteForm.handleSubmit(handleAddNote)}
              className="mb-4"
              noValidate
            >
              <textarea
                {...noteForm.register("content")}
                className={`${inputClass} resize-none mb-1 ${
                  noteForm.formState.errors.content
                    ? "border-red-300 bg-red-50"
                    : ""
                }`}
                placeholder="Add a note..."
                rows={3}
              />
              {noteForm.formState.errors.content && (
                <p className="text-xs text-red-500 mb-2">
                  {noteForm.formState.errors.content.message}
                </p>
              )}
              <button
                type="submit"
                disabled={createNote.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <IconPlus size={13} />
                Add note
              </button>
            </form>

            {/* Notes list */}
            <div className="space-y-3">
              {notes?.length === 0 && (
                <p className="text-xs text-gray-400">No notes yet.</p>
              )}
              {notes?.map((note) => (
                <div
                  key={note.id}
                  className="bg-surface-secondary rounded-lg p-3 group"
                >
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      {format(new Date(note.created_at), "dd MMM yyyy, HH:mm")}
                    </p>
                    <button
                      onClick={() => deleteNote.mutate(note.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete note"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column – reminders */}
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <IconBell size={14} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reminders
              </p>
            </div>

            {/* Add reminder form */}
            <form
              onSubmit={reminderForm.handleSubmit(handleAddReminder)}
              className="space-y-2 mb-4"
              noValidate
            >
              <div>
                <input
                  type="text"
                  {...reminderForm.register("title")}
                  className={`${inputClass} ${
                    reminderForm.formState.errors.title
                      ? "border-red-300 bg-red-50"
                      : ""
                  }`}
                  placeholder="Reminder title"
                />
                {reminderForm.formState.errors.title && (
                  <p className="text-xs text-red-500 mt-1">
                    {reminderForm.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="date"
                  {...reminderForm.register("date")}
                  className={`${inputClass} ${
                    reminderForm.formState.errors.date
                      ? "border-red-300 bg-red-50"
                      : ""
                  }`}
                  min={new Date().toISOString().slice(0, 10)}
                />
                {reminderForm.formState.errors.date && (
                  <p className="text-xs text-red-500 mt-1">
                    {reminderForm.formState.errors.date.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="time"
                  {...reminderForm.register("time")}
                  className={`${inputClass} ${
                    reminderForm.formState.errors.time
                      ? "border-red-300 bg-red-50"
                      : ""
                  }`}
                />
                {reminderForm.formState.errors.time && (
                  <p className="text-xs text-red-500 mt-1">
                    {reminderForm.formState.errors.time.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={createReminder.isPending}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <IconPlus size={13} />
                Add reminder
              </button>
            </form>

            {/* Reminders list */}
            <div className="space-y-2">
              {reminders?.length === 0 && (
                <p className="text-xs text-gray-400">No reminders yet.</p>
              )}
              {reminders?.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`rounded-lg p-3 group flex items-start justify-between gap-2 ${
                    reminder.sent ? "bg-gray-50 opacity-60" : "bg-brand-50"
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      {reminder.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(reminder.due_at), "dd MMM yyyy, HH:mm")}
                    </p>
                    {reminder.sent && (
                      <p className="text-xs text-gray-400 mt-0.5">Sent</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteReminder.mutate(reminder.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    aria-label="Delete reminder"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline editable field component.
interface InlineEditFieldProps {
  label: string;
  value: string;
  field: string;
  editingField: string | null;
  editValue: string;
  onEditStart: (field: string, value: string) => void;
  onEditSave: (field: string) => void;
  onEditCancel: () => void;
  onEditValueChange: (value: string) => void;
}

function InlineEditField({
  label,
  value,
  field,
  editingField,
  editValue,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditValueChange,
}: InlineEditFieldProps) {
  const isEditing = editingField === field;

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-xs text-gray-400 w-16 shrink-0">{label}</span>
      {isEditing ? (
        <div className="flex items-center gap-1.5 flex-1">
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            className="flex-1 border border-border rounded-md px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            autoFocus
          />
          <button
            onClick={() => onEditSave(field)}
            className="text-green-500 hover:text-green-600 transition-colors"
            aria-label="Save"
          >
            <IconCheck size={14} />
          </button>
          <button
            onClick={onEditCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cancel"
          >
            <IconX size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-sm text-gray-900">{value}</span>
          <button
            onClick={() => onEditStart(field, value === "—" ? "" : value)}
            className="text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100"
            aria-label={`Edit ${label}`}
          >
            <IconEdit size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
