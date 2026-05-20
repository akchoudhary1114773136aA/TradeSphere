import React from "react";

function Hero() {
  return (
    <div className="container">
      <div className="row p-5 mt-5 mb-5">
        <h1 className="fs-2 text-center">
          We pioneered the discount broking model in India
          <br />
          Now, we are breaking ground with our technology.
        </h1>
      </div>

      <div
        className="row p-5 mt-5 border-top text-muted"
        style={{ lineHeight: "1.8", fontSize: "1.2em" }}
      >
        <div className="col-6 p-5">
         <p>
  We started our journey on the 5th of March, 2021 with the mission of
  making investing and trading more accessible, affordable, and
  technology-driven for people across India. We named the company
  TradeSphere to represent a modern and connected financial ecosystem
  for traders and investors.
</p>

<p>
  Within a short span of time, our customer-first approach, transparent
  pricing, and advanced trading platforms have helped us establish a
  strong presence in the Indian fintech industry.
</p>

<p>
  Today, lakhs of investors actively use our ecosystem to trade and
  invest every day, contributing to the rapidly growing retail
  participation in India’s financial markets.
</p>
</div>

<div className="col-6 p-5">
  <p>
    Beyond trading, we also focus on spreading financial awareness
    through educational programs, webinars, and community-driven
    initiatives designed for modern investors.
  </p>

  <p>
    <a href="" style={{ textDecoration: "none" }}>
      SphereLabs
    </a>
    , our fintech innovation and startup support initiative, partners
    with emerging startups that are building the future of digital
    finance and investing in India.
  </p>

  <p>
    We continue to grow, innovate, and launch new solutions regularly.
    Follow our latest updates through our blog and media announcements.
  </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;
