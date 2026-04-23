import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="bg-sky-50 opacity-50 border border-sky-300 rounded-md p-4 mb-3"
      >
        <span className="invisible">{task.title}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-3 cursor-grab active:cursor-grabbing flex flex-col gap-2`}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="font-semibold text-sm text-gray-800 leading-tight">{task.title}</p>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          Core
        </span>
      </div>
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
    </div>
  );
}
