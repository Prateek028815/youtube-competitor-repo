import React, { useState, useMemo } from 'react';
import { ViewsTrendChart } from './Charts/ViewsTrendChart';
import { EngagementTrendChart } from './Charts/EngagementTrendChart';
import { ComparativeGrowthChart } from './Charts/ComparativeGrowthChart';
import type { AnalysisResponse, VideoData } from '../../types/youtube';

interface AnalyticsDashboardProps {
  analysisResults: AnalysisResponse;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analysisResults }) => {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [activeMetric, setActiveMetric] = useState<'views' | 'engagement' | 'comparative' | 'all'>('all');

  const validChannels = analysisResults.data?.channels?.filter(channel => 
    channel.videos && channel.videos.length > 0
  ) || [];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toLocaleString();
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return { bg: '#dcfce7', border: '#16a34a', text: '#15803d', icon: '🏆' };
    if (score >= 75) return { bg: '#fef3c7', border: '#d97706', text: '#92400e', icon: '⭐' };
    if (score >= 60) return { bg: '#dbeafe', border: '#2563eb', text: '#1d4ed8', icon: '📈' };
    if (score >= 40) return { bg: '#f3e8ff', border: '#7c3aed', text: '#6b21a8', icon: '📊' };
    return { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', icon: '📉' };
  };

  const topPerformingVideos = useMemo(() => {
    if (!analysisResults.data?.channels) return [];
    
    const allVideos: (VideoData & { channelName: string })[] = [];
    
    analysisResults.data.channels.forEach(channel => {
      if (channel.videos) {
        channel.videos.forEach(video => {
          allVideos.push({
            ...video,
            channelName: channel.channelName
          });
        });
      }
    });
    
    return allVideos
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5);
  }, [analysisResults]);

  if (validChannels.length === 0) {
    return (
      <div className="analytics-dashboard-empty-enhanced">
        <div className="empty-icon">📊</div>
        <h3>No Analytics Data Available</h3>
        <p>No valid channel data found for analytics visualization</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard-enhanced">
      {/* Dashboard Header */}
      <div className="dashboard-header-enhanced">
        <div className="header-content-enhanced">
          <div className="header-title-section">
            <h2 className="dashboard-title-enhanced">📊 NEET Analytics Dashboard</h2>
            <p className="dashboard-subtitle-enhanced">
              Comprehensive performance analysis for {validChannels.length} NEET channels
            </p>
          </div>
          
          <div className="dashboard-controls-enhanced">
            <select 
              value={activeMetric} 
              onChange={(e) => setActiveMetric(e.target.value as any)}
              className="metric-selector-enhanced"
            >
              <option value="all">All Charts</option>
              <option value="views">Views Trend</option>
              <option value="engagement">Engagement</option>
              <option value="comparative">Comparison</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-cards-enhanced">
        <div className="kpi-card views">
          <div className="kpi-icon">👁️</div>
          <div className="kpi-content">
            <div className="kpi-value">
              {formatNumber(validChannels.reduce((sum, ch) => sum + (ch.analytics?.totalViews || 0), 0))}
            </div>
            <div className="kpi-label">Total Views</div>
          </div>
          <div className="kpi-trend up">+12%</div>
        </div>

        <div className="kpi-card engagement">
          <div className="kpi-icon">💬</div>
          <div className="kpi-content">
            <div className="kpi-value">
              {(validChannels.reduce((sum, ch) => sum + (ch.analytics?.engagementRate || 0), 0) / validChannels.length).toFixed(1)}%
            </div>
            <div className="kpi-label">Avg Engagement</div>
          </div>
          <div className="kpi-trend up">+8%</div>
        </div>

        <div className="kpi-card videos">
          <div className="kpi-icon">📹</div>
          <div className="kpi-content">
            <div className="kpi-value">
              {validChannels.reduce((sum, ch) => sum + (ch.videos?.length || 0), 0)}
            </div>
            <div className="kpi-label">Total Videos</div>
          </div>
          <div className="kpi-trend stable">0%</div>
        </div>

        <div className="kpi-card performance">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-content">
            <div className="kpi-value">
              {Math.round(validChannels.reduce((sum, ch) => sum + (ch.analytics?.performanceScore || 0), 0) / validChannels.length)}
            </div>
            <div className="kpi-label">Avg Score</div>
          </div>
          <div className="kpi-trend up">+5%</div>
        </div>
      </div>

      {/* Top Performing Videos */}
      <div className="top-videos-enhanced">
        <div className="section-header-enhanced">
          <h3 className="section-title-enhanced">🏆 Top Performing Videos</h3>
          <span className="section-badge">Last {analysisResults.metadata?.timeWindow || 7} days</span>
        </div>
        
        <div className="top-videos-grid-enhanced">
          {topPerformingVideos.map((video, index) => {
            const rankColors = [
              { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' }, // Gold
              { bg: '#e5e7eb', border: '#6b7280', text: '#374151' }, // Silver
              { bg: '#fed7aa', border: '#ea580c', text: '#9a3412' }, // Bronze
              { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' }, // Blue
              { bg: '#f3e8ff', border: '#8b5cf6', text: '#6b21a8' }  // Purple
            ];
            const rankColor = rankColors[index] || rankColors[4];
            
            return (
              <div key={video.videoId} className="top-video-item-enhanced">
                <div 
                  className="video-rank-enhanced"
                  style={{ 
                    backgroundColor: rankColor.bg,
                    borderColor: rankColor.border,
                    color: rankColor.text
                  }}
                >
                  #{index + 1}
                </div>
                <div className="video-details-enhanced">
                  <h4 className="video-title-enhanced">{video.title}</h4>
                  <div className="video-channel-enhanced">{video.channelName}</div>
                  <div className="video-metrics-enhanced">
                    <span className="metric-enhanced views">👁️ {formatNumber(video.viewCount)}</span>
                    <span className="metric-enhanced likes">👍 {formatNumber(video.likeCount || 0)}</span>
                    <span className="metric-enhanced comments">💬 {formatNumber(video.commentCount || 0)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section-enhanced">
        {(activeMetric === 'comparative' || activeMetric === 'all') && validChannels.length >= 2 && (
          <div className="chart-container-enhanced">
            <ComparativeGrowthChart 
              channels={validChannels} 
              timeRange={timeRange}
            />
          </div>
        )}

        {(activeMetric === 'views' || activeMetric === 'all') && (
          <div className="chart-container-enhanced">
            <ViewsTrendChart 
              channels={validChannels} 
              timeRange={timeRange}
            />
          </div>
        )}
        
        {(activeMetric === 'engagement' || activeMetric === 'all') && (
          <div className="chart-container-enhanced">
            <EngagementTrendChart 
              channels={validChannels} 
              timeRange={timeRange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
