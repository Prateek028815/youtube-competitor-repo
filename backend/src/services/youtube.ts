interface YouTubeChannelResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      customUrl?: string;
    };
  }>;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: {
        high: {
          url: string;
        };
      };
      channelId: string;
    };
  }>;
}

interface YouTubeVideoResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: {
        high: {
          url: string;
        };
      };
    };
    statistics: {
      viewCount: string;
    };
    contentDetails: {
      duration: string;
    };
  }>;
}

export class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Extract channel ID from various URL formats
  private extractChannelId(channelUrl: string): string | null {
    // Handle different YouTube URL formats:
    // https://www.youtube.com/channel/UCChannelId
    // https://www.youtube.com/@username
    // https://www.youtube.com/c/channelname
    // https://www.youtube.com/user/username

    const patterns = [
      /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/@([a-zA-Z0-9_-]+)/,
      /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = channelUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // If it's already a channel ID format
    if (/^UC[a-zA-Z0-9_-]{22}$/.test(channelUrl)) {
      return channelUrl;
    }

    return null;
  }

  // Get channel ID from channel URL or handle
  async getChannelId(channelUrl: string): Promise<string> {
    const extractedId = this.extractChannelId(channelUrl);
    
    // If we extracted a direct channel ID, return it
    if (extractedId && extractedId.startsWith('UC')) {
      return extractedId;
    }

    // If it's a username/handle, search for the channel
    if (extractedId) {
      const searchUrl = `${this.baseUrl}/search?part=snippet&type=channel&q=${encodeURIComponent(extractedId)}&key=${this.apiKey}`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`Failed to search for channel: ${response.statusText}`);
      }

      const data: YouTubeSearchResponse = await response.json();
      if (data.items && data.items.length > 0) {
        // Prefer snippet.channelId, fallback to id if it looks like a channel ID
        if (data.items[0].snippet.channelId) {
          return data.items[0].snippet.channelId;
        }
        // In some cases, id may be a string (channelId) or an object with videoId
        if (typeof data.items[0].id === 'string') {
          return data.items[0].id;
        }
        throw new Error('Could not extract channelId from search result.');
      }
    }

    throw new Error(`Could not resolve channel ID from: ${channelUrl}`);
  }

  // Get channel information
  async getChannelInfo(channelId: string): Promise<{id: string, title: string, customUrl?: string}> {
    const url = `${this.baseUrl}/channels?part=snippet&id=${channelId}&key=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to get channel info: ${response.statusText}`);
    }

    const data: YouTubeChannelResponse = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error(`Channel not found: ${channelId}`);
    }

    const channel = data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      customUrl: channel.snippet.customUrl
    };
  }

  // Get videos from channel within time window
  async getChannelVideos(channelId: string, timeWindowDays: number): Promise<string[]> {
    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - timeWindowDays);
    const publishedAfterISO = publishedAfter.toISOString();

    const url = `${this.baseUrl}/search?part=snippet&channelId=${channelId}&type=video&publishedAfter=${publishedAfterISO}&maxResults=50&order=date&key=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to get channel videos: ${response.statusText}`);
    }

    const data: YouTubeSearchResponse = await response.json();
    return data.items.map(item => item.id.videoId);
  }

  // Get detailed video information
  async getVideoDetails(videoIds: string[]): Promise<Array<{
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    viewCount: number;
    duration: string;
  }>> {
    if (videoIds.length === 0) return [];

    // YouTube API allows up to 50 video IDs per request
    const chunks = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      chunks.push(videoIds.slice(i, i + 50));
    }

    const allVideos = [];
    
    for (const chunk of chunks) {
      const url = `${this.baseUrl}/videos?part=snippet,statistics,contentDetails&id=${chunk.join(',')}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to get video details: ${response.statusText}`);
      }

      const data: YouTubeVideoResponse = await response.json();
      
      const videos = data.items.map(item => ({
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(item.statistics.viewCount) || 0,
        duration: item.contentDetails.duration
      }));

      allVideos.push(...videos);
    }

    return allVideos;
  }
}
