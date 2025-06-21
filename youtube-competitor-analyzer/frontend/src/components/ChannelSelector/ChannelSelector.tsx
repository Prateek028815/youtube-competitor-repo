import React, { useState, useEffect } from 'react';

interface Channel {
  id: string;
  url: string;
}

interface CompetitorData {
  channels: Channel[];
}

interface ChannelSelectorProps {
  selectedChannels: string[];
  onChannelsChange: (channels: string[]) => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({ 
  selectedChannels, 
  onChannelsChange 
}) => {
  const [competitorData, setCompetitorData] = useState<CompetitorData | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadCompetitorData();
  }, []);

  const loadCompetitorData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('📁 Loading NEET YouTube channels data...');
      const response = await fetch('/data/competitor-channels.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load competitor data: ${response.statusText}`);
      }
      
      const data: CompetitorData = await response.json();
      console.log('✅ NEET channels data loaded:', data);
      
      setCompetitorData(data);
    } catch (error) {
      console.error('❌ Error loading competitor data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load competitor data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const channelId = e.target.value;
    setSelectedChannel(channelId);
    setShowPreview(!!channelId);
    console.log('📺 NEET Channel selected:', channelId);
  };

  const addSelectedChannel = () => {
    if (!selectedChannel || !competitorData) return;
    
    const channelData = competitorData.channels.find(ch => ch.id === selectedChannel);
    
    if (!channelData) {
      console.error('❌ Channel data not found');
      return;
    }
    
    if (selectedChannels.includes(channelData.url)) {
      alert('This NEET channel is already selected!');
      return;
    }
    
    const updatedChannels = [...selectedChannels, channelData.url];
    onChannelsChange(updatedChannels);
    
    console.log('✅ NEET Channel added:', channelData.id, channelData.url);
    
    setSelectedChannel('');
    setShowPreview(false);
  };

  const removeChannel = (channelUrl: string) => {
    const updatedChannels = selectedChannels.filter(url => url !== channelUrl);
    onChannelsChange(updatedChannels);
    console.log('🗑️ NEET Channel removed:', channelUrl);
  };

  const getChannelNameFromUrl = (url: string): string => {
    if (!competitorData) return url;
    
    const channel = competitorData.channels.find(ch => ch.url === url);
    if (channel) {
      return channel.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return url;
  };

  const addCustomChannel = () => {
    const customUrl = prompt('Enter YouTube channel URL:');
    if (customUrl && customUrl.trim()) {
      if (selectedChannels.includes(customUrl.trim())) {
        alert('This channel is already selected!');
        return;
      }
      
      const updatedChannels = [...selectedChannels, customUrl.trim()];
      onChannelsChange(updatedChannels);
      console.log('✅ Custom NEET channel added:', customUrl.trim());
    }
  };

  const getFilteredChannels = () => {
    if (!competitorData) return [];
    
    if (!searchTerm) return competitorData.channels;
    
    return competitorData.channels.filter(channel => 
      channel.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const addRandomChannels = (count: number) => {
    if (!competitorData) return;
    
    const availableChannels = competitorData.channels.filter(ch => 
      !selectedChannels.includes(ch.url)
    );
    
    const randomChannels = availableChannels
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map(ch => ch.url);
    
    const updatedChannels = [...selectedChannels, ...randomChannels];
    onChannelsChange(updatedChannels);
    console.log(`✅ Added ${randomChannels.length} random NEET channels`);
  };

  if (isLoading) {
    return (
      <div className="channel-selector-enhanced loading">
        <div className="selector-header">
          <div className="header-content">
            <h3 className="selector-title">
              <span className="title-icon">📺</span>
              Select NEET YouTube Channels
            </h3>
            <div className="loading-indicator">
              <div className="spinner"></div>
              <span>Loading channels...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="channel-selector-enhanced error">
        <div className="selector-header">
          <div className="header-content">
            <h3 className="selector-title">
              <span className="title-icon">📺</span>
              Select NEET YouTube Channels
            </h3>
            <div className="error-display">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h4>Failed to Load Channels</h4>
                <p>{error}</p>
                <button onClick={loadCompetitorData} className="retry-button">
                  <span className="btn-icon">🔄</span>
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredChannels = getFilteredChannels();

  return (
    <div className="channel-selector-enhanced">
      {/* Enhanced Header */}
      <div className="selector-header">
        <div className="header-content">
          <h3 className="selector-title">
            <span className="title-icon">📺</span>
            Select NEET YouTube Channels for Analysis
          </h3>
          <div className="selector-badge">
            <span className="badge-text">{competitorData?.channels.length || 0} Available</span>
          </div>
        </div>
        <p className="selector-description">
          Choose from our curated list of popular NEET education channels or add your own custom channels for comprehensive competitive analysis.
        </p>
      </div>

      {/* Enhanced Search & Selection */}
      <div className="selection-panel">
        <div className="search-section">
          <div className="search-input-group">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search NEET channels by name..."
              className="search-input-enhanced"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>
          <div className="search-results-count">
            {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''} found
          </div>
        </div>

        <div className="selection-section">
          <div className="select-input-group">
            <select 
              value={selectedChannel} 
              onChange={handleChannelChange}
              className="channel-select-enhanced"
            >
              <option value="">Choose a NEET channel...</option>
              {filteredChannels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            
            <button 
              onClick={addSelectedChannel}
              disabled={!selectedChannel}
              className="add-button-enhanced"
            >
              <span className="btn-icon">➕</span>
              Add Channel
            </button>
          </div>
        </div>

        {/* Channel Preview */}
        {showPreview && selectedChannel && (
          <div className="channel-preview-enhanced">
            {(() => {
              const channelData = competitorData?.channels.find(ch => ch.id === selectedChannel);
              if (!channelData) return null;
              
              return (
                <div className="preview-card">
                  <div className="preview-header">
                    <span className="preview-icon">📋</span>
                    <h4>Channel Preview</h4>
                  </div>
                  <div className="preview-content">
                    <div className="preview-item">
                      <span className="preview-label">Channel Name:</span>
                      <span className="preview-value">
                        {channelData.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">URL:</span>
                      <a 
                        href={channelData.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="preview-link"
                      >
                        {channelData.url}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-enhanced">
        <div className="actions-header">
          <h4>Quick Actions</h4>
        </div>
        <div className="actions-grid">
          <button onClick={addCustomChannel} className="action-btn custom">
            <span className="btn-icon">🔗</span>
            <div className="btn-content">
              <span className="btn-title">Custom URL</span>
              <span className="btn-subtitle">Add any YouTube channel</span>
            </div>
          </button>
          
          <button onClick={() => addRandomChannels(3)} className="action-btn random">
            <span className="btn-icon">🎲</span>
            <div className="btn-content">
              <span className="btn-title">Random 3</span>
              <span className="btn-subtitle">Quick start analysis</span>
            </div>
          </button>
          
          <button onClick={() => addRandomChannels(5)} className="action-btn random">
            <span className="btn-icon">🎯</span>
            <div className="btn-content">
              <span className="btn-title">Top 5</span>
              <span className="btn-subtitle">Comprehensive analysis</span>
            </div>
          </button>
          
          <button onClick={() => onChannelsChange([])} className="action-btn clear">
            <span className="btn-icon">🗑️</span>
            <div className="btn-content">
              <span className="btn-title">Clear All</span>
              <span className="btn-subtitle">Start over</span>
            </div>
          </button>
        </div>
      </div>

      {/* Selected Channels Display */}
      {selectedChannels.length > 0 && (
        <div className="selected-channels-enhanced">
          <div className="selected-header">
            <h4>
              <span className="header-icon">✅</span>
              Selected Channels ({selectedChannels.length})
            </h4>
            <div className="selection-summary">
              Ready for analysis
            </div>
          </div>
          
          <div className="selected-grid">
            {selectedChannels.map((channelUrl, index) => (
              <div key={index} className="selected-channel-card">
                <div className="card-content">
                  <div className="channel-number">#{index + 1}</div>
                  <div className="channel-info">
                    <div className="channel-name">{getChannelNameFromUrl(channelUrl)}</div>
                    <div className="channel-url">{channelUrl}</div>
                  </div>
                  <button 
                    onClick={() => removeChannel(channelUrl)}
                    className="remove-button"
                    title="Remove channel"
                  >
                    <span className="remove-icon">✕</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Panel */}
      {competitorData && (
        <div className="statistics-panel">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{competitorData.channels.length}</div>
              <div className="stat-label">Total Available</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{selectedChannels.length}</div>
              <div className="stat-label">Selected</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{competitorData.channels.length - selectedChannels.length}</div>
              <div className="stat-label">Remaining</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{filteredChannels.length}</div>
              <div className="stat-label">Search Results</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
