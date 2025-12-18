import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Landing from "./pages/Landing.jsx";
import Access from "./pages/Access.jsx";
import Lookbook from "./pages/Lookbook.jsx";
import Header from "./components/Header.jsx";
import PageTransition from "./components/PageTransition.jsx";

export default function App() {
  const location = useLocation();

  // check if user has passed access gate
  const hasAccess = Boolean(localStorage.getItem("23-access"));

  // pages where header should NOT show
  const hideHeader =
    location.pathname === "/" || location.pathname === "/access";

  return (
    <>
      {/* Header only shows AFTER access */}
      {!hideHeader && hasAccess && <Header />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Landing />
              </PageTransition>
            }
          />

          <Route
            path="/access"
            element={
              <PageTransition>
                <Access />
              </PageTransition>
            }
          />

          {/* Protected Lookbook */}
          <Route
            path="/lookbook"
            element={
              hasAccess ? (
                <PageTransition>
                  <Lookbook />
                </PageTransition>
              ) : (
                <Navigate to="/access" replace />
              )
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}
