"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Connexion impossible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-ivory py-24 md:py-32">
      <div className="container-x max-w-md">
        <h1 className="font-display text-4xl text-navy">Admin Login</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border border-border px-3 py-2" />
          <input required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full border border-border px-3 py-2" />
          <button type="submit" disabled={loading} className="rounded bg-navy px-6 py-2 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-navy-deep hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70">
            {loading ? "Loading..." : "Login"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </section>
  );
}
