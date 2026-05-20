import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export function DoughnutChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,

    // Smooth Animation
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },

    // Smooth Hover Transition
    transitions: {
      active: {
        animation: {
          duration: 250,
        },
      },
    },

    plugins: {
      legend: {
        position: "top",

        labels: {
          color: "#B6C2D1",
          padding: 16,
          boxWidth: 18,
          font: {
            size: 12,
          },
        },
      },

      tooltip: {
        enabled: true,
        backgroundColor: "#111A2B",
        titleColor: "#F4F7FB",
        bodyColor: "#B6C2D1",
        borderColor: "#243147",
        borderWidth: 1,
        padding: 12,
      },
    },

    elements: {
      arc: {
        borderWidth: 1,
        hoverOffset: 10,
      },
    },

    cutout: "40%",
  };

  return (
    <div
      className="chart-container"
      style={{
        height: "320px",
        width: "100%",
        position: "relative",
        willChange: "transform",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      <Doughnut data={data} options={options} />
    </div>
  );
}