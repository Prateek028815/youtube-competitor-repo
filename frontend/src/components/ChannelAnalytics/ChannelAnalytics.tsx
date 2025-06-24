import React from 'react';
import type { ChannelAnalysis } from '../../types/youtube';

interface ChannelAnalyticsProps {
  channel: ChannelAnalysis;
}

export const ChannelAnalytics: React.FC<ChannelAnalyticsProps> = ({ channel }) => {
  console.log('📊 Rendering individual ChannelAnalytics for:', channel.channelName);

  if (!channel.analytics) {
    return (
      <div className="channel-analytics-empty">
        <p>📊 No analytics data available for this channel</p>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toLocaleString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    if (score >= 40) return '#FFC107';
    return '#F44336';
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const analytics = channel.analytics;
  const metrics = channel.channelMetrics;

  return (
    <div className="channel-analytics-individual">
      <div className="analytics-header-individual">
        <div className="header-content">
          <h3 className="analytics-title">
            <span className="title-icon">📊</span>
            Individual Channel Analytics - {channel.channelName}
          </h3>
          <div className="analytics-badge">
            <div className="status-indicator active">
              <div className="pulse-ring"></div>
              <div className="pulse-dot"></div>
            </div>
            <span className="status-text">Live Data</span>
          </div>
        </div>
      </div>

      {/* Channel Overview Metrics */}
      <div className="channel-overview-section">
        <h4>🏠 Channel Overview</h4>
        <div className="overview-grid">
          <div className="overview-metric">
            <span className="metric-label">Total Subscribers</span>
            <span className="metric-value">{formatNumber(metrics?.subscriberCount || 0)}</span>
          </div>
          <div className="overview-metric">
            <span className="metric-label">Channel Total Views</span>
            <span className="metric-value">{formatNumber(metrics?.totalChannelViews || 0)}</span>
          </div>
          <div className="overview-metric">
            <span className="metric-label">Total Channel Videos</span>
            <span className="metric-value">{formatNumber(metrics?.videoCount || 0)}</span>
          </div>
          <div className="overview-metric">
            <span className="metric-label">Channel Created</span>
            <span className="metric-value">
              {metrics?.channelCreatedDate ? new Date(metrics.channelCreatedDate).getFullYear() : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="metrics-grid-individual">
        <div className="metric-card-individual primary">
          <div className="metric-header">
            <span className="metric-icon">🎯</span>
            <span className="metric-title">Performance Score</span>
          </div>
          <div className="metric-value-large" style={{ color: getScoreColor(analytics.performanceScore) }}>
            {analytics.performanceScore}/100
          </div>
          <div className="metric-subtitle">
            {analytics.performanceScore >= 80 ? 'Excellent' : 
             analytics.performanceScore >= 60 ? 'Good' : 
             analytics.performanceScore >= 40 ? 'Average' : 'Needs Improvement'}
          </div>
        </div>

        <div className="metric-card-individual">
          <div className="metric-header">
            <span className="metric-icon">📹</span>
            <span className="metric-title">Videos in Period</span>
          </div>
          <div className="metric-value-large">{analytics.totalVideos}</div>
          <div className="metric-subtitle">{analytics.uploadFrequency}</div>
        </div>

        <div className="metric-card-individual">
          <div className="metric-header">
            <span className="metric-icon">👁️</span>
            <span className="metric-title">Total Views</span>
          </div>
          <div className="metric-value-large">{formatNumber(analytics.totalViews)}</div>
          <div className="metric-subtitle">Period total</div>
        </div>

        <div className="metric-card-individual">
          <div className="metric-header">
            <span className="metric-icon">📊</span>
            <span className="metric-title">Average Views</span>
          </div>
          <div className="metric-value-large">{formatNumber(analytics.averageViews)}</div>
          <div className="metric-subtitle">Per video</div>
        </div>

        <div className="metric-card-individual">
          <div className="metric-header">
            <span className="metric-icon">💬</span>
            <span className="metric-title">Engagement Rate</span>
          </div>
          <div className="metric-value-large">{analytics.engagementRate}%</div>
          <div className="metric-subtitle">
            {analytics.engagementRate > 3 ? 'High' : 
             analytics.engagementRate > 1 ? 'Good' : 'Low'} engagement
          </div>
        </div>

        <div className="metric-card-individual">
          <div className="metric-header">
            <span className="metric-icon">{getTrendIcon(analytics.viewsGrowthTrend)}</span>
            <span className="metric-title">Growth Trend</span>
          </div>
          <div className="metric-value-large" style={{ 
            color: analytics.viewsGrowthTrend === 'up' ? '#4CAF50' : 
                   analytics.viewsGrowthTrend === 'down' ? '#F44336' : '#FF9800' 
          }}>
            {analytics.viewsGrowthTrend.toUpperCase()}
          </div>
          <div className="metric-subtitle">Views trend</div>
        </div>
      </div>

      {/* Detailed Analytics Sections */}
      <div className="detailed-analytics-grid">
        {/* Video Performance */}
        <div className="analytics-section">
          <h4>🏆 Video Performance</h4>
          <div className="performance-details">
            <div className="performance-item">
              <span className="performance-label">Most Popular Video:</span>
              <span className="performance-value">
                {analytics.mostPopularVideo ? 
                  `${analytics.mostPopularVideo.title.substring(0, 40)}... (${formatNumber(analytics.mostPopularVideo.viewCount)} views)` :
                  'No data'
                }
              </span>
            </div>
            <div className="performance-item">
              <span className="performance-label">Least Popular Video:</span>
              <span className="performance-value">
                {analytics.leastPopularVideo ? 
                  `${analytics.leastPopularVideo.title.substring(0, 40)}... (${formatNumber(analytics.leastPopularVideo.viewCount)} views)` :
                  'No data'
                }
              </span>
            </div>
            <div className="performance-item">
              <span className="performance-label">Average Duration:</span>
              <span className="performance-value">{formatDuration(analytics.averageDuration)}</span>
            </div>
          </div>
        </div>

        {/* Engagement Analytics */}
        <div className="analytics-section">
          <h4>💖 Engagement Analytics</h4>
          <div className="engagement-details">
            <div className="engagement-item">
              <span className="engagement-label">Total Likes:</span>
              <span className="engagement-value">{formatNumber(analytics.totalLikes)}</span>
            </div>
            <div className="engagement-item">
              <span className="engagement-label">Total Comments:</span>
              <span className="engagement-value">{formatNumber(analytics.totalComments)}</span>
            </div>
            <div className="engagement-item">
              <span className="engagement-label">Avg Likes per Video:</span>
              <span className="engagement-value">
                {formatNumber(Math.round(analytics.totalLikes / Math.max(analytics.totalVideos, 1)))}
              </span>
            </div>
          </div>
        </div>

        {/* Publishing Insights */}
        <div className="analytics-section">
          <h4>📅 Publishing Insights</h4>
          <div className="publishing-details">
            <div className="publishing-item">
              <span className="publishing-label">Best Performing Days:</span>
              <div className="top-days">
                {analytics.topPerformingDays.map((day, index) => (
                  <span key={index} className="day-badge">{day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Categories */}
        {analytics.contentCategories && analytics.contentCategories.length > 0 && (
          <div className="analytics-section">
            <h4>📂 Content Categories</h4>
            <div className="categories-grid">
              {analytics.contentCategories.map((category, index) => (
                <div key={index} className="category-item">
                  <span className="category-name">{category.category}</span>
                  <span className="category-count">{category.count} videos</span>
                  <span className="category-avg">{formatNumber(category.avgViews)} avg views</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
