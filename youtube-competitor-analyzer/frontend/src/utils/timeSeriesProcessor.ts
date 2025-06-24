import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';
import type { VideoData, ChannelAnalysis } from '../types/youtube';

export interface TimeSeriesPoint {
  date: string;
  value: number;
  formattedDate: string;
  videos: VideoData[];
  channelName: string;
}

export interface TrendDataset {
  label: string;
  data: TimeSeriesPoint[];
  borderColor: string;
  backgroundColor: string;
  channelId: string;
  totalValue: number;
}

// Make sure this is a NAMED export, not default
export class TimeSeriesProcessor {
  static generateViewsTrend(
    channels: ChannelAnalysis[],
    timeRange: number = 30
  ): { datasets: TrendDataset[]; labels: string[] } {
    console.log('📊 Generating views trend for', channels.length, 'channels');
    
    const endDate = new Date();
    const startDate = subDays(endDate, timeRange);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    const labels = dateRange.map(date => format(date, 'MMM dd'));
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#ffecd2', '#a8edea'];
    
    const datasets: TrendDataset[] = channels
      .filter(channel => channel.videos && channel.videos.length > 0)
      .map((channel, index) => {
        const timeSeriesData: TimeSeriesPoint[] = dateRange.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayVideos = (channel.videos || []).filter(video => {
            const videoDate = format(parseISO(video.publishedAt), 'yyyy-MM-dd');
            return videoDate === dateStr;
          });
          
          const totalViews = dayVideos.reduce((sum, video) => sum + video.viewCount, 0);
          
          return {
            date: dateStr,
            value: totalViews,
            formattedDate: format(date, 'MMM dd, yyyy'),
            videos: dayVideos,
            channelName: channel.channelName
          };
        });
        
        const totalValue = timeSeriesData.reduce((sum, point) => sum + point.value, 0);
        
        return {
          label: channel.channelName,
          data: timeSeriesData,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + '20',
          channelId: channel.channelId,
          totalValue
        };
      });
    
    console.log('📊 Generated', datasets.length, 'trend datasets');
    return { datasets, labels };
  }
  
  static generateEngagementTrend(
    channels: ChannelAnalysis[],
    timeRange: number = 30
  ): { datasets: TrendDataset[]; labels: string[] } {
    console.log('📊 Generating engagement trend for', channels.length, 'channels');
    
    const endDate = new Date();
    const startDate = subDays(endDate, timeRange);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    const labels = dateRange.map(date => format(date, 'MMM dd'));
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    
    const datasets: TrendDataset[] = channels
      .filter(channel => channel.videos && channel.videos.length > 0)
      .map((channel, index) => {
        const timeSeriesData: TimeSeriesPoint[] = dateRange.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayVideos = (channel.videos || []).filter(video => {
            const videoDate = format(parseISO(video.publishedAt), 'yyyy-MM-dd');
            return videoDate === dateStr;
          });
          
          const avgEngagement = dayVideos.length > 0 
            ? dayVideos.reduce((sum, video) => {
                const engagement = video.viewCount > 0 
                  ? ((video.likeCount || 0) + (video.commentCount || 0)) / video.viewCount * 100
                  : 0;
                return sum + engagement;
              }, 0) / dayVideos.length
            : 0;
          
          return {
            date: dateStr,
            value: avgEngagement,
            formattedDate: format(date, 'MMM dd, yyyy'),
            videos: dayVideos,
            channelName: channel.channelName
          };
        });
        
        const totalValue = timeSeriesData.reduce((sum, point) => sum + point.value, 0);
        
        return {
          label: channel.channelName,
          data: timeSeriesData,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + '20',
          channelId: channel.channelId,
          totalValue
        };
      });
    
    return { datasets, labels };
  }
  
  static formatChartData(trendData: { datasets: TrendDataset[]; labels: string[] }) {
    return {
      labels: trendData.labels,
      datasets: trendData.datasets.map(dataset => ({
        label: dataset.label,
        data: dataset.data.map(point => point.value),
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
        tension: 0.4,
        pointBackgroundColor: dataset.borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
      }))
    };
  }
}
