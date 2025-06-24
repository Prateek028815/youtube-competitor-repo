const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export class DirectYouTubeAPI {
  private static validateApiKey(): void {
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not found. Check your .env.local file.');
    }
    if (!YOUTUBE_API_KEY.startsWith('AIzaSy')) {
      throw new Error('Invalid YouTube API key format. Should start with "AIzaSy".');
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      this.validateApiKey();
      console.log('🧪 Testing YouTube API connection...');
      
      const response = await fetch(
        `${YOUTUBE_BASE_URL}/search?part=snippet&type=channel&q=test&maxResults=1&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API test failed: ${error.error?.message || response.statusText}`);
      }
      
      console.log('✅ YouTube API connection successful');
      return true;
    } catch (error) {
      console.error('YouTube API connection test failed:', error);
      throw error;
    }
  }

  static extractChannelId(channelUrl: string): string | null {
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

    if (/^UC[a-zA-Z0-9_-]{22}$/.test(channelUrl)) {
      return channelUrl;
    }

    return null;
  }

  static async searchChannel(query: string): Promise<{ id: string; title: string; customUrl?: string }> {
    try {
      this.validateApiKey();
      console.log('🔍 Searching for channel:', query);
      
      const response = await fetch(
        `${YOUTUBE_BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=1&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Channel search failed: ${error.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error(`No channel found for: ${query}`);
      }
      
      const channel = data.items[0];
      const result = {
        id: channel.snippet.channelId || channel.id.channelId,
        title: channel.snippet.title,
        customUrl: channel.snippet.customUrl
      };
      
      console.log('✅ Channel found:', result);
      return result;
    } catch (error) {
      console.error('Channel search error:', error);
      throw error;
    }
  }

  static async getChannelInfo(channelId: string): Promise<{
    id: string;
    title: string;
    customUrl?: string;
    subscriberCount?: number;
    totalViews?: number;
    videoCount?: number;
    publishedAt?: string;
    country?: string;
  }> {
    try {
      this.validateApiKey();
      console.log('🔍 Getting detailed channel info for:', channelId);
      
      const response = await fetch(
        `${YOUTUBE_BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Channel info failed: ${error.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error(`Channel not found: ${channelId}`);
      }
      
      const channel = data.items[0];
      const result = {
        id: channel.id,
        title: channel.snippet.title,
        customUrl: channel.snippet.customUrl,
        subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
        totalViews: parseInt(channel.statistics?.viewCount || '0'),
        videoCount: parseInt(channel.statistics?.videoCount || '0'),
        publishedAt: channel.snippet.publishedAt,
        country: channel.snippet.country
      };
      
      console.log('✅ Detailed channel info retrieved:', result);
      return result;
    } catch (error) {
      console.error('Channel info error:', error);
      throw error;
    }
  }

  static async getChannelVideos(channelId: string, timeWindowDays: number): Promise<string[]> {
    try {
      this.validateApiKey();
      
      const publishedAfter = new Date();
      publishedAfter.setDate(publishedAfter.getDate() - timeWindowDays);
      const publishedAfterISO = publishedAfter.toISOString();
      
      console.log(`🔍 Fetching videos from ${channelId} published after ${publishedAfterISO}`);
      
      const response = await fetch(
        `${YOUTUBE_BASE_URL}/search?` +
        `part=snippet&` +
        `channelId=${channelId}&` +
        `type=video&` +
        `publishedAfter=${publishedAfterISO}&` +
        `maxResults=50&` +
        `order=date&` +
        `key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Video search failed: ${error.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      const videoIds = data.items.map((item: any) => item.id.videoId).filter(Boolean);
      
      console.log(`✅ Found ${videoIds.length} videos in last ${timeWindowDays} days for ${channelId}`);
      return videoIds;
      
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      throw error;
    }
  }

  static async getVideoDetails(videoIds: string[]): Promise<Array<{
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    viewCount: number;
    duration: string;
    likeCount?: number;
    commentCount?: number;
  }>> {
    if (videoIds.length === 0) {
      console.log('⚠️ No video IDs provided, returning empty array');
      return [];
    }
    
    try {
      this.validateApiKey();
      
      const chunks = [];
      for (let i = 0; i < videoIds.length; i += 50) {
        chunks.push(videoIds.slice(i, i + 50));
      }
      
      const allVideos = [];
      
      for (const chunk of chunks) {
        console.log(`🔍 Fetching details for ${chunk.length} videos...`);
        
        const response = await fetch(
          `${YOUTUBE_BASE_URL}/videos?` +
          `part=snippet,statistics,contentDetails&` +
          `id=${chunk.join(',')}&` +
          `key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Video details failed: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        for (const item of data.items) {
          try {
            let thumbnailUrl = '';
            
            if (item.snippet?.thumbnails) {
              const thumbnails = item.snippet.thumbnails;
              if (thumbnails.maxres?.url) {
                thumbnailUrl = thumbnails.maxres.url;
              } else if (thumbnails.high?.url) {
                thumbnailUrl = thumbnails.high.url;
              } else if (thumbnails.medium?.url) {
                thumbnailUrl = thumbnails.medium.url;
              } else if (thumbnails.standard?.url) {
                thumbnailUrl = thumbnails.standard.url;
              } else if (thumbnails.default?.url) {
                thumbnailUrl = thumbnails.default.url;
              }
            }
            
            if (!thumbnailUrl) {
              thumbnailUrl = `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`;
            }
            
            const video = {
              videoId: item.id,
              title: item.snippet?.title || 'Untitled Video',
              description: item.snippet?.description || '',
              thumbnail: thumbnailUrl,
              publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
              viewCount: parseInt(item.statistics?.viewCount || '0'),
              duration: item.contentDetails?.duration || 'PT0S',
              likeCount: parseInt(item.statistics?.likeCount || '0'),
              commentCount: parseInt(item.statistics?.commentCount || '0')
            };
            
            allVideos.push(video);
            
          } catch (itemError) {
            console.error(`❌ Error processing video item:`, item, itemError);
          }
        }
      }
      
      console.log(`✅ Retrieved details for ${allVideos.length} videos`);
      return allVideos;
      
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  }

  // ENHANCED: Calculate comprehensive individual channel analytics
  static calculateChannelAnalytics(videos: any[], _channelInfo: any): any {
    if (!videos || videos.length === 0) {
      return {
        totalVideos: 0,
        totalViews: 0,
        averageViews: 0,
        totalLikes: 0,
        totalComments: 0,
        engagementRate: 0,
        mostPopularVideo: null,
        leastPopularVideo: null,
        uploadFrequency: 'No uploads in time period',
        averageDuration: 0,
        viewsGrowthTrend: 'stable' as const,
        performanceScore: 0,
        topPerformingDays: [],
        contentCategories: []
      };
    }

    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, video) => sum + (video.viewCount || 0), 0);
    const totalLikes = videos.reduce((sum, video) => sum + (video.likeCount || 0), 0);
    const totalComments = videos.reduce((sum, video) => sum + (video.commentCount || 0), 0);
    const averageViews = Math.round(totalViews / totalVideos);
    
    // Calculate engagement rate
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;
    
    // Find most and least popular videos
    const mostPopularVideo = videos.reduce((max, video) => 
      (video.viewCount || 0) > (max.viewCount || 0) ? video : max, videos[0]);
    const leastPopularVideo = videos.reduce((min, video) => 
      (video.viewCount || 0) < (min.viewCount || 0) ? video : min, videos[0]);
    
    // Calculate upload frequency
    const uploadFrequency = `${totalVideos} videos in period`;
    
    // Calculate average duration
    const totalDuration = videos.reduce((sum, video) => {
      const duration = this.parseDuration(video.duration);
      return sum + duration;
    }, 0);
    const averageDuration = Math.round(totalDuration / totalVideos);
    
    // Determine growth trend (simplified - based on view distribution)
    const sortedByDate = [...videos].sort((a, b) => 
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    const firstHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));
    const secondHalf = sortedByDate.slice(Math.floor(sortedByDate.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, v) => sum + v.viewCount, 0) / Math.max(firstHalf.length, 1);
    const secondHalfAvg = secondHalf.reduce((sum, v) => sum + v.viewCount, 0) / Math.max(secondHalf.length, 1);
    
    let viewsGrowthTrend: 'up' | 'down' | 'stable' = 'stable';
    if (secondHalfAvg > firstHalfAvg * 1.2) viewsGrowthTrend = 'up';
    else if (secondHalfAvg < firstHalfAvg * 0.8) viewsGrowthTrend = 'down';
    
    // Calculate performance score (0-100)
    const viewScore = Math.min((averageViews / 10000) * 30, 30);
    const engagementScore = Math.min(engagementRate * 20, 25);
    const consistencyScore = Math.min((totalVideos / 10) * 20, 20);
    const trendScore = viewsGrowthTrend === 'up' ? 25 : viewsGrowthTrend === 'stable' ? 15 : 5;
    const performanceScore = Math.round(viewScore + engagementScore + consistencyScore + trendScore);
    
    // Analyze top performing days
    const dayPerformance = new Map<string, number>();
    videos.forEach(video => {
      const day = new Date(video.publishedAt).toLocaleDateString('en-US', { weekday: 'long' });
      dayPerformance.set(day, (dayPerformance.get(day) || 0) + video.viewCount);
    });
    
    const topPerformingDays = Array.from(dayPerformance.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);
    
    // Analyze content categories (simplified)
    const contentCategories = [
      { category: 'Tutorial', count: 0, avgViews: 0 },
      { category: 'Review', count: 0, avgViews: 0 },
      { category: 'Entertainment', count: 0, avgViews: 0 },
      { category: 'Educational', count: 0, avgViews: 0 },
      { category: 'Other', count: 0, avgViews: 0 }
    ];
    
    videos.forEach(video => {
      const title = video.title.toLowerCase();
      if (title.includes('tutorial') || title.includes('how to')) {
        contentCategories[0].count++;
        contentCategories[0].avgViews += video.viewCount;
      } else if (title.includes('review') || title.includes('unboxing')) {
        contentCategories[1].count++;
        contentCategories[1].avgViews += video.viewCount;
      } else if (title.includes('funny') || title.includes('comedy')) {
        contentCategories[2].count++;
        contentCategories[2].avgViews += video.viewCount;
      } else if (title.includes('learn') || title.includes('course')) {
        contentCategories[3].count++;
        contentCategories[3].avgViews += video.viewCount;
      } else {
        contentCategories[4].count++;
        contentCategories[4].avgViews += video.viewCount;
      }
    });
    
    // Calculate average views per category
    contentCategories.forEach(category => {
      if (category.count > 0) {
        category.avgViews = Math.round(category.avgViews / category.count);
      }
    });

    return {
      totalVideos,
      totalViews,
      averageViews,
      totalLikes,
      totalComments,
      engagementRate: Math.round(engagementRate * 100) / 100,
      mostPopularVideo,
      leastPopularVideo,
      uploadFrequency,
      averageDuration,
      viewsGrowthTrend,
      performanceScore,
      topPerformingDays,
      contentCategories: contentCategories.filter(cat => cat.count > 0)
    };
  }

  static parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const [, hours, minutes, seconds] = match;
    return (parseInt(hours || '0') * 3600) + (parseInt(minutes || '0') * 60) + parseInt(seconds || '0');
  }

  static async analyzeChannel(channelUrl: string, timeWindowDays: number): Promise<{
    success: boolean;
    channelId?: string;
    channelInfo?: any;
    videos?: Array<any>;
    analytics?: any;
    channelMetrics?: any;
    error?: string;
    message: string;
  }> {
    try {
      console.log(`🧪 Starting individual analysis for: ${channelUrl} (${timeWindowDays} days)`);
      
      await this.testConnection();
      console.log('✅ API connection verified');
      
      let channelId = this.extractChannelId(channelUrl);
      console.log('🔍 Extracted channel ID:', channelId);
      
      if (!channelId || !channelId.startsWith('UC')) {
        const channelQuery = channelUrl.includes('@') 
          ? channelUrl.split('@')[1] 
          : channelUrl.split('/').pop() || channelUrl;
        console.log('🔍 Searching for channel with query:', channelQuery);
        const searchResult = await this.searchChannel(channelQuery);
        channelId = searchResult.id;
      }
      
      console.log('✅ Final channel ID:', channelId);
      
      const channelInfo = await this.getChannelInfo(channelId);
      console.log(`✅ Channel info: ${channelInfo.title}`);
      
      const videoIds = await this.getChannelVideos(channelId, timeWindowDays);
      console.log(`📹 Found ${videoIds.length} video IDs`);
      
      const videos = await this.getVideoDetails(videoIds);
      console.log(`📊 Retrieved details for ${videos.length} videos`);
      
      // Calculate comprehensive individual analytics
      const analytics = this.calculateChannelAnalytics(videos, channelInfo);
      
      const channelMetrics = {
        subscriberCount: channelInfo.subscriberCount,
        totalChannelViews: channelInfo.totalViews,
        videoCount: channelInfo.videoCount,
        channelCreatedDate: channelInfo.publishedAt,
        country: channelInfo.country,
        customUrl: channelInfo.customUrl
      };
      
      const result = {
        success: true,
        channelId,
        channelInfo,
        videos,
        analytics,
        channelMetrics,
        message: `Successfully analyzed ${videos.length} videos from ${channelInfo.title} with individual analytics`
      };
      
      console.log('✅ Complete individual channel analysis:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Individual channel analysis failed for', channelUrl, ':', error);
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Individual channel analysis failed for ${channelUrl}`
      };
      console.log('❌ Error result:', errorResult);
      return errorResult;
    }
  }

  static async quickTest(): Promise<string> {
    try {
      await this.testConnection();
      return '✅ YouTube API connection successful!';
    } catch (error) {
      return `❌ YouTube API failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}
