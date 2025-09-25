// src/admin/AdminProducts.tsx
import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {  addDoc,  collection,  deleteDoc,  doc,  getDocs,  orderBy,  query,  serverTimestamp,  updateDoc,} from "firebase/firestore";
import ProductForm, { type Product } from "./ProductForm";

/**
 * AdminProducts
 * @remarks Renders product grid with inline create/edit via <ProductForm />.
 * @details Tracks current user for createdBy/updatedBy. Uses basic skeletons
 * and error text. Sorting: createdAt desc. Safe defaults for optional fields.
 */
const AdminProducts = () => {
  //state
  const [products, setProducts] = useState<Product[]>([]); // fetched rows
  const [loading, setLoading] = useState(true);            // async gate
  const [err, setErr] = useState<string | null>(null);     // ui error msg

  const [showForm, setShowForm] = useState(false);         // toggle form
  const [editing, setEditing] = useState<Product | null>(null); // edit ctx

  //queries
  /** Load products ordered by createdAt desc into local state. */
  const loadProducts = async () => {
    setLoading(true);
    setErr(null);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      // Keep id + data; cast data to Product minus id to avoid `any`.
      const rows = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Product, "id">),
      })) as Product[];
      setProducts(rows);
    } catch (e: unknown) {
      const message = e && typeof e === "object" && "message" in e
        ? String((e as { message?: string }).message)
        : "Failed to load products.";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  // initial fetch only
  useEffect(() => {
    loadProducts();
  }, []);

  /**
   * Create a new product.
   * @param data - Product fields from form; normalized here.
   */
  const handleCreate = async (data: Product) => {
    await addDoc(collection(db, "products"), {
      title: data.title,
      description: data.description ?? "",
      price: Number(data.price) || 0,
      imageUrl: data.imageUrl ?? "",
      category: data.category ?? "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid ?? null,
    });
    setShowForm(false);
    setEditing(null);
    await loadProducts(); // refresh list after write
  };

  /**
   * Update an existing product.
   * @param data - Product with id; no-op if id missing.
   */
  const handleUpdate = async (data: Product) => {
    if (!data.id) return; // guard
    await updateDoc(doc(db, "products", data.id), {
      title: data.title,
      description: data.description ?? "",
      price: Number(data.price) || 0,
      imageUrl: data.imageUrl ?? "",
      category: data.category ?? "",
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.uid ?? null,
    });
    setShowForm(false);
    setEditing(null);
    await loadProducts();
  };

  /* Save dispatcher: create vs update. */
  const handleSave = async (data: Product) => {
    if (editing?.id) return handleUpdate({ ...data, id: editing.id });
    return handleCreate(data);
  };

  /**
   * Delete a product after confirmation.
   * @param id - Product id.
   */
  const handleDelete = async (id?: string) => {
    if (!id) return; // guard
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await deleteDoc(doc(db, "products", id));
    await loadProducts();
  };

  //render
  return (
    <div className="page">
      {/* header */}
      <div className="admin-header">
        <h2 className="section-title">Admin · Products</h2>
        <div className="btn-row">
          <button
            className="btn primary"
            onClick={() => {
              setEditing(null);   // create mode
              setShowForm(true);  // open form
            }}
          >
            New product
          </button>
        </div>
      </div>

      {/* form: create or edit */}
      {showForm && (
        <ProductForm
          initial={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* error */}
      {err && <p className="feedback error">{err}</p>}

      {/* loading skeletons */}
      {loading && (
        <div className="products-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <article className="card product-card skeleton" key={i}>
              <div className="skeleton-thumb" />
              <div className="skeleton-line" />
              <div className="skeleton-line sm" />
            </article>
          ))}
        </div>
      )}

      {/* empty state */}
      {!loading && products.length === 0 && (
        <div className="card">
          <p className="muted">No products yet. Click “New product” to add one.</p>
        </div>
      )}

      {/* grid */}
      {!loading && products.length > 0 && (
        <div className="products-grid">
          {products.map((p) => (
            <article className="card product-card" key={p.id}>
              {/* thumb */}
              {p.imageUrl ? (
                <img className="product-thumb" src={p.imageUrl} alt={p.title} />
              ) : (
                <div className="product-thumb placeholder">No Image</div>
              )}

              {/* body */}
              <div className="product-body">
                <h3 className="product-title">{p.title}</h3>

                {/* meta */}
                <div className="product-meta">
                  <span className="pill">{p.category || "uncategorized"}</span>
                </div>

                {/* price */}
                <div className="product-row">
                  <span className="product-price">${Number(p.price || 0).toFixed(2)}</span>
                </div>

                {/* actions */}
                <div className="btn-row">
                  <button
                    className="btn secondary"
                    onClick={() => {
                      setEditing(p);    // edit mode
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn secondary" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

//export
export default AdminProducts;


