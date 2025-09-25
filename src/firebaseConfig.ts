// src/firebaseConfig.ts

// Import core Firebase SDK
import { initializeApp } from "firebase/app";

// Import the pieces you need
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCghuX8XVnySmGhpJ_nZdaD33R0fNZsCVs",
  authDomain: "ecommerce-firebase-bd731.firebaseapp.com",
  projectId: "ecommerce-firebase-bd731",
  storageBucket: "ecommerce-firebase-bd731.firebasestorage.app",
  messagingSenderId: "552237148399",
  appId: "1:552237148399:web:0c97574437aba0f401931a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services we’ll actually use
const auth: Auth = getAuth(app);
const db = getFirestore(app);

// Export so other files can import { auth, db }
export { auth, db };
