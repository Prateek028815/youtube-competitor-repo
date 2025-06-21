import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
import type { VideoData, ChannelAnalysis } from '../types/youtube';

export interface ComparativeDataPoint {
  date: string;
  formattedDate: string;
  channels: {
    [channelId: string]: {
      value: number;
      channelName: string;
      videos: VideoData[];
    };
  };
}

export interface ComparativeDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  channelId: string;
  growth: number;
  rank: number;
  totalValue: number;
}

export class ComparativeProcessor {
  static generateComparativeGrowth(
    channels: ChannelAnalysis[],
    metric: 'views' | 'engagement' | 'uploads',
    timeRange: number = 30
  ): { datasets: ComparativeDataset[]; labels: string[]; comparativeData: ComparativeDataPoint[] } {
    console.log('📊 Generating comparative growth for', channels.length, 'channels');
    
    const endDate = new Date();
    const startDate = subDays(endDate, timeRange);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    const labels = dateRange.map(date => format(date, 'MMM dd'));
    const colors = [
      '#667eea', '#f093fb', '#4facfe', '#43e97b', '#ffecd2', 
      '#a8edea', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'
    ];
    
    // Generate comparative data points
    const comparativeData: ComparativeDataPoint[] = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const channelsData: { [channelId: string]: any } = {};
      
      channels.forEach(channel => {
        const dayVideos = (channel.videos || []).filter(video => {
          const videoDate = format(parseISO(video.publishedAt), 'yyyy-MM-dd');
          return videoDate === dateStr;
        });
        
        let value = 0;
        switch (metric) {
          case 'views':
            value = dayVideos.reduce((sum, video) => sum + video.viewCount, 0);
            break;
          case 'engagement':
            value = dayVideos.length > 0 
              ? dayVideos.reduce((sum, video) => {
                  const engagement = video.viewCount > 0 
                    ? ((video.likeCount || 0) + (video.commentCount || 0)) / video.viewCount * 100
                    : 0;
                  return sum + engagement;
                }, 0) / dayVideos.length
              : 0;
            break;
          case 'uploads':
            value = dayVideos.length;
            break;
        }
        
        channelsData[channel.channelId] = {
          value,
          channelName: channel.channelName,
          videos: dayVideos
        };
      });
      
      return {
        date: dateStr,
        formattedDate: format(date, 'MMM dd, yyyy'),
        channels: channelsData
      };
    });
    
    // Generate datasets with growth calculation
    const datasets: ComparativeDataset[] = channels.map((channel, index) => {
      const data = comparativeData.map(point => point.channels[channel.channelId]?.value || 0);
      const totalValue = data.reduce((sum, val) => sum + val, 0);
      
      // Calculate growth rate (first week vs last week)
      const firstWeekAvg = data.slice(0, 7).reduce((sum, val) => sum + val, 0) / 7;
      const lastWeekAvg = data.slice(-7).reduce((sum, val) => sum + val, 0) / 7;
      const growth = firstWeekAvg > 0 ? ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100 : 0;
      
      return {
        label: channel.channelName,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        channelId: channel.channelId,
        growth,
        rank: 0, // Will be set after sorting
        totalValue
      };
    });
    
    // Sort by total value and assign ranks
    const sortedDatasets = [...datasets].sort((a, b) => b.totalValue - a.totalValue);
    sortedDatasets.forEach((dataset, index) => {
      const originalDataset = datasets.find(d => d.channelId === dataset.channelId);
      if (originalDataset) {
        originalDataset.rank = index + 1;
      }
    });
    
    return { datasets, labels, comparativeData };
  }
  
  static generatePerformanceDistribution(
    channels: ChannelAnalysis[]
  ): { 
    scatterData: { x: number; y: number; channelName: string; channelId: string }[];
    benchmarks: { avgViews: number; avgEngagement: number };
  } {
    console.log('📊 Generating performance distribution for', channels.length, 'channels');
    
    const scatterData = channels.map(channel => {
      const avgViews = channel.analytics?.averageViews || 0;
      const engagementRate = channel.analytics?.engagementRate || 0;
      
      return {
        x: avgViews,
        y: engagementRate,
        channelName: channel.channelName,
        channelId: channel.channelId
      };
    });
    
    const benchmarks = {
      avgViews: scatterData.reduce((sum, point) => sum + point.x, 0) / scatterData.length,
      avgEngagement: scatterData.reduce((sum, point) => sum + point.y, 0) / scatterData.length
    };
    
    return { scatterData, benchmarks };
  }
  
  static formatComparativeChartData(
    datasets: ComparativeDataset[], 
    labels: string[]
  ) {
    return {
      labels,
      datasets: datasets.map(dataset => ({
        label: `${dataset.label} (Rank #${dataset.rank})`,
        data: dataset.data,
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
        tension: 0.4,
        pointBackgroundColor: dataset.borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 8,
        fill: false,
        borderWidth: 3,
      }))
    };
  }
}
