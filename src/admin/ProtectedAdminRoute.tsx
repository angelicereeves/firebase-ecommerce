// src/admin/ProtectedAdminRoute.tsx
import { type ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Minimal shape of user profile stored in Firestore
type UserDoc = {
  role?: "admin" | "user" | string; // allow string fallback
};

type Props = { children: ReactNode };

/**
 * ProtectedAdminRoute
 * Guards children so only admins can view.
 */
const ProtectedAdminRoute = ({ children }: Props) => {
  // state
  const [checking, setChecking] = useState(true); // resolving auth/role
  const [isAdmin, setIsAdmin] = useState(false);  // computed role flag

  //effects
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const data = (snap.exists() ? (snap.data() as UserDoc) : undefined);
        setIsAdmin(data?.role === "admin");
      } catch (e: unknown) {
        // On error, deny access and surface nothing here (avoid leaking details)
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    });
    return () => unsub();
  }, []);

  // render
  if (checking) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Checking access…</h2>
          <p className="auth-subtitle">Please wait.</p>
        </div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

//export
export default ProtectedAdminRoute;
