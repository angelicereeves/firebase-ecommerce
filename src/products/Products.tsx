// src/products/Products.tsx
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query, type Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { formatPrice } from "../utilities/format";
import { addToCart } from "../utilities/cart";

// Local product type aligned to Firestore schema for this page.
type Product = {
  id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  createdAt?: Timestamp; // Firestore timestamp
};

const Products = () => {
  //state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Fetch products once on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        // Keep id + data; data() has no id field
        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, "id">),
        })) as Product[];
        setAllProducts(rows);
      } catch (e: unknown) {
        const message =
          e && typeof e === "object" && "message" in e
            ? String((e as { message?: string }).message)
            : "Failed to load products.";
        setErr(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Unique categories (plus "all")
  const categories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => p.category && set.add(p.category));
    return ["all", ...Array.from(set)];
  }, [allProducts]);

  // Filtered list
  const products = useMemo(() => {
    const s = search.trim().toLowerCase();
    return allProducts.filter((p) => {
      const byCat =
        category === "all" ||
        (p.category ?? "").toLowerCase() === category.toLowerCase();
      const byText =
        !s ||
        p.title.toLowerCase().includes(s) ||
        (p.description ?? "").toLowerCase().includes(s);
      return byCat && byText;
    });
  }, [allProducts, search, category]);

  //render
  return (
    <div className="page">
      <h2 className="section-title">Products</h2>

      <div className="card">
        <div className="filters">
          <input
            className="auth-input"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="auth-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="products-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <article className="card product-card skeleton" key={i}>
              <div className="skeleton-thumb" />
              <div className="skeleton-line" />
              <div className="skeleton-line sm" />
            </article>
          ))}
        </div>
      )}

      {!loading && err && <p className="feedback error">{err}</p>}

      {!loading && !err && products.length === 0 && (
        <div className="card">
          <p className="muted">No products match your filters.</p>
        </div>
      )}

      {!loading && !err && products.length > 0 && (
        <div className="products-grid">
          {products.map((p) => (
            <article className="card product-card" key={p.id}>
              {p.imageUrl ? (
                <img className="product-thumb" src={p.imageUrl} alt={p.title} />
              ) : (
                <div className="product-thumb placeholder">No Image</div>
              )}

              <div className="product-body">
                <h3 className="product-title">{p.title}</h3>
                <div className="product-meta">
                  <span className="pill">{p.category || "uncategorized"}</span>
                </div>
                <div className="product-row">
                  <span className="product-price">{formatPrice(p.price)}</span>
                </div>

                <div className="btn-row">
                  <button
                    className="btn primary"
                    onClick={() =>
                      addToCart({
                        productId: p.id,
                        title: p.title,
                        price: p.price,
                        imageUrl: p.imageUrl,
                        qty: 1,
                      })
                    }
                  >
                    Add to cart
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
export default Products;
