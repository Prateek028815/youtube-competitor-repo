export interface YouTubeChannel {
  id: string;
  title: string;
  customUrl?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    high: {
      url: string;
    };
  };
  publishedAt: string;
  statistics: {
    viewCount: string;
  };
  contentDetails: {
    duration: string;
  };
}

export interface AnalysisRequest {
  channels: string[];
  timeWindow: 7 | 15 | 30;
  requestId: string;
}

export interface AnalysisResponse {
  requestId: string;
  status: 'processing' | 'completed' | 'error';
  data?: {
    channels: Array<{
      channelId: string;
      channelName: string;
      channelUrl: string;
      videos: Array<{
        videoId: string;
        title: string;
        description: string;
        thumbnail: string;
        publishedAt: string;
        viewCount: number;
        duration: string;
      }>;
    }>;
  };
  metadata?: {
    totalVideos: number;
    totalViews: number;        // ADD this line
    processedAt: string;
    timeWindow: number;
    fromCache?: boolean;
    usingDirectAPI?: boolean;
    analysisType?: string;
  };
  message?: string;
}
