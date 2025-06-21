import React, { useState, useEffect } from 'react';
import type { AnalysisResponse } from '../../types/youtube';

interface CompetitorTrackerProps {
  analysisResults: AnalysisResponse | null;
}

interface PerformanceMetrics {
  channelName: string;
  channelId: string;
  totalViews: number;
  avgViews: number;
  engagementRate: number;
  uploadFrequency: number;
  competitiveScore: number;
}

export const CompetitorTracker: React.FC<CompetitorTrackerProps> = ({ analysisResults }) => {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    if (analysisResults?.data?.channels) {
      analyzeCompetitorPerformance();
    }
  }, [analysisResults]);

  const analyzeCompetitorPerformance = () => {
    const channels = analysisResults?.data?.channels || [];
    
    const metrics: PerformanceMetrics[] = channels.map((channel) => {
      const totalViews = channel.analytics?.totalViews || 0;
      const avgViews = channel.analytics?.averageViews || 0;
      const engagementRate = channel.analytics?.engagementRate || 0;
      const uploadFreq = parseUploadFrequency(channel.analytics?.uploadFrequency || '0');
      
      // Calculate competitive score (0-100)
      const viewScore = Math.min((avgViews / 50000) * 30, 30);
      const engagementScore = Math.min(engagementRate * 20, 25);
      const consistencyScore = Math.min(uploadFreq * 5, 20);
      const competitiveScore = Math.round(viewScore + engagementScore + consistencyScore + 25);
      
      return {
        channelName: channel.channelName,
        channelId: channel.channelId,
        totalViews,
        avgViews,
        engagementRate,
        uploadFrequency: uploadFreq,
        competitiveScore
      };
    });
    
    setPerformanceData(metrics.sort((a, b) => b.competitiveScore - a.competitiveScore));
  };

  const parseUploadFrequency = (frequency: string): number => {
    const match = frequency.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toLocaleString();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    if (score >= 40) return '#FFC107';
    return '#F44336';
  };

  if (!analysisResults?.data?.channels || analysisResults.data.channels.length < 2) {
    return (
      <div className="competitor-tracker-empty">
        <h3>📊 Competitor Performance Tracker</h3>
        <p>Add multiple channels to enable competitive comparison</p>
      </div>
    );
  }

  return (
    <div className="competitor-tracker">
      <div className="tracker-header">
        <h2>📊 Competitor Performance Tracker</h2>
      </div>

      <div className="performance-cards">
        {performanceData.map((channel, index) => (
          <div key={channel.channelId} className="performance-card">
            <div className="card-header">
              <h4>{channel.channelName}</h4>
              <div className="rank-badge">#{index + 1}</div>
            </div>
            
            <div className="score-section">
              <div className="competitive-score">
                <span className="score-number">{channel.competitiveScore}</span>
                <span className="score-grade">
                  {channel.competitiveScore >= 90 ? 'A+' : 
                   channel.competitiveScore >= 80 ? 'A' : 
                   channel.competitiveScore >= 70 ? 'B' : 
                   channel.competitiveScore >= 60 ? 'C' : 'D'}
                </span>
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">Avg Views</span>
                <span className="metric-value">{formatNumber(channel.avgViews)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Total Views</span>
                <span className="metric-value">{formatNumber(channel.totalViews)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Engagement</span>
                <span className="metric-value">{channel.engagementRate.toFixed(2)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Upload Freq</span>
                <span className="metric-value">{channel.uploadFrequency}/week</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
