import React from "react";

function Stats() {
  return (
    <section className="home-section home-stats-section">
      <div className="row align-items-center">

        <div
          className="col-lg-6 p-4 p-lg-5"
          data-aos="fade-up"
        >
          <h1 className="fs-2 mb-5">
            Trust with confidence
          </h1>

          <div data-aos="fade-up" data-aos-delay="100">
            <h2 className="fs-4">Customer-first always</h2>

            <p className="text-muted">
              That's why 1.3+ crore customers trust
              TradeSphere with ₹3.5+ lakh crores
              worth of equity investments.
            </p>
          </div>

          <div data-aos="fade-up" data-aos-delay="200">
            <h2 className="fs-4">No spam or gimmicks</h2>

            <p className="text-muted">
              No gimmicks, spam, "gamification",
              or annoying push notifications.
              High quality apps that you use at
              your pace, the way you like.
            </p>
          </div>

          <div data-aos="fade-up" data-aos-delay="300">
            <h2 className="fs-4">The TradeSphere universe</h2>

            <p className="text-muted">
              Not just an app, but a whole ecosystem.
              Our investments in 30+ fintech startups
              offer you tailored services specific
              to your needs.
            </p>
          </div>

          <div data-aos="fade-up" data-aos-delay="400">
            <h2 className="fs-4">Do better with money</h2>

            <p className="text-muted">
              With initiatives like Nudge and Kill
              Switch, we don't just facilitate
              transactions, but actively help you
              do better with your money.
            </p>
          </div>

        </div>

        <div
          className="col-lg-6 p-4 p-lg-5 text-center"
          data-aos="fade-up"
          data-aos-delay="500"
        >
          <img
            className="content-image"
            src="media/images/home-trading-ecosystem.svg"
            style={{ width: "92%" }}
            alt="Trading ecosystem illustration"
          />
        </div>

      </div>
    </section>
  );
}

export default Stats;
