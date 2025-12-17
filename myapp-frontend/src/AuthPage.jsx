import React, { useState } from "react";
import "./AuthPage.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api/Auth";

export default function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("register");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });

      const text = await res.text();
      if (res.ok) {
        setMessage("Registration successful! Please log in.");
        setMode("login");
        setPassword("");
      } else {
        setMessage(text || `${res.status} ${res.statusText}`);
      }
    } catch (err) {
      setMessage(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json(); // { id, email, displayName, token }

        localStorage.setItem("token", data.token);
        localStorage.setItem("displayName", data.displayName || data.email);

        navigate("/dashboard");
      } else {
        const text = await res.text();
        setMessage(text || `${res.status} ${res.statusText}`);
      }
    } catch (err) {
      setMessage(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <div className="auth-header">
          <h1>MyApp</h1>
          <p>Register or log in to continue</p>
        </div>

        <div className="auth-tabs">
          <button
            className={mode === "register" ? "tab active" : "tab"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
          <button
            className={mode === "login" ? "tab active" : "tab"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
        </div>

        {mode === "register" ? (
          <form className="auth-form" onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <button type="submit" disabled={busy}>
              {busy ? "Registering..." : "Register"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={busy}>
              {busy ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {message && <div className="auth-message">{message}</div>}
      </div>
    </div>
  );
}
