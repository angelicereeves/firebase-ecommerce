// src/users/Register.tsx
import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, type UserCredential } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const Register = () => {
  //state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  //handlers
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (!name || !address || !email || !password) {
      setErr("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create Firestore user doc
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        name,
        address,
        role: "user",
        createdAt: serverTimestamp(),
      });

      setMsg("Account created! You can now sign in.");
      setName("");
      setAddress("");
      setEmail("");
      setPassword("");
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Registration failed.";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  //render
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Sign up to manage your profile, products, and orders.</p>

        <form onSubmit={handleRegister} className="auth-form" noValidate>
          <label className="auth-label" htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            required
          />

          <label className="auth-label" htmlFor="address">Shipping address</label>
          <input
            id="address"
            type="text"
            placeholder="123 Main St, City, ST"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="auth-input"
            required
          />

          <label className="auth-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />

          <label className="auth-label" htmlFor="password">Password</label>
          <div className="auth-input-group">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input has-button"
              required
            />
            <button
              type="button"
              className="auth-inline-btn"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>

          {msg && <p className="auth-error" style={{ color: "limegreen" }}>{msg}</p>}
          {err && <p className="auth-error">{err}</p>}
        </form>
      </div>
    </div>
  );
};

//export
export default Register;
