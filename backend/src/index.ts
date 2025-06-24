import { Hono } from 'hono';
import { cors } from 'hono/cors';

const RUNTIME_YOUTUBE_KEY = "AIzaSyC5qwZ5uu5aG5O-bDAb5Oye77Ot9QmKSxY"

interface Env {
  YOUTUBE_API_KEY: string;
  YOUTUBE_ANALYSIS_KV: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// Global error handler with detailed logging
app.onError((err, c) => {
  console.error('🔴 GLOBAL ERROR CAUGHT:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: c.req.url,
    method: c.req.method
  });
  
  return c.json({ 
    error: 'Internal server error',
    message: err.message,
    stack: err.stack, // Include stack trace for debugging
    timestamp: new Date().toISOString()
  }, 500);
});

// Test endpoint to verify environment
// Health check endpoint
app.get('/', (c) => {
  const hasYouTubeKey = !!c.env.YOUTUBE_API_KEY;
  const hasKVNamespace = !!c.env.YOUTUBE_ANALYSIS_KV;
  
  return c.json({ 
    message: 'YouTube Competitor Analysis API',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: {
      hasYouTubeApiKey: hasYouTubeKey,
      hasKVNamespace: hasKVNamespace
    }
  });
});

// ADD THIS NEW ENDPOINT
app.get('/env-debug', (c) => {
  try {
    console.log('🔍 Environment debug check...');
    
    // Detailed environment check
    const envCheck = {
      youtubeApiKey: {
        exists: !!c.env.YOUTUBE_API_KEY,
        length: c.env.YOUTUBE_API_KEY?.length || 0,
        startsWithAIza: c.env.YOUTUBE_API_KEY?.startsWith('AIzaSy') || false
      },
      kvNamespace: {
        exists: !!c.env.YOUTUBE_ANALYSIS_KV,
        type: typeof c.env.YOUTUBE_ANALYSIS_KV
      }
    };
    
    console.log('🔍 Detailed environment check:', envCheck);
    
    return c.json({
      message: 'Environment debug check',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Environment debug error:', error);
    return c.json({ error: 'Environment debug failed' }, 500);
  }
});


app.use('*', cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type'],
}));

app.get('/', (c) => c.json({ message: 'API Running' }));

// Simplified analyze endpoint for testing
app.post('/api/analyze', async (c) => {
  try {
    console.log('🚀 ANALYZE ENDPOINT HIT');
    
    // Check environment immediately
    if (!c.env.YOUTUBE_API_KEY) {
      console.error('❌ No YouTube API key found');
      return c.json({ error: 'YouTube API key missing' }, 400);
    }
    
    if (!c.env.YOUTUBE_ANALYSIS_KV) {
      console.error('❌ No KV namespace found');
      return c.json({ error: 'KV namespace missing' }, 400);
    }
    
    // Test basic request parsing
    const body = await c.req.json();
    console.log('📝 Request body parsed:', body);
    
    // Return minimal success response
    return c.json({
      message: 'Basic endpoint working',
      receivedChannels: body.channels?.length || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 ANALYZE ERROR:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    
    throw error; // Let global error handler catch it
  }
});

export default app;
