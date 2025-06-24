import type { Context } from 'hono';

interface Env {
  YOUTUBE_API_KEY: string;
  YOUTUBE_ANALYSIS_KV: KVNamespace;
}

export async function statusHandler(c: Context<{ Bindings: Env }>) {
  try {
    const requestId = c.req.param('requestId');
    
    if (!requestId) {
      return c.json({ error: 'Request ID is required' }, 400);
    }

    const response = {
      requestId,
      status: 'completed' as const,
      progress: 100,
      message: 'Analysis completed successfully'
    };

    return c.json(response);

  } catch (error) {
    console.error('Status handler error:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
