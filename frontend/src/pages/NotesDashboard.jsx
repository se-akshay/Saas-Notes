import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

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

  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
      // Always check latest tenant plan from backend
      const tenantRes = await axios.get(`${API_URL}/tenants/${user.tenant}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const plan = tenantRes.data.plan;
      setNoteLimitReached(plan === "free" && res.data.length >= 3);
    } catch (err) {
      setError("Failed to fetch notes");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
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
      // After upgrade, re-fetch notes and tenant info for all users
      await fetchNotes();
    } catch (err) {
      setError("Upgrade failed");
    }
    setUpgrading(false);
  };

  // Edit functionality
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
    <div className="max-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8 flex flex-col sm:flex-row gap-8">
        {/* Left Box */}
        <div className="flex-1 flex flex-col justify-start">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
            Notes Dashboard
          </h2>
          <div className="mb-6">
            <div className="text-blue-700 mb-2">
              Logged in as <b>{user.email}</b> ({user.role}) | Tenant:{" "}
              <b>{user.tenant}</b>
            </div>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 mb-6">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-blue-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="border border-blue-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={noteLimitReached}
              className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${
                noteLimitReached ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Create Note
            </button>
          </form>
          {noteLimitReached && (
            <div className="bg-blue-100 text-blue-700 rounded p-3 mb-4 text-center">
              Note limit reached. Upgrade to Pro to create more notes.
              {user.role === "admin" && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                >
                  {upgrading ? "Upgrading..." : "Upgrade to Pro"}
                </button>
              )}
            </div>
          )}
          {error && (
            <div className="text-red-600 text-center mb-4">{error}</div>
          )}
        </div>
        {/* Right Box */}
        <div className="flex-1 overflow-y-auto max-h-[500px]">
          {loading ? (
            <div className="text-center text-blue-600">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-center text-blue-600">No notes found.</div>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note._id}
                  className="bg-blue-50 rounded px-4 py-3 flex items-center justify-between"
                >
                  {editId === note._id ? (
                    <span className="flex flex-col sm:flex-row gap-2 flex-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Edit title"
                      />
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Edit content"
                      />
                      <button
                        onClick={() => handleEditSave(note._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 transition"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <span className="flex-1">
                      <b className="text-blue-700">{note.title}</b>:{" "}
                      {note.content}
                      <div className="text-xs text-gray-500 mt-1">
                        Created by:{" "}
                        {note.createdBy?.name ||
                          note.createdBy?.email ||
                          "Unknown"}
                      </div>
                    </span>
                  )}
                  <div className="flex gap-2 ml-4">
                    {editId !== note._id && (
                      <button
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                        onClick={() => startEdit(note)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      onClick={() => handleDelete(note._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
