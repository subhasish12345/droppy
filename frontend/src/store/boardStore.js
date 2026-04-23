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

    // 1. OPTIMISTIC UPDATE: Instant UI transition
    get().syncTaskMove(taskId, sourceListId, targetListId, newPosition);

    // 2. SOCKET BROADCAST
    socket.emit("task:move", {
      boardId: previousBoard.id,
      taskId,
      sourceListId,
      listId: targetListId,
      position: newPosition,
    });

    // 3. BACKGROUND API SYNC
    try {
      await api.patch(`/tasks/${taskId}/move`, {
        boardId: previousBoard.id,
        listId: targetListId,
        position: newPosition,
      });
    } catch (err) {
      console.error("Failed to sync move, reverting layout", err);
      // REVERT CACHE ON FAILURE
      set({ board: previousBoard });
    }
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

    // Broadcast creation
    socket.emit("task:add", { boardId: previousBoard.id, task: newTask });

    try {
      const res = await api.post("/tasks", { listId, title, description: "", position, boardId: previousBoard.id });
      
      // Update with real ID from backend
      set((state) => {
        const newBoard = JSON.parse(JSON.stringify(state.board));
        const list = newBoard.lists.find((l) => l.id === listId);
        if (list) {
          const task = list.tasks.find((t) => t.id === tempId);
          if (task) Object.assign(task, res.data);
        }
        return { board: newBoard };
      });
    } catch (err) {
      console.error("Failed to add task", err);
      set({ board: previousBoard });
    }
  },

  addList: async (title) => {
    const previousBoard = get().board;
    if (!previousBoard) return;

    const tempId = `temp-list-${Date.now()}`;
    let position = 1;
    if (previousBoard.lists.length > 0) {
      position = previousBoard.lists[previousBoard.lists.length - 1].position + 1;
    }

    const newList = {
      id: tempId,
      title,
      position,
      tasks: [],
    };

    // Optimistic Add
    set((state) => {
      const newBoard = JSON.parse(JSON.stringify(state.board));
      newBoard.lists.push(newList);
      return { board: newBoard };
    });

    // Broadcast creation
    socket.emit("list:add", { boardId: previousBoard.id, list: newList });

    try {
      const res = await api.post("/lists", { title, position, boardId: previousBoard.id });
      
      // Update with real ID from backend
      set((state) => {
        const newBoard = JSON.parse(JSON.stringify(state.board));
        const list = newBoard.lists.find((l) => l.id === tempId);
        if (list) Object.assign(list, res.data);
        return { board: newBoard };
      });
    } catch (err) {
      console.error("Failed to add list", err);
      set({ board: previousBoard });
    }
  },
}));
