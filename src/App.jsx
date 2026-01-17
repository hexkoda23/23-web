import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Landing from "./pages/Landing.jsx";
import Access from "./pages/Access.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Hub from "./pages/Hub.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import MemberDetail from "./pages/MemberDetail.jsx";
import Lookbook from "./pages/Lookbook.jsx";
import OutfitGenerator from "./pages/OutfitGenerator.jsx";
import FoodGenerator from "./pages/FoodGenerator.jsx";
import SlumBook from "./pages/SlumBook.jsx";
import SlumBookView from "./pages/SlumBookView.jsx";
import Header from "./components/Header.jsx";
import PageTransition from "./components/PageTransition.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  const location = useLocation();

  // Only show header on lookbook
  const showHeader = location.pathname.startsWith("/lookbook");

  return (
    <>
      {showHeader && <Header />}

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
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/signup"
            element={
              <PageTransition>
                <SignUp />
              </PageTransition>
            }
          />
          <Route
            path="/hub"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Hub />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <PageTransition>
                <Portfolio />
              </PageTransition>
            }
          />
          <Route
            path="/portfolio/:id"
            element={
              <PageTransition>
                <MemberDetail />
              </PageTransition>
            }
          />
          <Route
            path="/lookbook"
            element={
              <PageTransition>
                <Lookbook />
              </PageTransition>
            }
          />
          <Route
            path="/outfit-generator"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <OutfitGenerator />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/food-generator"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <FoodGenerator />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/slumbook"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <SlumBook />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/slumbook/:id"
            element={
              <PageTransition>
                <SlumBookView />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}
