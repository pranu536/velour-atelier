"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, UserCheck, Loader2 } from "lucide-react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const registered = searchParams.get("registered");
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setErrorMessage("An unexpected authentication error occurred");
      setIsLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage("");
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 border border-neutral-200 rounded-sm shadow-sm">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] uppercase tracking-ultra text-brand-600 font-semibold">
          Maison Atelier
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wide text-noir-900">
          Sign In to Velour
        </h2>
        <p className="text-xs text-neutral-500 max-w-xs mx-auto">
          Access your orders, saved measurements, shipping addresses, and private drops.
        </p>
      </div>

      {/* URL Parameter Notices */}
      {registered === "true" && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm">
          <p className="font-semibold">Account created successfully!</p>
          <p className="text-[11px] mt-0.5 text-emerald-700">Please sign in with your credentials to access your client portal.</p>
        </div>
      )}

      {urlError === "AccessDenied" && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-sm">
          <p className="font-semibold">Administrator Clearance Required</p>
          <p className="text-[11px] mt-0.5 text-rose-700">The page you attempted to visit is restricted strictly to verified administrator accounts.</p>
        </div>
      )}

      {/* Quick Demo Login Bar for Seamless Testing */}
      <div className="p-3 bg-brand-50 border border-brand-200 rounded-sm text-xs space-y-2">
        <div className="flex items-center space-x-1.5 font-semibold text-brand-900 uppercase tracking-wider text-[10px]">
          <UserCheck className="w-3.5 h-3.5" />
          <span>One-Click Test Accounts</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials("demo@velour.com", "User@Velour2026")}
            className="px-2 py-1.5 bg-white border border-brand-300 text-brand-900 rounded text-[11px] hover:bg-brand-100 transition-colors text-left"
          >
            <span className="font-semibold block">Demo Customer</span>
            <span className="text-[9px] text-neutral-500">demo@velour.com</span>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials("admin@velour.com", "Admin@Velour2026")}
            className="px-2 py-1.5 bg-white border border-brand-300 text-brand-900 rounded text-[11px] hover:bg-brand-100 transition-colors text-left"
          >
            <span className="font-semibold block">Admin Portal</span>
            <span className="text-[9px] text-neutral-500">admin@velour.com</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm">
            {errorMessage}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center text-neutral-600">
            <input type="checkbox" className="accent-noir-900 mr-2 rounded" defaultChecked />
            <span>Remember me</span>
          </label>
          <span className="text-neutral-400 hover:text-noir-900 cursor-pointer">
            Forgot password?
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full tracking-widest mt-2"
        >
          <span>Sign In to Account</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      {/* Register link */}
      <div className="text-center pt-4 border-t border-neutral-100 text-xs text-neutral-500">
        <span>New to Velour Atelier? </span>
        <Link
          href="/register"
          className="font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors ml-1 underline"
        >
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-noir-900" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
