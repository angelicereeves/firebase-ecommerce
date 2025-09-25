// src/orders/OrderDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { formatPrice, formatDate } from "../utilities/format";
import type { Order, OrderDoc } from "./OrderTypes";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();

  //state
  const [order, setOrder] = useState<Order | null>(null); // fetched order
  const [loading, setLoading] = useState(true);           // async gate
  const [err, setErr] = useState<string | null>(null);    // ui error msg

  //effects
  useEffect(() => {
    // If missing id, surface a friendly error early
    if (!id) {
      setErr("Missing order id.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const snap = await getDoc(doc(db, "orders", id));
        if (snap.exists()) {
          // Keep id + data; narrow to Order (data() has no id)
          setOrder({ id: snap.id, ...(snap.data() as OrderDoc) });
        } else {
          setErr("Order not found.");
        }
      } catch (e: unknown) {
        const message =
          e && typeof e === "object" && "message" in e
            ? String((e as { message?: string }).message)
            : "Failed to load order.";
        setErr(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  //render
  if (loading) return <p className="muted">Loading order…</p>;
  if (err) return <p className="feedback error">{err}</p>;
  if (!order) return null; // nothing to show

  return (
    <div className="page">
      <h2 className="section-title">Order Details</h2>

      {/* order header */}
      <div className="card">
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
        <p><strong>Status:</strong> {order.status ?? "pending"}</p>
        <p><strong>Total:</strong> {formatPrice(order.total)}</p>
      </div>

      {/* items */}
      <div className="card">
        <h3 className="section-title">Items</h3>
        {order.items?.map((i) => (
          <div className="cart-row" key={i.productId}>
            <div className="cart-item">
              {i.imageUrl ? (
                <img src={i.imageUrl} alt={i.title} className="cart-thumb" />
              ) : (
                <div className="cart-thumb placeholder">No Image</div>
              )}
              <span className="cart-title">{i.title}</span>
            </div>
            <span>
              {i.qty} × {formatPrice(i.priceAtPurchase)}
            </span>
            <span className="bold">{formatPrice(i.qty * i.priceAtPurchase)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

//export
export default OrderDetail;
