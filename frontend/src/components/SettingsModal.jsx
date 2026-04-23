import React from "react";
import { useThemeStore } from "../store/themeStore";
import { X } from "lucide-react";

const THEME_LABELS = {
  indigo: { name: "Classic", color: "#4f46e5" },
  violet: { name: "Violet", color: "#7c3aed" },
  teal:   { name: "Teal",   color: "#0d9488" },
  rose:   { name: "Rose",   color: "#e11d48" },
};

export default function SettingsModal({ open, onClose }) {
  const { theme, themes, setTheme } = useThemeStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Settings</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-40 shrink-0 border-r border-slate-100 p-3 space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--color-primary)]">
              General
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-colors">
              Account
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Theme section */}
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

            {/* Navigation section */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="font-bold text-slate-800 mb-1">About Droppy</h3>
              <p className="text-xs text-slate-500">
                Real-time collaborative Kanban workspace.<br />
                Built with React, Node.js, Socket.IO &amp; PostgreSQL.
              </p>
              <p className="text-xs text-slate-400 mt-3">Version 1.0.0</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
