// src/pages/Cart.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { getCart, saveCart, clearCart, type CartItem } from "../utilities/cart";
import { formatPrice } from "../utilities/format";

/**
 * Cart
 * Renders the user's cart with inline quantity controls and checkout.
 */
const Cart = () => {
  // state
  const [items, setItems] = useState<CartItem[]>([]);     // cart line items
  const [placing, setPlacing] = useState(false);          // checkout in-flight
  const [err, setErr] = useState<string | null>(null);    // error feedback
  const [msg, setMsg] = useState<string | null>(null);    // success/info msg
  const navigate = useNavigate();

  // Load cart once on mount
  useEffect(() => {
    setItems(getCart());
  }, []);

  // totals
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  // local mutations (cart state + persistence)
  //Update quantity for a product; persist to localStorage.
  const updateQty = (productId: string, qty: number) => {
    setItems((prev) => {
      const next = prev
        .map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i))
        .filter((i) => i.qty > 0);
      saveCart(next);
      return next;
    });
  };

  //Remove a product from the cart; persist to localStorage
  const remove = (productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      saveCart(next);
      return next;
    });
  };

  //Clear entire cart (localStorage + state)
  const empty = () => {
    clearCart();
    setItems([]);
  };

  //checkout flow
  /**
   * Create an order in Firestore from the current cart.
   * Safeguards: empty cart blocked, unauthenticated users redirected.
   */
  const checkout = async () => {
    setErr(null);
    setMsg(null);

    if (items.length === 0) {
      setErr("Your cart is empty.");
      return;
    }

    const u = auth.currentUser;
    if (!u) {
      navigate("/login");
      return;
    }

    try {
      setPlacing(true);
      await addDoc(collection(db, "orders"), {
        userId: u.uid,
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          imageUrl: i.imageUrl ?? null,
          priceAtPurchase: i.price,
          qty: i.qty,
        })),
        total: subtotal,
        status: "pending",           // downstream flow can update status
        createdAt: serverTimestamp(), // server authoritative timestamp
      });

      clearCart();
      setItems([]);
      setMsg("Order placed! Redirecting to your orders…");
      // tiny delay for message, then navigate
      setTimeout(() => navigate("/orders"), 600);
    } catch (e: unknown) {
      // Avoid `any`; surface a friendly message
      const message = e && typeof e === "object" && "message" in e ?
        String((e as { message?: string }).message) :
        "Failed to place order.";
      setErr(message);
    } finally {
      setPlacing(false);
    }
  };

  //render
  return (
    <div className="page">
      <h2 className="section-title">Your Cart</h2>

      {items.length === 0 ? (
        <div className="card">
          <p className="muted">Your cart is empty.</p>
        </div>
      ) : (
        <>
          {/* cart list */}
          <div className="card cart-card">
            <div className="cart-head">
              <span>Item</span>
              <span className="hide-sm">Price</span>
              <span>Qty</span>
              <span>Total</span>
              <span />
            </div>

            {items.map((i) => (
              <div className="cart-row" key={i.productId}>
                <div className="cart-item">
                  {i.imageUrl ? (
                    <img src={i.imageUrl} alt={i.title} className="cart-thumb" />
                  ) : (
                    <div className="cart-thumb placeholder">No Image</div>
                  )}
                  <span className="cart-title">{i.title}</span>
                </div>

                <span className="hide-sm">{formatPrice(i.price)}</span>

                {/* qty controls */}
                <div className="qty">
                  <button
                    className="qty-btn"
                    aria-label="Decrease"
                    onClick={() => updateQty(i.productId, i.qty - 1)}
                  >
                    −
                  </button>
                  <input
                    className="qty-input"
                    type="number"
                    min={1}
                    value={i.qty}
                    onChange={(e) =>
                      updateQty(i.productId, Number(e.target.value || 1))
                    }
                  />
                  <button
                    className="qty-btn"
                    aria-label="Increase"
                    onClick={() => updateQty(i.productId, i.qty + 1)}
                  >
                    +
                  </button>
                </div>

                <span className="bold">{formatPrice(i.price * i.qty)}</span>

                <button className="remove-btn" onClick={() => remove(i.productId)}>
                  Remove
                </button>
              </div>
            ))}

            {/* footer: clear + subtotal */}
            <div className="cart-foot">
              <button className="clear-btn" onClick={empty}>
                Clear cart
              </button>

              <div className="cart-total">
                <span>Subtotal</span>
                <span className="bold">{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>

          {/* checkout CTA */}
          <div className="btn-row end">
            <button className="btn btn-primary" onClick={checkout} disabled={placing}>
              {placing ? "Placing order…" : "Checkout"}
            </button>
          </div>
        </>
      )}

      {/* feedback */}
      {msg && <p className="feedback">{msg}</p>}
      {err && <p className="feedback error">{err}</p>}
    </div>
  );
};

//export
export default Cart;