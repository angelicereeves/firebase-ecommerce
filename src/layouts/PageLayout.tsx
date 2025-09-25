// src/layouts/PageLayout.tsx
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

/**
 * PageLayout
 * Wraps routes with common navigation and content container.
 */
const PageLayout = () => {
  return (
    <>
      {/* top navigation */}
      <NavBar />

      {/* main content area */}
      <main className="container" style={{ paddingTop: 16, paddingBottom: 32 }}>
        <Outlet />
      </main>
    </>
  );
};

//export
export default PageLayout;
