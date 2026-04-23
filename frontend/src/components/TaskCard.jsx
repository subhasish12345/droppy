import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import TaskModal from "./TaskModal";

export default function TaskCard({ task, canEdit }) {
  const [modalOpen, setModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
    // Only allow drag if editor
    disabled: !canEdit,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-[var(--color-primary-light)] opacity-60 border-2 border-dashed rounded-xl p-4 mb-2"
        style={{ ...style, borderColor: "var(--color-primary)" }}
      >
        <span className="invisible text-sm font-semibold">{task.title}</span>
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all mb-2 group flex items-start gap-1 pr-3"
      >
        {/* Drag Handle — only visible if can edit */}
        {canEdit && (
          <button
            {...attributes}
            {...listeners}
            className="flex-shrink-0 flex items-center justify-center w-6 h-full py-4 pl-2 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
          >
            <GripVertical size={14} />
          </button>
        )}

        {/* Card Content — click to open modal */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex-1 py-3 text-left min-w-0"
        >
          <p className="font-semibold text-sm text-slate-800 leading-tight">{task.title}</p>
          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
          )}
          {task.dueDate && (
            <p className="text-xs text-amber-600 mt-1.5 font-medium">
              📅 {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </button>
      </div>

      {modalOpen && (
        <TaskModal
          task={task}
          listId={task.listId}
          onClose={() => setModalOpen(false)}
          canEdit={canEdit}
        />
      )}
    </>
  );
}
