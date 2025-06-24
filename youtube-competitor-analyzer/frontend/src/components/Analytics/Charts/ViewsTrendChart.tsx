import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartContainer } from './ChartContainer';
import { defaultChartOptions } from './chartConfig';
import { TimeSeriesProcessor } from '../../../utils/timeSeriesProcessor';
import type { ChannelAnalysis } from '../../../types/youtube';

interface ViewsTrendChartProps {
  channels: ChannelAnalysis[];
  timeRange?: number;
}

export const ViewsTrendChart: React.FC<ViewsTrendChartProps> = ({ 
  channels, 
  timeRange = 30 
}) => {
  console.log('📊 Rendering ViewsTrendChart with', channels.length, 'channels');

  const chartData = useMemo(() => {
    if (!channels || channels.length === 0) {
      return null;
    }
    
    try {
      const trendData = TimeSeriesProcessor.generateViewsTrend(channels, timeRange);
      return TimeSeriesProcessor.formatChartData(trendData);
    } catch (error) {
      console.error('Error generating views trend data:', error);
      return null;
    }
  }, [channels, timeRange]);

  const chartOptions = useMemo(() => ({
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: `NEET Channel Views Trend (Last ${timeRange} Days)`,
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
            const formattedValue = value >= 1000000 
              ? `${(value / 1000000).toFixed(1)}M` 
              : value >= 1000 
              ? `${(value / 1000).toFixed(1)}K` 
              : value.toLocaleString();
            return `${label}: ${formattedValue} views`;
          },
          afterLabel: function(_context: any) {
            return 'Click for detailed video breakdown';
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
          text: 'Daily Views',
          font: {
            size: 12,
            weight: 'bold' as const
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
    console.log('📊 Exporting views trend chart');
    alert('Views trend chart export - Coming in reporting phase!');
  };

  if (!chartData) {
    return (
      <ChartContainer 
        title="📈 NEET Channel Views Trend"
        error="No channel data available for views trend analysis"
      >
        <div></div>
      </ChartContainer>
    );
  }

  if (chartData.datasets.length === 0) {
    return (
      <ChartContainer 
        title="📈 NEET Channel Views Trend"
        error="No videos found in the selected time range"
      >
        <div></div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer 
      title="📈 NEET Channel Views Trend Analysis"
      onExport={handleExport}
    >
      <Line data={chartData} options={chartOptions} />
    </ChartContainer>
  );
};
