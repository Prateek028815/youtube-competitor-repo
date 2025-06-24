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
  const [timeWindow, setTimeWindow] = useState<number>(7); // Changed to number for 1-30 days
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
      setForceRender(prev => prev + 1);
    }
  }, [analysisResults]);

  // Type guard to check if channel has valid analytics
  const hasValidAnalytics = (channel: ChannelAnalysis): boolean => {
    return !!(channel.analytics && channel.channelMetrics);
  };

  const handleAnalyze = async () => {
    if (channels.length === 0) {
      alert('Please select at least one NEET YouTube channel to analyze');
      return;
    }

    // Validate time window
    if (timeWindow < 1 || timeWindow > 30) {
      alert('Please select a time window between 1 and 30 days');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisResults(null);
    
    console.log(`🚀 Starting NEET channel analysis (${timeWindow} days)...`);

    try {
      const channelResults: ChannelAnalysis[] = [];
      
      for (let i = 0; i < channels.length; i++) {
        const channelUrl = channels[i];
        console.log(`🔍 Processing NEET channel ${i + 1}/${channels.length}: ${channelUrl}`);
        
        try {
          const result = await DirectYouTubeAPI.analyzeChannel(channelUrl, timeWindow);
          console.log(`📊 Analysis result for ${channelUrl}:`, result);
          
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
            console.warn(`⚠️ Invalid result for ${channelUrl}:`, result);
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
          console.error(`❌ Error processing ${channelUrl}:`, channelError);
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
      console.log('🧪 Testing YouTube API connection...');
      const result = await DirectYouTubeAPI.quickTest();
      alert(result);
    } catch (error) {
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
              },
              {
                videoId: 'neet_physics_2',
                title: 'NEET Chemistry - Organic Reactions',
                description: 'Complete organic chemistry reactions for NEET 2025.',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                publishedAt: new Date(Date.now() - 86400000).toISOString(),
                viewCount: 180000,
                duration: 'PT38M15S',
                likeCount: 9000,
                commentCount: 1500
              },
              {
                videoId: 'neet_physics_3',
                title: 'NEET Biology - Cell Structure',
                description: 'Cell structure and function for NEET biology.',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                publishedAt: new Date(Date.now() - 172800000).toISOString(),
                viewCount: 150000,
                duration: 'PT42M20S',
                likeCount: 7500,
                commentCount: 1200
              }
            ],
            analytics: {
              totalVideos: 3,
              totalViews: 580000,
              averageViews: 193333,
              totalLikes: 29000,
              totalComments: 5500,
              engagementRate: 5.94,
              mostPopularVideo: null,
              leastPopularVideo: null,
              uploadFrequency: '5 videos/week',
              averageDuration: 2730,
              viewsGrowthTrend: 'up' as const,
              performanceScore: 92,
              topPerformingDays: ['Monday', 'Wednesday', 'Friday'],
              contentCategories: [
                { category: 'Physics', count: 1, avgViews: 250000 },
                { category: 'Chemistry', count: 1, avgViews: 180000 },
                { category: 'Biology', count: 1, avgViews: 150000 }
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
                title: 'NEET Biology - Genetics and Evolution',
                description: 'Complete genetics chapter for NEET biology preparation.',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                publishedAt: new Date(Date.now() - 86400000).toISOString(),
                viewCount: 120000,
                duration: 'PT35M10S',
                likeCount: 6000,
                commentCount: 800
              },
              {
                videoId: 'neet_bio_2',
                title: 'NEET Physics - Thermodynamics',
                description: 'Thermodynamics concepts for NEET physics.',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                publishedAt: new Date(Date.now() - 172800000).toISOString(),
                viewCount: 95000,
                duration: 'PT40M25S',
                likeCount: 4500,
                commentCount: 600
              }
            ],
            analytics: {
              totalVideos: 2,
              totalViews: 215000,
              averageViews: 107500,
              totalLikes: 10500,
              totalComments: 1400,
              engagementRate: 5.53,
              mostPopularVideo: null,
              leastPopularVideo: null,
              uploadFrequency: '4 videos/week',
              averageDuration: 2295,
              viewsGrowthTrend: 'stable' as const,
              performanceScore: 85,
              topPerformingDays: ['Tuesday', 'Thursday', 'Saturday'],
              contentCategories: [
                { category: 'Biology', count: 1, avgViews: 120000 },
                { category: 'Physics', count: 1, avgViews: 95000 }
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
        totalVideos: 5,
        totalViews: 795000,
        processedAt: new Date().toISOString(),
        timeWindow: timeWindow,
        usingDirectAPI: true,
        analysisType: 'neet_test',
        individualChannelCount: 2
      }
    };
    
    console.log('🧪 Setting NEET test data:', testData);
    setAnalysisResults(testData);
  };

  return (
    <div className="app-clean">
      {/* Simple Top Bar */}
      <div className="top-bar-minimal">
        <div className="top-bar-content">
          <h1 className="app-title-minimal">NEET YouTube Analytics</h1>
          <div className="top-bar-actions">
            <button onClick={testConnection} className="top-btn">
              🧪 Test API
            </button>
            <button onClick={createTestData} className="top-btn">
              📊 Demo Data
            </button>
            <button onClick={() => setDebugMode(!debugMode)} className="top-btn">
              {debugMode ? 'Hide Debug' : 'Debug'}
            </button>
          </div>
        </div>
      </div>
      
      <main className="main-content-clean">
        {/* Debug Section */}
        {debugMode && (
          <div className="debug-section-minimal">
            <details className="debug-details">
              <summary className="debug-summary">🔍 Debug Information</summary>
              <div className="debug-content">
                <p><strong>Analysis Results:</strong> {analysisResults ? 'YES' : 'NO'}</p>
                <p><strong>Channels Count:</strong> {analysisResults?.data?.channels?.length || 'N/A'}</p>
                <p><strong>Analysis Type:</strong> {analysisResults?.metadata?.analysisType || 'N/A'}</p>
                <p><strong>Time Window:</strong> {timeWindow} days</p>
                <p><strong>Force Render:</strong> {forceRender}</p>
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

        {/* Error Display */}
        {error && (
          <div className="error-section-minimal">
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
        
        {/* Analysis Form */}
        <section className="analysis-section-clean">
          <div className="section-container">
            <ChannelSelector 
              selectedChannels={channels} 
              onChannelsChange={setChannels} 
            />
            
            <div className="analysis-controls">
              <TimeWindowSelector 
                selectedWindow={timeWindow} 
                onWindowChange={setTimeWindow} 
              />
              
              <div className="form-actions">
                <button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || channels.length === 0}
                  className="analyze-btn-clean"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="btn-spinner">🔄</span>
                      Analyzing {timeWindow} days...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🚀</span>
                      Start Analysis ({timeWindow} days)
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleReset} 
                  disabled={isAnalyzing}
                  className="reset-btn-clean"
                >
                  <span className="btn-icon">🔄</span>
                  Reset
                </button>
              </div>

              {analysisResults?.metadata && (
                <div className="analysis-summary-clean">
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-number">{analysisResults.data?.channels?.length || 0}</span>
                      <span className="summary-label">Channels</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-number">{analysisResults.metadata.totalVideos || 0}</span>
                      <span className="summary-label">Videos</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-number">{formatNumber(analysisResults.metadata.totalViews || 0)}</span>
                      <span className="summary-label">Views</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-number">{analysisResults.metadata.timeWindow}</span>
                      <span className="summary-label">Days Period</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Analytics Dashboard */}
        {analysisResults && analysisResults.data?.channels && analysisResults.data.channels.length > 0 && (
          <AnalyticsDashboard analysisResults={analysisResults} />
        )}

        {/* Content Intelligence Section */}
        {showContentIntelligence && analysisResults && (
          <section className="intelligence-section-clean">
            <ContentIntelligence analysisResults={analysisResults} />
          </section>
        )}

        {/* Results Section */}
        {analysisResults && (
          <section className="results-section-clean">
            <div className="section-container">
              <div className="section-header">
                <h3 className="section-title">
                  <span className="section-icon">📊</span>
                  Analysis Results
                </h3>
                <div className="section-actions">
                  <button 
                    onClick={() => setShowContentIntelligence(!showContentIntelligence)}
                    className="toggle-btn"
                  >
                    <span className="btn-icon">🧠</span>
                    {showContentIntelligence ? 'Hide AI Insights' : 'Show AI Insights'}
                  </button>
                </div>
              </div>
              
              {/* Results Summary */}
              {analysisResults.metadata && (
                <div className="results-summary-clean">
                  <div className="summary-content">
                    <h4>Analysis Summary</h4>
                    <div className="summary-details">
                      <p><strong>Analysis Type:</strong> Individual NEET YouTube Channel Analysis</p>
                      <p><strong>Channels Analyzed:</strong> {analysisResults.data?.channels?.length || 0}</p>
                      <p><strong>Successful Analyses:</strong> {analysisResults.data?.channels?.filter(hasValidAnalytics).length || 0}</p>
                      <p><strong>Time Period:</strong> Last {analysisResults.metadata.timeWindow} days</p>
                      <p><strong>Processed:</strong> {new Date(analysisResults.metadata.processedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Competitor Tracker */}
              {analysisResults && analysisResults.data?.channels && 
               analysisResults.data.channels.filter(hasValidAnalytics).length > 1 && (
                <CompetitorTracker analysisResults={analysisResults} />
              )}
              
              {/* Individual Channel Results */}
              {analysisResults.data?.channels && Array.isArray(analysisResults.data.channels) ? (
                <div className="channels-results">
                  <h4 className="channels-title">
                    Individual Channel Analysis ({analysisResults.data.channels.length} Channels)
                  </h4>
                  <p className="channels-description">
                    Each NEET channel below shows separate analytics including performance scores, 
                    engagement metrics, and growth trends for the last {analysisResults.metadata?.timeWindow || timeWindow} days.
                  </p>
                  <div className="channels-grid">
                    {analysisResults.data.channels.map((channel, index) => (
                      <ChannelSection 
                        key={`neet-channel-${index}-${forceRender}`}
                        channel={channel} 
                        channelIndex={index}
                        totalChannels={analysisResults.data!.channels.length}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-results-clean">
                  <div className="no-results-icon">📊</div>
                  <h4>No Analysis Results</h4>
                  <p>No NEET channel data was successfully analyzed. Please try again with different channels.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
