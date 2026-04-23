import React, { useState } from "react";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { X, User, Palette, Lock, Eye, EyeOff, Check } from "lucide-react";
import api from "../api/axios";

const THEME_LABELS = {
  indigo: { name: "Classic", color: "#4f46e5" },
  violet: { name: "Violet", color: "#7c3aed" },
  teal:   { name: "Teal",   color: "#0d9488" },
  rose:   { name: "Rose",   color: "#e11d48" },
};

function GeneralTab() {
  const { theme, themes, setTheme } = useThemeStore();
  return (
    <div className="space-y-8">
      {/* Theme */}
      <div>
        <h3 className="font-bold text-slate-800 mb-1">Theme</h3>
        <p className="text-xs text-slate-500 mb-4">Choose a colour theme for your workspace.</p>
        <div className="grid grid-cols-4 gap-3">
          {themes.map((t) => {
            const meta = THEME_LABELS[t];
            return (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                  theme === t ? "border-[var(--color-primary)] shadow-md" : "border-slate-100 hover:border-slate-300"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full shadow-inner"
                  style={{ background: `linear-gradient(135deg, ${meta.color} 50%, #e2e8f0 50%)` }}
                />
                <span className="text-xs font-medium text-slate-600">{meta.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* About */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="font-bold text-slate-800 mb-1">About Droppy</h3>
        <p className="text-xs text-slate-500">
          Real-time collaborative Kanban workspace.<br />
          Built with React, Node.js, Socket.IO &amp; PostgreSQL.
        </p>
        <p className="text-xs text-slate-400 mt-3">Version 1.0.0</p>
      </div>
    </div>
  );
}

function AccountTab() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [nameSaved, setNameSaved] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState("");

  const [showEmail, setShowEmail] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const isGuest = user?.email?.endsWith("@guest.local");
  const maskedEmail = user?.email
    ? user.email.slice(0, 3) + "***@" + user.email.split("@")[1]
    : "";

  const handleSaveName = async () => {
    if (!name.trim() || name === user?.name) return;
    setNameLoading(true);
    setNameError("");
    try {
      const res = await api.put("/auth/profile", { name });
      const updated = { ...user, name: res.data.name };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated, localStorage.getItem("token"));
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (err) {
      setNameError(err.response?.data?.error || "Failed to save name");
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwError("");
    if (newPw !== confirmPw) { setPwError("Passwords do not match"); return; }
    if (newPw.length < 6) { setPwError("Password must be at least 6 characters"); return; }
    setPwLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword: currentPw, newPassword: newPw });
      setPwSuccess(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.response?.data?.error || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Personal Information</h3>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-md" style={{ background: "var(--color-primary)" }}>
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500">{isGuest ? "Guest Account" : "Member"}</p>
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Display Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            <button
              onClick={handleSaveName}
              disabled={nameLoading || name === user?.name}
              className="px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all hover:brightness-110"
              style={{ background: "var(--color-primary)" }}
            >
              {nameSaved ? <Check size={16} /> : "Save"}
            </button>
          </div>
          {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
        </div>

        {/* Email */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sign-In Email</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5 font-mono">
                {showEmail ? user?.email : (isGuest ? "—" : maskedEmail)}
              </p>
            </div>
            {!isGuest && (
              <button onClick={() => setShowEmail(!showEmail)} className="text-slate-400 hover:text-slate-600 transition-colors">
                {showEmail ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>
          {isGuest && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠ Temporary account. Use the "Save Account" banner to secure your data.
            </p>
          )}
        </div>
      </div>

      {/* Change Password */}
      {!isGuest && (
        <div>
          <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Lock size={15} className="text-slate-500" /> Change Password
          </h3>
          {pwSuccess && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl mb-3 border border-green-100 flex items-center gap-2">
              <Check size={15} /> Password changed successfully!
            </div>
          )}
          <form onSubmit={handleChangePw} className="space-y-3">
            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
            <input
              type="password" placeholder="Current password" value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            <input
              type="password" placeholder="New password" value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            <input
              type="password" placeholder="Confirm new password" value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            <button
              type="submit" disabled={pwLoading}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 hover:brightness-110 transition-all"
              style={{ background: "var(--color-primary)" }}
            >
              {pwLoading ? "Saving…" : "Update Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "general", label: "General", icon: Palette },
  { id: "account", label: "Account", icon: User },
];

export default function SettingsModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("general");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" style={{ maxHeight: "88vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Settings</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-40 shrink-0 border-r border-slate-100 p-3 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
                style={activeTab === tab.id ? { background: "var(--color-primary)" } : {}}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "general" && <GeneralTab />}
            {activeTab === "account" && <AccountTab />}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white rounded-xl font-medium transition-all text-sm hover:brightness-110"
            style={{ background: "var(--color-primary)" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
