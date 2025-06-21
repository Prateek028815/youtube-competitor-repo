import React, { useState, useEffect } from 'react';
import { ChannelSelector } from './components/ChannelSelector/ChannelSelector';
import { TimeWindowSelector } from './components/TimeWindowSelector/TimeWindowSelector';
import { ChannelSection } from './components/ChannelSection/ChannelSection';
import { CompetitorTracker } from './components/CompetitorTracker/CompetitorTracker';
import { ContentIntelligence } from './components/ContentIntelligence/ContentIntelligence';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { DirectYouTubeAPI } from './services/youtubeApi';
import type { AnalysisResponse, ChannelAnalysis } from './types/youtube';
import './App.css';

function App() {
  const [channels, setChannels] = useState<string[]>([]);
  const [timeWindow, setTimeWindow] = useState<7 | 15 | 30>(7);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [debugMode, setDebugMode] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  const [showContentIntelligence, setShowContentIntelligence] = useState(false);

  // Force re-render when analysisResults changes
  useEffect(() => {
    if (analysisResults) {
      console.log('🔄 useEffect triggered - analysisResults changed:', analysisResults);
      console.log('🔄 NEET Channels in results:', analysisResults.data?.channels);
      setForceRender(prev => prev + 1);
      
      setTimeout(() => {
        console.log('🔄 DOM update forced');
        const analysisSection = document.querySelector('.analysis-results');
        if (analysisSection) {
          console.log('✅ Analysis section found in DOM');
        } else {
          console.error('❌ Analysis section NOT found in DOM');
        }
      }, 100);
    }
  }, [analysisResults]);

  // Type guard to check if channel has valid analytics
  const hasValidAnalytics = (channel: ChannelAnalysis): boolean => {
    return !!(channel.analytics && channel.channelMetrics);
  };

  const handleAnalyze = async () => {
    if (channels.length === 0) {
      alert('Please add at least one NEET YouTube channel');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisResults(null);
    
    console.log(`🚀 FRONTEND - Starting NEET channel analysis (${timeWindow} days)...`);

    try {
      const channelResults: ChannelAnalysis[] = [];
      
      for (let i = 0; i < channels.length; i++) {
        const channelUrl = channels[i];
        console.log(`🔍 Processing NEET channel ${i + 1}/${channels.length}: ${channelUrl}`);
        
        try {
          const result = await DirectYouTubeAPI.analyzeChannel(channelUrl, timeWindow);
          console.log(`📊 NEET channel analysis result for ${channelUrl}:`, result);
          
          if (result.success && result.channelInfo) {
            const channelData: ChannelAnalysis = {
              channelId: result.channelId || `channel_${i}`,
              channelName: result.channelInfo.title,
              channelUrl: channelUrl,
              videos: Array.isArray(result.videos) ? result.videos : [],
              analytics: result.analytics,
              channelMetrics: result.channelMetrics
            };
            
            channelResults.push(channelData);
            console.log(`✅ Added NEET channel data:`, channelData);
          } else {
            console.warn(`⚠️ Invalid result for NEET channel ${channelUrl}:`, result);
            const errorChannelData: ChannelAnalysis = {
              channelId: `error_${i}`,
              channelName: `Error: ${channelUrl}`,
              channelUrl: channelUrl,
              videos: [],
              error: result.error || 'Unknown error'
            };
            channelResults.push(errorChannelData);
          }
        } catch (channelError) {
          console.error(`❌ Error processing NEET channel ${channelUrl}:`, channelError);
          const errorChannelData: ChannelAnalysis = {
            channelId: `error_${i}`,
            channelName: `Error: ${channelUrl}`,
            channelUrl: channelUrl,
            videos: [],
            error: channelError instanceof Error ? channelError.message : 'Unknown error'
          };
          channelResults.push(errorChannelData);
        }
      }

      console.log('📋 Final NEET channel results:', channelResults);

      const validChannels = channelResults.filter(hasValidAnalytics);
      const totalVideos = validChannels.reduce((sum, ch) => sum + (ch.analytics?.totalVideos || 0), 0);
      const totalViews = validChannels.reduce((sum, ch) => sum + (ch.analytics?.totalViews || 0), 0);

      const response: AnalysisResponse = {
        requestId: `neet_analysis_${Date.now()}`,
        status: 'completed',
        data: {
          channels: channelResults
        },
        metadata: {
          totalVideos,
          totalViews,
          processedAt: new Date().toISOString(),
          timeWindow: timeWindow,
          usingDirectAPI: true,
          analysisType: 'neet_comprehensive',
          individualChannelCount: channelResults.length
        }
      };

      console.log('✅ Setting NEET analysis results:', response);
      setAnalysisResults(response);
      
    } catch (error) {
      console.error('❌ NEET analysis failed:', error);
      setError(error instanceof Error ? error.message : 'NEET analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setChannels([]);
    setTimeWindow(7);
    setAnalysisResults(null);
    setError('');
    setForceRender(0);
    setShowContentIntelligence(false);
  };

  const testConnection = async () => {
    try {
      console.log('🧪 Testing direct YouTube API connection...');
      const result = await DirectYouTubeAPI.quickTest();
      console.log('Direct API test result:', result);
      alert(result);
    } catch (error) {
      console.error('Direct API test failed:', error);
      alert(`❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const createTestData = () => {
    const testData: AnalysisResponse = {
      requestId: 'neet_test_123',
      status: 'completed',
      data: {
        channels: [
          {
            channelId: 'physics_wallah_test',
            channelName: 'Physics Wallah',
            channelUrl: 'https://www.youtube.com/@PhysicsWallah',
            videos: [
              {
                videoId: 'neet_physics_1',
                title: 'NEET 2025 Physics - Mechanics Complete Chapter',
                description: 'Complete physics mechanics chapter for NEET 2025 preparation.',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                publishedAt: new Date().toISOString(),
                viewCount: 250000,
                duration: 'PT45M30S',
                likeCount: 12500,
                commentCount: 2800
              }
            ],
            analytics: {
              totalVideos: 1,
              totalViews: 250000,
              averageViews: 250000,
              totalLikes: 12500,
              totalComments: 2800,
              engagementRate: 6.12,
              mostPopularVideo: null,
              leastPopularVideo: null,
              uploadFrequency: '5 videos/week',
              averageDuration: 2730,
              viewsGrowthTrend: 'up' as const,
              performanceScore: 92,
              topPerformingDays: ['Monday', 'Wednesday', 'Friday'],
              contentCategories: [
                { category: 'Physics', count: 1, avgViews: 250000 }
              ]
            },
            channelMetrics: {
              subscriberCount: 8500000,
              totalChannelViews: 950000000,
              videoCount: 2500,
              channelCreatedDate: '2016-05-15T00:00:00Z',
              country: 'IN',
              customUrl: '@PhysicsWallah'
            }
          },
          {
            channelId: 'unacademy_neet_test',
            channelName: 'Unacademy NEET',
            channelUrl: 'https://www.youtube.com/@UnacademyNEET',
            videos: [
              {
                videoId: 'neet_bio_1',
                title: 'NEET Biology - Cell Structure and Function',
                description: 'Complete biology chapter on cell structure for NEET preparation.',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                publishedAt: new Date(Date.now() - 86400000).toISOString(),
                viewCount: 180000,
                duration: 'PT38M15S',
                likeCount: 9000,
                commentCount: 1500
              }
            ],
            analytics: {
              totalVideos: 1,
              totalViews: 180000,
              averageViews: 180000,
              totalLikes: 9000,
              totalComments: 1500,
              engagementRate: 5.83,
              mostPopularVideo: null,
              leastPopularVideo: null,
              uploadFrequency: '4 videos/week',
              averageDuration: 2295,
              viewsGrowthTrend: 'stable' as const,
              performanceScore: 85,
              topPerformingDays: ['Tuesday', 'Thursday', 'Saturday'],
              contentCategories: [
                { category: 'Biology', count: 1, avgViews: 180000 }
              ]
            },
            channelMetrics: {
              subscriberCount: 3200000,
              totalChannelViews: 420000000,
              videoCount: 1800,
              channelCreatedDate: '2018-03-20T00:00:00Z',
              country: 'IN',
              customUrl: '@UnacademyNEET'
            }
          }
        ]
      },
      metadata: {
        totalVideos: 2,
        totalViews: 430000,
        processedAt: new Date().toISOString(),
        timeWindow: 7,
        usingDirectAPI: true,
        analysisType: 'neet_test',
        individualChannelCount: 2
      }
    };
    
    console.log('🧪 Setting NEET test data:', testData);
    setAnalysisResults(testData);
  };

  const scrollToAnalytics = () => {
    const analyticsSection = document.getElementById('analytics-section');
    if (analyticsSection) {
      analyticsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="App">
      {/* PROFESSIONAL HEADER */}
      <header className="app-header-professional">
        <div className="header-container">
          <div className="header-brand">
            <div className="brand-logo">
              <span className="logo-icon">🎯</span>
              <span className="logo-text">NEET Analytics</span>
            </div>
            <span className="brand-tagline">YouTube Competitor Intelligence</span>
          </div>
          
          <nav className="header-nav">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="nav-link"
            >
              Home
            </button>
            <button 
              onClick={scrollToAnalytics}
              className="nav-link"
            >
              Analytics
            </button>
            <button 
              onClick={() => setDebugMode(!debugMode)}
              className="nav-link"
            >
              {debugMode ? 'Hide Debug' : 'Debug'}
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section-professional">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">🏆</span>
              <span className="badge-text">Professional NEET Analytics</span>
            </div>
            
            <h1 className="hero-title">
              Analyze Your <span className="highlight">NEET YouTube</span> Competition
            </h1>
            
            <p className="hero-description">
              Get comprehensive insights into competitor NEET channels, track performance trends, 
              and optimize your educational content strategy with our advanced analytics platform.
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">20+</span>
                <span className="stat-label">NEET Channels</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">Real-time</span>
                <span className="stat-label">Analytics</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Free Tool</span>
              </div>
            </div>
            
            <div className="hero-actions">
              <button 
                onClick={scrollToAnalytics}
                className="cta-primary"
              >
                <span>Start Analysis</span>
                <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              
              <button 
                onClick={createTestData}
                className="cta-secondary"
              >
                <span>Try Demo</span>
                <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <span className="preview-title">NEET Analytics Dashboard</span>
              </div>
              <div className="preview-content">
                <div className="preview-chart">
                  <div className="chart-bars">
                    <div className="bar" style={{ height: '60%' }}></div>
                    <div className="bar" style={{ height: '80%' }}></div>
                    <div className="bar" style={{ height: '45%' }}></div>
                    <div className="bar" style={{ height: '90%' }}></div>
                    <div className="bar" style={{ height: '70%' }}></div>
                  </div>
                </div>
                <div className="preview-metrics">
                  <div className="metric">
                    <span className="metric-label">Physics Wallah</span>
                    <span className="metric-value">8.5M views</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Unacademy NEET</span>
                    <span className="metric-value">3.2M views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="app-main-professional" id="analytics-section">
        {/* DEBUG SECTION */}
        {debugMode && (
          <div className="debug-section-professional">
            <details className="debug-details">
              <summary className="debug-summary">🔍 Debug Information</summary>
              <div className="debug-content">
                <p><strong>Force Render Counter:</strong> {forceRender}</p>
                <p><strong>Analysis Results:</strong> {analysisResults ? 'YES' : 'NO'}</p>
                <p><strong>Channels Count:</strong> {analysisResults?.data?.channels?.length || 'N/A'}</p>
                <p><strong>Analysis Type:</strong> {analysisResults?.metadata?.analysisType || 'N/A'}</p>
                <button 
                  onClick={() => console.log('Full debug:', analysisResults)}
                  className="debug-btn"
                >
                  Console Dump
                </button>
              </div>
            </details>
          </div>
        )}

        {/* ERROR HANDLING */}
        {error && (
          <div className="error-section-professional">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <div className="error-text">
                <h4>Analysis Error</h4>
                <p>{error}</p>
              </div>
              <button onClick={() => setError('')} className="error-dismiss">
                ✕
              </button>
            </div>
          </div>
        )}
        
        {/* ANALYSIS FORM */}
        <section className="analysis-form-professional">
          <div className="form-container">
            <div className="form-header">
              <h2>🎯 NEET Channel Analysis</h2>
              <p>Select NEET YouTube channels and analyze their performance with advanced metrics</p>
            </div>

            <div className="form-content">
              <ChannelSelector 
                selectedChannels={channels} 
                onChannelsChange={setChannels} 
              />
              
              <TimeWindowSelector 
                selectedWindow={timeWindow} 
                onWindowChange={setTimeWindow} 
              />
              
              <div className="form-actions">
                <button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || channels.length === 0}
                  className="analyze-btn-professional"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="loading-spinner"></span>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀 Start Analysis</span>
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleReset} 
                  disabled={isAnalyzing}
                  className="reset-btn-professional"
                >
                  🔄 Reset
                </button>

                <button 
                  onClick={testConnection}
                  className="test-btn-professional"
                >
                  🧪 Test API
                </button>
              </div>

              {analysisResults?.metadata && (
                <div className="quick-stats-professional">
                  <div className="stat-card">
                    <span className="stat-number">{analysisResults.data?.channels?.length || 0}</span>
                    <span className="stat-label">NEET Channels</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{analysisResults.metadata.totalVideos || 0}</span>
                    <span className="stat-label">Videos Analyzed</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{formatNumber(analysisResults.metadata.totalViews || 0)}</span>
                    <span className="stat-label">Total Views</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{analysisResults.metadata.timeWindow}</span>
                    <span className="stat-label">Days Period</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ANALYTICS DASHBOARD */}
        {analysisResults && analysisResults.data?.channels && analysisResults.data.channels.length > 0 && (
          <AnalyticsDashboard analysisResults={analysisResults} />
        )}

        {/* CONTENT INTELLIGENCE */}
        {showContentIntelligence && analysisResults && (
          <div className="content-intelligence-section">
            <ContentIntelligence analysisResults={analysisResults} />
          </div>
        )}

        {/* ANALYSIS RESULTS */}
        {analysisResults && (
          <section className="analysis-results-professional">
            <div className="results-container">
              <div className="results-header">
                <h2>📊 NEET Channel Analysis Results</h2>
                <p>Comprehensive analysis of {analysisResults.data?.channels?.length || 0} NEET channels</p>
              </div>
              
              {analysisResults.metadata && (
                <div className="results-summary-professional">
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Analysis Type</span>
                      <span className="summary-value">Individual NEET Channel Analysis</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Successful Analyses</span>
                      <span className="summary-value">{analysisResults.data?.channels?.filter(hasValidAnalytics).length || 0}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Time Period</span>
                      <span className="summary-value">Last {analysisResults.metadata.timeWindow} days</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Processed</span>
                      <span className="summary-value">{new Date(analysisResults.metadata.processedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* COMPETITOR TRACKER */}
              {analysisResults && analysisResults.data?.channels && 
               analysisResults.data.channels.filter(hasValidAnalytics).length > 1 && (
                <CompetitorTracker analysisResults={analysisResults} />
              )}
              
              {/* INDIVIDUAL CHANNEL SECTIONS */}
              {analysisResults.data?.channels && Array.isArray(analysisResults.data.channels) ? (
                <div className="channels-container-professional">
                  <div className="channels-header">
                    <h3>📋 Individual NEET Channel Analysis</h3>
                    <p>Detailed analysis for each selected NEET channel with performance metrics and insights</p>
                  </div>
                  {analysisResults.data.channels.map((channel, index) => {
                    console.log(`🎯 Rendering NEET ChannelSection ${index + 1} for:`, channel.channelName);
                    
                    return (
                      <ChannelSection 
                        key={`neet-channel-${index}-${forceRender}`}
                        channel={channel} 
                        channelIndex={index}
                        totalChannels={analysisResults.data!.channels.length}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="no-results-professional">
                  <div className="no-results-icon">📊</div>
                  <h3>No Valid NEET Channels Found</h3>
                  <p>No NEET channel data was successfully analyzed. Please try different channels or check your API connection.</p>
                  <button onClick={() => console.log('Empty results debug:', analysisResults)} className="debug-btn">
                    Debug Results
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* PROFESSIONAL FOOTER */}
      <footer className="app-footer-professional">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-logo">
                <span className="logo-icon">🎯</span>
                <span className="logo-text">NEET Analytics</span>
              </div>
              <p className="footer-description">
                Professional YouTube analytics platform designed specifically for NEET educators and content creators.
              </p>
            </div>
            
            <div className="footer-links">
              <div className="footer-section">
                <h4>Features</h4>
                <ul>
                  <li>Channel Analysis</li>
                  <li>Competitor Tracking</li>
                  <li>Performance Metrics</li>
                  <li>Content Intelligence</li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4>Resources</h4>
                <ul>
                  <li>API Documentation</li>
                  <li>User Guide</li>
                  <li>Best Practices</li>
                  <li>Support</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 NEET Analytics. Built for NEET educators worldwide.</p>
            <div className="footer-social">
              <span>Made with ❤️ for NEET Education</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
