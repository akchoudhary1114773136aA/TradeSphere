import React from "react";

function Awards() {
  return (
    <section className="home-section home-split-section">
      <div className="row align-items-center">

        <div
          className="col-lg-6 p-4 p-lg-5"
          data-aos="fade-up"
        >
          <img
            className="content-image"
            src="media/images/home-broker-dashboard.svg"
            alt="Trading dashboard illustration"
          />
        </div>

        <div
          className="col-lg-6 p-4 p-lg-5"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <h1>Largest stock broker in India</h1>

          <p className="mb-5">
            2+ million TradeSphere clients contribute to over
            15% of all retail order volumes in India daily by
            trading and investing in:
          </p>

          <div className="row">

            <div className="col-6">
              <ul>
                <li>
                  <p>Futures and Options</p>
                </li>
                <li>
                  <p>Commodity derivatives</p>
                </li>
                <li>
                  <p>Currency derivatives</p>
                </li>
              </ul>
            </div>

            <div className="col-6">
              <ul>
                <li>
                  <p>Stocks & IPOs</p>
                </li>
                <li>
                  <p>Direct mutual funds</p>
                </li>
                <li>
                  <p>Bonds and Govt. Securities</p>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Awards;
