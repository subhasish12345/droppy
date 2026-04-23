import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import { useBoardStore } from "../store/boardStore";

export default function Column({ list }) {
  const { addTask } = useBoardStore();
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");

  // Setup droppable region for this specific list (so we can drop on empty lists)
  const { setNodeRef } = useDroppable({
    id: list.id,
    data: {
      type: "Column",
      list,
    },
  });

  // Extract task ids for SortableContext
  const taskIds = list.tasks.map((t) => t.id);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setIsAdding(false);
      return;
    }
    addTask(list.id, taskTitle);
    setTaskTitle("");
    setIsAdding(false);
  };

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 w-[290px] shrink-0 flex flex-col shadow-sm">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-2 pt-1 pointer-events-none">
        <h2 className="font-semibold text-sm text-slate-700 tracking-wide">{list.title}</h2>
        <span className="text-xs font-medium bg-white text-slate-500 px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
          {list.tasks.length}
        </span>
      </div>

      {/* Droppable Area */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[120px] px-1 py-1">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {list.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      {/* Quick Add Button / Inline Input */}
      <div className="mt-2 px-1">
        {isAdding ? (
          <form onSubmit={handleAddTask} className="flex flex-col gap-2 bg-white p-3 rounded-xl shadow-sm border border-indigo-200">
            <input
              type="text"
              autoFocus
              placeholder="What needs to be done?"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-700 font-medium"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setTaskTitle("");
                }
              }}
            />
            <div className="flex items-center justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setTaskTitle("");
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Add
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
    </div>
  );
}
