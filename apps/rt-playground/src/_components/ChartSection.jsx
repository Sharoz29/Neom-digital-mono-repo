import React from 'react';
import { Box, Grid } from '@mui/material';
import CustomChart from './Charts/CustomChart';

const ChartSection = () => {
  const lineChartData = [
    { name: 'Jan', today: 50, tomorrow: 60 },
    { name: 'Feb', today: 60, tomorrow: 70 },
    { name: 'Mar', today: 70, tomorrow: 80 },
    { name: 'Apr', today: 80, tomorrow: 90 },
    { name: 'May', today: 90, tomorrow: 100 },
    { name: 'Jun', today: 70, tomorrow: 80 },
    { name: 'Jul', today: 60, tomorrow: 70 },
    { name: 'Aug', today: 80, tomorrow: 90 },
    { name: 'Sep', today: 90, tomorrow: 100 },
    { name: 'Oct', today: 70, tomorrow: 80 },
    { name: 'Nov', today: 60, tomorrow: 70 },
    { name: 'Dec', today: 50, tomorrow: 60 },
  ];

  const lineColors = ['#8884d8', '#82ca9d'];
  const lineLabels = [
    { key: 'today', text: 'Today' },
    { key: 'tomorrow', text: 'Tomorrow' },
  ];

  const pieData = [
    { name: 'Critical', value: 20 },
    { name: 'Major', value: 19 },
    { name: 'Minor', value: 50 },
    { name: 'Warning', value: 11 },
  ];
  
  const severityColors = ['#FF0000', '#FFA500', '#008000', '#0000FF'];
  const severityLabels = [
    { key: 'Critical', text: 'Critical' },
    { key: 'Major', text: 'Major' },
    { key: 'Minor', text: 'Minor' },
    { key: 'Warning', text: 'Warning' },
  ];

  const doughnutData = [
    { name: 'Active', value: 67 },
    { name: 'Expired', value: 33 },
  ];

  const alarmColors = ['#008000', '#FFA500'];
  const alarmLabels = [
    { key: 'Active', text: 'Active' },
    { key: 'Expired', text: 'Expired' }, 
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <CustomChart type="line" data={lineChartData} header="Alarm Trends" colors={lineColors} labels={lineLabels} />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomChart type="pie" data={pieData} header="Alarm Severity" colors={severityColors} labels={severityLabels} />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomChart type="pie" data={doughnutData} header="Alarm Status" colors={alarmColors} labels={alarmLabels} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChartSection;

