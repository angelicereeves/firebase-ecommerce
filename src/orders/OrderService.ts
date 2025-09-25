// src/orders/orderService.ts
import { auth, db } from "../firebaseConfig";
import {  addDoc,  collection,  serverTimestamp,  query,  where,  orderBy,  getDocs,  doc,  getDoc,} from "firebase/firestore";
import type { CartItem, Order } from "./OrderTypes";

//Creates an order for the signed-in user. Returns order id or null.
export async function placeOrder(items: CartItem[]): Promise<string | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    alert("Please log in to place an order.");
    return null;
  }
  if (!items.length) {
    alert("Your cart is empty.");
    return null;
  }

  const total = items.reduce((sum, i) => sum + i.qty * i.priceAtPurchase, 0);

  const ref = await addDoc(collection(db, "orders"), {
    userId: uid,
    items,
    total,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

//Lists current user's orders (newest first).
export async function listMyOrders(): Promise<Order[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const q = query(
    collection(db, "orders"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }));
}

//Fetches a single order by id.
export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, "orders", id));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Order, "id">) } : null;
}
