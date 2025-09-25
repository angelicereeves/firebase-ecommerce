// src/App.tsx
import { Link } from "react-router-dom";

const App = () => {
  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero card" style={{ textAlign: "center" }}>
        <h1 className="title">Welcome to Firebase E-Commerce</h1>

        <div className="btn-row" style={{ justifyContent: "center" }}>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
          <Link to="/register" className="btn btn-primary">
            Create Account
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="features-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginTop: "2rem",
        }}
      >
        <article className="card" style={{ textAlign: "center" }}>
          <h3>🔥 Easy Shopping</h3>
          <p>Browse products and add them to your cart in one click.</p>
        </article>

        <article className="card" style={{ textAlign: "center" }}>
          <h3>🔐 Secure Login</h3>
          <p>Email &amp; password authentication with protected user profiles.</p>
        </article>

        <article className="card" style={{ textAlign: "center" }}>
          <h3>📦 Order History</h3>
          <p>Place orders and view your history anytime.</p>
        </article>
      </section>
    </div>
  );
};

//export
export default App;
