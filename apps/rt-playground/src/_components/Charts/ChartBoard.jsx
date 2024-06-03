import React from "react";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
import LineGraph from "./LineGraph";
import DailyMetrics from "../DailyMetrics";

export default function ChartBoard() {
  return (
    <div>
      <DailyMetrics />
      <h3 style={{ textAlign: "center" }}>Metrics</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexFlow: "wrap",
          alignItems: "center",
          width: "100%",
        }}
      >
        <PieChart />
        <BarChart />
        <LineGraph />
      </div>
    </div>
  );
}
