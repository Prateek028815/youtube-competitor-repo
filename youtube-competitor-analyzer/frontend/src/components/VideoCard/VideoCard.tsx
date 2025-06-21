import React from 'react';
import type { VideoData } from '../../types/youtube';

interface VideoCardProps {
  video: VideoData;
  channelAverage?: number;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, channelAverage = 0 }) => {
  // Debug logging
  console.log('🎬 Rendering VideoCard:', video?.title);

  if (!video) {
    return (
      <div className="video-card-error">
        <p>⚠️ Video data missing</p>
      </div>
    );
  }

  const formatDuration = (duration: string): string => {
    if (!duration) return '0s';
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const [, hours, minutes, seconds] = match;
    const parts = [];
    
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds) parts.push(`${seconds}s`);
    
    return parts.join(' ') || '0s';
  };

  const formatViewCount = (count: number): string => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  const formatPublishDate = (dateString: string): string => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  const calculateEngagementRate = (): number => {
    if (!video.viewCount) return 0;
    const totalEngagement = (video.likeCount || 0) + (video.commentCount || 0);
    return (totalEngagement / video.viewCount) * 100;
  };

  const getPerformanceIndicator = (): string => {
    if (channelAverage === 0) return '';
    const performance = (video.viewCount / channelAverage) * 100;
    if (performance >= 150) return '🔥';
    if (performance >= 80) return '📈';
    if (performance >= 50) return '📊';
    return '📉';
  };

  const getPerformanceScore = (): string => {
    if (channelAverage === 0) return 'N/A';
    const performance = Math.round((video.viewCount / channelAverage) * 100);
    return `${performance}%`;
  };

  const handleThumbnailError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const currentSrc = target.src;
    
    console.warn(`Thumbnail failed for ${video.videoId}, trying fallback`);
    
    // Enhanced fallback system with multiple YouTube thumbnail qualities
    const fallbacks = [
      `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${video.videoId}/sddefault.jpg`,
      `https://img.youtube.com/vi/${video.videoId}/default.jpg`,
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjExMyIgdmlld0JveD0iMCAwIDIwMCAxMTMiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTEzIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTYuNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIFRodW1ibmFpbDwvdGV4dD4KPC9zdmc+'
    ];
    
    // Find current fallback index
    const currentIndex = fallbacks.findIndex(url => url === currentSrc);
    
    // Try next fallback
    if (currentIndex < fallbacks.length - 1) {
      target.src = fallbacks[currentIndex + 1];
      console.log(`Trying fallback ${currentIndex + 1} for ${video.videoId}`);
    } else {
      // All fallbacks failed, show placeholder
      target.style.display = 'none';
      const placeholder = target.parentElement?.querySelector('.thumbnail-placeholder');
      if (placeholder) {
        (placeholder as HTMLElement).style.display = 'flex';
      }
      console.error(`All thumbnail fallbacks failed for ${video.videoId}`);
    }
  };

  const getThumbnailUrl = (): string => {
    if (video.thumbnail) {
      return video.thumbnail;
    }
    
    // Generate thumbnail URL if not provided
    if (video.videoId) {
      return `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
    }
    
    return '';
  };

  const getVideoUrl = (): string => {
    return `https://youtube.com/watch?v=${video.videoId}`;
  };

  const getAnalyticsUrl = (): string => {
    return `https://www.youtube.com/watch?v=${video.videoId}`;
  };

  return (
    <div className="video-card enhanced">
      <div className="video-thumbnail-container">
        {getThumbnailUrl() ? (
          <>
            <img 
              src={getThumbnailUrl()} 
              alt={video.title || 'Video thumbnail'}
              className="video-thumbnail"
              loading="lazy"
              onError={handleThumbnailError}
            />
            <div className="thumbnail-placeholder" style={{ display: 'none' }}>
              <span>📹</span>
              <span>No Thumbnail</span>
            </div>
          </>
        ) : (
          <div className="thumbnail-placeholder">
            <span>📹</span>
            <span>No Thumbnail</span>
          </div>
        )}
        <div className="video-overlay">
          <span className="video-duration">{formatDuration(video.duration)}</span>
          {getPerformanceIndicator() && (
            <span className="performance-indicator">{getPerformanceIndicator()}</span>
          )}
        </div>
      </div>
      
      <div className="video-content">
        <div className="video-header">
          <h4 className="video-title">
            {video.title || 'Untitled Video'}
          </h4>
          <div className="video-performance">
            <span className="performance-score">{getPerformanceScore()}</span>
          </div>
        </div>
        
        <div className="video-metrics">
          <div className="metric-item">
            <span className="metric-icon">👁️</span>
            <span className="metric-value">{formatViewCount(video.viewCount)} views</span>
          </div>
          <div className="metric-item">
            <span className="metric-icon">👍</span>
            <span className="metric-value">{formatViewCount(video.likeCount || 0)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-icon">💬</span>
            <span className="metric-value">{formatViewCount(video.commentCount || 0)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-icon">📊</span>
            <span className="metric-value">{calculateEngagementRate().toFixed(2)}%</span>
          </div>
        </div>
        
        <div className="video-metadata">
          <span className="publish-date">{formatPublishDate(video.publishedAt)}</span>
          <span className="absolute-date">
            {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
        
        <p className="video-description">
          {video.description ? (
            video.description.length > 120 
              ? `${video.description.substring(0, 120)}...` 
              : video.description
          ) : 'No description available'}
        </p>
        
        <div className="video-actions">
          <a 
            href={getVideoUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="video-link primary"
            onClick={() => console.log(`Opening video: ${video.title}`)}
          >
            ▶️ Watch on YouTube
          </a>
          <a 
            href={getAnalyticsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="video-link secondary"
            onClick={() => console.log(`Opening analytics for: ${video.title}`)}
          >
            📊 Analytics
          </a>
        </div>
      </div>
    </div>
  );
};
