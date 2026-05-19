import React from "react";

import Hero from "./Hero";
import CreateTicket from "./CreateTicket";

function PricingPage() {
  return (
    <>
      <div data-aos="fade-up">
        <Hero />
      </div>
      <div data-aos="fade-up" data-aos-delay="200">
        <CreateTicket />
      </div>
    </>
  );
}

export default PricingPage;
