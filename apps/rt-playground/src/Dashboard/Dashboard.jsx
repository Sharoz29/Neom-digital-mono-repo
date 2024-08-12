import React, { useState } from 'react';
import DailyMetrics from "../_components/DailyMetrics";
import ChartSection from "../_components/ChartSection";
import { MenuItem, Select, FormControl, InputLabel, Typography, Box } from '@mui/material';
import styled from 'styled-components';
import EnhancedTable from '../_components/Table/EnhancedTable';
import { useHistory } from 'react-router-dom';

const DashboardHeader = styled.div`
  padding: 20px;
  font-size: 33px;
  font-weight: bold;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 0 20px;
  margin-bottom: 16px;
`;

const deviceColumns = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Device Name' },
  { id: 'type', numeric: false, disablePadding: false, label: 'Device Type' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'action', numeric: false, disablePadding: false, label: 'Actions' }
];

const alarmColumns = [
  { id: 'id', numeric: false, disablePadding: false, label: 'ID' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Device Name' },
  { id: 'location', numeric: false, disablePadding: false, label: 'Location' },
  { id: 'time', numeric: false, disablePadding: false, label: 'Time/Date' },
  { id: 'severity', numeric: false, disablePadding: false, label: 'Severity' },
  { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'action', numeric: false, disablePadding: false, label: 'Actions' }
];

const deviceRows = [
  { id: 1, name: 'Device 1', type: 'Type A', status: 'Active' },
  { id: 2, name: 'Device 2', type: 'Type B', status: 'Inactive' },
  { id: 3, name: 'Device 3', type: 'Type C', status: 'Active' }
];

const alarmRows = [
  { id: 1, name: 'Device 1', location: 'Location 1', time: '2021-08-09 10:00', severity: 'High', type: 'Sensor', status: 'Active' },
  { id: 2, name: 'Device 2', location: 'Location 2', time: '2021-08-10 15:00', severity: 'Medium', type: 'Temperature', status: 'Inactive' }
];

export default function Dashboard() {
  const [selectedOption, setSelectedOption] = useState('devices');
  const columns = selectedOption === 'devices' ? deviceColumns : alarmColumns;
  const rows = selectedOption === 'devices' ? deviceRows : alarmRows;
  const [searchQuery, setSearchQuery] = useState('');
  const history = useHistory();
  
  const handleActionClick = (id, actionType) => {
    if (actionType === 'view') {
      const path = selectedOption === 'devices' ? `/device/${id}` : `/alaram/${id}`;
      history.push(path);
    }
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredRows = rows.filter(row => {
    return Object.values(row).some(value => value.toString().toLowerCase().includes(searchQuery));
  });

  return (
    <Box sx={{ width: '100%' }}>
      <DashboardHeader>Dashboard</DashboardHeader>
      <DailyMetrics />
      <ChartSection />
      <Controls>
        <FormControl variant="outlined" size="small">
          <InputLabel>Options</InputLabel>
          <Select value={selectedOption} onChange={handleOptionChange} label="Options">
            <MenuItem value="devices">Devices</MenuItem>
            <MenuItem value="alarms">Alarms</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body1">
          {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)} - {filteredRows.length} results
        </Typography>
      </Controls>
      <EnhancedTable
        columns={columns}
        rows={filteredRows}
        title={`${selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)} List`}
        onActionClick={handleActionClick}
      />
    </Box>
  );
}
