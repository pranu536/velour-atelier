"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-[#F1EDE5] py-20 px-4 sm:px-6 lg:px-8 border-y border-[#EBE6DD]">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <span className="text-[11px] uppercase tracking-[0.24em] text-[#7F6650] font-medium block">
          Stay Connected
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#242424] font-normal tracking-tight">
          Join the Velour Community
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto font-light leading-relaxed">
          Be the first to explore seasonal launches, capsule drops, and private previews. No spam, ever.
        </p>

        {isSubscribed ? (
          <div className="pt-4 flex items-center justify-center space-x-2 text-sm text-[#242424] font-medium animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Thank you for subscribing. Welcome to Velour.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white border border-[#D8CDBD] px-4 py-3 text-xs text-[#242424] placeholder-neutral-400 focus:outline-none focus:border-[#242424] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#242424] hover:bg-[#383838] text-white px-6 py-3 text-xs uppercase tracking-widest transition-colors flex items-center justify-center space-x-1.5 shrink-0"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
        <p className="text-[10px] text-neutral-400 pt-1">
          By signing up, you agree to our Privacy Policy and Terms of Service.
        </p>
      </div>
    </section>
  );
}

