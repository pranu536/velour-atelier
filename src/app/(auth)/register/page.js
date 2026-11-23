"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      // Automatically sign in on successful registration
      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInRes?.ok) {
        router.push("/profile");
        router.refresh();
      } else {
        router.push("/login?registered=true");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred during registration. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 border border-neutral-200 rounded-sm shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[11px] uppercase tracking-ultra text-brand-600 font-semibold">
            Maison Atelier
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wide text-noir-900">
            Create Atelier Account
          </h2>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Join the Velour community for priority drops, order tracking, and complimentary tailored privileges.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm">
              {errorMessage}
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            required
            placeholder="e.g. Julian Hayes"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            required
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full tracking-widest"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>

        {/* Already have an account */}
        <div className="text-center pt-4 border-t border-neutral-100 text-xs text-neutral-500">
          <span>Already registered? </span>
          <Link
            href="/login"
            className="font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors ml-1 underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

