"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("mashrafiahnam1@gmail.com");
  const [password, setPassword] = useState("adminLogin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin");
    }
    setLoading(false);
  }

  return (
    <section className="bg-ivory py-24 md:py-32">
      <div className="container-x max-w-md">
        <h1 className="font-display text-4xl text-navy">Admin Login</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border border-border px-3 py-2" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full border border-border px-3 py-2" />
          <button type="submit" disabled={loading} className="bg-navy px-6 py-2 text-ivory transition-all duration-300 hover:bg-navy-deep hover:shadow-soft">
            {loading ? "Loading..." : "Login"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </section>
  );
}
