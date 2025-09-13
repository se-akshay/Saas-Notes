import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function InviteUser({ token, user, variant = "page" }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  variant === "modal" ? "" : "mt-8";
  const handleInvite = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await axios.post(
        `${API_URL}/tenants/${user.tenant}/invite`,
        { email, role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("User invited successfully!");
      setEmail("");
      setRole("member");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to invite user");
    }
  };

  if (user.role !== "admin") return null;

  return (
    <div
      className={
        variant === "modal"
          ? "flex items-center justify-center"
          : "flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300"
      }
    >
      <div
        className={`mt-8 w-full max-w-md mx-auto bg-white rounded-lg shadow p-6 ${
          variant === "modal" ? "mt-0" : ""
        }`}
      >
        <h3 className="text-xl font-bold text-blue-700 mb-4 text-center">
          Invite User
        </h3>
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-blue-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-blue-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Invite
          </button>
        </form>
        {message && (
          <div className="text-green-600 text-center mt-4">{message}</div>
        )}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </div>
    </div>
  );
}
