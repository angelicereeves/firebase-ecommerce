// src/products/AddProductForm.tsx
import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { Product } from "./ProductTypes";

//AddProductForm 
const AddProductForm = () => {
  //state
  const [data, setData] = useState<Omit<Product, "id" | "createdAt">>({
    title: "",
    description: "",
    price: 0,
    imageUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  //handlers
  //Update form state on input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  //Validate and submit new product to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!data.title || data.price <= 0) {
      setError("Please provide a title and a price greater than 0.");
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, "products"), {
        ...data,
        imageUrl: data.imageUrl || null,
        createdAt: serverTimestamp(),
      });
      alert("Product added!");
      setData({ title: "", description: "", price: 0, imageUrl: "" });
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Failed to add product.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  //render
  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 8, maxWidth: 420 }}
    >
      <h3>Add Product</h3>

      <input
        name="title"
        placeholder="Title"
        value={data.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={data.description}
        onChange={handleChange}
        rows={3}
      />

      <input
        name="price"
        type="number"
        step="0.01"
        min="0"
        placeholder="Price"
        value={data.price}
        onChange={handleChange}
        required
      />

      <input
        name="imageUrl"
        placeholder="Image URL (optional)"
        value={data.imageUrl ?? ""}
        onChange={handleChange}
      />

      <button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Add Product"}
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </form>
  );
};

//export
export default AddProductForm;
