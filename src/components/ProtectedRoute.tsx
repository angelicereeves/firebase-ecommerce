// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../firebaseConfig";

interface ProtectedRouteProps {
  children: JSX.Element; // the route content to render if authorized
}

/**
 * ProtectedRoute
 * Guards a route by checking if user is authenticated.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  //state
  const [user, setUser] = useState<User | null>(null); // current auth user
  const [loading, setLoading] = useState(true);        // auth check flag

  // subscribe to Firebase auth state on mount
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  //render
  if (loading) return <div>Loading...</div>; 
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

//export
export default ProtectedRoute;
