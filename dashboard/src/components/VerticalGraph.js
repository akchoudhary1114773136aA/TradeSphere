import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  scales: {
    x: {
      ticks: {
        color: "#B6C2D1",
      },
      grid: {
        color: "rgba(114,129,151,0.14)",
      },
    },
    y: {
      ticks: {
        color: "#B6C2D1",
      },
      grid: {
        color: "rgba(114,129,151,0.14)",
      },
    },
  },
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#B6C2D1",
      },
    },
    title: {
      display: true,
      text: "Holdings",
      color: "#F4F7FB",
    },
  },
};

export function VerticalGraph({ data }) {
  return <Bar options={options} data={data} />;
}
