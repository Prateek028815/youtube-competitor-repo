export interface VideoData {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  duration: string;
  likeCount?: number;
  commentCount?: number;
}

export interface ChannelAnalytics {
  totalVideos: number;
  totalViews: number;
  averageViews: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  mostPopularVideo: VideoData | null;
  leastPopularVideo: VideoData | null;
  uploadFrequency: string;
  averageDuration: number;
  viewsGrowthTrend: 'up' | 'down' | 'stable';
  performanceScore: number;
  topPerformingDays: string[];
  contentCategories: { category: string; count: number; avgViews: number }[];
}

export interface ChannelAnalysis {
  channelId: string;
  channelName: string;
  channelUrl: string;
  videos: VideoData[];
  analytics?: ChannelAnalytics; // Made optional
  channelMetrics?: { // Made optional
    subscriberCount?: number;
    totalChannelViews?: number;
    videoCount?: number;
    channelCreatedDate?: string;
    country?: string;
    customUrl?: string;
  };
  error?: string;
}

export interface AnalysisRequest {
  channels: string[];
  timeWindow: 7 | 15 | 30;
  requestId?: string;
}

export interface AnalysisResponse {
  requestId: string;
  status: 'processing' | 'completed' | 'error';
  data?: {
    channels: ChannelAnalysis[];
  };
  metadata?: {
    totalVideos: number;
    totalViews: number;
    processedAt: string;
    timeWindow: number;
    usingDirectAPI?: boolean;
    analysisType?: string;
    fromCache?: boolean;
    individualChannelCount?: number;
  };
  message?: string;
}
export interface VideoEngagement {
  videoId: string;
  channelId: string;
  engagementRate: number;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  averageWatchTime: number; // in seconds
}