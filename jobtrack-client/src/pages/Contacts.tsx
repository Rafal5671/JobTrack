import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconPlus,
  IconLoader2,
  IconUsers,
  IconMail,
  IconPhone,
  IconBrandLinkedin,
  IconTrash,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  useContacts,
  useCreateContact,
  useDeleteContact,
} from "../hooks/useContacts";
import type { CreateContactInput } from "../types";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().max(100, "Role is too long").optional(),
  company: z.string().max(100, "Company is too long").optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone is too long").optional(),
  notes: z.string().max(1000, "Notes are too long").optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Add contact modal component.
function AddContactModal({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void;
  onSubmit: (input: CreateContactInput) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onFormSubmit = (data: ContactFormData) => {
    onSubmit({
      name: data.name,
      role: data.role || undefined,
      company: data.company || undefined,
      email: data.email || undefined,
      linkedin: data.linkedin || undefined,
      phone: data.phone || undefined,
      notes: data.notes || undefined,
    });
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-surface ${
      hasError ? "border-red-300 bg-red-50" : "border-border"
    }`;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-surface rounded-xl border border-border w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-gray-900">Add contact</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="p-5 space-y-3"
          noValidate
        >
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              className={inputClass(!!errors.name)}
              placeholder="Anna Kowalska"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Role + Company */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Role
              </label>
              <input
                type="text"
                {...register("role")}
                className={inputClass(!!errors.role)}
                placeholder="HR Manager"
              />
              {errors.role && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Company
              </label>
              <input
                type="text"
                {...register("company")}
                className={inputClass(!!errors.company)}
                placeholder="Google"
              />
              {errors.company && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.company.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className={inputClass(!!errors.email)}
              placeholder="anna@google.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* LinkedIn + Phone */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                LinkedIn
              </label>
              <input
                type="url"
                {...register("linkedin")}
                className={inputClass(!!errors.linkedin)}
                placeholder="https://linkedin.com/in/..."
              />
              {errors.linkedin && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.linkedin.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                {...register("phone")}
                className={inputClass(!!errors.phone)}
                placeholder="+48 123 456 789"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              {...register("notes")}
              className={`${inputClass(!!errors.notes)} resize-none`}
              placeholder="Additional notes..."
              rows={3}
            />
            {errors.notes && (
              <p className="text-xs text-red-500 mt-1">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isLoading ? "Adding..." : "Add contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const { data: contacts, isLoading, isError } = useContacts();
  const createContact = useCreateContact();
  const deleteContact = useDeleteContact();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSubmit = async (input: CreateContactInput) => {
    await createContact.mutateAsync(input);
    setModalOpen(false);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete contact ${name}?`)) {
      deleteContact.mutate(id);
    }
  };

  // Filter contacts by search query.
  const filtered = contacts?.filter((c) =>
    [c.name, c.company, c.role, c.email]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // Generate initials from contact name.
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <IconLoader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm gap-2">
        <IconAlertCircle size={16} />
        Failed to load contacts. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Topbar */}
      <div className="bg-surface border-b border-border px-6 py-3.5 flex items-center justify-between shrink-0">
        <h1 className="text-sm font-medium text-gray-900">Contacts</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="border border-border rounded-lg px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-surface w-48"
          />
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <IconPlus size={14} />
            Add contact
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Empty state */}
        {filtered?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <IconUsers size={32} className="mb-3" />
            <p className="text-sm font-medium text-gray-500">No contacts yet</p>
            <p className="text-xs mt-1">
              Add HR contacts to track your network
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <IconPlus size={14} />
              Add first contact
            </button>
          </div>
        )}

        {/* Contacts grid */}
        {filtered && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((contact) => (
              <div
                key={contact.id}
                className="bg-surface border border-border rounded-xl p-4 group hover:border-border-strong transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 text-xs font-medium flex items-center justify-center shrink-0">
                      {getInitials(contact.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      {(contact.role || contact.company) && (
                        <p className="text-xs text-gray-500 truncate">
                          {[contact.role, contact.company]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(contact.id, contact.name)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    aria-label="Delete contact"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>

                {/* Contact details */}
                <div className="space-y-1.5">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-600 transition-colors"
                    >
                      <IconMail size={13} className="shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-600 transition-colors"
                    >
                      <IconPhone size={13} className="shrink-0" />
                      <span className="truncate">{contact.phone}</span>
                    </a>
                  )}
                  {contact.linkedin && (
                    <a
                      href={contact.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-600 transition-colors"
                    >
                      <IconBrandLinkedin size={13} className="shrink-0" />
                      <span className="truncate">LinkedIn</span>
                    </a>
                  )}
                </div>

                {/* Notes preview */}
                {contact.notes && (
                  <p className="text-xs text-gray-400 mt-3 line-clamp-2 border-t border-border pt-3">
                    {contact.notes}
                  </p>
                )}

                {/* Footer */}
                <p className="text-xs text-gray-300 mt-3">
                  Added {format(new Date(contact.created_at), "dd MMM yyyy")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <AddContactModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={createContact.isPending}
        />
      )}
    </div>
  );
}
