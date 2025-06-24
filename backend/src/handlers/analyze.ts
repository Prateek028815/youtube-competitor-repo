import type { Context } from 'hono';
import type { AnalysisRequest, AnalysisResponse } from '../types/api';
import { YouTubeService } from '../services/youtube';

// Define environment interface for handlers
interface Env {
  YOUTUBE_API_KEY: string;
  YOUTUBE_ANALYSIS_KV: KVNamespace;
  ENVIRONMENT?: string;
}

export async function analyzeHandler(c: Context<{ Bindings: Env }>) {
  try {
    console.log('🚀 BACKEND - Analyze handler starting...');
    
    // Log raw request details
    console.log('🔍 BACKEND - Request method:', c.req.method);
    console.log('🔍 BACKEND - Request URL:', c.req.url);
    console.log('🔍 BACKEND - Content-Type:', c.req.header('content-type'));
    
    // Parse request body with detailed logging
    console.log('📝 BACKEND - Parsing request body...');
    const requestBody = await c.req.json() as AnalysisRequest;
    
    // Log exactly what was received
    console.log('📝 BACKEND - Received body:', requestBody);
    console.log('📝 BACKEND - Body structure:', {
      hasChannels: !!requestBody.channels,
      channelsValue: requestBody.channels,
      channelsType: typeof requestBody.channels,
      channelsLength: requestBody.channels?.length,
      timeWindow: requestBody.timeWindow,
      timeWindowType: typeof requestBody.timeWindow,
      requestId: requestBody.requestId
    });
    
    // Detailed validation with specific error messages
    if (!requestBody.channels) {
      console.error('❌ BACKEND - Validation failed: channels property missing');
      return c.json({ 
        error: 'Channels property is missing from request',
        received: requestBody
      }, 400);
    }
    
    if (!Array.isArray(requestBody.channels)) {
      console.error('❌ BACKEND - Validation failed: channels is not an array');
      return c.json({ 
        error: 'Channels must be an array',
        received: typeof requestBody.channels,
        value: requestBody.channels
      }, 400);
    }
    
    if (requestBody.channels.length === 0) {
      console.error('❌ BACKEND - Validation failed: channels array is empty');
      return c.json({ 
        error: 'At least one channel is required',
        receivedLength: requestBody.channels.length
      }, 400);
    }

    if (!requestBody.timeWindow) {
      console.error('❌ BACKEND - Validation failed: timeWindow missing');
      return c.json({ 
        error: 'TimeWindow is required',
        received: requestBody.timeWindow
      }, 400);
    }
    
    if (![7, 15, 30].includes(requestBody.timeWindow)) {
      console.error('❌ BACKEND - Validation failed: invalid timeWindow value');
      return c.json({ 
        error: 'Invalid time window. Must be 7, 15, or 30 days',
        received: requestBody.timeWindow,
        type: typeof requestBody.timeWindow
      }, 400);
    }

    console.log('✅ BACKEND - Validation passed successfully');
    
    // Return success response
    return c.json({
      message: 'Validation successful!',
      receivedChannels: requestBody.channels.length,
      timeWindow: requestBody.timeWindow,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 BACKEND - Handler error:', error);
    return c.json({ 
      error: 'Handler failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

