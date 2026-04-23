import React, { useMemo, useState, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import Column from "./Column";
import TaskCard from "./TaskCard";
import { useBoardStore } from "../store/boardStore";

export default function Board({ canEdit = true }) {
  const [isAddingList, setIsAddingList] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const { board, moveTask, addList } = useBoardStore();
  const [activeTask, setActiveTask] = useState(null);

  // We track drag state in a ref so onDragOver can write and onDragEnd can read
  // without stale closures.
  const dragInfo = useRef({
    taskId: null,
    sourceListId: null,
    targetListId: null,
  });

  const handleAddList = (e) => {
    e.preventDefault();
    if (!listTitle.trim()) {
      setIsAddingList(false);
      return;
    }
    addList(listTitle);
    setListTitle("");
    setIsAddingList(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const lists = board?.lists || [];
  const listIds = useMemo(() => lists.map((l) => l.id), [lists]);

  // ─── DRAG START ──────────────────────────────────────────────────────────────
  const onDragStart = ({ active }) => {
    if (active.data.current?.type !== "Task") return;
    const task = active.data.current.task;
    setActiveTask(task);
    dragInfo.current = {
      taskId: task.id,
      sourceListId: task.listId,
      targetListId: task.listId, // default to same list
    };
  };

  // ─── DRAG OVER ───────────────────────────────────────────────────────────────
  // This is the key missing handler. It fires continuously while dragging.
  // We use it to track the current target list so onDragEnd knows where to drop.
  const onDragOver = ({ active, over }) => {
    if (!over) return;
    if (active.data.current?.type !== "Task") return;

    let newTargetListId;

    if (over.data.current?.type === "Column") {
      newTargetListId = over.id;
    } else if (over.data.current?.type === "Task") {
      newTargetListId = over.data.current.task.listId;
    } else {
      return;
    }

    dragInfo.current.targetListId = newTargetListId;
  };

  // ─── DRAG END ────────────────────────────────────────────────────────────────
  const onDragEnd = ({ active, over }) => {
    setActiveTask(null);

    if (!over) {
      dragInfo.current = { taskId: null, sourceListId: null, targetListId: null };
      return;
    }

    const { taskId, sourceListId, targetListId } = dragInfo.current;
    dragInfo.current = { taskId: null, sourceListId: null, targetListId: null };

    if (!taskId || !targetListId) return;

    // Find target list
    const targetList = lists.find((l) => l.id === targetListId);
    if (!targetList) return;

    // Build final task order for target column (exclude the dragged task first)
    const tasksInTarget = targetList.tasks.filter((t) => t.id !== taskId);

    // Find where in the target list we're dropping
    let dropIndex = tasksInTarget.length; // default: end of list

    if (over.data.current?.type === "Task" && over.data.current.task.listId === targetListId) {
      const overIndex = tasksInTarget.findIndex((t) => t.id === over.id);
      if (overIndex !== -1) dropIndex = overIndex;
    }

    // ── Float position math ──
    let newPosition;
    if (tasksInTarget.length === 0) {
      newPosition = 65536; // midpoint of 0–131072 range
    } else if (dropIndex === 0) {
      newPosition = tasksInTarget[0].position / 2;
    } else if (dropIndex >= tasksInTarget.length) {
      newPosition = tasksInTarget[tasksInTarget.length - 1].position + 65536;
    } else {
      newPosition =
        (tasksInTarget[dropIndex - 1].position + tasksInTarget[dropIndex].position) / 2;
    }

    // No-op if nothing changed
    if (sourceListId === targetListId) {
      const sourceList = lists.find((l) => l.id === sourceListId);
      const currentIndex = sourceList?.tasks.findIndex((t) => t.id === taskId);
      if (currentIndex === dropIndex || currentIndex === dropIndex - 1) return;
    }

    moveTask(taskId, sourceListId, targetListId, newPosition);
  };

  if (!board) return null;

  return (
    <div className="flex gap-6 overflow-x-auto p-6 h-full items-start">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
          {lists.map((list) => (
            <Column key={list.id} list={list} canEdit={canEdit} />
          ))}
        </SortableContext>

        {/* Add Column — only for editors */}
        {canEdit && (
        <div className="shrink-0 w-[290px]">
          {isAddingList ? (
            <form onSubmit={handleAddList} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
              <input
                type="text"
                autoFocus
                placeholder="Column title..."
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                className="w-full text-sm outline-none bg-white border border-indigo-200 px-3 py-2 rounded-xl placeholder:text-slate-400 text-slate-700 font-medium shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsAddingList(false);
                    setListTitle("");
                  }
                }}
              />
              <div className="flex items-center justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingList(false);
                    setListTitle("");
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Add Column
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="w-full border-2 border-dashed border-slate-300/70 rounded-2xl py-3 hover:bg-slate-100 hover:border-slate-400 text-slate-500 hover:text-slate-700 font-medium transition-all text-sm flex items-center justify-center gap-2 h-[60px]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Column
            </button>
          )}
        </div>
        )}

        {createPortal(
          <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}
