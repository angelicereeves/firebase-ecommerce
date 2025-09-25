// src/utilities/cart.ts
export type CartItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  imageUrl?: string;
};

const KEY = "cart_v1";
export const CART_EVENT = "cart:update";

// Read cart from storage (fails safe to empty array)
export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

// Persist cart to storage and notify listeners
export function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // ignore any write errors
  } finally {
    window.dispatchEvent(new CustomEvent(CART_EVENT));
  }
}

// Clear cart and notify listeners.
export function clearCart() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  } finally {
    window.dispatchEvent(new CustomEvent(CART_EVENT));
  }
}

// Sum total item quantities
export function cartCount(): number {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

// Add or merge an item
export function addToCart(item: CartItem) {
  const items = getCart();
  const idx = items.findIndex((i) => i.productId === item.productId);

  const addQty = Math.max(1, item.qty | 0);

  if (idx >= 0) {
    items[idx].qty = Math.max(1, (items[idx].qty | 0) + addQty);
  } else {
    items.push({ ...item, qty: addQty });
  }
  saveCart(items);
}
