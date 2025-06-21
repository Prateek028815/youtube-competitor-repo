import type { AnalysisRequest, AnalysisResponse } from '../types/youtube';

const API_BASE_URL = 'http://127.0.0.1:8787';

export class ApiService {
  private static async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  static async analyzeChannels(request: AnalysisRequest): Promise<AnalysisResponse> {
    return this.makeRequest<AnalysisResponse>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async getAnalysisStatus(requestId: string): Promise<any> {
    return this.makeRequest(`/api/status/${requestId}`);
  }

  static async updateConfig(config: any): Promise<any> {
    return this.makeRequest('/api/config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  static async healthCheck(): Promise<any> {
    return this.makeRequest('/');
  }
}
