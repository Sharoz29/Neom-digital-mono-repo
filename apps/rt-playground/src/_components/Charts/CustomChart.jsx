import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

const defaultColors = {
  line: ['#8884d8', '#82ca9d'],
  pie: ['#FF8042', '#FFBB28', '#00C49F', '#0088FE'],
  bar: ['#8884d8']
};

const defaultLabels = {
  line: [
    { key: 'critical', text: 'Critical' },
    { key: 'major', text: 'Major' },
    { key: 'minor', text: 'Minor' },
    { key: 'warning', text: 'Warning' },
  ],
  pie: [
    { key: 'active', text: 'Active' },
    { key: 'inactive', text: 'Inactive' },
  ],
  bar: [
    { key: 'value', text: 'Value' },
  ]
};

const defaultHeader = 'Chart';

const CustomChart = ({ type, data, header, style, colors, labels }) => {
  const finalColors = colors || defaultColors[type];
  const finalLabels = labels || defaultLabels[type];
  const finalHeader = header || defaultHeader;

  const [activeLines, setActiveLines] = useState(finalLabels.reduce((acc, label) => ({ ...acc, [label.key]: true }), {}));

  const defaultStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: 'white',
    ...style,
  };

  const toggleLine = (key) => {
    setActiveLines((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderLegend = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
      {finalLabels.map((label, index) => (
        <Box
          key={index}
          sx={{ display: 'flex', alignItems: 'center', marginRight: 1, cursor: 'pointer' }}
          onClick={() => toggleLine(label.key)}
        >
          <Box
            sx={{ width: 12, height: 12, backgroundColor: finalColors[index], marginRight: 1, opacity: activeLines[label.key] ? 1 : 0.5 }}
          />
          <Typography>{label.text}</Typography>
        </Box>
      ))}
    </Box>
  );

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              {finalLabels.map((label, index) =>
                activeLines[label.key] && <Line key={label.key} type="monotone" dataKey={label.key} stroke={finalColors[index]} />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.filter(entry => activeLines[entry.name])}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill={finalColors[0]}
                paddingAngle={5}
                dataKey="value"
    
              >
                {data.map((entry, index) => (
                  activeLines[entry.name] && <Cell key={`cell-${index}`} fill={finalColors[index % finalColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              {finalLabels.map((label, index) =>
                activeLines[label.key] && <Bar key={label.key} dataKey="value" fill={finalColors[index]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return <Typography variant="h6">Invalid chart type</Typography>;
    }
  };

  return (
    <Box sx={defaultStyle}>
      <Typography style={{ color: 'black', fontWeight: '600' }} variant="h6" gutterBottom>
        {finalHeader}
      </Typography>
      {renderLegend()}
      {renderChart()}
    </Box>
  );
};

export default CustomChart;
