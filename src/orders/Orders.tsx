// src/orders/Orders.tsx
import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { formatPrice, formatDate } from "../utilities/format";
import type { Order, OrderDoc } from "./OrderTypes";

const Orders = () => {
  //state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  //effects
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const u = auth.currentUser;
      if (!u) {
        setLoading(false); // not signed in; show empty state
        return;
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", u.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        // Keep id + data; narrow data type to OrderDoc (data() has no id)
        const rows: Order[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as OrderDoc),
        }));
        setOrders(rows);
      } catch (e: unknown) {
        const message =
          e && typeof e === "object" && "message" in e
            ? String((e as { message?: string }).message)
            : "Failed to load orders.";
        setErr(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  //render
  return (
    <div className="page">
      <h2 className="section-title">My Orders</h2>

      {loading && <p className="muted">Loading orders…</p>}
      {err && <p className="feedback error">{err}</p>}

      {!loading && !err && orders.length === 0 && (
        <div className="card">
          <p className="muted">You don’t have any orders yet.</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="orders-grid">
          {orders.map((o) => (
            <article className="card order-card" key={o.id}>
              <div className="order-row">
                <span className="muted">Order ID</span>
                <span>{o.id.slice(0, 8)}…</span>
              </div>
              <div className="order-row">
                <span className="muted">Date</span>
                <span>{formatDate(o.createdAt)}</span>
              </div>
              <div className="order-row">
                <span className="muted">Total</span>
                <span className="bold">{formatPrice(o.total)}</span>
              </div>
              <div className="order-row">
                <span className="muted">Status</span>
                <span>{o.status}</span>
              </div>

              <div className="btn-row end">
                <Link className="btn btn-ghost" to={`/orders/${o.id}`}>
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

//export
export default Orders;
