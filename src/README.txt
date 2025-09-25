# Firebase E-Commerce (React + TypeScript)

Minimal e-commerce starter using React Router, Firebase Auth, and Firestore.  
Includes: product catalog with filters, cart with local persistence, 
checkout → orders, user profiles, and a small admin CRUD.


FEATURES

Products
  - Public catalog (/products) with search + category filter
  - Admin CRUD at /admin/products using a reusable ProductForm
Cart
  - LocalStorage persistence under "cart_v1"
  - Event-driven cart badge updates via a custom "cart:update" event
Orders
  - Checkout writes orders/{id} with line items
  - Order list + detail pages for the signed-in user
Users
  - Email/Password auth (Firebase)
  - Profile page (name, address) create/update
  - Admin gate via users/{uid}.role === "admin"


TECH STACK

Frontend: React 18, TypeScript, React Router, Vite
Backend:  Firebase Auth, Firestore (serverTimestamp)
Styling:  CSS (dark theme utilities)
Dev:      Vite scripts


PROJECT STRUCTURE (key files)

src/
  App.tsx
  main.tsx
  firebaseConfig.ts            

  layouts/
    PageLayout.tsx             

  components/
    NavBar.tsx                 
    ProtectedRoute.tsx         

  admin/
    AdminProducts.tsx         
    ProductForm.tsx           
    ProtectedAdminRoute.tsx    

  products/
    Products.tsx               
    ProductList.tsx            
    AddProductForm.tsx        
    ProductTypes.ts            

  orders/
    Orders.tsx                 
    OrderDetail.tsx            
    OrderTypes.ts              
    Checkout.tsx              

  pages/
    Cart.tsx                   
    NotFound.tsx

  users/
    Login.tsx
    Register.tsx
    Profile.tsx

  utilities/
    cart.ts                   
    format.ts                  

index.css
App.css



SETUP

1) Requirements
   - Node 18+ (LTS recommended)
   - Firebase project with Firestore (Native mode)

2) Enable Firebase services
   - Auth → Sign-in method: enable Email/Password
   - Firestore: create database (Native mode)

3) Install & run
   Clone github repo: git clone https://github.com/angelicereeves/firebase-ecommerce
   npm install
   npm run dev



ROUTES

/                      Landing
/products              Catalog + filters
/cart                  Cart (checkout → creates order)
/login, /register      Auth
/profile               ProtectedRoute
/orders, /orders/:id   ProtectedRoute
/admin/products        ProtectedAdminRoute
*                      Not Found

