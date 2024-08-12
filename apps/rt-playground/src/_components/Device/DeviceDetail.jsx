import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Typography, Switch } from '@mui/material';
import styled from 'styled-components';
import CustomChart from '../Charts/CustomChart';

const DetailContainer = styled(Box)`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  background-color: white;
  height: 100%;
`;

const DetailItem = styled(Typography)`
  margin-bottom: 10px;
`;

const ActionsContainer = styled(Box)`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  background-color: white;
  height: 100%;
`;

const DeviceHeader = styled.div`
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
`;

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

const deviceData = [
  {
    id: 1,
    description: 'Device 1 is a temperature sensor located in Location 1.',
    fullName: 'Temperature Sensor',
    status: 'Active',
    location: 'Location 1',
    humidity: 44,
    temperature: 30,
    lastUpdate: 'Jul 16, 2024 10:45:00'
  },
  {
    id: 2,
    description: 'Device 2 is a humidity sensor located in Location 2.',
    fullName: 'Humidity Sensor',
    status: 'Inactive',
    location: 'Location 2',
    humidity: 60,
    temperature: 25,
    lastUpdate: 'Jul 17, 2024 11:00:00'
  },
];
const lineColors = ['#8884d8', '#82ca9d'];
const lineLabels = [
  { key: 'today', text: 'Today' },
  { key: 'tomorrow', text: 'Tomorrow' },
];
const DeviceDetail = () => {
  const { id } = useParams();
  const device = deviceData.find(device => device.id === parseInt(id));
  if (!device) {
    return <div style={{
      display:'flex',
      justifyContent:'center'
    }}> <Typography variant="h6">Device not found</Typography></div>
  }

  return (
    <>
      <DeviceHeader>Device Detail</DeviceHeader>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DetailContainer>
              <Typography variant="h6" gutterBottom>
                Device Detail
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <DetailItem variant="body2">
                    <strong>Description:</strong> {device.description}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Full Name:</strong> {device.fullName}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Status:</strong> {device.status}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Location:</strong> {device.location}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Humidity:</strong> {device.humidity}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Temperature:</strong> {device.temperature}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Last Update:</strong> {device.lastUpdate}
                  </DetailItem>
                </Grid>
              </Grid>
            </DetailContainer>
          </Grid>
          <Grid item xs={12} md={6}>
          <CustomChart type="line" data={lineChartData} header="Tempreture" colors={lineColors} labels={lineLabels} />
          </Grid>
          <Grid item xs={12} md={6}>
            <ActionsContainer>
              <Typography variant="h6" gutterBottom>
                Device Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Device name/Location
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Status</Typography>
                  <Switch />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Enable alarm</Typography>
                  <Switch />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Text</Typography>
                  <Switch defaultChecked />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Text</Typography>
                  <Switch />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Text</Typography>
                  <Switch />
                </Grid>
              </Grid>
            </ActionsContainer>
          </Grid>
          <Grid item xs={12} md={6}>
               <CustomChart type="line" data={lineChartData} header="Humidity" colors={lineColors} labels={lineLabels} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default DeviceDetail;
