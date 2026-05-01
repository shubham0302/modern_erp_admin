import { useState, type FormEvent } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import axios from "axios";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { login } from "./api";
import { setTokens } from "./storage";
import { useAuthStore } from "./store";
import type { ApiError } from "@/lib/api/types";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" }) as { redirect?: string };
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const result = await login({ email: email.trim(), password });
      setTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      setAuth(result.admin);
      toast.success(`Welcome back, ${result.admin.name}`);
      navigate({ to: search.redirect ?? "/dashboard" });
    } catch (err) {
      const message =
        (axios.isAxiosError(err) &&
          (err.response?.data as ApiError | undefined)?.error?.message) ||
        "Login failed. Please try again.";
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-dvw items-center justify-center bg-nl-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-pl-500 to-pl-400 shadow-md">
            <span className="text-xl font-extrabold text-white">M</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-nl-800">Modern ERP</h1>
            <p className="text-[11px] font-semibold tracking-wider text-pl-600 uppercase">
              Admin Console
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-nl-100 sm:p-8"
        >
          <div>
            <h2 className="text-lg font-semibold text-nl-800">Sign in</h2>
            <p className="mt-1 text-xs text-nl-500">
              Enter your credentials to access the admin console.
            </p>
          </div>

          <div className="relative">
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@modern.com"
              autoComplete="email"
              required
              disabled={submitting}
              className="pl-9"
            />
            <Mail
              size={15}
              className="pointer-events-none absolute bottom-3 left-3 text-nl-400"
            />
          </div>

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={submitting}
              className="px-9"
            />
            <Lock
              size={15}
              className="pointer-events-none absolute bottom-3 left-3 text-nl-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={submitting}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 bottom-2 flex size-6 cursor-pointer items-center justify-center rounded-md text-nl-400 transition-colors hover:bg-nl-100 hover:text-nl-600 disabled:cursor-not-allowed"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={submitting || !email || !password}
            className="mt-2 h-10 w-full"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
