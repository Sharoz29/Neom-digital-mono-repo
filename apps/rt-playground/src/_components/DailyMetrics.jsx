import React from "react";
import { dailyMetricsData } from "../mockData/mockData";

export default function DailyMetrics() {
  const appointmentType = dailyMetricsData[0]?.caseType;
  return (
    <div>
      <h3 style={{ textAlign: "center" }}>Daily Report</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          marginTop: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-evenly",
            border: "2.5px solid black",
            borderRadius: "10px",
            padding: 10,
            width: 220,
            height: 150,
          }}
        >
          <h3 style={{ fontSize: "25px" }}>Today</h3>
          <span style={{ fontSize: "50px" }}>
            {dailyMetricsData[0]?.casesForToday}
          </span>
        </div>
        {appointmentType &&
          appointmentType.map((appointment, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-evenly",
                border: "2.5px solid black",
                borderRadius: "10px",
                padding: 10,
                width: 220,
                height: 150,
              }}
            >
              <h3 style={{ fontSize: "25px" }}>{appointment.type}</h3>
              <span style={{ fontSize: "50px" }}>
                {appointment.numberOfCases}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
