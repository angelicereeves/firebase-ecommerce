// src/products/ProductTypes.ts
import type { Timestamp } from "firebase/firestore";

export interface Product {
  id?: string;         // Firestore doc ID (optional when creating)
  title: string;       // Product name
  description: string; // Short description
  price: number;       // Price in USD
  imageUrl?: string;   // Optional product image URL
  category?: string;   // Optional category 
  createdAt?: Timestamp; // Firestore serverTimestamp
}

//Shape used when creating new products (no id/createdAt from client).
export type NewProduct = Omit<Product, "id" | "createdAt">;

//Shape returned by Firestore data() (payload has no id).
export type ProductDoc = Omit<Product, "id">;

