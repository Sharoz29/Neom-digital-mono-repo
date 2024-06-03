import React from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import { lineGraphData } from "../../mockData/mockData";

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function LineGraph() {
  const options = {
    animationEnabled: true,
    exportEnabled: true,
    exportFileName: "Monthly accumulated appointments",
    title: {
      text: `Monthly Accumulated Appointments - ${new Date().toLocaleString(
        "default",
        { month: "long" }
      )}`,
    },
    axisX: {
      valueFormatString: "D",
      title: "Days",
    },
    axisY: {
      title: "Accumulated Appointments",
    },
    data: lineGraphData,
  };
  return (
    <div
      style={{
        padding: 10,
        width: "33%",
      }}
    >
      <CanvasJSChart options={options} />
    </div>
  );
}
