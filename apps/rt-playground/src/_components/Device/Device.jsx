import React from 'react';
import styled from 'styled-components';
import EnhancedTable from '../Table/EnhancedTable';


const DeviceHeader = styled.div`
padding: 20px;
font-size: 24px;
font-weight: bold;
`;

const columns = [
  {
    id: 'deviceName',
    numeric: false,
    disablePadding: false,
    label: 'Device Name',
  },
  {
    id: 'deviceLocation',
    numeric: false,
    disablePadding: false,
    label: 'Device Location',
  },
  {
    id: 'alarmDateTime',
    numeric: false,
    disablePadding: false,
    label: 'Alarm Date/Time',
  },
  {
    id: 'alarmSeverity',
    numeric: false,
    disablePadding: false,
    label: 'Alarm Severity',
  },
  {
    id: 'alarmType',
    numeric: false,
    disablePadding: false,
    label: 'Alarm Type',
  },
  {
    id: 'alarmStatus',
    numeric: false,
    disablePadding: false,
    label: 'Alarm Status',
  },
];

function createData(id, deviceName, deviceLocation, alarmDateTime, alarmSeverity, alarmType, alarmStatus) {
  return { id, deviceName, deviceLocation, alarmDateTime, alarmSeverity, alarmType, alarmStatus };
}

const rows = [
  createData(1, 'AC', 'Cell Text', 'Cell Text', 'Cell Text', 'Cell Text', 'Active'),
  createData(2, 'name', 'Cell Text', 'Cell Text', 'Cell Text', 'Cell Text', 'Badge'),
  createData(3, 'name', 'Cell Text', 'Cell Text', 'Cell Text', 'Cell Text', 'Badge'),
  createData(4, 'name', 'Cell Text', 'Cell Text', 'Cell Text', 'Cell Text', 'Badge'),
  createData(5, 'name', 'Cell Text', 'Cell Text', 'Cell Text', 'Cell Text', 'Badge'),
  createData(6, 'name', 'Cell Text', 'Cell Text', 'Cell Text', 'Cell Text', 'Badge'),
  createData(7, 'name', 'Cell Text', 'Cell Text', 'Cell Text', 'Cell Text', 'Badge'), 
  createData(8, 'name', 'Cell Text', 'Cell Text', 'Cell Text', 'Cell Text', 'Badge'),
  createData(9, 'name', 'Cell Text', 'Cell Text', 'Cell Text', 'Cell Text', 'Badge'),
  createData(10, 'name', 'Cell Text', 'Cell Text', 'Cell Text', 'Cell Text', 'Badge'),
];

const Device = () => {
  return (
    <>
       <DeviceHeader>
         Devices
      </DeviceHeader>
      <EnhancedTable columns={columns} rows={rows} title="Devices List" />
     
            
    </>
  );
};

export default Device;
