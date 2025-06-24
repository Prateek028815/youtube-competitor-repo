import React from 'react';
import type { AnalysisResponse } from '../../types/youtube';

interface AnalyticsDashboardProps {
  analysisResults: AnalysisResponse;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analysisResults }) => {
  const validChannels = analysisResults.data?.channels?.filter(channel => 
    channel.videos && channel.videos.length > 0
  ) || [];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toLocaleString();
  };

  if (validChannels.length === 0) {
    return (
      <div className="analytics-dashboard-empty">
        <div className="empty-icon">📊</div>
        <h3>No Analytics Data Available</h3>
        <p>No valid channel data found for analytics visualization</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard-horizontal">
      {/* Dashboard Header */}
      <div className="dashboard-header-horizontal">
        <h2 className="dashboard-title-horizontal">📊 NEET Analytics Overview</h2>
        <p className="dashboard-subtitle-horizontal">
          Performance summary for {validChannels.length} NEET channels
        </p>
      </div>

      {/* Horizontal KPI Cards */}
      <div className="kpi-cards-horizontal">
        <div className="kpi-card-horizontal views">
          <div className="kpi-header-horizontal">
            <div className="kpi-icon-horizontal">👁️</div>
            <div className="kpi-label-horizontal">Total Views</div>
          </div>
          <div className="kpi-value-horizontal">
            {formatNumber(validChannels.reduce((sum, ch) => sum + (ch.analytics?.totalViews || 0), 0))}
          </div>
          <div className="kpi-trend-horizontal up">↗ +12%</div>
        </div>

        <div className="kpi-card-horizontal engagement">
          <div className="kpi-header-horizontal">
            <div className="kpi-icon-horizontal">💬</div>
            <div className="kpi-label-horizontal">Avg Engagement</div>
          </div>
          <div className="kpi-value-horizontal">
            {validChannels.length > 0 ? 
              (validChannels.reduce((sum, ch) => sum + (ch.analytics?.engagementRate || 0), 0) / validChannels.length).toFixed(1) : 
              '0'
            }%
          </div>
          <div className="kpi-trend-horizontal up">↗ +8%</div>
        </div>

        <div className="kpi-card-horizontal videos">
          <div className="kpi-header-horizontal">
            <div className="kpi-icon-horizontal">📹</div>
            <div className="kpi-label-horizontal">Total Videos</div>
          </div>
          <div className="kpi-value-horizontal">
            {validChannels.reduce((sum, ch) => sum + (ch.videos?.length || 0), 0)}
          </div>
          <div className="kpi-trend-horizontal stable">→ 0%</div>
        </div>

        <div className="kpi-card-horizontal performance">
          <div className="kpi-header-horizontal">
            <div className="kpi-icon-horizontal">🎯</div>
            <div className="kpi-label-horizontal">Avg Score</div>
          </div>
          <div className="kpi-value-horizontal">
            {validChannels.length > 0 ? 
              Math.round(validChannels.reduce((sum, ch) => sum + (ch.analytics?.performanceScore || 0), 0) / validChannels.length) : 
              0
            }
          </div>
          <div className="kpi-trend-horizontal up">↗ +5%</div>
        </div>

        <div className="kpi-card-horizontal channels">
          <div className="kpi-header-horizontal">
            <div className="kpi-icon-horizontal">📺</div>
            <div className="kpi-label-horizontal">Channels</div>
          </div>
          <div className="kpi-value-horizontal">
            {validChannels.length}
          </div>
          <div className="kpi-trend-horizontal stable">→ Active</div>
        </div>
      </div>
    </div>
  );
};
