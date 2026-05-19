import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export function DoughnutChart({ data }) {
  const options = {
    plugins: {
      legend: {
        labels: {
          color: "#B6C2D1",
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}
