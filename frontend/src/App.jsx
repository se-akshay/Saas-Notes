import { useState, useEffect } from "react";
import Login from "./pages/Login";
import NotesDashboard from "./pages/NotesDashboard";
import InviteUser from "./pages/InviteUser";
// import "./App.css";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const handleLogin = (jwt, userInfo) => {
    setToken(jwt);
    setUser(userInfo);
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <NotesDashboard token={token} user={user} onLogout={handleLogout} />
      <InviteUser token={token} user={user} />
    </>
  );
}

export default App;
