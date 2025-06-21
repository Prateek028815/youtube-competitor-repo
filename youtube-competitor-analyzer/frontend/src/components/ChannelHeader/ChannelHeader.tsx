import React from 'react';
import type { ChannelAnalysis } from '../../types/youtube';

interface ChannelHeaderProps {
  channel: ChannelAnalysis;
}

export const ChannelHeader: React.FC<ChannelHeaderProps> = ({ channel }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getChannelHandle = (): string => {
    if (channel.channelUrl.includes('@')) {
      return channel.channelUrl.split('@')[1];
    }
    return channel.channelName.replace(/\s+/g, '').toLowerCase();
  };

  const calculateChannelScore = (): number => {
    if (!channel.analytics) return 0;
    
    // Simple scoring algorithm based on engagement and consistency
    const avgViews = channel.analytics.averageViews;
    const totalVideos = channel.analytics.totalVideos;
    
    let score = 0;
    
    // Views scoring (0-40 points)
    if (avgViews > 100000) score += 40;
    else if (avgViews > 50000) score += 30;
    else if (avgViews > 10000) score += 20;
    else if (avgViews > 1000) score += 10;
    
    // Content volume scoring (0-30 points)
    if (totalVideos > 20) score += 30;
    else if (totalVideos > 10) score += 20;
    else if (totalVideos > 5) score += 10;
    
    // Engagement scoring (0-30 points)
    const totalViews = channel.analytics.totalViews;
    if (totalViews > 1000000) score += 30;
    else if (totalViews > 500000) score += 20;
    else if (totalViews > 100000) score += 10;
    
    return Math.min(score, 100);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    if (score >= 40) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const channelScore = calculateChannelScore();

  return (
    <div className="channel-header">
      <div className="channel-main-info">
        <div className="channel-avatar">
          <div className="avatar-placeholder">
            {channel.channelName.charAt(0).toUpperCase()}
          </div>
          <div className="verified-badge">✓</div>
        </div>
        
        <div className="channel-details">
          <div className="channel-title-row">
            <h2 className="channel-name">{channel.channelName}</h2>
            <div className="channel-score">
              <div 
                className="score-circle"
                style={{ '--score-color': getScoreColor(channelScore) } as React.CSSProperties}
              >
                <span className="score-value">{channelScore}</span>
              </div>
              <span className="score-label">Channel Score</span>
            </div>
          </div>
          
          <div className="channel-meta">
            <span className="channel-handle">@{getChannelHandle()}</span>
            <a 
              href={channel.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="channel-link"
            >
              🔗 Visit Channel
            </a>
          </div>
          
          <div className="channel-quick-stats">
            <div className="quick-stat">
              <span className="stat-value">{channel.videos?.length || 0}</span>
              <span className="stat-label">Videos</span>
            </div>
            <div className="quick-stat">
              <span className="stat-value">
                {formatNumber(channel.analytics?.totalViews || 0)}
              </span>
              <span className="stat-label">Total Views</span>
            </div>
            <div className="quick-stat">
              <span className="stat-value">
                {formatNumber(channel.analytics?.averageViews || 0)}
              </span>
              <span className="stat-label">Avg Views</span>
            </div>
          </div>
        </div>
      </div>
      
      {channel.error && (
        <div className="channel-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{channel.error}</span>
        </div>
      )}
    </div>
  );
};
