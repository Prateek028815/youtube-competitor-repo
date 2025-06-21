import React, { useState } from 'react';
import { ViewsTrendChart } from './Charts/ViewsTrendChart';
import { EngagementTrendChart } from './Charts/EngagementTrendChart';
import { ComparativeGrowthChart } from './Charts/ComparativeGrowthChart';
import type { AnalysisResponse } from '../../types/youtube';

interface AnalyticsDashboardProps {
  analysisResults: AnalysisResponse;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analysisResults }) => {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [activeMetric, setActiveMetric] = useState<'views' | 'engagement' | 'comparative' | 'all'>('all');

  console.log('📊 Rendering AnalyticsDashboard with', analysisResults.data?.channels?.length, 'channels');

  const validChannels = analysisResults.data?.channels?.filter(channel => 
    channel.videos && channel.videos.length > 0
  ) || [];

  if (validChannels.length === 0) {
    return (
      <div className="analytics-dashboard-empty">
        <h3>📊 Analytics Dashboard</h3>
        <p>No valid channel data available for trend analysis</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h2>📊 NEET Channel Analytics Dashboard</h2>
        <div className="dashboard-controls">
          <div className="control-group">
            <label htmlFor="time-range">Time Range:</label>
            <select 
              id="time-range"
              value={timeRange} 
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="time-range-select"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={60}>Last 60 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>
          
          <div className="control-group">
            <label htmlFor="metric-type">Show Charts:</label>
            <select 
              id="metric-type"
              value={activeMetric} 
              onChange={(e) => setActiveMetric(e.target.value as any)}
              className="metric-select"
            >
              <option value="all">All Charts</option>
              <option value="views">Views Trend</option>
              <option value="engagement">Engagement Trend</option>
              <option value="comparative">Comparative Growth</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{validChannels.length}</span>
            <span className="stat-label">NEET Channels</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {validChannels.reduce((sum, ch) => sum + (ch.videos?.length || 0), 0)}
            </span>
            <span className="stat-label">Total Videos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{timeRange}</span>
            <span className="stat-label">Days Analysis</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {validChannels.length >= 2 ? 'Yes' : 'No'}
            </span>
            <span className="stat-label">Comparison Ready</span>
          </div>
        </div>
      </div>

      <div className="charts-container">
        {/* Comparative Growth Chart - NEW */}
        {(activeMetric === 'comparative' || activeMetric === 'all') && validChannels.length >= 2 && (
          <ComparativeGrowthChart 
            channels={validChannels} 
            timeRange={timeRange}
          />
        )}

        {(activeMetric === 'views' || activeMetric === 'all') && (
          <ViewsTrendChart 
            channels={validChannels} 
            timeRange={timeRange}
          />
        )}
        
        {(activeMetric === 'engagement' || activeMetric === 'all') && (
          <EngagementTrendChart 
            channels={validChannels} 
            timeRange={timeRange}
          />
        )}
      </div>
    </div>
  );
};
