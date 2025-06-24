import React, { useMemo } from 'react';
import type { AnalysisResponse } from '../../types/youtube';

interface CompetitorTrackerProps {
  analysisResults: AnalysisResponse;
}

export const CompetitorTracker: React.FC<CompetitorTrackerProps> = ({ analysisResults }) => {
  const competitorData = useMemo(() => {
    if (!analysisResults.data?.channels) return [];
    
    return analysisResults.data.channels
      .filter(channel => channel.analytics && channel.channelMetrics)
      .map(channel => ({
        name: channel.channelName,
        subscribers: channel.channelMetrics?.subscriberCount || 0,
        totalViews: channel.analytics?.totalViews || 0,
        engagementRate: channel.analytics?.engagementRate || 0,
        performanceScore: channel.analytics?.performanceScore || 0,
        videoCount: channel.videos?.length || 0,
        growthTrend: channel.analytics?.viewsGrowthTrend || 'stable'
      }))
      .sort((a, b) => b.performanceScore - a.performanceScore);
  }, [analysisResults]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return { bg: '#dcfce7', border: '#16a34a', text: '#15803d', badge: 'Excellent' };
    if (score >= 75) return { bg: '#fef3c7', border: '#d97706', text: '#92400e', badge: 'Good' };
    if (score >= 60) return { bg: '#dbeafe', border: '#2563eb', text: '#1d4ed8', badge: 'Average' };
    if (score >= 40) return { bg: '#f3e8ff', border: '#7c3aed', text: '#6b21a8', badge: 'Below Avg' };
    return { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', badge: 'Poor' };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return { icon: '📈', color: '#16a34a', bg: '#dcfce7' };
      case 'down': return { icon: '📉', color: '#dc2626', bg: '#fee2e2' };
      default: return { icon: '➡️', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  if (competitorData.length < 2) {
    return (
      <div className="competitor-tracker-empty">
        <div className="empty-icon">🏆</div>
        <h3>Competitor Analysis Unavailable</h3>
        <p>Need at least 2 channels with valid data for comparison</p>
      </div>
    );
  }

  return (
    <div className="competitor-tracker-enhanced">
      <div className="tracker-header-enhanced">
        <div className="header-content-enhanced">
          <h3 className="tracker-title-enhanced">🏆 Competitor Performance Tracker</h3>
          <p className="tracker-subtitle-enhanced">
            Ranking of {competitorData.length} NEET channels by performance score
          </p>
        </div>
      </div>

      <div className="competitor-leaderboard">
        {competitorData.map((competitor, index) => {
          const performance = getPerformanceColor(competitor.performanceScore);
          const trend = getTrendIcon(competitor.growthTrend);
          const isTopPerformer = index === 0;
          
          return (
            <div 
              key={competitor.name} 
              className={`competitor-card-enhanced ${isTopPerformer ? 'top-performer' : ''}`}
            >
              <div className="competitor-rank-section">
                <div className={`rank-badge ${index < 3 ? 'podium' : ''}`}>
                  <span className="rank-number">#{index + 1}</span>
                  {index === 0 && <span className="crown">👑</span>}
                </div>
              </div>

              <div className="competitor-info-section">
                <div className="competitor-header">
                  <h4 className="competitor-name">{competitor.name}</h4>
                  <div 
                    className="performance-badge-enhanced"
                    style={{
                      backgroundColor: performance.bg,
                      borderColor: performance.border,
                      color: performance.text
                    }}
                  >
                    {performance.badge}
                  </div>
                </div>

                <div className="competitor-metrics-grid">
                  <div className="metric-item-enhanced subscribers">
                    <div className="metric-icon">👥</div>
                    <div className="metric-content">
                      <div className="metric-value">{formatNumber(competitor.subscribers)}</div>
                      <div className="metric-label">Subscribers</div>
                    </div>
                  </div>

                  <div className="metric-item-enhanced views">
                    <div className="metric-icon">👁️</div>
                    <div className="metric-content">
                      <div className="metric-value">{formatNumber(competitor.totalViews)}</div>
                      <div className="metric-label">Total Views</div>
                    </div>
                  </div>

                  <div className="metric-item-enhanced engagement">
                    <div className="metric-icon">💬</div>
                    <div className="metric-content">
                      <div className="metric-value">{competitor.engagementRate.toFixed(1)}%</div>
                      <div className="metric-label">Engagement</div>
                    </div>
                  </div>

                  <div className="metric-item-enhanced videos">
                    <div className="metric-icon">📹</div>
                    <div className="metric-content">
                      <div className="metric-value">{competitor.videoCount}</div>
                      <div className="metric-label">Videos</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="competitor-performance-section">
                <div className="performance-score-container">
                  <div className="score-circle" style={{ borderColor: performance.border }}>
                    <span className="score-value" style={{ color: performance.text }}>
                      {competitor.performanceScore}
                    </span>
                  </div>
                  <div className="score-label">Performance Score</div>
                </div>

                <div 
                  className="trend-indicator"
                  style={{ 
                    backgroundColor: trend.bg,
                    color: trend.color
                  }}
                >
                  <span className="trend-icon">{trend.icon}</span>
                  <span className="trend-text">{competitor.growthTrend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
