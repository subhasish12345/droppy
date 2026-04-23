import { create } from "zustand";
import api from "../api/axios";
import socket from "../api/socket";

export const useBoardStore = create((set, get) => ({
  board: null,
  setBoard: (data) => set({ board: data }),

  // Catch socket broadcast from another client
  syncTaskMove: (taskId, sourceListId, targetListId, newPosition) => {
    set((state) => {
      if (!state.board) return state;
      const newBoard = JSON.parse(JSON.stringify(state.board));
      let taskToMove = null;

      const sourceList = newBoard.lists.find((l) => l.id === sourceListId);
      if (sourceList) {
        const taskIdx = sourceList.tasks.findIndex((t) => t.id === taskId);
        if (taskIdx !== -1) taskToMove = sourceList.tasks.splice(taskIdx, 1)[0];
      }

      if (taskToMove) {
        taskToMove.position = newPosition;
        taskToMove.listId = targetListId;
        const targetList = newBoard.lists.find((l) => l.id === targetListId);
        if (targetList) {
          targetList.tasks.push(taskToMove);
          targetList.tasks.sort((a, b) => a.position - b.position);
        }
      }

      return { board: newBoard };
    });
  },

  syncTaskAdd: (task) => {
    set((state) => {
      if (!state.board) return state;
      const newBoard = JSON.parse(JSON.stringify(state.board));
      const list = newBoard.lists.find((l) => l.id === task.listId);
      if (list && !list.tasks.find((t) => t.id === task.id)) {
        list.tasks.push(task);
        list.tasks.sort((a, b) => a.position - b.position);
      }
      return { board: newBoard };
    });
  },

  syncListAdd: (list) => {
    set((state) => {
      if (!state.board) return state;
      const newBoard = JSON.parse(JSON.stringify(state.board));
      if (!newBoard.lists.find((l) => l.id === list.id)) {
        newBoard.lists.push(list);
        newBoard.lists.sort((a, b) => a.position - b.position);
      }
      return { board: newBoard };
    });
  },

  // Optimistic UI move logic called instantly upon drop by the local user
  moveTask: async (taskId, sourceListId, targetListId, newPosition) => {
    const previousBoard = get().board;
    if (!previousBoard) return;

    // 1. INSTANT optimistic UI update (no waiting)
    get().syncTaskMove(taskId, sourceListId, targetListId, newPosition);

    // 2. INSTANT socket broadcast to other users
    socket.emit("task:move", {
      boardId: previousBoard.id,
      taskId,
      sourceListId,
      listId: targetListId,
      position: newPosition,
    });

    // 3. Fire-and-forget background DB sync — UI never waits for this
    api.patch(`/tasks/${taskId}/move`, {
      boardId: previousBoard.id,
      listId: targetListId,
      position: newPosition,
    }).catch((err) => {
      // Only revert on actual failure
      console.error("Move sync failed, reverting", err);
      set({ board: previousBoard });
    });
  },

  addTask: async (listId, title) => {
    const previousBoard = get().board;
    if (!previousBoard) return;

    const tempId = `temp-${Date.now()}`;
    const targetList = previousBoard.lists.find((l) => l.id === listId);
    let position = 1;
    if (targetList && targetList.tasks.length > 0) {
      position = targetList.tasks[targetList.tasks.length - 1].position + 1;
    }

    const newTask = {
      id: tempId,
      title,
      description: "",
      position,
      listId,
    };

    // Optimistic Add
    set((state) => {
      const newBoard = JSON.parse(JSON.stringify(state.board));
      const list = newBoard.lists.find((l) => l.id === listId);
      if (list) list.tasks.push(newTask);
      return { board: newBoard };
    });

    // Broadcast creation (instant, no wait)
    socket.emit("task:add", { boardId: previousBoard.id, task: newTask });

    // Background DB sync - replace temp ID with real one when ready
    api.post("/tasks", { listId, title, description: "", position, boardId: previousBoard.id })
      .then((res) => {
        set((state) => {
          const newBoard = JSON.parse(JSON.stringify(state.board));
          const list = newBoard.lists.find((l) => l.id === listId);
          if (list) {
            const task = list.tasks.find((t) => t.id === tempId);
            if (task) Object.assign(task, res.data);
          }
          return { board: newBoard };
        });
      })
      .catch((err) => {
        console.error("Failed to add task", err);
        set({ board: previousBoard });
      });
  },

  addList: async (title) => {
    const previousBoard = get().board;
    if (!previousBoard) return;

    const tempId = `temp-list-${Date.now()}`;
    let position = 1;
    if (previousBoard.lists.length > 0) {
      position = previousBoard.lists[previousBoard.lists.length - 1].position + 1;
    }

    const newList = { id: tempId, title, position, tasks: [] };

    set((state) => {
      const newBoard = JSON.parse(JSON.stringify(state.board));
      newBoard.lists.push(newList);
      return { board: newBoard };
    });

    socket.emit("list:add", { boardId: previousBoard.id, list: newList });

    api.post("/lists", { title, position, boardId: previousBoard.id })
      .then((res) => {
        set((state) => {
          const newBoard = JSON.parse(JSON.stringify(state.board));
          const list = newBoard.lists.find((l) => l.id === tempId);
          if (list) Object.assign(list, res.data);
          return { board: newBoard };
        });
      })
      .catch((err) => {
        console.error("Failed to add list", err);
        set({ board: previousBoard });
      });
  },

  // ── RENAME LIST ───────────────────────────────────────────────
  renameList: (listId, newTitle) => {
    const previousBoard = get().board;
    if (!previousBoard) return;

    // Optimistic
    set((state) => {
      const newBoard = JSON.parse(JSON.stringify(state.board));
      const list = newBoard.lists.find((l) => l.id === listId);
      if (list) list.title = newTitle;
      return { board: newBoard };
    });

    socket.emit("list:rename", { boardId: previousBoard.id, listId, title: newTitle });

    api.patch(`/lists/${listId}`, { boardId: previousBoard.id, title: newTitle })
      .catch((err) => {
        console.error("Failed to rename list", err);
        set({ board: previousBoard });
      });
  },

  // ── DELETE LIST ───────────────────────────────────────────────
  deleteList: (listId) => {
    const previousBoard = get().board;
    if (!previousBoard) return;

    // Optimistic
    set((state) => {
      const newBoard = JSON.parse(JSON.stringify(state.board));
      newBoard.lists = newBoard.lists.filter((l) => l.id !== listId);
      return { board: newBoard };
    });

    socket.emit("list:delete", { boardId: previousBoard.id, listId });

    api.delete(`/lists/${listId}`, { data: { boardId: previousBoard.id } })
      .catch((err) => {
        console.error("Failed to delete list", err);
        set({ board: previousBoard });
      });
  },

  // ── UPDATE TASK (title + description) ─────────────────────────
  updateTask: (taskId, listId, changes) => {
    const previousBoard = get().board;
    if (!previousBoard) return;

    set((state) => {
      const newBoard = JSON.parse(JSON.stringify(state.board));
      const list = newBoard.lists.find((l) => l.id === listId);
      if (list) {
        const task = list.tasks.find((t) => t.id === taskId);
        if (task) Object.assign(task, changes);
      }
      return { board: newBoard };
    });

    socket.emit("task:update", { boardId: previousBoard.id, taskId, listId, changes });

    api.patch(`/tasks/${taskId}`, { boardId: previousBoard.id, ...changes })
      .catch((err) => {
        console.error("Failed to update task", err);
        set({ board: previousBoard });
      });
  },

  // ── DELETE TASK ───────────────────────────────────────────────
  deleteTask: (taskId, listId) => {
    const previousBoard = get().board;
    if (!previousBoard) return;

    set((state) => {
      const newBoard = JSON.parse(JSON.stringify(state.board));
      const list = newBoard.lists.find((l) => l.id === listId);
      if (list) list.tasks = list.tasks.filter((t) => t.id !== taskId);
      return { board: newBoard };
    });

    socket.emit("task:delete", { boardId: previousBoard.id, taskId, listId });

    api.delete(`/tasks/${taskId}`, { data: { boardId: previousBoard.id } })
      .catch((err) => {
        console.error("Failed to delete task", err);
        set({ board: previousBoard });
      });
  },
}));

