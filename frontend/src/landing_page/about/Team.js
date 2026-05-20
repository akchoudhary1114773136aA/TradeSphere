import React from "react";

function Team() {
  return (
    <div className="container">
      <div className="row p-3 mt-5 border-top">
        <h1 className="text-center ">People</h1>
      </div>

      <div
        className="row p-3 text-muted"
        style={{ lineHeight: "1.8", fontSize: "1.2em" }}
      >
        <div className="col-6 p-3 text-center">
          <img
            src="media/images/aishwarya.jpeg"
            alt="Aishwarya Kumar Choudhary"
            style={{
              borderRadius: "100%",
              width: "50%",
              aspectRatio: "1 / 1",
              objectFit: "cover",
            }}
          />
          <h4 className="mt-5">Aishwarya Kumar Choudhary</h4>
          <h6>Founder, CEO</h6>
        </div>
        <div className="col-6 p-3">
          <p>
            Aishwarya Kumar Choudhary founded TradeSphere in 2021 with a vision
            to make investing and trading more seamless and accessible for
             everyone in India.
          </p>
          <p>
             Today, TradeSphere continues to grow as a trusted fintech platform,
    empowering modern investors through technology-driven solutions.
          </p>
          <p>Playing basketball is his zen.</p>
          <p>
            Connect on <a href="">Homepage</a> / <a href="">TradingQnA</a> /{" "}
            <a href="">Twitter</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;
