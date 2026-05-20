import React from "react";
import Hero from "./Hero";
import Brokerage from "./Brokerage";
import OpenAccount from "../OpenAccount";

function PricingPage() {
  return (
    <>
      <div data-aos="fade-up">
        <Hero />
      </div>
      <div data-aos="fade-up" data-aos-delay="200">
        <OpenAccount />
      </div>
      <div data-aos="fade-up" data-aos-delay="300">
        <Brokerage />
      </div>
    </>
  );
}

export default PricingPage;
