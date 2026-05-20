import React from "react";

import Hero from "./Hero";
import Team from "./Team";

function PricingPage() {
  return (
    <>
      <div data-aos="fade-up">
        <Hero />
      </div>
      <div data-aos="fade-up" data-aos-delay="200">
        <Team />
      </div>
    </>
  );
}

export default PricingPage;
