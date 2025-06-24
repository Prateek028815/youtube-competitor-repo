import React from 'react';
import type { VideoData } from '../../types/youtube';

interface VideoCardProps {
  video: VideoData;
  channelAverage?: number;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, channelAverage = 0 }) => {
  if (!video) {
    return (
      <div className="video-card-error-compact">
        <span className="error-icon">⚠️</span>
        <span>Video data missing</span>
      </div>
    );
  }

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

  const formatCount = (count: number): string => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
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

  const getPerformanceData = () => {
    if (channelAverage === 0) {
      return { status: 'No Data', color: '#64748b', icon: '📊' };
    }
    
    const performance = (video.viewCount / channelAverage) * 100;
    
    if (performance >= 200) return { status: 'Viral', color: '#dc2626', icon: '🔥' };
    if (performance >= 150) return { status: 'Excellent', color: '#10b981', icon: '🏆' };
    if (performance >= 100) return { status: 'Good', color: '#f59e0b', icon: '⭐' };
    if (performance >= 50) return { status: 'Average', color: '#6366f1', icon: '📈' };
    return { status: 'Low', color: '#64748b', icon: '📉' };
  };

  const getThumbnailUrl = (): string => {
    if (video.thumbnail) return video.thumbnail;
    if (video.videoId) return `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
    return '';
  };

  const getVideoUrl = (): string => {
    return `https://youtube.com/watch?v=${video.videoId}`;
  };

  const performanceData = getPerformanceData();

  return (
    <div className="video-card-compact">
      {/* Thumbnail */}
      <div className="thumbnail-compact">
        {getThumbnailUrl() ? (
          <img 
            src={getThumbnailUrl()} 
            alt={video.title || 'Video thumbnail'}
            className="thumbnail-image-compact"
            loading="lazy"
          />
        ) : (
          <div className="thumbnail-placeholder-compact">
            <span>📹</span>
          </div>
        )}
        
        <div className="thumbnail-overlay-compact">
          <span className="duration-compact">{formatDuration(video.duration)}</span>
          <span 
            className="performance-compact"
            style={{ backgroundColor: performanceData.color }}
            title={performanceData.status}
          >
            {performanceData.icon}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="content-compact">
        <h4 className="title-compact" title={video.title}>
          {video.title}
        </h4>
        
        <div className="metrics-compact">
          <span className="metric-compact">👁️ {formatCount(video.viewCount)}</span>
          <span className="metric-compact">👍 {formatCount(video.likeCount || 0)}</span>
          <span className="metric-compact">💬 {formatCount(video.commentCount || 0)}</span>
          <span className="metric-compact">📅 {getTimeSince(video.publishedAt)}</span>
        </div>
        
        <div className="actions-compact">
          <a 
            href={getVideoUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="action-compact primary"
          >
            ▶️ Watch
          </a>
          <button 
            onClick={() => navigator.clipboard.writeText(getVideoUrl())}
            className="action-compact secondary"
          >
            🔗 Copy
          </button>
        </div>
      </div>
    </div>
  );
};
