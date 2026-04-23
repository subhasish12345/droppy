import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { LogOut, Plus, Users, Lock, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  
  // Create form
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardPassword, setNewBoardPassword] = useState("");
  
  // Join form
  const [joinBoardId, setJoinBoardId] = useState("");
  const [joinBoardPassword, setJoinBoardPassword] = useState("");
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await api.get("/boards");
      setBoards(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/boards", {
        name: newBoardName,
        password: newBoardPassword || undefined,
      });
      navigate(`/b/${res.data.id}`);
    } catch (err) {
      console.error("Failed to create board");
    }
  };

  const handleJoinBoard = async (e) => {
    e.preventDefault();
    setJoinError("");
    try {
      await api.post(`/boards/${joinBoardId}/join`, {
        password: joinBoardPassword || undefined,
      });
      navigate(`/b/${joinBoardId}`);
    } catch (err) {
      setJoinError(err.response?.data?.error || "Failed to join board");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Droppy</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Workspaces</h2>
            <p className="text-slate-500 mt-1">Manage and access your real-time collaboration boards.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsJoinOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <Users size={18} />
              Join Room
            </button>
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-sm"
            >
              <Plus size={18} />
              New Room
            </button>
          </div>
        </div>

        {/* Board Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
          </div>
        ) : boards.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No rooms yet</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Create a new workspace or join an existing one using an invite code to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link 
                key={board.id} 
                to={`/b/${board.id}`}
                className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col h-40"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{board.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">Real-time collaboration</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {new Date(board.createdAt).toLocaleDateString()}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Create New Room</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreateBoard} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Engineering Sync"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Lock size={14} className="text-slate-400" />
                  Room Password <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="password"
                  placeholder="Leave blank for public room"
                  value={newBoardPassword}
                  onChange={(e) => setNewBoardPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {isJoinOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Join a Room</h3>
              <button onClick={() => setIsJoinOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleJoinBoard} className="p-6 space-y-4">
              {joinError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                  {joinError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room ID</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Paste the room ID here"
                  value={joinBoardId}
                  onChange={(e) => setJoinBoardId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Lock size={14} className="text-slate-400" />
                  Room Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password if required"
                  value={joinBoardPassword}
                  onChange={(e) => setJoinBoardPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsJoinOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm">Join Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center">
        <p className="text-sm text-slate-500">
          Powered by <span className="font-semibold text-indigo-600">Antigravity</span>
        </p>
      </footer>
    </div>
  );
}
