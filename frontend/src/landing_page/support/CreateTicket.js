import React from "react";

function CreateTicket() {
  const topics = [
    {
      title: "Account Opening",
      items: [
        "Online Account Opening",
        "Offline Account Opening",
        "Company, Partnership and HUF Account",
        "NRI Account Opening",
        "Charges at TradeSphere",
        "3-in-1 Account",
        "Getting Started",
      ],
    },
    {
      title: "Trading & Markets",
      items: [
        "Equity Trading",
        "F&O Trading",
        "Commodity Trading",
        "Currency Trading",
        "Order Types",
        "Margin Info",
        "Market Timings",
      ],
    },
    {
      title: "Funds & Payments",
      items: [
        "Add Funds",
        "Withdraw Funds",
        "UPI Payments",
        "Bank Linking",
        "Payment Issues",
        "Transaction History",
      ],
    },
  ];

  return (
    <div className="container">
      <div className="row p-5 mt-5 mb-5">

        <h1 className="fs-2 mb-4">
          To create a ticket, select a relevant topic
        </h1>

        {topics.map((section, index) => (
          <div className="col-4 p-4 mt-2 mb-2" key={index}>
            
            <h4>
              <i className="fa fa-plus-circle" aria-hidden="true"></i>{" "}
              {section.title}
            </h4>

            {section.items.map((item, i) => (
              <a
                key={i}
                href="#"
                style={{ textDecoration: "none", lineHeight: "2.2" }}
              >
                {item}
                <br />
              </a>
            ))}

          </div>
        ))}

      </div>
    </div>
  );
}

export default CreateTicket;