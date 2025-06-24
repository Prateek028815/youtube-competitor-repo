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
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'analytics'>('overview');
  const [sortBy, setSortBy] = useState<'views' | 'date' | 'engagement'>('views');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState<string>('');

  console.log(`🔍 ChannelSection rendering:`, {
    channelName: channel?.channelName,
    videosCount: channel?.videos?.length,
    channelIndex,
    isExpanded
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

  const getSortedVideos = () => {
    if (!channel.videos || !Array.isArray(channel.videos)) {
      return [];
    }
    
    let videos = [...channel.videos];
    
    // Filter by search term
    if (searchTerm) {
      videos = videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort videos
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

  const getTopVideos = () => {
    return getSortedVideos().slice(0, 3);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toLocaleString();
  };

  const calculateChannelAverage = (): number => {
    if (!channel.videos || channel.videos.length === 0) return 0;
    const totalViews = channel.videos.reduce((sum, video) => sum + (video.viewCount || 0), 0);
    return Math.round(totalViews / channel.videos.length);
  };

  const hasValidAnalytics = !!(channel.analytics && channel.channelMetrics);
  const sortedVideos = getSortedVideos();
  const topVideos = getTopVideos();
  const performanceData = getPerformanceData();
  const channelAverage = calculateChannelAverage();

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
            
            {/* Quick Metrics */}
            <div className="quick-metrics-modern">
              <div className="metric-item-modern">
                <div className="metric-icon">📹</div>
                <div className="metric-content">
                  <span className="metric-value">{channel.videos?.length || 0}</span>
                  <span className="metric-label">Videos</span>
                </div>
              </div>
              
              {hasValidAnalytics && channel.analytics && (
                <>
                  <div className="metric-item-modern">
                    <div className="metric-icon">👁️</div>
                    <div className="metric-content">
                      <span className="metric-value">{formatNumber(channel.analytics.totalViews)}</span>
                      <span className="metric-label">Total Views</span>
                    </div>
                  </div>
                  
                  <div className="metric-item-modern">
                    <div className="metric-icon">💬</div>
                    <div className="metric-content">
                      <span className="metric-value">{channel.analytics.engagementRate.toFixed(1)}%</span>
                      <span className="metric-label">Engagement</span>
                    </div>
                  </div>
                  
                  <div className="metric-item-modern">
                    <div className="metric-icon">📊</div>
                    <div className="metric-content">
                      <span className="metric-value">{formatNumber(channelAverage)}</span>
                      <span className="metric-label">Avg Views</span>
                    </div>
                  </div>
                </>
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

      {/* Expandable Content */}
      <div className={`expandable-content-modern ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {isExpanded && (
          <>
            {/* Tab Navigation */}
            <div className="tab-navigation-modern">
              <div className="tab-container">
                <button 
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <span className="tab-icon">📊</span>
                  <span className="tab-text">Overview</span>
                </button>
                
                <button 
                  className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('videos')}
                >
                  <span className="tab-icon">📹</span>
                  <span className="tab-text">Videos ({channel.videos?.length || 0})</span>
                </button>
                
                <button 
                  className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                  disabled={!hasValidAnalytics}
                >
                  <span className="tab-icon">📈</span>
                  <span className="tab-text">Analytics</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content-modern">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="overview-content">
                  {/* Channel Header */}
                  <ChannelHeader channel={channel} />
                  
                  {/* Top Videos Section */}
                  <div className="top-videos-section">
                    <div className="section-header">
                      <h4 className="section-title">
                        <span className="section-icon">🏆</span>
                        Top Performing Videos
                      </h4>
                      <button 
                        onClick={() => setActiveTab('videos')}
                        className="view-all-btn"
                      >
                        View All ({channel.videos?.length || 0})
                      </button>
                    </div>
                    
                    <div className="top-videos-grid">
                      {topVideos.length > 0 ? (
                        topVideos.map((video, index) => (
                          <div key={video.videoId} className="top-video-card">
                            <div className="video-rank-badge">#{index + 1}</div>
                            <div className="video-thumbnail-wrapper">
                              {video.thumbnail ? (
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title}
                                  className="video-thumbnail-small"
                                />
                              ) : (
                                <div className="thumbnail-placeholder-small">
                                  <span>📹</span>
                                </div>
                              )}
                            </div>
                            <div className="video-info-compact">
                              <h5 className="video-title-compact">{video.title}</h5>
                              <div className="video-stats-compact">
                                <span className="stat-compact">
                                  👁️ {formatNumber(video.viewCount)}
                                </span>
                                <span className="stat-compact">
                                  👍 {formatNumber(video.likeCount || 0)}
                                </span>
                                <span className="stat-compact">
                                  💬 {formatNumber(video.commentCount || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-videos-compact">
                          <span className="no-videos-icon">📹</span>
                          <span>No videos found</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div className="videos-content">
                  <div className="videos-controls-modern">
                    <div className="controls-left">
                      <div className="search-wrapper">
                        <div className="search-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search videos..."
                          className="video-search-input"
                        />
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="clear-search-small"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="sort-select-modern"
                      >
                        <option value="views">Sort by Views</option>
                        <option value="date">Sort by Date</option>
                        <option value="engagement">Sort by Engagement</option>
                      </select>
                    </div>
                    
                    <div className="controls-right">
                      <div className="view-mode-toggle">
                        <button 
                          className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
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
                          className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
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
                      
                      <div className="results-count">
                        {sortedVideos.length} video{sortedVideos.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className={`videos-container-modern ${viewMode}`}>
                    {sortedVideos.length > 0 ? (
                      sortedVideos.map((video, index) => {
                        if (!video || !video.videoId) {
                          return (
                            <div 
                              key={`invalid-${index}`} 
                              className="video-error-item"
                            >
                              <span className="error-icon">⚠️</span>
                              <span>Invalid video data</span>
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
                      <div className="no-videos-state-modern">
                        <div className="no-videos-illustration">
                          <div className="illustration-icon">📹</div>
                          <div className="illustration-bg"></div>
                        </div>
                        <h4>No Videos Found</h4>
                        <p>
                          {searchTerm 
                            ? `No videos match "${searchTerm}"`
                            : channel.error 
                            ? 'Unable to load videos due to an error.' 
                            : 'No videos were published in the selected time period.'
                          }
                        </p>
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="clear-search-btn-large"
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && hasValidAnalytics && (
                <div className="analytics-content">
                  <ChannelAnalytics channel={channel} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
