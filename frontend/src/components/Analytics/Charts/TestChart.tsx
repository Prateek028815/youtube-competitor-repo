import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartContainer } from './ChartContainer';
import { defaultChartOptions } from './chartConfig';
import type { ChartData } from 'chart.js';

export const TestChart: React.FC = () => {
  console.log('📊 Rendering TestChart component');

  const testData: ChartData<'line'> = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: 'NEET Physics Views',
        data: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
        borderColor: '#667eea',
        backgroundColor: '#667eea20',
        tension: 0.4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        fill: false,
      },
      {
        label: 'NEET Chemistry Views', 
        data: [800, 1400, 2200, 3800, 1600, 2400, 3200],
        borderColor: '#f093fb',
        backgroundColor: '#f093fb20',
        tension: 0.4,
        pointBackgroundColor: '#f093fb',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        fill: false,
      }
    ],
  };

  const handleExport = () => {
    console.log('📊 Export functionality - will be implemented in later steps');
    alert('Export functionality will be implemented in the reporting phase!');
  };

  return (
    <ChartContainer 
      title="📊 Chart Infrastructure Test - NEET Channel Performance"
      onExport={handleExport}
    >
      <Line data={testData} options={defaultChartOptions} />
    </ChartContainer>
  );
};
