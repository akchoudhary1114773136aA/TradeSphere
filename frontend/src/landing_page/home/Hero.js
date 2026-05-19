import React from "react";
import "./Hero.css";

function Hero() {
  return (
    <section className="tradehero">

      <div className="tradehero-card" data-aos="fade-up">

        <div className="tradehero-header">
          <div className="tradehero-brand">
            <span className="tradehero-brand-icon">🌐</span>
            <span>TradeSphere</span>
            <span className="tradehero-live">Live</span>
          </div>

          <div className="tradehero-ranges">
            <button className="tradehero-range-btn active">1D</button>
            <button className="tradehero-range-btn">6M</button>
            <button className="tradehero-range-btn">1Y</button>
            <button className="tradehero-range-btn">5Y</button>
          </div>
        </div>

        <div className="tradehero-main">

          <div>
            <p className="tradehero-label">NIFTY 50</p>
            <h1 className="tradehero-price">22,450.30</h1>
            <p className="tradehero-change">+278.40 (+1.24%)</p>
            <p className="tradehero-sub">NSE · Updated just now</p>
          </div>

          <div className="tradehero-chart">
            <div className="tradehero-chart-line">
              <svg viewBox="0 0 360 200" preserveAspectRatio="none">
                <path
                  d="M0 142 C60 138 80 130 120 113 C160 97 200 110 240 120 C280 130 320 115 360 95"
                  fill="none"
                  stroke="rgba(255,255,255,0.95)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

        </div>

        <div className="tradehero-chart-legend">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
        </div>

      </div>

      <div className="tradehero-grid">

        <div
          className="tradehero-card-small"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <p className="card-title">RELIANCE</p>
          <p className="card-value">2,890.50</p>
          <p className="card-change">+0.87%</p>
          <div className="chart-strip"></div>
        </div>

        <div
          className="tradehero-card-small negative"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <p className="card-title">TCS</p>
          <p className="card-value">3,456.00</p>
          <p className="card-change">-0.32%</p>
          <div className="chart-strip"></div>
        </div>

        <div
          className="tradehero-card-small"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <p className="card-title">HDFC BANK</p>
          <p className="card-value">1,721.80</p>
          <p className="card-change">+1.13%</p>
          <div className="chart-strip"></div>
        </div>

        <div
          className="tradehero-card-small negative"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <p className="card-title">INFOSYS</p>
          <p className="card-value">1,498.25</p>
          <p className="card-change">-0.61%</p>
          <div className="chart-strip"></div>
        </div>

      </div>

      <div className="tradehero-info">

        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">52W High</p>
          <p className="info-value">23,441</p>
          <p className="info-note">4.2% away</p>
        </div>

        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">Volume</p>
          <p className="info-value">2.4B</p>
          <p className="info-note">Avg 2.1B</p>
        </div>

        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">P/E Ratio</p>
          <p className="info-value">21.3x</p>
          <p className="info-note">Hist. 19.8x</p>
        </div>

      </div>

    </section>
  );
}

export default Hero;