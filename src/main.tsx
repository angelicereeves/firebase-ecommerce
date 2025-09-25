// src/main.tsx
import "./index.css";
import "./App.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import PageLayout from "./layouts/PageLayout";
import App from "./App";

// auth / users
import Register from "./users/Register";
import Login from "./users/Login";
import Profile from "./users/Profile";

// products
import Products from "./products/Products";

// cart
import Cart from "./orders/cart";

// orders
import Orders from "./orders/Orders";
import OrderDetail from "./orders/OrderDetail";

// admin
import AdminProducts from "./admin/AdminProducts";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";

// shared
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PageLayout />,
    children: [
      { index: true, element: <App /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "products", element: <Products /> },
      { path: "cart", element: <Cart /> },

      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders/:id",
        element: (
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/products",
        element: (
          <ProtectedAdminRoute>
            <AdminProducts />
          </ProtectedAdminRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
