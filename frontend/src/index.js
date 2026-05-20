import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";

import AOS from "aos";
import "aos/dist/aos.css";

import HomePage from "./landing_page/home/HomePage";
import Signup from "./landing_page/signup/Signup";
import Login from "./landing_page/login/Login";
import AboutPage from "./landing_page/about/AboutPage";
import ProductPage from "./landing_page/products/ProductsPage";
import PricingPage from "./landing_page/pricing/PricingPage";
import SupportPage from "./landing_page/support/SupportPage";
import DashboardFrame from "./landing_page/dashboard/DashboardFrame";

import NotFound from "./landing_page/NotFound";
import Navbar from "./landing_page/Navbar";
import Footer from "./landing_page/Footer";

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    requestAnimationFrame(() => {
      document
        .querySelectorAll("[data-aos]")
        .forEach((element) => element.classList.remove("aos-animate"));
      AOS.refreshHard();
    });
  }, [pathname]);

  return null;
}

AOS.init({
  duration: 1000,
  once: true,
});

function AppLayout() {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardFrame />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isDashboard && <Footer />}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <AppLayout />
  </BrowserRouter>
);

AOS.init({
  duration: 1200,
  easing: "ease-in-out",
  once: true,
});
