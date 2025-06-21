import React, { useState, useEffect } from 'react';
import type { AnalysisResponse } from '../../types/youtube';

interface ContentIntelligenceProps {
  analysisResults: AnalysisResponse | null;
}

interface AIInsight {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export const ContentIntelligence: React.FC<ContentIntelligenceProps> = ({ analysisResults }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (analysisResults?.data?.channels) {
      generateInsights();
    }
  }, [analysisResults]);

  const generateInsights = () => {
    setIsAnalyzing(true);
    
    const channels = analysisResults?.data?.channels || [];
    const totalVideos = channels.reduce((sum, ch) => sum + (ch.videos?.length || 0), 0);
    const totalViews = channels.reduce((sum, ch) => sum + (ch.analytics?.totalViews || 0), 0);
    const avgViews = totalViews / Math.max(totalVideos, 1);
    
    const generatedInsights: AIInsight[] = [
      {
        title: 'Content Performance Analysis',
        description: `Analyzed ${totalVideos} videos across ${channels.length} channels with ${formatNumber(totalViews)} total views.`,
        priority: 'high',
        category: 'Performance'
      },
      {
        title: 'Average Views Benchmark',
        description: `Current average of ${formatNumber(avgViews)} views per video. ${avgViews > 50000 ? 'Above' : 'Below'} industry benchmark.`,
        priority: avgViews > 50000 ? 'low' : 'high',
        category: 'Metrics'
      },
      {
        title: 'Channel Strategy Recommendation',
        description: channels.length > 1 ? 
          'Multiple channels analyzed - focus on cross-promotion opportunities.' :
          'Single channel analysis - consider expanding content variety.',
        priority: 'medium',
        category: 'Strategy'
      }
    ];
    
    setInsights(generatedInsights);
    setIsAnalyzing(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toLocaleString();
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#DC2626';
      case 'medium': return '#D97706';
      case 'low': return '#059669';
      default: return '#6B7280';
    }
  };

  if (!analysisResults?.data?.channels || analysisResults.data.channels.length === 0) {
    return (
      <div className="content-intelligence-empty">
        <h3>🧠 Content Intelligence</h3>
        <p>Add channels to unlock AI-powered content insights</p>
      </div>
    );
  }

  return (
    <div className="content-intelligence">
      <div className="intelligence-header">
        <h2>🧠 Content Intelligence Dashboard</h2>
        {isAnalyzing && (
          <div className="analyzing-status">
            <span className="spinner">🔄</span>
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div key={index} className="insight-card">
            <div className="insight-header">
              <h4>{insight.title}</h4>
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(insight.priority) }}
              >
                {insight.priority.toUpperCase()}
              </span>
            </div>
            <div className="insight-content">
              <span className="category">{insight.category}</span>
              <p className="description">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-recommendations">
        <h3>📋 Quick Recommendations</h3>
        <div className="recommendations-list">
          <div className="recommendation-item">
            <span className="rec-icon">📈</span>
            <span>Focus on improving video thumbnails and titles for better click-through rates</span>
          </div>
          <div className="recommendation-item">
            <span className="rec-icon">🎯</span>
            <span>Maintain consistent upload schedule to improve audience retention</span>
          </div>
          <div className="recommendation-item">
            <span className="rec-icon">💬</span>
            <span>Increase community engagement through calls-to-action and responses</span>
          </div>
        </div>
      </div>
    </div>
  );
};
