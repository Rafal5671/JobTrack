import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconX } from "@tabler/icons-react";
import type { CreateApplicationInput } from "../../types";

const schema = z.object({
  company: z.string().min(2, "Company must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  location: z.string().max(100, "Location is too long").optional(),
  salary: z.string().max(50, "Salary is too long").optional(),
  job_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface AddApplicationModalProps {
  onClose: () => void;
  onSubmit: (input: CreateApplicationInput) => void;
  isLoading: boolean;
}

export default function AddApplicationModal({
  onClose,
  onSubmit,
  isLoading,
}: AddApplicationModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      company: data.company,
      role: data.role,
      location: data.location || undefined,
      salary: data.salary || undefined,
      job_url: data.job_url || undefined,
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
          <h2 className="text-sm font-medium text-gray-900">Add application</h2>
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
          className="p-5 space-y-4"
          noValidate
        >
          {/* Company */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Company <span className="text-red-400">*</span>
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

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Role <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register("role")}
              className={inputClass(!!errors.role)}
              placeholder="Backend Engineer"
            />
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Location + Salary */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Location
              </label>
              <input
                type="text"
                {...register("location")}
                className={inputClass(!!errors.location)}
                placeholder="Warsaw"
              />
              {errors.location && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Salary
              </label>
              <input
                type="text"
                {...register("salary")}
                className={inputClass(!!errors.salary)}
                placeholder="15 000 PLN"
              />
              {errors.salary && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.salary.message}
                </p>
              )}
            </div>
          </div>

          {/* Job URL */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Job URL
            </label>
            <input
              type="url"
              {...register("job_url")}
              className={inputClass(!!errors.job_url)}
              placeholder="https://..."
            />
            {errors.job_url && (
              <p className="text-xs text-red-500 mt-1">
                {errors.job_url.message}
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
              {isLoading ? "Adding..." : "Add application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
