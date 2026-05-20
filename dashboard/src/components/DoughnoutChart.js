import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export function DoughnutChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,

    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },

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
        callbacks: {
          label: function (context) {
            const chart = context.chart;
            const dataset = context.dataset;

            // Sum only visible segments
            const total = dataset.data.reduce((acc, val, i) => {
              return chart.getDataVisibility(i) ? acc + val : acc;
            }, 0);

            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${value} (${percentage}%)`;
          },
        },
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