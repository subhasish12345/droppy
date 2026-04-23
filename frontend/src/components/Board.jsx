import React, { useMemo, useState } from "react";
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import Column from "./Column";
import TaskCard from "./TaskCard";
import { useBoardStore } from "../store/boardStore";

export default function Board() {
  const [isAddingList, setIsAddingList] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const { board, moveTask, addList } = useBoardStore();
  const [activeTask, setActiveTask] = useState(null);

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
        distance: 5, // Requires minimum 5px drag before activating (fixes click bugs)
      },
    })
  );

  const lists = board?.lists || [];
  const listIds = useMemo(() => lists.map((l) => l.id), [lists]);

  const onDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === "Task") {
      setActiveTask(active.data.current.task);
    }
  };

  const onDragEnd = (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    // Detect what we dropped on
    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return; // For now we only drag tasks

    const activeTaskData = active.data.current.task;
    const sourceListId = activeTaskData.listId;

    let targetListId;
    let targetTasksArr = [];
    let dropIndex = -1;

    // SCENARIO 1: Dropped onto another Task
    if (isOverTask) {
      targetListId = over.data.current.task.listId;
      const targetList = lists.find((l) => l.id === targetListId);
      targetTasksArr = targetList ? [...targetList.tasks] : [];
      
      // If same list, filter active out first to calculate accurate index
      if (sourceListId === targetListId) {
        targetTasksArr = targetTasksArr.filter(t => t.id !== activeId);
      }
      
      const overIndex = targetList.tasks.findIndex((t) => t.id === overId);
      dropIndex = overIndex;
    } 
    // SCENARIO 2: Dropped onto an empty Column
    else if (isOverColumn) {
      targetListId = over.id;
      const targetList = lists.find((l) => l.id === targetListId);
      targetTasksArr = targetList ? [...targetList.tasks] : [];
      if (sourceListId === targetListId) {
        targetTasksArr = targetTasksArr.filter(t => t.id !== activeId);
      }
      dropIndex = targetTasksArr.length; // Drop at very end
    } 
    else {
      return; // Unknown drop target
    }

    // --- APPLY FLOAT MATH LOGIC --- //
    let newPosition = 1;
    if (targetTasksArr.length === 0) {
      newPosition = 1; // Empty column
    } else if (dropIndex === 0) {
      // Drop top
      newPosition = targetTasksArr[0].position / 2;
    } else if (dropIndex >= targetTasksArr.length) {
      // Drop bottom
      newPosition = targetTasksArr[targetTasksArr.length - 1].position + 1;
    } else {
      // Drop middle
      const prevPosition = targetTasksArr[dropIndex - 1].position;
      const nextPosition = targetTasksArr[dropIndex].position;
      newPosition = (prevPosition + nextPosition) / 2;
    }

    // Trigger explicit optimistic sequence
    moveTask(activeId, sourceListId, targetListId, newPosition);
  };

  if (!board) return null;

  return (
    <div className="flex gap-6 overflow-x-auto p-6 h-full items-start">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
          {lists.map((list) => (
            <Column key={list.id} list={list} />
          ))}
        </SortableContext>

        {/* Add Column Button / Inline Input */}
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

        {createPortal(
          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}
