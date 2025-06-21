import React, { useState } from 'react';
import { VideoCard } from '../VideoCard/VideoCard';
import { ChannelHeader } from '../ChannelHeader/ChannelHeader';
import { ChannelAnalytics } from '../ChannelAnalytics/ChannelAnalytics';
import type { ChannelAnalysis } from '../../types/youtube';

interface ChannelSectionProps {
  channel: ChannelAnalysis;
  channelIndex: number;
  totalChannels: number;
}

export const ChannelSection: React.FC<ChannelSectionProps> = ({ 
  channel, 
  channelIndex, 
  totalChannels 
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Default collapsed for better UX
  const [showVideos, setShowVideos] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [sortBy, setSortBy] = useState<'views' | 'date' | 'engagement'>('views');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  console.log(`🔍 ChannelSection rendering:`, {
    channelName: channel?.channelName,
    videosCount: channel?.videos?.length,
    channelIndex,
    isExpanded
  });

  if (!channel) {
    console.error('❌ ChannelSection: No channel data');
    return (
      <div className="channel-section-error">
        <h3>⚠️ No Channel Data</h3>
        <p>Channel data is missing or invalid.</p>
      </div>
    );
  }

  const calculateChannelAverage = (): number => {
    if (!channel.videos || channel.videos.length === 0) return 0;
    const totalViews = channel.videos.reduce((sum, video) => sum + (video.viewCount || 0), 0);
    return Math.round(totalViews / channel.videos.length);
  };

  const getSortedVideos = () => {
    if (!channel.videos || !Array.isArray(channel.videos)) {
      console.warn('⚠️ Invalid videos array:', channel.videos);
      return [];
    }
    
    const videos = [...channel.videos];
    
    switch (sortBy) {
      case 'views':
        return videos.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      case 'date':
        return videos.sort((a, b) => {
          const dateA = new Date(a.publishedAt || 0).getTime();
          const dateB = new Date(b.publishedAt || 0).getTime();
          return dateB - dateA;
        });
      case 'engagement':
        return videos.sort((a, b) => {
          const aEng = a.viewCount > 0 ? ((a.likeCount || 0) + (a.commentCount || 0)) / a.viewCount : 0;
          const bEng = b.viewCount > 0 ? ((b.likeCount || 0) + (b.commentCount || 0)) / b.viewCount : 0;
          return bEng - aEng;
        });
      default:
        return videos;
    }
  };

  const getChannelRank = (): string => {
    const rank = channelIndex + 1;
    const suffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';
    return `${rank}${suffix}`;
  };

  const getPerformanceData = () => {
    // Fixed: Added null check for analytics
    if (!channel.analytics) return { status: 'unknown', color: '#9e9e9e', message: 'No data', icon: '📊' };
    
    const score = channel.analytics.performanceScore || 0;
    if (score >= 80) return { status: 'excellent', color: '#10B981', message: 'Excellent', icon: '🏆' };
    if (score >= 60) return { status: 'good', color: '#F59E0B', message: 'Good', icon: '⭐' };
    if (score >= 40) return { status: 'average', color: '#6B7280', message: 'Average', icon: '📈' };
    return { status: 'below', color: '#EF4444', message: 'Needs Work', icon: '📊' };
  };

  const hasValidAnalytics = !!(channel.analytics && channel.channelMetrics);
  const sortedVideos = getSortedVideos();
  const channelAverage = calculateChannelAverage();
  const performanceData = getPerformanceData();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toLocaleString();
  };

  return (
    <div className="channel-section-enhanced">
      {/* Collapsible Header */}
      <div className="section-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="section-title-row">
          <div className="section-title">
            <div className="channel-rank">#{getChannelRank()}</div>
            <h3 className="section-heading">{channel.channelName}</h3>
            {hasValidAnalytics && (
              <div 
                className="performance-badge"
                style={{ 
                  backgroundColor: performanceData.color + '20',
                  borderColor: performanceData.color,
                  color: performanceData.color
                }}
              >
                <span className="performance-icon">{performanceData.icon}</span>
                {performanceData.message}
              </div>
            )}
          </div>
          
          <div className="section-controls">
            <button 
              className={`toggle-btn ${isExpanded ? 'expanded' : 'collapsed'}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              title={isExpanded ? 'Collapse channel details' : 'Expand channel details'}
            >
              <svg 
                className="toggle-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                style={{ 
                  width: '20px', 
                  height: '20px',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <path 
                  d="M6 9l6 6 6-6" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Stats (Always Visible) */}
        <div className="quick-stats-row">
          <div className="quick-stat">
            <span className="stat-value">{channel.videos?.length || 0}</span>
            <span className="stat-label">Videos</span>
          </div>
          {hasValidAnalytics && channel.analytics && (
            <>
              <div className="quick-stat">
                <span className="stat-value">
                  {formatNumber(channel.analytics.totalViews)}
                </span>
                <span className="stat-label">Total Views</span>
              </div>
              <div className="quick-stat">
                <span className="stat-value">{channel.analytics.engagementRate.toFixed(1)}%</span>
                <span className="stat-label">Engagement</span>
              </div>
              <div className="quick-stat">
                <span className="stat-value">{channel.analytics.performanceScore}/100</span>
                <span className="stat-label">Score</span>
              </div>
            </>
          )}
        </div>

        {/* Error Banner */}
        {channel.error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-text">Error: {channel.error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Content */}
      <div className={`section-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {isExpanded && (
          <>
            {/* Content Controls */}
            <div className="content-controls">
              <div className="control-tabs">
                <button 
                  className={`control-tab ${showAnalytics && !showVideos ? 'active' : ''}`}
                  onClick={() => {
                    setShowAnalytics(true);
                    setShowVideos(false);
                  }}
                >
                  📊 Analytics Only
                </button>
                <button 
                  className={`control-tab ${showVideos && !showAnalytics ? 'active' : ''}`}
                  onClick={() => {
                    setShowVideos(true);
                    setShowAnalytics(false);
                  }}
                >
                  📹 Videos Only ({channel.videos?.length || 0})
                </button>
                <button 
                  className={`control-tab ${showAnalytics && showVideos ? 'active' : ''}`}
                  onClick={() => {
                    setShowAnalytics(true);
                    setShowVideos(true);
                  }}
                >
                  📋 Full Analysis
                </button>
              </div>
            </div>

            {/* Channel Header - Fixed: Only pass channel prop */}
            <ChannelHeader channel={channel} />

            {/* Analytics Section */}
            {showAnalytics && hasValidAnalytics && (
              <div className="analytics-section">
                <ChannelAnalytics channel={channel} />
              </div>
            )}

            {/* Videos Section */}
            {showVideos && (
              <div className="videos-section">
                <div className="videos-header">
                  <div className="videos-title">
                    <h4>📹 Channel Videos</h4>
                    <span className="videos-count">
                      {channel.videos?.length || 0} video{(channel.videos?.length || 0) !== 1 ? 's' : ''} found
                    </span>
                  </div>
                  
                  <div className="videos-controls">
                    <div className="sort-controls">
                      <span className="control-label">Sort by:</span>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="sort-select"
                      >
                        <option value="views">Views (High to Low)</option>
                        <option value="date">Date (Newest First)</option>
                        <option value="engagement">Engagement Rate</option>
                      </select>
                    </div>
                    
                    <div className="view-controls">
                      <button 
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <line x1="8" y1="6" x2="21" y2="6"/>
                          <line x1="8" y1="12" x2="21" y2="12"/>
                          <line x1="8" y1="18" x2="21" y2="18"/>
                          <line x1="3" y1="6" x2="3.01" y2="6"/>
                          <line x1="3" y1="12" x2="3.01" y2="12"/>
                          <line x1="3" y1="18" x2="3.01" y2="18"/>
                        </svg>
                      </button>
                      <button 
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="3" width="7" height="7"/>
                          <rect x="14" y="3" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/>
                          <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`videos-container ${viewMode}`}>
                  {sortedVideos.length > 0 ? (
                    sortedVideos.map((video, index) => {
                      if (!video || !video.videoId) {
                        return (
                          <div 
                            key={`invalid-${index}`} 
                            className="video-error"
                          >
                            ⚠️ Invalid video data at index {index}
                          </div>
                        );
                      }
                      
                      return (
                        <VideoCard 
                          key={`${video.videoId}-${index}`}
                          video={video} 
                          channelAverage={channelAverage}
                        />
                      );
                    })
                  ) : (
                    <div className="no-videos-state">
                      <div className="no-videos-icon">📹</div>
                      <h4>No Videos Found</h4>
                      <p>
                        {channel.error 
                          ? 'Unable to load videos due to an error.' 
                          : 'No videos were published in the selected time period.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
