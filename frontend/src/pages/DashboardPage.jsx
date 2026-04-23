import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { Plus, Users, Lock, ChevronRight, Trash2, LayoutDashboard, Home, Settings } from "lucide-react";
import GuestBanner from "../components/GuestBanner";
import ProfileMenu from "../components/ProfileMenu";
import SettingsModal from "../components/SettingsModal";

// Live Clock Component
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <div className="text-center select-none">
      <div className="text-6xl font-black text-slate-800 tracking-tight leading-none">{time}</div>
      <div className="text-slate-500 font-medium mt-2 text-lg">{date}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Create form
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardPassword, setNewBoardPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Join form
  const [joinBoardId, setJoinBoardId] = useState("");
  const [joinBoardPassword, setJoinBoardPassword] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => { fetchBoards(); }, []);

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
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await api.post("/boards", { name: newBoardName, password: newBoardPassword || undefined });
      navigate(`/b/${res.data.id}`);
    } catch (err) {
      console.error("Failed to create board");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinBoard = async (e) => {
    e.preventDefault();
    if (isJoining) return;
    setJoinError("");
    setIsJoining(true);
    try {
      await api.post(`/boards/${joinBoardId}/join`, { password: joinBoardPassword || undefined });
      navigate(`/b/${joinBoardId}`);
    } catch (err) {
      setJoinError(err.response?.data?.error || "Failed to join board");
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeleteBoard = async (e, boardId) => {
    e.preventDefault();
    if (!window.confirm("Delete this room? This cannot be undone.")) return;
    try {
      await api.delete(`/boards/${boardId}`);
      setBoards(boards.filter((b) => b.id !== boardId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete board.");
    }
  };

  const recentBoards = [...boards].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-100">
      <GuestBanner />

      {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
      <aside className="w-20 shrink-0 flex flex-col items-center py-4 gap-1 border-r border-slate-200 bg-white z-10">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md mb-3 bg-white overflow-hidden p-1">
          <img src="/logo.png" alt="Droppy" className="w-full h-full object-contain" />
        </div>

        {/* Nav Items */}
        {[
          { id: "home",   icon: Home,            label: "Home" },
          { id: "boards", icon: LayoutDashboard, label: "Boards" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveNav(id)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl gap-1 text-xs font-semibold transition-all ${
              activeNav === id
                ? "text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100"
            }`}
            style={activeNav === id ? { background: "var(--color-primary)" } : {}}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Settings at bottom */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-xl gap-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-all"
        >
          <Settings size={20} />
          Settings
        </button>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold text-slate-800">
            {activeNav === "home" ? "Home" : "Your Boards"}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsJoinOpen(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl font-medium hover:bg-slate-50 transition-all text-sm shadow-sm"
            >
              <Users size={16} /> Join Room
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 text-white px-3 py-2 rounded-xl font-medium transition-all text-sm shadow-sm hover:brightness-110"
              style={{ background: "var(--color-primary)" }}
            >
              <Plus size={16} /> New Room
            </button>
            <ProfileMenu />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">

          {/* ── HOME TAB ── */}
          {activeNav === "home" && (
            <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

              {/* Clock hero */}
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col items-center">
                <LiveClock />
                <p className="mt-4 text-slate-500 text-sm">Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span> 👋</p>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="group flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left"
                    style={{ borderLeftWidth: "4px", borderLeftColor: "var(--color-primary)" }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform" style={{ background: "var(--color-primary)" }}>
                      <Plus size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">New Room</p>
                      <p className="text-sm text-slate-500">Create a workspace</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsJoinOpen(true)}
                    className="group flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left"
                    style={{ borderLeftWidth: "4px", borderLeftColor: "#0d9488" }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-teal-500 shadow-md group-hover:scale-105 transition-transform">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Join Room</p>
                      <p className="text-sm text-slate-500">Enter with an ID</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Rooms",   value: boards.length,                              color: "bg-indigo-50 text-indigo-700" },
                  { label: "Recent",        value: recentBoards.length,                        color: "bg-teal-50 text-teal-700" },
                  { label: "Member Since",  value: user ? new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—", color: "bg-rose-50 text-rose-700" },
                ].map((s) => (
                  <div key={s.label} className={`rounded-2xl p-4 ${s.color} border border-white`}>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-xs font-semibold mt-1 opacity-70">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Rooms */}
              {recentBoards.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Rooms</h2>
                    <button onClick={() => setActiveNav("boards")} className="text-xs font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                      View all →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentBoards.map((board) => (
                      <Link
                        key={board.id}
                        to={`/b/${board.id}`}
                        className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 border border-slate-100 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ background: "var(--color-primary)" }}>
                            {board.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-[var(--color-primary)] transition-colors">{board.name}</p>
                            <p className="text-xs text-slate-400">Created {new Date(board.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-[var(--color-primary)] transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BOARDS TAB ── */}
          {activeNav === "boards" && (
            <div className="max-w-6xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Your Workspaces</h2>
                  <p className="text-slate-500 mt-1 text-sm">Manage and access your real-time collaboration boards.</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin w-8 h-8 rounded-full border-4 border-slate-200" style={{ borderTopColor: "var(--color-primary)" }} />
                </div>
              ) : boards.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{ background: "var(--color-primary-light)" }}>
                    <Plus size={28} style={{ color: "var(--color-primary)" }} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No rooms yet</h3>
                  <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">Create a new workspace or join an existing one to get started.</p>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="mt-6 px-6 py-3 rounded-2xl text-white font-semibold shadow-md hover:brightness-110 transition-all"
                    style={{ background: "var(--color-primary)" }}
                  >
                    Create your first room
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {boards.map((board) => (
                    <Link
                      key={board.id}
                      to={`/b/${board.id}`}
                      className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col gap-4"
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm" style={{ background: "var(--color-primary)" }}>
                          {board.name.charAt(0).toUpperCase()}
                        </div>
                        <button
                          onClick={(e) => handleDeleteBoard(e, board.id)}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-base group-hover:text-[var(--color-primary)] transition-colors">{board.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">Real-time collaboration</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                          {new Date(board.createdAt).toLocaleDateString()}
                        </span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-[var(--color-primary-light)] transition-colors">
                          <ChevronRight size={14} className="text-slate-400 group-hover:text-[var(--color-primary)] transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS ─────────────────────────────────────────── */}
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
                  type="text" required autoFocus placeholder="e.g. Engineering Sync"
                  value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ "--tw-ring-color": "var(--color-primary)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Lock size={14} className="text-slate-400" /> Password <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="password" placeholder="Leave blank for public room"
                  value={newBoardPassword} onChange={(e) => setNewBoardPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsCreateOpen(false)} disabled={isCreating} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isCreating} className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all shadow-sm disabled:opacity-50 hover:brightness-110" style={{ background: "var(--color-primary)" }}>
                  {isCreating ? "Creating…" : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isJoinOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Join a Room</h3>
              <button onClick={() => setIsJoinOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleJoinBoard} className="p-6 space-y-4">
              {joinError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">{joinError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room ID</label>
                <input
                  type="text" required autoFocus placeholder="Paste the room ID here"
                  value={joinBoardId} onChange={(e) => setJoinBoardId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Lock size={14} className="text-slate-400" /> Room Password
                </label>
                <input
                  type="password" placeholder="Enter password if required"
                  value={joinBoardPassword} onChange={(e) => setJoinBoardPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsJoinOpen(false)} disabled={isJoining} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isJoining} className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all shadow-sm disabled:opacity-50 hover:brightness-110" style={{ background: "var(--color-primary)" }}>
                  {isJoining ? "Joining…" : "Join Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
