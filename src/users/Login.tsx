// src/users/Login.tsx
import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const Login = () => {
  //state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  //handlers
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError(null);
      alert("Login successful!");
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Login failed. Please try again.";
      setError(message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out!");
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Logout failed. Please try again.";
      // Keep console.error for my visibility, but avoid leaking details to users
      console.error("Logout error:", message);
    }
  };

  //render
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Sign in to your account</h2>
        <p className="auth-subtitle">Access your orders, profile, and cart.</p>

        <form onSubmit={handleLogin} className="auth-form" noValidate>
          <label htmlFor="email" className="auth-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
            autoComplete="email"
          />

          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
            autoComplete="current-password"
          />

          <button type="submit" className="auth-btn primary">
            Login
          </button>

          {error && <p className="auth-error">{error}</p>}
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button onClick={handleLogout} className="auth-btn secondary">
          Logout
        </button>
      </div>
    </div>
  );
};

//export
export default Login;
