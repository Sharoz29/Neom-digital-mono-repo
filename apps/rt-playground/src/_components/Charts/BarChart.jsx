import React from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import { barGraphData } from "../../mockData/mockData";

var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var CanvasJS = CanvasJSReact.CanvasJS;

export default function BarChart() {
  const options = {
    animationEnabled: true,
    exportEnabled: true,
    theme: "light2",
    title: {
      text: "Weekly Scheduled Appointments",
    },
    axisY: {
      title: "Appointents",
      includeZero: true,
    },
    data: [
      {
        type: barGraphData.type,
        indexLabel: barGraphData.indexLabel,
        indexLabelFontColor: barGraphData.indexLabelFontColor,
        indexLabelPlacement: barGraphData.indexLabelPlacement,
        dataPoints: barGraphData.dataPoints,
      },
    ],
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
