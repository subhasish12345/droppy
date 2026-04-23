import React, { useState, useEffect } from "react";
import { X, Trash2, Check } from "lucide-react";
import { useBoardStore } from "../store/boardStore";

export default function TaskModal({ task, listId, onClose, canEdit }) {
  const { updateTask, deleteTask } = useBoardStore();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [saved, setSaved] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim()) return;
    updateTask(task.id, listId, { title: title.trim(), description: description.trim() });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 700);
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    deleteTask(task.id, listId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Task Details</h2>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={handleDelete}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
            {canEdit ? (
              <input
                type="text"
                value={title}
                autoFocus
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ "--tw-ring-color": "var(--color-primary)" }}
                placeholder="Task title..."
              />
            ) : (
              <p className="text-sm font-semibold text-slate-800 px-1">{title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
            {canEdit ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-slate-600 px-1 whitespace-pre-wrap">
                {description || <span className="text-slate-400 italic">No description</span>}
              </p>
            )}
          </div>

          {/* Meta */}
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-4 text-xs text-slate-500">
            <span>📋 ID: <span className="font-mono">{task.id.slice(0, 8)}…</span></span>
            {task.createdAt && <span>📅 {new Date(task.createdAt).toLocaleDateString()}</span>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
          >
            {canEdit ? "Cancel" : "Close"}
          </button>
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-xl text-white font-medium transition-all text-sm disabled:opacity-50 hover:brightness-110 flex items-center justify-center gap-2"
              style={{ background: "var(--color-primary)" }}
            >
              {saved ? <><Check size={15} /> Saved!</> : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
