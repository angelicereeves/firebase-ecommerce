// src/orders/OrderTypes.ts
import type { Timestamp } from "firebase/firestore";


//CartItem
export interface CartItem {
  productId: string;        // Firestore product doc ID
  qty: number;              // quantity
  priceAtPurchase: number;  // unit price at checkout
  title?: string;           // optional for UI
  imageUrl?: string;        // optional for UI
}

//Order
export interface Order {
  id?: string; // Firestore doc ID
  userId: string;
  items: CartItem[];
  total: number; // sum of qty * priceAtPurchase
  status?: "pending" | "paid" | "shipped" | "complete" | "cancelled";
  createdAt?: Timestamp; // Firestore serverTimestamp
}

//New order
export type NewOrder = Omit<Order, "id" | "createdAt">;

//OrderDoc
export type OrderDoc = Omit<Order, "id">;