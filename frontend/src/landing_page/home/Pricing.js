import React from "react";

function Pricing() {
  return (
    <section className="home-section home-pricing-section">
      <div className="row align-items-center">

        <div
          className="col-lg-4"
          data-aos="fade-up"
        >
          <h1 className="mb-3 fs-2">
            Unbeatable pricing
          </h1>

          <p>
            We pioneered the concept of discount broking and
            price transparency in India. Flat fees and no
            hidden charges.
          </p>

          <a href="" style={{ textDecoration: "none" }}>
            See Pricing{" "}
            <i
              className="fa fa-long-arrow-right"
              aria-hidden="true"
            ></i>
          </a>
        </div>

        <div className="col-lg-1"></div>

        <div
          className="col-lg-7"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="row text-center">

            <div
              className="col p-4 home-price-card"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <h1 className="mb-3">₹0</h1>

              <p>
                Free equity delivery and
                <br />
                direct mutual funds
              </p>
            </div>

            <div
              className="col p-4 home-price-card"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <h1 className="mb-3">₹20</h1>
              <p>Intraday and F&O</p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Pricing;
