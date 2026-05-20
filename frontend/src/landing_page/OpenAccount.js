import React from "react";
import { Link } from "react-router-dom";

function OpenAccount() {
  return (
    <section className="home-open-account" data-aos="fade-up">
      <div className="text-center">
        <h1 className="mt-5">Open a TradeSphere account</h1>
        <p>
          Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and
          F&O trades.
        </p>
        <Link
          to="/signup"
          className="btn btn-primary fs-5 mb-5 home-open-account-btn"
        >
          Sign up Now
        </Link>
      </div>
    </section>
  );
}

export default OpenAccount;
