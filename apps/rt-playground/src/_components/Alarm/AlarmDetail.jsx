import React from 'react';
import { useParams

  
} from 'react-router-dom';
import { Box, Grid, Typography, Switch, Button } from '@mui/material';
import styled from 'styled-components';
import CustomChart from '../Charts/CustomChart';

const DetailContainer = styled(Box)`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  background-color: white;
  height: 100%;
`;
const BackButton = styled(Button)`

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

const RecentAlarmContainer = styled(Box)`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  background-color: white;
  height: 100%;
  overflow-y: auto;
`;

const RecentAlarmItem = styled(Box)`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
  &:before {
    content: '';
    position: absolute;
    left: 6px;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #ccc;
  }
`;

const AlarmIndicator = styled(Box)`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #8884d8;
  margin-right: 10px;
  position: relative;
  z-index: 1;
`;

const AlarmDetails = styled(Box)`
  margin-left: 30px;
`;

const AlaramHeader = styled.div`
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
`;

const COLORS = ['#8884d8', '#82ca9d'];

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

const alarmsData = [
  {
    id: 1,
    description: 'Temperature exceed the value in Sensor#5',
    status: 'Active',
    deviceName: 'Sensor#5',
    deviceLocation: 'Location 1',
    alarmType: 'Temperature',
    alarmSeverity: 'High',
    lastUpdate: 'Jul 16, 2024 10:45:00'
  },
  {
    id: 2,
    description: 'Humidity exceed the value in Sensor#6',
    status: 'Active',
    deviceName: 'Sensor#6',
    deviceLocation: 'Location 2',
    alarmType: 'Humidity',
    alarmSeverity: 'Medium',
    lastUpdate: 'Jul 17, 2024 11:00:00'
  },
];

const recentAlarms = [
  { id: 1, title: 'Emergency alarm: Sensor#5', date: 'Jul 16, 2024 10:45:00', description: 'Temperature exceed the value' },
  { id: 2, title: 'Emergency alarm: Sensor#6', date: 'Jul 17, 2024 11:00:00', description: 'Humidity exceed the value' },
  { id: 3, title: 'Emergency alarm: Sensor#7', date: 'Jul 18, 2024 12:30:00', description: 'Pressure exceed the value' },
  { id: 4, title: 'Emergency alarm: Sensor#8', date: 'Jul 19, 2024 13:45:00', description: 'Gas leak detected' },
  { id: 5, title: 'Emergency alarm: Sensor#9', date: 'Jul 20, 2024 14:30:00', description: 'Water leak detected' },
  { id: 6, title: 'Emergency alarm: Sensor#10', date: 'Jul 21, 2024 15:00:00', description: 'Temperature exceed the value' },
  { id: 7, title: 'Emergency alarm: Sensor#11', date: 'Jul 22, 2024 16:00:00', description: 'Humidity exceed the value' },
  { id: 8, title: 'Emergency alarm: Sensor#12', date: 'Jul 23, 2024 17:30:00', description: 'Pressure exceed the value' },
];
const lineColors = ['#8884d8', '#82ca9d'];
const lineLabels = [
  { key: 'today', text: 'Today' },
  { key: 'tomorrow', text: 'Tomorrow' },
];
const AlarmDetail = () => {
  const { id } = useParams();
  const alarm = alarmsData.find(alarm => alarm.id === parseInt(id));

  if (!alarm) {
    return <Typography variant="h6">Alarm not found</Typography>;
  }

  return (
    <>
      <AlaramHeader>Alarm Detail</AlaramHeader>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DetailContainer>
              <Typography variant="h6" gutterBottom>
                Alarm Detail
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <DetailItem variant="body2">
                    <strong>Descriptions:</strong> {alarm.description}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Status:</strong> {alarm.status}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Device Name:</strong> {alarm.deviceName}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Device Location:</strong> {alarm.deviceLocation}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Alarm Type:</strong> {alarm.alarmType}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Alarm Severity:</strong> {alarm.alarmSeverity}
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem variant="body2">
                    <strong>Last Update:</strong> {alarm.lastUpdate}
                  </DetailItem>
                </Grid>
              </Grid>
            </DetailContainer>
          </Grid>
          <Grid item xs={12} md={6}>
          <CustomChart type="line" data={lineChartData} header="Humidity" colors={lineColors} labels={lineLabels} />
          </Grid>
          <Grid item xs={12} md={6}>
            <ActionsContainer>
              <Typography variant="h6" gutterBottom>
                Alarm Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Alarm
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Alarm Status</Typography>
                  <Switch />
                </Grid>
                <Grid item xs={6}>
                  <Button variant="outlined">Time Delay</Button>
                  <Button variant="outlined">Alarm Delay</Button>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Text</Typography>
                  <Switch />
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
            <RecentAlarmContainer sx={{ maxHeight: 313 }}>
              <Typography variant="h6" gutterBottom>
                Recent Alarms
              </Typography>
              {recentAlarms.map((alarm) => (
                <RecentAlarmItem key={alarm.id}>
                  <AlarmIndicator />
                  <AlarmDetails>
                    <Typography variant="body2"><strong>{alarm.title}</strong></Typography>
                    <Typography variant="body2">{alarm.date}</Typography>
                    <Typography variant="body2">{alarm.description}</Typography>
                  </AlarmDetails>
                </RecentAlarmItem>
              ))}
            </RecentAlarmContainer>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AlarmDetail;
