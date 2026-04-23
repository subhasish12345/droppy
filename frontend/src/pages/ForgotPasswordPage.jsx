import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-md" style={{ background: "var(--color-primary)" }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Forgot Password?</h1>
          <p className="text-sm text-slate-500 mt-1">We'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-slate-800">Check your email!</p>
            <p className="text-sm text-slate-500">If <strong>{email}</strong> has an account, we've sent a password reset link. It expires in 15 minutes.</p>
            <Link to="/login" className="block w-full py-3 rounded-2xl text-white font-semibold text-sm text-center transition-all" style={{ background: "var(--color-primary)" }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl">{error}</div>
            )}
            <input
              type="email" required autoFocus
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl text-white font-semibold text-sm shadow-md hover:brightness-110 disabled:opacity-60 transition-all"
              style={{ background: "var(--color-primary)" }}
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <p className="text-center text-xs text-slate-500">
              <Link to="/login" className="font-semibold underline" style={{ color: "var(--color-primary)" }}>Back to Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
