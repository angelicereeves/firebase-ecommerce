// src/admin/ProductForm.tsx
import { type FormEvent, useEffect, useState } from "react";

// Shared Product type
export type Product = {
  id?: string;         // present only when editing an existing doc
  title: string;       // required product title
  description: string; // text description
  price: number;       // numeric price (USD)
  imageUrl: string;    // optional image url
  category: string;    // category label (string)
};

// Props accepted by ProductForm
// - initial: pre-filled product (edit mode)
// - onCancel: callback to dismiss without saving
// - onSave: async callback that persists the product
//
type Props = {
  initial?: Product | null;
  onCancel: () => void;
  onSave: (data: Product) => Promise<void>;
};

// Template product used to clear the form.
const emptyProduct: Product = {
  title: "",
  description: "",
  price: 0,
  imageUrl: "",
  category: "",
};

/**
 * ProductForm component
 * Renders controlled inputs for product fields with save/cancel actions.
 */
const ProductForm = ({ initial, onCancel, onSave }: Props) => {
  // local form state
  const [form, setForm] = useState<Product>(emptyProduct);
  // saving flag disables submit button
  const [saving, setSaving] = useState(false);
  // isEdit: derived flag, true if editing an existing product
  const isEdit = Boolean(initial?.id);

  // When initial changes, reset the form state accordingly.
  useEffect(() => {
    setForm(initial ?? emptyProduct);
  }, [initial]);

  // Strongly-typed field setter - avoid using 'any'
  const setField = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * handleSubmit
   * Prevents default form submit, validates required fields, and
   * triggers the onSave callback. Sets saving state during async call.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title || !form.category || !(form.price > 0)) return;
    try {
      setSaving(true);
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  //render 
  return (
    <div className="card">
      <h3 className="section-title">{isEdit ? "Edit Product" : "New Product"}</h3>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <label className="auth-label" htmlFor="p_title">Title</label>
        <input
          id="p_title"
          className="auth-input"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Product title"
          required
        />

        {/* Description */}
        <label className="auth-label" htmlFor="p_desc">Description</label>
        <textarea
          id="p_desc"
          className="auth-input textarea"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Short description"
          rows={3}
        />

        {/* Price */}
        <div className="grid-2">
          <div>
            <label className="auth-label" htmlFor="p_price">Price (USD)</label>
            <input
              id="p_price"
              className="auth-input"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setField("price", Number(e.target.value || 0))}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Category + Image URL */}
        <div className="grid-2">
          <div>
            <label className="auth-label" htmlFor="p_cat">Category</label>
            <input
              id="p_cat"
              className="auth-input"
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              placeholder="e.g., apparel"
              required
            />
          </div>
          <div>
            <label className="auth-label" htmlFor="p_img">Image URL</label>
            <input
              id="p_img"
              className="auth-input"
              value={form.imageUrl}
              onChange={(e) => setField("imageUrl", e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="btn-row">
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
          <button className="btn secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

//export
export default ProductForm;
