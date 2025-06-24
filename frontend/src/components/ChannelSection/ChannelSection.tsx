import React, { useState } from 'react';
import type { ChannelAnalysis, VideoData } from '../../types/youtube';

interface ChannelSectionProps {
  channel: ChannelAnalysis;
  channelIndex: number;
  totalChannels: number;
  autoExpand?: boolean;
  allChannels?: ChannelAnalysis[];
}

export const ChannelSection: React.FC<ChannelSectionProps> = ({ 
  channel, 
  channelIndex, 
  totalChannels,
  autoExpand = false,
  allChannels = []
}) => {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [videoFilter, setVideoFilter] = useState<'all' | 'long' | 'shorts'>('all');

  console.log(`🔍 ChannelSection rendering:`, {
    channelName: channel?.channelName,
    videosCount: channel?.videos?.length,
    channelIndex,
    isExpanded,
    autoExpand
  });

  if (!channel) {
    return (
      <div className="channel-error-modern">
        <div className="error-illustration">
          <div className="error-icon">⚠️</div>
          <div className="error-bg"></div>
        </div>
        <h3>Channel Data Unavailable</h3>
        <p>Unable to load channel information. Please try again.</p>
      </div>
    );
  }

  const getPerformanceData = () => {
    if (!channel.analytics) {
      return { 
        status: 'No Data', 
        color: '#64748b', 
        icon: '📊', 
        gradient: 'linear-gradient(135deg, #64748b, #475569)',
        score: 0
      };
    }
    
    const score = channel.analytics.performanceScore || 0;
    if (score >= 80) return { 
      status: 'Excellent', 
      color: '#10b981', 
      icon: '🏆',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      score
    };
    if (score >= 60) return { 
      status: 'Good', 
      color: '#f59e0b', 
      icon: '⭐',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      score
    };
    if (score >= 40) return { 
      status: 'Average', 
      color: '#6366f1', 
      icon: '📈',
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      score
    };
    return { 
      status: 'Needs Work', 
      color: '#ef4444', 
      icon: '📊',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      score
    };
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toLocaleString();
  };

  const formatDuration = (duration: string): string => {
    if (!duration) return '0:00';
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const [, hours, minutes, seconds] = match;
    const h = parseInt(hours || '0');
    const m = parseInt(minutes || '0');
    const s = parseInt(seconds || '0');
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getDurationInSeconds = (duration: string): number => {
    if (!duration) return 0;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const [, hours, minutes, seconds] = match;
    const h = parseInt(hours || '0');
    const m = parseInt(minutes || '0');
    const s = parseInt(seconds || '0');
    
    return h * 3600 + m * 60 + s;
  };

  const isShortVideo = (video: VideoData): boolean => {
    const durationInSeconds = getDurationInSeconds(video.duration || '');
    return durationInSeconds <= 60; // YouTube Shorts are 60 seconds or less
  };

  const categorizeVideos = () => {
    if (!channel.videos) return { longVideos: [], shorts: [] };
    
    const longVideos = channel.videos.filter(video => !isShortVideo(video));
    const shorts = channel.videos.filter(video => isShortVideo(video));
    
    return { longVideos, shorts };
  };

  const getFilteredVideos = () => {
    const { longVideos, shorts } = categorizeVideos();
    
    switch (videoFilter) {
      case 'long':
        return longVideos.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      case 'shorts':
        return shorts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      default:
        return [...longVideos, ...shorts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    }
  };

  const getTimeSince = (dateString: string): string => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
      return `${Math.floor(diffDays / 365)}y ago`;
    } catch {
      return 'Unknown';
    }
  };

  const calculateChannelAverage = (): number => {
    if (!channel.videos || channel.videos.length === 0) return 0;
    const totalViews = channel.videos.reduce((sum, video) => sum + (video.viewCount || 0), 0);
    return Math.round(totalViews / channel.videos.length);
  };

  const getVideoPerformance = (video: VideoData, channelAverage: number): { percentage: number; status: string; color: string } => {
    if (channelAverage === 0) return { percentage: 0, status: 'No Data', color: '#64748b' };
    
    const performance = (video.viewCount / channelAverage) * 100;
    
    if (performance >= 200) return { percentage: Math.round(performance), status: 'Viral', color: '#dc2626' };
    if (performance >= 150) return { percentage: Math.round(performance), status: 'Excellent', color: '#10b981' };
    if (performance >= 100) return { percentage: Math.round(performance), status: 'Above Average', color: '#f59e0b' };
    if (performance >= 50) return { percentage: Math.round(performance), status: 'Average', color: '#6366f1' };
    return { percentage: Math.round(performance), status: 'Below Average', color: '#64748b' };
  };

  const hasValidAnalytics = !!(channel.analytics && channel.channelMetrics);
  const performanceData = getPerformanceData();
  const channelAverage = calculateChannelAverage();
  const filteredVideos = getFilteredVideos();
  const { longVideos, shorts } = categorizeVideos();

  return (
    <div className="modern-channel-card">
      {/* Modern Channel Header */}
      <div className="channel-header-modern" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-gradient-bg"></div>
        
        <div className="header-content-modern">
          {/* Channel Rank */}
          <div className="channel-rank-badge">
            <div className="rank-number">#{channelIndex + 1}</div>
            <div className="rank-label">
              {channelIndex === 0 ? '1st' : channelIndex === 1 ? '2nd' : channelIndex === 2 ? '3rd' : `${channelIndex + 1}th`}
            </div>
          </div>
          
          {/* Channel Info */}
          <div className="channel-info-modern">
            <div className="channel-title-section">
              <h3 className="channel-title-modern">{channel.channelName}</h3>
              {hasValidAnalytics && (
                <div 
                  className="performance-badge-header"
                  style={{ 
                    background: performanceData.gradient,
                    boxShadow: `0 4px 20px ${performanceData.color}40`
                  }}
                >
                  <span className="badge-icon">{performanceData.icon}</span>
                  <span className="badge-text">{performanceData.status}</span>
                  <span className="badge-score">{performanceData.score}/100</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Expand Button */}
          <div className="expand-control-modern">
            <button className="expand-btn-modern">
              <svg 
                className={`expand-icon ${isExpanded ? 'expanded' : 'collapsed'}`}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {channel.error && (
          <div className="error-banner-header">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-text">Error: {channel.error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Quick Stats Row - Horizontal Layout (No Score) */}
      <div className="quick-stats-row-horizontal">
        {hasValidAnalytics && channel.analytics ? (
          <>
            {/* Channel Actions Row */}
            <div className="channel-actions-row">
              <a 
                href={channel.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="channel-link-btn-compact"
                title="Visit YouTube Channel"
              >
                🔗 Visit Channel
              </a>
              
              <div className="ranking-badge-compact">
                <span className="ranking-icon">🏆</span>
                <span className="ranking-text">Rank #{channelIndex + 1}/{totalChannels}</span>
              </div>
            </div>

            {/* Horizontal Performance Stats Grid */}
            <div className="horizontal-stats-grid">
              <div className="stat-item-horizontal">
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">📹</span>
                </div>
                <div className="stat-content">
                  <span className="stat-value">{channel.videos?.length || 0}</span>
                  <span className="stat-label">Videos</span>
                </div>
              </div>

              <div className="stat-item-horizontal">
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">👁️</span>
                </div>
                <div className="stat-content">
                  <span className="stat-value">{formatNumber(channel.analytics.totalViews || 0)}</span>
                  <span className="stat-label">Total Views</span>
                </div>
              </div>

              <div className="stat-item-horizontal">
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">👥</span>
                </div>
                <div className="stat-content">
                  <span className="stat-value">{formatNumber(channel.channelMetrics?.subscriberCount || 0)}</span>
                  <span className="stat-label">Subscribers</span>
                </div>
              </div>

              <div className="stat-item-horizontal">
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">💬</span>
                </div>
                <div className="stat-content">
                  <span className="stat-value">{(channel.analytics.engagementRate || 0).toFixed(1)}%</span>
                  <span className="stat-label">Engagement</span>
                </div>
              </div>

              <div className="stat-item-horizontal">
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">📊</span>
                </div>
                <div className="stat-content">
                  <span className="stat-value">{formatNumber(channelAverage)}</span>
                  <span className="stat-label">Avg Views</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="horizontal-stats-grid">
            <div className="stat-item-horizontal error">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">⚠️</span>
              </div>
              <div className="stat-content">
                <span className="stat-value">No Data</span>
                <span className="stat-label">Analysis Failed</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Filter Toggle Section */}
      <div className="video-filter-section">
        <div className="filter-header">
          <h4 className="filter-title">
            📹 Videos ({filteredVideos.length})
          </h4>
          <div className="video-type-stats">
            <span className="type-stat long-videos">📺 {longVideos.length} Long</span>
            <span className="type-stat shorts">🎬 {shorts.length} Shorts</span>
          </div>
        </div>
        
        <div className="video-filter-toggle">
          <button 
            className={`filter-btn ${videoFilter === 'all' ? 'active' : ''}`}
            onClick={() => setVideoFilter('all')}
          >
            <span className="filter-icon">📱</span>
            <span className="filter-text">All Videos</span>
            <span className="filter-count">({(longVideos.length + shorts.length)})</span>
          </button>
          
          <button 
            className={`filter-btn long-videos ${videoFilter === 'long' ? 'active' : ''}`}
            onClick={() => setVideoFilter('long')}
          >
            <span className="filter-icon">📺</span>
            <span className="filter-text">Long Videos</span>
            <span className="filter-count">({longVideos.length})</span>
          </button>
          
          <button 
            className={`filter-btn shorts ${videoFilter === 'shorts' ? 'active' : ''}`}
            onClick={() => setVideoFilter('shorts')}
          >
            <span className="filter-icon">🎬</span>
            <span className="filter-text">Shorts</span>
            <span className="filter-count">({shorts.length})</span>
          </button>
        </div>
      </div>

      {/* Horizontal Video Cards with Filter */}
      <div className="horizontal-videos-section">
        <div className="horizontal-videos-container">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video, index) => {
              const performance = getVideoPerformance(video, channelAverage);
              const isShort = isShortVideo(video);
              
              return (
                <div 
                  key={video.videoId} 
                  className={`horizontal-video-card ${isShort ? 'shorts-card' : 'long-video-card'}`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="video-thumbnail-horizontal">
                    {video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="thumbnail-image-horizontal"
                      />
                    ) : (
                      <div className="thumbnail-placeholder-horizontal">
                        <span>📹</span>
                      </div>
                    )}
                    <div className="video-duration-overlay">
                      {formatDuration(video.duration || '')}
                    </div>
                    <div className={`video-type-badge ${isShort ? 'shorts-badge' : 'long-badge'}`}>
                      {isShort ? '🎬' : '📺'}
                    </div>
                    <div className="video-rank-overlay">#{index + 1}</div>
                  </div>
                  
                  <div className="video-info-horizontal">
                    <h5 className="video-title-horizontal">{video.title}</h5>
                    
                    <div className="video-stats-horizontal">
                      <div className="stat-item-horizontal">
                        <span className="stat-label-horizontal">Views:</span>
                        <span className="stat-value-horizontal">{formatNumber(video.viewCount || 0)}</span>
                      </div>
                      
                      <div className="stat-item-horizontal">
                        <span className="stat-label-horizontal">Performance:</span>
                        <span 
                          className="stat-value-horizontal performance"
                          style={{ color: performance.color }}
                        >
                          {performance.percentage}%
                        </span>
                      </div>
                      
                      <div className="stat-item-horizontal">
                        <span className="stat-label-horizontal">Published:</span>
                        <span className="stat-value-horizontal">{getTimeSince(video.publishedAt || '')}</span>
                      </div>
                      
                      <div className="stat-item-horizontal">
                        <span className="stat-label-horizontal">Type:</span>
                        <span className={`stat-value-horizontal ${isShort ? 'shorts-text' : 'long-text'}`}>
                          {isShort ? 'Short' : 'Long'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-videos-horizontal">
              <div className="no-videos-icon">
                {videoFilter === 'shorts' ? '🎬' : videoFilter === 'long' ? '📺' : '📹'}
              </div>
              <span>No {videoFilter === 'all' ? 'videos' : videoFilter === 'shorts' ? 'shorts' : 'long videos'} found</span>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Content - Redesigned Analytics */}
      <div className={`expandable-content-modern ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {isExpanded && hasValidAnalytics && channel.analytics && (
          <div className="analytics-redesigned-section">
            <div className="analytics-header-redesigned">
              <h4 className="analytics-title-redesigned">
                📈 Detailed Analytics
              </h4>
            </div>
            
            {/* Horizontal Analytics Rows */}
            <div className="analytics-rows-container">
              
              {/* Channel Metrics Row */}
              <div className="analytics-row">
                <div className="row-header">
                  <span className="row-icon">📺</span>
                  <span className="row-title">Channel Metrics</span>
                </div>
                <div className="row-stats">
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">👥</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value">{formatNumber(channel.channelMetrics?.subscriberCount || 0)}</span>
                      <span className="analytics-stat-label">Subscribers</span>
                    </div>
                  </div>
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">📹</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value">{formatNumber(channel.channelMetrics?.videoCount || 0)}</span>
                      <span className="analytics-stat-label">Total Videos</span>
                    </div>
                  </div>
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">👁️</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value">{formatNumber(channel.channelMetrics?.totalChannelViews || 0)}</span>
                      <span className="analytics-stat-label">Channel Views</span>
                    </div>
                  </div>
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">📅</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value">
                        {channel.channelMetrics?.channelCreatedDate ? 
                          new Date(channel.channelMetrics.channelCreatedDate).getFullYear() : 'N/A'}
                      </span>
                      <span className="analytics-stat-label">Created</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Analysis Row */}
              <div className="analytics-row">
                <div className="row-header">
                  <span className="row-icon">📚</span>
                  <span className="row-title">Content Analysis</span>
                </div>
                <div className="row-stats">
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">⏰</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value">{channel.analytics.uploadFrequency || 'N/A'}</span>
                      <span className="analytics-stat-label">Upload Frequency</span>
                    </div>
                  </div>
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">📈</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value" style={{ 
                        color: channel.analytics.viewsGrowthTrend === 'up' ? '#10b981' : 
                               channel.analytics.viewsGrowthTrend === 'down' ? '#ef4444' : '#6b7280'
                      }}>
                        {channel.analytics.viewsGrowthTrend === 'up' ? 'Growing' : 
                         channel.analytics.viewsGrowthTrend === 'down' ? 'Declining' : 'Stable'}
                      </span>
                      <span className="analytics-stat-label">Growth Trend</span>
                    </div>
                  </div>
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">⏱️</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value">{Math.round((channel.analytics.averageDuration || 0) / 60)}min</span>
                      <span className="analytics-stat-label">Avg Duration</span>
                    </div>
                  </div>
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">🏷️</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value">{channel.analytics.contentCategories?.length || 0}</span>
                      <span className="analytics-stat-label">Categories</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Type Breakdown Row */}
              <div className="analytics-row">
                <div className="row-header">
                  <span className="row-icon">🎬</span>
                  <span className="row-title">Video Types</span>
                </div>
                <div className="row-stats">
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">📺</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value">{longVideos.length}</span>
                      <span className="analytics-stat-label">Long Videos</span>
                    </div>
                  </div>
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">🎬</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value">{shorts.length}</span>
                      <span className="analytics-stat-label">Shorts</span>
                    </div>
                  </div>
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">📊</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value">
                        {channel.videos?.length ? Math.round((shorts.length / channel.videos.length) * 100) : 0}%
                      </span>
                      <span className="analytics-stat-label">Shorts Ratio</span>
                    </div>
                  </div>
                  <div className="analytics-stat-item">
                    <span className="analytics-stat-icon">💬</span>
                    <div className="analytics-stat-content">
                      <span className="analytics-stat-value">{(channel.analytics.engagementRate || 0).toFixed(1)}%</span>
                      <span className="analytics-stat-label">Engagement</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Categories Row (if available) */}
              {channel.analytics.contentCategories && channel.analytics.contentCategories.length > 0 && (
                <div className="analytics-row">
                  <div className="row-header">
                    <span className="row-icon">🏆</span>
                    <span className="row-title">Top Categories</span>
                  </div>
                  <div className="row-stats categories-stats">
                    {channel.analytics.contentCategories.slice(0, 4).map((category, index) => (
                      <div key={category.category} className="analytics-stat-item category-item">
                        <span className="analytics-stat-icon">📝</span>
                        <div className="analytics-stat-content">
                          <span className="analytics-stat-value">{category.category}</span>
                          <span className="analytics-stat-label">{category.count} videos • {formatNumber(category.avgViews || 0)} avg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Video Details Popup - Enhanced Description */}
      {selectedVideo && (
        <div className="video-popup-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="video-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3 className="popup-title">
                {isShortVideo(selectedVideo) ? '🎬 YouTube Short' : '📺 Long Video'}
              </h3>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="popup-close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="popup-body">
              <div className="popup-thumbnail">
                {selectedVideo.thumbnail ? (
                  <img 
                    src={selectedVideo.thumbnail} 
                    alt={selectedVideo.title}
                    className="popup-thumbnail-image"
                  />
                ) : (
                  <div className="popup-thumbnail-placeholder">
                    <span>📹</span>
                  </div>
                )}
              </div>
              
              <div className="popup-details">
                <h4 className="popup-video-title">{selectedVideo.title}</h4>
                
                <div className="popup-stats-grid">
                  <div className="popup-stat">
                    <span className="popup-stat-label">Type:</span>
                    <span className="popup-stat-value">
                      {isShortVideo(selectedVideo) ? '🎬 YouTube Short' : '📺 Long Video'}
                    </span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Views:</span>
                    <span className="popup-stat-value">{formatNumber(selectedVideo.viewCount || 0)}</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Likes:</span>
                    <span className="popup-stat-value">{formatNumber(selectedVideo.likeCount || 0)}</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Comments:</span>
                    <span className="popup-stat-value">{formatNumber(selectedVideo.commentCount || 0)}</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Duration:</span>
                    <span className="popup-stat-value">{formatDuration(selectedVideo.duration || '')}</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Published:</span>
                    <span className="popup-stat-value">{getTimeSince(selectedVideo.publishedAt || '')}</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Performance:</span>
                    <span className="popup-stat-value">
                      {getVideoPerformance(selectedVideo, channelAverage).percentage}% vs avg
                    </span>
                  </div>
                </div>
                
                {selectedVideo.description && (
                  <div className="popup-description-enhanced">
                    <div className="description-header">
                      <h5 className="description-title">📝 Description</h5>
                      <button 
                        className="description-toggle"
                        onClick={(e) => {
                          const content = e.currentTarget.parentElement?.nextElementSibling;
                          if (content) {
                            content.classList.toggle('expanded');
                            e.currentTarget.textContent = content.classList.contains('expanded') ? '🔼 Less' : '🔽 More';
                          }
                        }}
                      >
                        🔽 More
                      </button>
                    </div>
                    <div className="description-content">
                      <p className="description-text">{selectedVideo.description}</p>
                    </div>
                  </div>
                )}
                
                <div className="popup-actions">
                  <a 
                    href={`https://youtube.com/watch?v=${selectedVideo.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="popup-action-btn primary"
                  >
                    ▶️ Watch on YouTube
                  </a>
                  <button 
                    onClick={() => navigator.clipboard.writeText(`https://youtube.com/watch?v=${selectedVideo.videoId}`)}
                    className="popup-action-btn secondary"
                  >
                    🔗 Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
