export const barGraphData = {
  type: "column",
  indexLabel: "{y}", //Shows y value on all Data Points
  indexLabelFontColor: "#5A5757",
  indexLabelPlacement: "outside",
  dataPoints: [
    { label: "Monday", y: 13 },
    { label: "Tuesday", y: 15 },
    { label: "Wednesday", y: 16 },
    { label: "Thursday", y: 17 },
    { label: "Friday", y: 15 },
    { label: "Saturday", y: 20 },
    { label: "Sunday", y: 9 },
  ],
};

export const pieChartData = {
  type: "pie",
  showInLegend: true,
  legendText: "{label}",
  toolTipContent: "{label}: <strong>{y}</strong>",
  indexLabel: "{x}",
  indexLabelPlacement: "outside",
  dataPoints: [
    { y: 8, label: "New" },
    { y: 3, label: "Follow ups" },
    { y: 4, label: "Rescheduled" },
    { y: 2, label: "Emergency" },
  ],
};

const yArr = [
  2, 4, 6, 7, 8, 8, 3, 4, 9, 0, 7, 4, 4, 9, 6, 5, 3, 4, 7, 4, 5, 6, 2, 4, 6, 2,
  9, 3, 6, 9, 7,
];
const dataArr = [];
let sum = 0;
for (let i = 0; i < yArr.length; i++) {
  sum += yArr[i];
  dataArr.push({
    x: new Date(2024, 4, i + 1),
    y: sum,
  });
}
export const lineGraphData = [
  {
    yValueFormatString: "### Appointments",
    xValueFormatString: "DD-MMMM",
    type: "spline",
    dataPoints: dataArr,
  },
];
export const dailyMetricsData = [
  {
    casesForToday: 13,
    caseType: [
      {
        type: "Follow Ups",
        numberOfCases: 5,
      },
      {
        type: "New",
        numberOfCases: 4,
      },
      {
        type: "Rescheduled",
        numberOfCases: 4,
      },
    ],
  },
];
export const headerData = ["Case", "Status", "Urgency", "Create Date"];
