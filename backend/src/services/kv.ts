export class KVService {
  private kv: KVNamespace;
  private defaultTTL = 3600; // 1 hour cache

  constructor(kvNamespace: KVNamespace) {
    this.kv = kvNamespace;
  }

  // Cache keys for different types of data
  private getChannelKey(channelUrl: string): string {
    return `channel:${encodeURIComponent(channelUrl)}`;
  }

  private getVideosKey(channelId: string, timeWindow: number): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `videos:${channelId}:${timeWindow}days:${today}`;
  }

  private getVideoDetailsKey(videoIds: string[]): string {
    const sortedIds = videoIds.sort().join(',');
    // Use btoa instead of Buffer for Cloudflare Workers compatibility
    return `videodetails:${btoa(sortedIds)}`;
  }

  // Channel caching (cache for 24 hours)
  async getCachedChannelInfo(channelUrl: string): Promise<any> {
    try {
      const key = this.getChannelKey(channelUrl);
      const cached = await this.kv.get(key, 'json');
      return cached as string[] | null;
    } catch (error) {
      console.error('Error getting cached channel info:', error);
      return null;
    }
  }

  async setCachedChannelInfo(channelUrl: string, channelInfo: any): Promise<void> {
    try {
      const key = this.getChannelKey(channelUrl);
      await this.kv.put(key, JSON.stringify(channelInfo), { 
        expirationTtl: 24 * 3600 // 24 hours 
      });
    } catch (error) {
      console.error('Error setting cached channel info:', error);
    }
  }

  // Video list caching (cache for 2 hours since videos change frequently)
  async getCachedVideos(channelId: string, timeWindow: number): Promise<string[] | null> {
    try {
      const key = this.getVideosKey(channelId, timeWindow);
      const cached = await this.kv.get(key, 'json');
      return cached as any[] | null;
    } catch (error) {
      console.error('Error getting cached videos:', error);
      return null;
    }
  }

  async setCachedVideos(channelId: string, timeWindow: number, videoIds: string[]): Promise<void> {
    try {
      const key = this.getVideosKey(channelId, timeWindow);
      await this.kv.put(key, JSON.stringify(videoIds), { 
        expirationTtl: 2 * 3600 // 2 hours 
      });
    } catch (error) {
      console.error('Error setting cached videos:', error);
    }
  }

  // Video details caching (cache for 6 hours)
  async getCachedVideoDetails(videoIds: string[]): Promise<any[] | null> {
    if (videoIds.length === 0) return [];
    
    try {
      const key = this.getVideoDetailsKey(videoIds);
      const cached = await this.kv.get(key, 'json');
      return cached as any[] | null;
    } catch (error) {
      console.error('Error getting cached video details:', error);
      return null;
    }
  }

  async setCachedVideoDetails(videoIds: string[], videoDetails: any[]): Promise<void> {
    if (videoIds.length === 0) return;
    
    try {
      const key = this.getVideoDetailsKey(videoIds);
      await this.kv.put(key, JSON.stringify(videoDetails), { 
        expirationTtl: 6 * 3600 // 6 hours 
      });
    } catch (error) {
      console.error('Error setting cached video details:', error);
    }
  }

  // Analysis result caching (cache complete analysis for 1 hour)
  async getCachedAnalysis(requestSignature: string): Promise<any> {
    try {
      const key = `analysis:${requestSignature}`;
      const cached = await this.kv.get(key, 'json');
      return cached;
    } catch (error) {
      console.error('Error getting cached analysis:', error);
      return null;
    }
  }

  async setCachedAnalysis(requestSignature: string, analysisResult: any): Promise<void> {
    try {
      const key = `analysis:${requestSignature}`;
      await this.kv.put(key, JSON.stringify(analysisResult), { 
        expirationTtl: this.defaultTTL 
      });
    } catch (error) {
      console.error('Error setting cached analysis:', error);
    }
  }

  // Generate signature for request caching  
  generateRequestSignature(channels: string[], timeWindow: number): string {
    const sortedChannels = channels.sort();
    const today = new Date().toISOString().split('T')[0];
    const signatureString = `${sortedChannels.join('|')}:${timeWindow}:${today}`;
    // Use btoa instead of Buffer for Cloudflare Workers compatibility
    return btoa(signatureString);
  }

  // Utility: Clear cache for debugging
  async clearCache(pattern?: string): Promise<void> {
    console.log('Cache clear requested for pattern:', pattern);
  }
}
