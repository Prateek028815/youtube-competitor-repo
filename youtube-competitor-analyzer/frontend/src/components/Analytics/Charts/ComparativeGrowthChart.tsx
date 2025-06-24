import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartContainer } from './ChartContainer';
import { defaultChartOptions } from './chartConfig';
import { ComparativeProcessor } from '../../../utils/comparativeProcessor';
import type { ChannelAnalysis } from '../../../types/youtube';
import { Chart } from 'chart.js';

interface ComparativeGrowthChartProps {
  channels: ChannelAnalysis[];
  timeRange?: number;
}

export const ComparativeGrowthChart: React.FC<ComparativeGrowthChartProps> = ({ 
  channels, 
  timeRange = 30 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'engagement' | 'uploads'>('views');
  const chartRef = useRef<any>(null);
  const canvasId = `comparative-chart-${Date.now()}`;
  
  console.log('📊 Rendering ComparativeGrowthChart with', channels.length, 'channels');

  // FIXED: Destroy existing chart before creating new one
  useEffect(() => {
    return () => {
      // Destroy chart using Chart.getChart method
      const existingChart = Chart.getChart(canvasId);
      if (existingChart) {
        existingChart.destroy();
      }
    };
  }, [canvasId]);

  // FIXED: Destroy chart when dependencies change
  useEffect(() => {
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) {
      existingChart.destroy();
    }
  }, [selectedMetric, timeRange, channels, canvasId]);

  const { chartData, growthStats } = useMemo(() => {
    if (!channels || channels.length < 2) {
      return { chartData: null, growthStats: null };
    }
    
    try {
      const { datasets, labels } = ComparativeProcessor.generateComparativeGrowth(
        channels, 
        selectedMetric, 
        timeRange
      );
      
      const chartData = ComparativeProcessor.formatComparativeChartData(datasets, labels);
      
      const growthStats = datasets.map(dataset => ({
        channelName: dataset.label,
        growth: dataset.growth,
        rank: dataset.rank,
        totalValue: dataset.totalValue,
        channelId: dataset.channelId
      })).sort((a, b) => a.rank - b.rank);
      
      return { chartData, growthStats };
    } catch (error) {
      console.error('Error generating comparative growth data:', error);
      return { chartData: null, growthStats: null };
    }
  }, [channels, selectedMetric, timeRange]);

  // FIXED: Simplified chart options without problematic legend function
  const chartOptions = useMemo(() => ({
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: `NEET Channel Comparative Growth - ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} (${timeRange} Days)`,
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
            
            let formattedValue = '';
            switch (selectedMetric) {
              case 'views':
                formattedValue = value >= 1000000 
                  ? `${(value / 1000000).toFixed(1)}M` 
                  : value >= 1000 
                  ? `${(value / 1000).toFixed(1)}K` 
                  : value.toLocaleString();
                formattedValue += ' views';
                break;
              case 'engagement':
                formattedValue = `${value.toFixed(2)}% engagement`;
                break;
              case 'uploads':
                formattedValue = `${value} uploads`;
                break;
            }
            
            return `${label}: ${formattedValue}`;
          }
        }
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 'normal' as const
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
          text: selectedMetric === 'views' ? 'Daily Views' : 
                selectedMetric === 'engagement' ? 'Engagement Rate (%)' : 'Daily Uploads',
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
  }), [selectedMetric, timeRange]);

  const handleExport = () => {
    console.log('📊 Exporting comparative growth chart');
    alert('Comparative growth chart export - Coming in reporting phase!');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toLocaleString();
  };

  if (!chartData) {
    return (
      <ChartContainer 
        title="📊 NEET Channel Comparative Growth"
        error={channels.length < 2 ? "Need at least 2 channels for comparison" : "No data available for comparative analysis"}
      >
        <div></div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer 
      title="📊 NEET Channel Comparative Growth Analysis"
      onExport={handleExport}
    >
      <div className="comparative-chart-container">
        {/* Metric Selector */}
        <div className="metric-selector">
          <label htmlFor="comparative-metric">Compare by:</label>
          <select 
            id="comparative-metric"
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value as 'views' | 'engagement' | 'uploads')}
            className="metric-select"
          >
            <option value="views">Daily Views</option>
            <option value="engagement">Engagement Rate</option>
            <option value="uploads">Upload Frequency</option>
          </select>
        </div>

        {/* FIXED: Chart with unique ID and proper cleanup */}
        <div className="chart-wrapper">
          <Line 
            ref={chartRef}
            id={canvasId}
            key={`${canvasId}-${selectedMetric}-${timeRange}`}
            data={chartData} 
            options={chartOptions} 
          />
        </div>

        {/* Growth Statistics */}
        {growthStats && (
          <div className="growth-statistics">
            <h4>📈 Growth Statistics ({timeRange} days)</h4>
            <div className="stats-grid">
              {growthStats.map((stat) => (
                <div key={stat.channelId} className="stat-card">
                  <div className="stat-header">
                    <span className="rank-badge">#{stat.rank}</span>
                    <span className="channel-name">{stat.channelName}</span>
                  </div>
                  <div className="stat-metrics">
                    <div className="metric">
                      <span className="metric-label">Growth Rate</span>
                      <span className={`metric-value ${stat.growth >= 0 ? 'positive' : 'negative'}`}>
                        {stat.growth > 0 ? '+' : ''}{stat.growth.toFixed(1)}%
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Total {selectedMetric}</span>
                      <span className="metric-value">
                        {selectedMetric === 'engagement' 
                          ? `${stat.totalValue.toFixed(1)}%` 
                          : formatNumber(stat.totalValue)
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ChartContainer>
  );
};
