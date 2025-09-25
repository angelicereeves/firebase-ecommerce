// src/components/NavBar.tsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { cartCount } from "../utilities/cart";

const NavBar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [count, setCount] = useState(0);

  // auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  // cart badge syncing
  useEffect(() => {
    const refresh = () => setCount(cartCount());

    // initial read
    refresh();

    // cross-tab updates (fires in other tabs only)
    const onStorage = () => refresh();

    // tab came back to foreground
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    // some browsers reliably fire window 'focus'
    const onFocus = () => refresh();

    // same-tab updates emitted by utilities/cart.ts
    const onCartUpdate = () => refresh();

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    // custom event from saveCart()/clearCart()
    window.addEventListener("cart:update", onCartUpdate as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("cart:update", onCartUpdate as EventListener);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        {/* brand */}
        <Link to="/" className="brand">
          <span className="brand-logo" />
          <span>Firebase E-Commerce</span>
        </Link>

        {/* links */}
        <nav className="nav-links">
          <Link className="link-btn" to="/products">Products</Link>
          <Link className="link-btn" to="/cart">
            Cart {count > 0 && <span className="badge">{count}</span>}
          </Link>
          {user && (
            <>
              <Link className="link-btn" to="/orders">Orders</Link>
              <Link className="link-btn" to="/profile">Profile</Link>
              <Link className="link-btn" to="/admin/products">Admin</Link>
            </>
          )}
        </nav>

        {/* cta */}
        <div className="nav-cta">
          {!user ? (
            <>
              <Link className="btn btn-ghost" to="/login">Login</Link>
              <Link className="btn btn-primary" to="/register">Create account</Link>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </div>
    </header>
  );
};

//export
export default NavBar;
