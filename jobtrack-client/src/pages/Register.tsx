import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconBriefcase, IconAlertCircle } from "@tabler/icons-react";
import { useAuthStore } from "../store/authStore";
import { register as registerUser } from "../api/auth";

const registerSchema = z
  .object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { user, token } = await registerUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      });
      setAuth(user, token);
      navigate("/board");
    } catch {
      setError("root", {
        message: "Registration failed. Email may already be in use.",
      });
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
      hasError ? "border-red-300 bg-red-50" : "border-border bg-surface"
    }`;

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl mb-4">
            <IconBriefcase
              size={24}
              className="text-brand-600"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-xl font-medium text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Start tracking your job search
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Root error */}
            {errors.root && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-sm text-red-600 flex items-center gap-2">
                <IconAlertCircle size={16} aria-hidden="true" />
                {errors.root.message}
              </div>
            )}

            {/* Name row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  {...register("first_name")}
                  className={inputClass(!!errors.first_name)}
                  placeholder="Jan"
                  autoComplete="given-name"
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  {...register("last_name")}
                  className={inputClass(!!errors.last_name)}
                  placeholder="Kowalski"
                  autoComplete="family-name"
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.last_name.message}
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
                placeholder="jan@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className={inputClass(!!errors.password)}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                {...register("confirm_password")}
                className={inputClass(!!errors.confirm_password)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirm_password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
