import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function GuestBanner() {
  const { user, claimAccount } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is not a guest, don't show anything
  if (!user || !user.email.endsWith("@guest.local")) {
    return null;
  }

  const handleClaim = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await claimAccount(email, password);
      setIsOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save account. Email might be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-3 flex items-center justify-between z-50 relative">
        <div className="flex items-center gap-2">
          <span className="text-amber-800 text-sm font-medium">
            ⚠️ You are using a temporary guest account. Your history will be lost if you leave.
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-sm transition-colors"
        >
          Save Account
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Save Your Account</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleClaim} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              <p className="text-sm text-slate-600 mb-4">
                Enter an email and password to permanently save your access to these boards.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50">
                  {loading ? "Saving..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
