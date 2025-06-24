import React, { useState, useEffect } from 'react';

interface Channel {
  id: string;
  url: string;
  subscribers?: string;
  category?: string;
  verified?: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

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

  const getFilteredChannels = () => {
    if (!competitorData) return [];
    
    let filtered = competitorData.channels;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(channel => 
        channel.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(channel => 
        channel.category === filterCategory
      );
    }
    
    return filtered;
  };

  const addChannel = (channelUrl: string) => {
    if (selectedChannels.includes(channelUrl)) {
      return;
    }
    
    const updatedChannels = [...selectedChannels, channelUrl];
    onChannelsChange(updatedChannels);
    console.log('✅ NEET Channel added:', channelUrl);
  };

  const removeChannel = (channelUrl: string) => {
    const updatedChannels = selectedChannels.filter(url => url !== channelUrl);
    onChannelsChange(updatedChannels);
    console.log('🗑️ NEET Channel removed:', channelUrl);
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

  const getChannelDisplayName = (channelId: string): string => {
    return channelId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getChannelData = (url: string) => {
    return competitorData?.channels.find(ch => ch.url === url);
  };

  const filteredChannels = getFilteredChannels();

  if (isLoading) {
    return (
      <div className="channel-selector-compact loading">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Loading NEET channels...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="channel-selector-compact error">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Channels</h3>
          <p>{error}</p>
          <button onClick={loadCompetitorData} className="retry-button">
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="channel-selector-compact">
      {/* Header Section */}
      <div className="selector-header-compact">
        <div className="header-content">
          <div className="header-main">
            <div className="header-icon">📺</div>
            <div className="header-text">
              <h2 className="selector-title">Select NEET YouTube Channels</h2>
              <p className="selector-subtitle">
                Choose from {competitorData?.channels.length || 0} curated NEET education channels
              </p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <span className="stat-number">{selectedChannels.length}</span>
              <span className="stat-label">Selected</span>
            </div>
            <div className="stat-badge">
              <span className="stat-number">{filteredChannels.length}</span>
              <span className="stat-label">Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-compact">
        <div className="search-controls">
          <div className="search-input-wrapper">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search NEET channels..."
              className="search-input-compact"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
              >
                ✕
              </button>
            )}
          </div>
          
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-filter-compact"
          >
            <option value="all">All Categories</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
            <option value="general">General NEET</option>
          </select>
        </div>
      </div>

      {/* Dropdown Channel Selection */}
      <div className="channel-dropdown-section">
        <div className="dropdown-header">
          <h4>Available NEET Channels</h4>
          <span className="channel-count">{filteredChannels.length} channels</span>
        </div>
        
        <div className="channel-dropdown-container">
          <select 
            value=""
            onChange={(e) => {
              if (e.target.value) {
                addChannel(e.target.value);
                e.target.value = ''; // Reset dropdown
              }
            }}
            className="channel-dropdown"
          >
            <option value="">Select a NEET channel to add...</option>
            {filteredChannels
              .filter(channel => !selectedChannels.includes(channel.url))
              .map((channel) => (
                <option key={channel.id} value={channel.url}>
                  {getChannelDisplayName(channel.id)} 
                  {channel.subscribers && ` (${channel.subscribers})`}
                </option>
              ))
            }
          </select>
          
          <button 
            onClick={() => {
              const customUrl = prompt('Enter YouTube channel URL:');
              if (customUrl && customUrl.trim()) {
                if (!selectedChannels.includes(customUrl.trim())) {
                  addChannel(customUrl.trim());
                } else {
                  alert('Channel already selected!');
                }
              }
            }}
            className="add-custom-btn"
          >
            🔗 Add Custom
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-compact">
        <div className="primary-actions">
          <select 
            onChange={(e) => {
              const action = e.target.value;
              if (action === 'random3') addRandomChannels(3);
              else if (action === 'random5') addRandomChannels(5);
              else if (action === 'custom') {
                const customUrl = prompt('Enter YouTube channel URL:');
                if (customUrl && customUrl.trim()) {
                  if (selectedChannels.includes(customUrl.trim())) {
                    alert('This channel is already selected!');
                    return;
                  }
                  addChannel(customUrl.trim());
                }
              }
              e.target.value = ''; // Reset dropdown
            }}
            className="quick-action-dropdown"
            disabled={!competitorData}
          >
            <option value="">Quick Actions...</option>
            <option value="random3">🎲 Add 3 Random Channels</option>
            <option value="random5">🎯 Add Top 5 Channels</option>
            <option value="custom">🔗 Add Custom URL</option>
          </select>
          
          <button 
            onClick={() => onChannelsChange([])}
            className="clear-all-btn"
            disabled={selectedChannels.length === 0}
            title="Clear all selected channels"
          >
            🗑️ Clear All
          </button>
        </div>
        
        <div className="selection-info">
          <span className="selection-count">
            {selectedChannels.length} of {competitorData?.channels.length || 0} selected
          </span>
        </div>
      </div>

      {/* Selected Channels Summary */}
      {selectedChannels.length > 0 && (
        <div className="selected-summary-compact">
          <div className="summary-header">
            <h3>
              <span className="summary-icon">✅</span>
              Selected Channels ({selectedChannels.length})
            </h3>
            <div className="summary-status">Ready for Analysis</div>
          </div>
          
          <div className="selected-channels-list-compact">
            {selectedChannels.map((channelUrl, index) => {
              const channelData = getChannelData(channelUrl);
              const displayName = channelData ? 
                getChannelDisplayName(channelData.id) : 
                channelUrl;
              
              return (
                <div key={index} className="selected-channel-item-compact">
                  <div className="item-number">#{index + 1}</div>
                  <div className="item-info">
                    <span className="item-name">{displayName}</span>
                    <span className="item-url">{channelUrl}</span>
                  </div>
                  <button 
                    onClick={() => removeChannel(channelUrl)}
                    className="remove-item-btn"
                    title="Remove channel"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
