import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Settings, LogOut, ChevronDown, User, HelpCircle, Info, Globe, X, BookOpen, MessageCircle } from "lucide-react";
import SettingsModal from "./SettingsModal";

const STATUSES = [
  { id: "available",   label: "Available",      dot: "bg-green-500",     ring: "ring-green-500" },
  { id: "busy",        label: "Busy",           dot: "bg-red-500",       ring: "ring-red-500" },
  { id: "dnd",         label: "Do Not Disturb", dot: "bg-red-600",       ring: "ring-red-600", icon: "🚫" },
  { id: "away",        label: "Away",           dot: "bg-yellow-400",    ring: "ring-yellow-400" },
  { id: "offline",     label: "Out of Office",  dot: "bg-slate-400",     ring: "ring-slate-400" },
];

const STATUS_ICONS = {
  available: "🟢",
  busy:      "🔴",
  dnd:       "⛔",
  away:      "🟡",
  offline:   "⚫",
};

export default function ProfileMenu() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [status, setStatus] = useState(
    () => localStorage.getItem("droppy-status") || "available"
  );
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const currentStatus = STATUSES.find((s) => s.id === status) || STATUSES[0];

  const handleStatus = (id) => {
    setStatus(id);
    localStorage.setItem("droppy-status", id);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <>
      <div ref={ref} className="relative">
        {/* Avatar Trigger */}
        <button
          onClick={() => setOpen(!open)}
          id="profile-menu-button"
          className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 transition-colors"
        >
          <div className="relative">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ background: "var(--color-primary)" }}
            >
              {initials}
            </div>
            {/* Status dot */}
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${currentStatus.dot}`} />
          </div>
          <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-68 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in" style={{ width: "260px" }}>

            {/* User Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow" style={{ background: "var(--color-primary)" }}>
                    {initials}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${currentStatus.dot}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email?.endsWith("@guest.local") ? "Guest Account" : user?.email}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--color-primary)" }}>{STATUS_ICONS[status]} {currentStatus.label}</p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="py-1">
              <button
                onClick={() => { setOpen(false); setSettingsOpen(true); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings size={15} className="text-slate-400 shrink-0" /> Settings
              </button>
            </div>

            {/* Status Section */}
            <div className="border-t border-slate-100 py-1">
              <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Set Status</p>
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStatus(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${status === s.id ? "bg-slate-50 font-semibold text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                  {s.label}
                  {status === s.id && <span className="ml-auto text-xs" style={{ color: "var(--color-primary)" }}>✓</span>}
                </button>
              ))}
            </div>

            {/* Links Section */}
            <div className="border-t border-slate-100 py-1">
              <button
                onClick={() => { setOpen(false); setSettingsOpen(true); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User size={15} className="text-slate-400 shrink-0" /> My Profile
              </button>
              <button
                onClick={() => { setOpen(false); window.open("https://github.com/subhasish12345/droppy", "_blank"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Info size={15} className="text-slate-400 shrink-0" /> About Droppy
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => { setOpen(false); setLangOpen(true); }}
              >
                <Globe size={15} className="text-slate-400 shrink-0" />
                Language
                <span className="ml-auto text-xs text-slate-400">English</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => { setOpen(false); setHelpOpen(true); }}
              >
                <HelpCircle size={15} className="text-slate-400 shrink-0" /> Help
              </button>
            </div>

            {/* Sign Out */}
            <div className="border-t border-slate-100 py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><HelpCircle size={18} style={{ color: 'var(--color-primary)' }} /> Help & Support</h2>
              <button onClick={() => setHelpOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm">⌨️ Keyboard Shortcuts</h3>
                {[['N', 'New Room'], ['J', 'Join Room'], ['Esc', 'Close modal'], ['Ctrl+K', 'Quick search (coming soon)']].map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{desc}</span>
                    <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono text-slate-700 shadow-sm">{key}</kbd>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-slate-800 text-sm">📖 Quick Tips</h3>
                <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Drag & drop tasks between columns</li>
                  <li>Share your Room ID to invite collaborators</li>
                  <li>Password-protect rooms for private teams</li>
                  <li>Changes sync in real-time across all members</li>
                </ul>
              </div>
              <a href="https://github.com/subhasish12345/droppy" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                <Info size={18} className="text-slate-500" /> View source on GitHub
              </a>
            </div>
            <div className="px-6 pb-5"><button onClick={() => setHelpOpen(false)} className="w-full py-2.5 rounded-xl text-white font-medium hover:brightness-110 transition-all" style={{ background: 'var(--color-primary)' }}>Close</button></div>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {langOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Globe size={18} style={{ color: 'var(--color-primary)' }} /> Language</h2>
              <button onClick={() => setLangOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-4 space-y-1">
              {[['🇺🇸', 'English', true], ['🇮🇳', 'Hindi — हिंदी', false], ['🇪🇸', 'Spanish — Español', false], ['🇫🇷', 'French — Français', false], ['🇩🇪', 'German — Deutsch', false]].map(([flag, lang, active]) => (
                <button key={lang} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${ active ? 'font-bold text-white' : 'text-slate-700 hover:bg-slate-50'}`}
                  style={active ? { background: 'var(--color-primary)' } : {}}>
                  <span className="text-xl">{flag}</span>
                  {lang}
                  {active && <span className="ml-auto text-xs opacity-80">✓ Active</span>}
                  {!active && <span className="ml-auto text-xs text-slate-400">Coming soon</span>}
                </button>
              ))}
            </div>
            <div className="px-6 pb-5"><button onClick={() => setLangOpen(false)} className="w-full py-2.5 rounded-xl text-white font-medium hover:brightness-110 transition-all" style={{ background: 'var(--color-primary)' }}>Done</button></div>
          </div>
        </div>
      )}
    </>
  );
}
