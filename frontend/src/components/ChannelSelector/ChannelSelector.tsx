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

  // Default channels that are pre-selected but can be removed
  const defaultChannels = [
    'https://www.youtube.com/@CompetitionWallah',
    'https://www.youtube.com/@UnacademyNEET', 
    'https://www.youtube.com/@VedantuNEET'
  ];

  useEffect(() => {
    loadCompetitorData();
  }, []);

  // Set default channels on initial load only if no channels are selected
  useEffect(() => {
    if (selectedChannels.length === 0) {
      onChannelsChange(defaultChannels);
    }
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

  const validateYouTubeURL = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/@[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/c\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/channel\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/user\/[\w-]+/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  const addChannel = (channelUrl: string) => {
    if (!channelUrl.trim()) {
      alert('Please enter a valid YouTube channel URL');
      return;
    }

    if (!validateYouTubeURL(channelUrl)) {
      alert('Please enter a valid YouTube channel URL format');
      return;
    }

    if (selectedChannels.includes(channelUrl)) {
      alert('This channel is already added');
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

  const getChannelDisplayName = (channelId: string): string => {
    return channelId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getChannelData = (url: string) => {
    return competitorData?.channels.find(ch => ch.url === url);
  };

  const getChannelName = (url: string): string => {
    if (url.includes('CompetitionWallah')) return 'Competition Wallah';
    if (url.includes('UnacademyNEET')) return 'Unacademy NEET';
    if (url.includes('VedantuNEET')) return 'Vedantu NEET';
    
    const channelData = getChannelData(url);
    return channelData ? getChannelDisplayName(channelData.id) : url;
  };

  const isDefaultChannel = (url: string): boolean => {
    return defaultChannels.includes(url);
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
              <h2 className="selector-title">NEET YouTube Channels</h2>
              <p className="selector-subtitle">
                Default channels pre-selected. Add more from {competitorData?.channels.length || 0} available channels or add custom URLs.
              </p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <span className="stat-number">{selectedChannels.length}</span>
              <span className="stat-label">Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add More Channels */}
      <div className="add-channels-section">
        <div className="search-controls">
          <div className="search-input-wrapper">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search to add more channels..."
              className="search-input-compact"
            />
          </div>
        </div>

        {/* Custom URL Input Section */}
        <div className="custom-url-section">
          <div className="custom-url-header">
            <span className="custom-url-icon">🔗</span>
            <span className="custom-url-title">Add Custom YouTube Channel</span>
          </div>
          <div className="custom-url-input-wrapper">
            <input
              type="text"
              placeholder="Paste YouTube channel URL here (e.g., https://www.youtube.com/@channelname)"
              className="custom-url-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const url = (e.target as HTMLInputElement).value.trim();
                  if (url) {
                    addChannel(url);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <button 
              className="add-url-btn"
              onClick={() => {
                const input = document.querySelector('.custom-url-input') as HTMLInputElement;
                const url = input?.value.trim();
                if (url) {
                  addChannel(url);
                  input.value = '';
                }
              }}
            >
              ➕ Add
            </button>
          </div>
          <div className="url-format-hint">
            <span className="hint-icon">💡</span>
            <span className="hint-text">
              Supported formats: youtube.com/@channel, youtube.com/c/channel, youtube.com/channel/ID
            </span>
          </div>
        </div>

        {/* One-Click Dropdown - Auto-add on selection */}
        <div className="channel-dropdown-section">
          <select 
            value=""
            onChange={(e) => {
              if (e.target.value) {
                addChannel(e.target.value);
                e.target.value = ''; // Reset dropdown
              }
            }}
            className="channel-dropdown-oneclick"
          >
            <option value="">+ Add from preset NEET channels...</option>
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
        </div>
      </div>

      {/* Compact Selected Channels Display - No Header */}
      <div className="selected-channels-minimal">
        <div className="selected-channels-grid-minimal">
          {selectedChannels.map((channelUrl, index) => {
            const displayName = getChannelName(channelUrl);
            const isDefault = isDefaultChannel(channelUrl);
            
            return (
              <div key={index} className={`channel-chip-minimal ${isDefault ? 'default' : ''}`}>
                <span className="chip-number">#{index + 1}</span>
                <span className="chip-name">{displayName}</span>
                <button 
                  onClick={() => removeChannel(channelUrl)}
                  className="chip-remove-btn"
                  title="Remove channel"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
