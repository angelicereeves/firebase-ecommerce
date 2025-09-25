// src/products/ProductsAdmin.tsx
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {  collection,  getDocs,  doc,  updateDoc,  deleteDoc,  query,  orderBy,} from "firebase/firestore";
import type { Product } from "./ProductTypes";

const ProductsAdmin: React.FC = () => {
  //state
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products
  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      // Keep id + whitelisted fields; avoid `any` by narrowing via Product minus id
      const rows: Product[] = snap.docs.map((d) => {
        const data = d.data() as Omit<Product, "id">;
        return {
          id: d.id,
          title: data.title,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          category: data.category,
          createdAt: data.createdAt,
        };
      });

      setItems(rows);
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Failed to load products.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  //updates
  const handleUpdate = async (
    id: string | undefined,
    patch: Partial<Product>
  ) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, "products", id), patch);
      await refresh();
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Update failed";
      alert(message);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      // optimistic remove
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Delete failed";
      alert(message);
    }
  };

  // render
  if (loading) return <div>Loading products…</div>;
  if (error) return <div style={{ color: "crimson" }}>{error}</div>;
  if (!items.length) return <div>No products yet.</div>;

  return (
    <div style={{ maxWidth: 720 }}>
      <h3>Manage Products</h3>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
        {items.map((p) => (
          <li
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 600 }}>{p.title}</div>
            <div>Description: {p.description}</div>
            <div>Price: ${p.price}</div>
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.title}
                style={{ maxWidth: 160, borderRadius: 6 }}
              />
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <InlineTitleEditor
                value={p.title}
                onSave={(val) => handleUpdate(p.id, { title: val })}
              />
              <InlinePriceEditor
                value={p.price}
                onSave={(val) => handleUpdate(p.id, { price: val })}
              />
              <button
                onClick={() => handleDelete(p.id)}
                style={{ background: "crimson", color: "white" }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

//inline editors
const InlineTitleEditor: React.FC<{
  value: string;
  onSave: (value: string) => void;
}> = ({ value, onSave }) => {
  const [v, setV] = useState<string>(value);
  return (
    <span>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="New title"
        style={{ marginRight: 8 }}
      />
      <button onClick={() => onSave(v)}>Update Title</button>
    </span>
  );
};

const InlinePriceEditor: React.FC<{
  value: number;
  onSave: (value: number) => void;
}> = ({ value, onSave }) => {
  const [v, setV] = useState<string>(String(value));
  return (
    <span>
      <input
        type="number"
        step="0.01"
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="New price"
        style={{ marginRight: 8 }}
      />
      <button onClick={() => onSave(Number(v))}>Update Price</button>
    </span>
  );
};

//export
export default ProductsAdmin;
