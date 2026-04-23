import React, { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import { useBoardStore } from "../store/boardStore";
import { MoreVertical, Pencil, Trash2, Check, X } from "lucide-react";

export default function Column({ list, canEdit }) {
  const { addTask, renameList, deleteList } = useBoardStore();
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(list.title);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { setNodeRef } = useDroppable({
    id: list.id,
    data: { type: "Column", list },
  });

  const taskIds = list.tasks.map((t) => t.id);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) { setIsAdding(false); return; }
    addTask(list.id, taskTitle);
    setTaskTitle("");
    setIsAdding(false);
  };

  const handleRename = () => {
    if (!renameVal.trim() || renameVal === list.title) { setIsRenaming(false); return; }
    renameList(list.id, renameVal.trim());
    setIsRenaming(false);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    if (!window.confirm(`Delete column "${list.title}" and all its tasks?`)) return;
    deleteList(list.id);
  };

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 w-[290px] shrink-0 flex flex-col shadow-sm">
      {/* ── Column Header ── */}
      <div className="flex items-center justify-between mb-3 px-1 pt-1">
        {isRenaming ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              type="text"
              autoFocus
              value={renameVal}
              onChange={(e) => setRenameVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") { setIsRenaming(false); setRenameVal(list.title); }
              }}
              className="flex-1 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "var(--color-primary)" }}
            />
            <button onClick={handleRename} className="p-1 text-green-500 hover:text-green-700 transition-colors">
              <Check size={14} />
            </button>
            <button onClick={() => { setIsRenaming(false); setRenameVal(list.title); }} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-sm text-slate-700 tracking-wide flex-1 truncate">{list.title}</h2>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium bg-white text-slate-500 px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
                {list.tasks.length}
              </span>
              {canEdit && (
                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                    title="Column options"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 w-44 animate-in">
                      <button
                        onClick={() => { setMenuOpen(false); setIsRenaming(true); setRenameVal(list.title); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Pencil size={14} className="text-slate-400" /> Rename Column
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} /> Delete Column
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Droppable Task Area ── */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[80px] px-0.5 py-0.5">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {list.tasks.map((task) => (
            <TaskCard key={task.id} task={task} canEdit={canEdit} />
          ))}
        </SortableContext>
      </div>

      {/* ── Add Task ── */}
      {canEdit && (
        <div className="mt-2 px-1">
          {isAdding ? (
            <form onSubmit={handleAddTask} className="flex flex-col gap-2 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
              <input
                type="text"
                autoFocus
                placeholder="What needs to be done?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-700 font-medium"
                onKeyDown={(e) => { if (e.key === "Escape") { setIsAdding(false); setTaskTitle(""); } }}
              />
              <div className="flex items-center justify-end gap-2 mt-1">
                <button type="button" onClick={() => { setIsAdding(false); setTaskTitle(""); }}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1">
                  Cancel
                </button>
                <button type="submit"
                  className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm hover:brightness-110"
                  style={{ background: "var(--color-primary)" }}>
                  Add Task
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full border-2 border-dashed border-slate-300/70 rounded-xl py-2.5 hover:bg-slate-200/50 hover:border-slate-400 text-slate-500 hover:text-slate-700 font-medium transition-all text-xs flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          )}
        </div>
      )}
    </div>
  );
}
