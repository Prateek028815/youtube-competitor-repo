import React, { useState, useEffect } from 'react';
import { ChannelSelector } from './components/ChannelSelector/ChannelSelector';
import { TimeWindowSelector } from './components/TimeWindowSelector/TimeWindowSelector';
import { ChannelSection } from './components/ChannelSection/ChannelSection';
import { DirectYouTubeAPI } from './services/youtubeApi';
import type { AnalysisResponse, ChannelAnalysis } from './types/youtube';
import './App.css';

function App() {
  // Default channels: Competition Wallah, Unacademy NEET, Vedantu NEET
  const defaultChannels = [
    'https://www.youtube.com/@CompetitionWallah',
    'https://www.youtube.com/@UnacademyNEET', 
    'https://www.youtube.com/@VedantuNEET'
  ];

  const [channels, setChannels] = useState<string[]>(defaultChannels);
  const [timeWindow, setTimeWindow] = useState<number>(7);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [forceRender, setForceRender] = useState(0);

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
    console.log('📺 Analyzing channels:', channels);

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
    setChannels(defaultChannels);
    setTimeWindow(7);
    setAnalysisResults(null);
    setError('');
    setForceRender(0);
  };

  return (
    <div className="app-clean">
      {/* Simple Top Bar - Clean Title Only */}
      <div className="top-bar-minimal">
        <div className="top-bar-content">
          <h1 className="app-title-minimal">NEET YouTube Analytics</h1>
        </div>
      </div>
      
      <main className="main-content-clean">
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
            </div>
          </div>
        </section>

        {/* Results Section - Direct to Individual Channels Only */}
        {analysisResults && (
          <section className="results-section-clean">
            <div className="section-container">
              {/* Individual Channel Results */}
              {analysisResults.data?.channels && Array.isArray(analysisResults.data.channels) ? (
                <div className="channels-results">
                  <h4 className="channels-title">
                    NEET Channel Analysis ({analysisResults.data.channels.length} Channels)
                  </h4>
                  <p className="channels-description">
                    Each NEET channel below shows detailed analytics including performance scores, 
                    engagement metrics, competitor ranking data, and growth trends for the last {analysisResults.metadata?.timeWindow || timeWindow} days.
                    First channel auto-expands with quick stats visible.
                  </p>
                  <div className="channels-grid">
                    {analysisResults.data.channels.map((channel, index) => (
                      <ChannelSection 
                        key={`neet-channel-${index}-${forceRender}`}
                        channel={channel} 
                        channelIndex={index}
                        totalChannels={analysisResults.data!.channels.length}
                        autoExpand={index === 0}
                        allChannels={analysisResults.data!.channels}
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
