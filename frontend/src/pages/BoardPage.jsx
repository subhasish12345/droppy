import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import socket from "../api/socket";
import { useBoardStore } from "../store/boardStore";
import Board from "../components/Board";
import GuestBanner from "../components/GuestBanner";
import { ArrowLeft, Share2, Copy, Check } from "lucide-react";

export default function BoardPage() {
  const { id: boardId } = useParams();
  const { board, setBoard } = useBoardStore();
  const [loading, setLoading] = useState(true);
  const [presence, setPresence] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await api.get(`/boards/${boardId}`);
        setBoard(res.data);
      } catch (err) {
        console.error("Failed to load project board", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();

    // Socket Setup
    socket.emit("join-board", boardId);

    const handleTaskMoved = (data) => {
      useBoardStore.getState().syncTaskMove(data.taskId, data.sourceListId, data.listId, data.position);
    };

    const handleTaskAdded = (task) => {
      useBoardStore.getState().syncTaskAdd(task);
    };

    const handleListAdded = (list) => {
      useBoardStore.getState().syncListAdd(list);
    };

    const handlePresence = (count) => {
      setPresence(count);
    };

    socket.on("task:moved", handleTaskMoved);
    socket.on("task:added", handleTaskAdded);
    socket.on("list:added", handleListAdded);
    socket.on("presence:update", handlePresence);

    return () => {
      socket.off("task:moved", handleTaskMoved);
      socket.off("task:added", handleTaskAdded);
      socket.off("list:added", handleListAdded);
      socket.off("presence:update", handlePresence);
    };
  }, [setBoard, boardId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(boardId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-slate-300 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="p-6 bg-white border border-red-200 rounded-2xl shadow-sm text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Room Unavailable</h2>
          <p className="text-slate-500 mb-6">You don't have access to this room, it requires a password, or it was deleted.</p>
          <Link to="/" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden">
      <GuestBanner />
      {/* Premium Header */}
      <header className="p-4 border-b bg-white shrink-0 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-none">{board.name}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                Real-Time
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                {presence} online
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 pr-3">
            <button 
              onClick={copyToClipboard}
              className="p-1.5 bg-white shadow-sm border border-slate-200 rounded-md text-slate-500 hover:text-indigo-600 transition-colors mr-2"
              title="Copy Room ID"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
            <span className="text-xs font-mono text-slate-500">{boardId}</span>
          </div>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-medium hover:bg-indigo-100 transition-colors text-sm"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">{copied ? "Copied ID!" : "Share Room"}</span>
          </button>
        </div>
      </header>

      {/* Main Board Area */}
      <main className="flex-1 overflow-hidden">
        <Board />
      </main>
    </div>
  );
}
