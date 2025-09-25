// src/orders/Checkout.tsx
import React from "react";
import type { CartItem } from "./OrderTypes";
import { placeOrder } from "../orders/OrderService";

//Minimal checkout button that calls placeOrder(cart)
const Checkout: React.FC<{ cart: CartItem[] }> = ({ cart }) => {
  const onClick = async () => {
    const id = await placeOrder(cart);
    if (id) alert(`Order placed! #${id}`);
  };
  return <button onClick={onClick}>Place Order</button>;
};

//export
export default Checkout;

