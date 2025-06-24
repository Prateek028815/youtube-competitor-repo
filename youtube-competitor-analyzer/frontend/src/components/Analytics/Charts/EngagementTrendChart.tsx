import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartContainer } from './ChartContainer';
import { defaultChartOptions } from './chartConfig';
import { TimeSeriesProcessor } from '../../../utils/timeSeriesProcessor';
import type { ChannelAnalysis } from '../../../types/youtube';

interface EngagementTrendChartProps {
  channels: ChannelAnalysis[];
  timeRange?: number;
}

export const EngagementTrendChart: React.FC<EngagementTrendChartProps> = ({ 
  channels, 
  timeRange = 30 
}) => {
  console.log('📊 Rendering EngagementTrendChart with', channels.length, 'channels');

  const chartData = useMemo(() => {
    if (!channels || channels.length === 0) {
      return null;
    }
    
    try {
      const trendData = TimeSeriesProcessor.generateEngagementTrend(channels, timeRange);
      return TimeSeriesProcessor.formatChartData(trendData);
    } catch (error) {
      console.error('Error generating engagement trend data:', error);
      return null;
    }
  }, [channels, timeRange]);

  const chartOptions = useMemo(() => ({
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: `NEET Channel Engagement Trend (Last ${timeRange} Days)`,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        ...defaultChartOptions.plugins?.tooltip,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)}% engagement rate`;
          },
          afterLabel: function(context: any) {
            return 'Engagement = (Likes + Comments) / Views × 100';
          }
        }
      }
    },
    scales: {
      ...defaultChartOptions.scales,
      y: {
        ...defaultChartOptions.scales?.y,
        title: {
          display: true,
          text: 'Engagement Rate (%)',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        },
        ticks: {
          ...defaultChartOptions.scales?.y?.ticks,
          callback: function(value: any) {
            return value.toFixed(1) + '%';
          }
        }
      },
      x: {
        ...defaultChartOptions.scales?.x,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      }
    }
  }), [timeRange]);

  const handleExport = () => {
    console.log('📊 Exporting engagement trend chart');
    alert('Engagement trend chart export - Coming in reporting phase!');
  };

  if (!chartData) {
    return (
      <ChartContainer 
        title="💬 NEET Channel Engagement Trend"
        error="No channel data available for engagement trend analysis"
      >
        <div></div>
      </ChartContainer>
    );
  }

  if (chartData.datasets.length === 0) {
    return (
      <ChartContainer 
        title="💬 NEET Channel Engagement Trend"
        error="No videos found in the selected time range"
      >
        <div></div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer 
      title="💬 NEET Channel Engagement Trend Analysis"
      onExport={handleExport}
    >
      <Line data={chartData} options={chartOptions} />
    </ChartContainer>
  );
};
