import { useEffect, useState } from "react";
import axios from "axios";
import InviteUser from "./InviteUser";

const API_URL = import.meta.env.VITE_API_URL;

export default function NotesDashboard({ token, user, onLogout }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [noteLimitReached, setNoteLimitReached] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
      const tenantRes = await axios.get(`${API_URL}/tenants/${user.tenant}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const plan = tenantRes.data.plan;
      setNoteLimitReached(plan === "free" && res.data.length >= 3);
    } catch (err) {
      setError("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post(
        `${API_URL}/notes`,
        { title, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTitle("");
      setContent("");
      fetchNotes();
    } catch (err) {
      if (err.response?.data?.error?.includes("Upgrade")) {
        setNoteLimitReached(true);
      }
      setError(err.response?.data?.error || "Failed to create note");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await axios.delete(`${API_URL}/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err) {
      setError("Failed to delete note");
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError("");
    try {
      await axios.post(
        `${API_URL}/tenants/${user.tenant}/upgrade`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchNotes();
    } catch (err) {
      setError("Upgrade failed");
    }
    setUpgrading(false);
  };

  const startEdit = (note) => {
    setEditId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleEditSave = async (id) => {
    setError("");
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/notes/${id}`,
        { title: editTitle, content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cancelEdit();
      fetchNotes();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 text-white grid place-items-center shadow-sm">
              ND
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Notes Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                {user.email} • {user.role} • Tenant:{" "}
                <span className="font-medium">{user.tenant}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {noteLimitReached && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md">
                Limit reached
                {user.role === "admin" && (
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="ml-1 inline-flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {upgrading ? "Upgrading..." : "Upgrade"}
                  </button>
                )}
              </div>
            )}
            {user.role === "admin" && (
              <button
                onClick={() => setShowInvite(true)}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 shadow-sm"
              >
                Invite User
              </button>
            )}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {noteLimitReached && (
          <div className="sm:hidden mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
            <div className="flex items-center justify-between">
              <span>Note limit reached. Upgrade to create more.</span>
              {user.role === "admin" && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="ml-3 inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {upgrading ? "Upgrading..." : "Upgrade"}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                <h2 className="text-sm font-medium text-slate-700">
                  Create a note
                </h2>
              </div>
              <form onSubmit={handleCreate} className="p-5 flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Note title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Write your note..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px]"
                />
                <button
                  type="submit"
                  disabled={noteLimitReached}
                  className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Note
                </button>
              </form>
            </div>
          </section>

          {/* Notes list */}
          <section className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between">
                <h2 className="text-sm font-medium text-slate-700">
                  Your notes
                </h2>
                {loading && (
                  <span className="text-xs text-slate-500">Loading…</span>
                )}
              </div>
              <div className="max-h-[540px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-slate-500">
                    Loading notes...
                  </div>
                ) : notes.length === 0 ? (
                  <div className="p-10 text-center text-slate-500">
                    <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-100 grid place-items-center text-slate-400">
                      📝
                    </div>
                    No notes yet. Create your first note from the left.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {notes.map((note) => (
                      <li
                        key={note._id}
                        className="px-5 py-4 hover:bg-slate-50 transition"
                      >
                        {editId === note._id ? (
                          <div className="flex flex-col gap-3">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Edit title"
                            />
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                              placeholder="Edit content"
                              rows={3}
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditSave(note._id)}
                                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 disabled:opacity-50"
                                disabled={loading}
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="inline-flex items-center rounded-md bg-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-300 disabled:opacity-50"
                                disabled={loading}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="truncate text-slate-800 font-medium">
                                  {note.title}
                                </h3>
                                <span className="text-xs text-slate-400">
                                  •
                                </span>
                                <span className="text-xs text-slate-500">
                                  {note.createdBy?.name ||
                                    note.createdBy?.email ||
                                    "Unknown"}
                                </span>
                              </div>
                              <p className="mt-1 text-slate-600 break-words whitespace-pre-wrap">
                                {note.content}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              {editId !== note._id && (
                                <button
                                  className="rounded-md bg-amber-400 px-3 py-1.5 text-white hover:bg-amber-500"
                                  onClick={() => startEdit(note)}
                                  disabled={loading}
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                className="rounded-md bg-red-500 px-3 py-1.5 text-white hover:bg-red-600"
                                onClick={() => handleDelete(note._id)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      {/* Invite Modal */}
      {showInvite && user.role === "admin" && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative">
            <button
              aria-label="Close invite"
              onClick={() => setShowInvite(false)}
              className="absolute -top-3 -right-3 rounded-full bg-white shadow p-1 text-slate-600 hover:bg-slate-50"
            >
              ✕
            </button>
            <InviteUser token={token} user={user} variant="modal" />
          </div>
        </div>
      )}
    </div>
  );
}
