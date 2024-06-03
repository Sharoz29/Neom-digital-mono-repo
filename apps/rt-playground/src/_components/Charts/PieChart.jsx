import React from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import { pieChartData } from "../../mockData/mockData";

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function PieChart() {
  const options = {
    theme: "light2",
    animationEnabled: true,
    exportFileName: "Appointmnents scheduled for today",
    exportEnabled: true,
    title: {
      text: "Types of appointments scheduled for today",
    },
    data: [
      {
        type: pieChartData.type,
        showInLegend: pieChartData.showInLegend,
        legendText: pieChartData.legendText,
        toolTipContent: pieChartData.toolTipContent,
        indexLabel: pieChartData.indexLabel,
        indexLabelPlacement: pieChartData.indexLabelPlacement,
        dataPoints: pieChartData.dataPoints,
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
