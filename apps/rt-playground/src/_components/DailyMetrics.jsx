import React from "react";
import styled from 'styled-components';



const Container = styled.div`
  // text-align: center;
  // margin-top: 20px;
  // padding: 0 10px;
`;

const MetricsContainer = styled.div`
  display: flex;
  padding:5px;
  flex-direction: row;
  // justify-content: center;
  flex-wrap: wrap;

  @media (min-width: 300px) {
    // justify-content: center;
  }
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const MetricCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 10px;
  padding: 20px;
  width: 410px;
  height: 80px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin: 10px;

  @media (max-width: 1669px) {
    width: 22%;
    height: 100px;
  }
  @media (max-width: 768px) {
    width: 80%;
    margin-bottom: 20px;
  }
`;

const MetricTitle = styled.h3`
  font-size: 16px;
  color: black;
`;

const MetricNumber = styled.span`
  font-size: 24px;
  color: black;
  font-weight: bold;
`;

export default function DailyMetrics() {
  const metrics = [
    { title: "Total devices", value: 100 },
    { title: "No of Alarms", value: 7 },
    { title: "Active Devices", value: 54 },
    { title: "Text", value: "8K" },
  ];

  return (
    <Container>
      <MetricsContainer>
        {metrics.map((metric, index) => (
          <MetricCard key={index}>
            <MetricTitle>{metric.title}</MetricTitle>
            <MetricNumber>{metric.value}</MetricNumber>
          </MetricCard>
        ))}
      </MetricsContainer>
    </Container>
  );
}
