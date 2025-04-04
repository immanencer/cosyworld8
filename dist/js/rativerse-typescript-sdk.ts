
/**
 * RATiverse TypeScript SDK
 * A client library for interacting with the RATi API
 */

export interface RATiApiConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface Avatar {
  tokenId: string;
  name: string;
  description: string;
  media?: {
    image?: string;
    video?: string;
  };
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  evolution?: {
    level: number;
    previous: string[];
    timestamp: string;
  };
  memory?: {
    recent: string;
    archive: string;
  };
}

export interface Item {
  tokenId: string;
  name: string;
  description: string;
  media?: {
    image?: string;
    video?: string;
  };
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  evolution?: {
    level: number;
    previous: string[];
    timestamp: string;
  };
}

export interface Location {
  tokenId: string;
  name: string;
  description: string;
  media?: {
    image?: string;
    video?: string;
  };
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  currentAvatars?: string[];
}

export interface Memory {
  id: string;
  avatarId: string;
  timestamp: string;
  content: string;
  type: string;
  locationId?: string;
  relatedEntities?: Array<{
    id: string;
    type: string;
    role: string;
  }>;
}

export interface ChatRequest {
  avatarId: string;
  message: string;
  locationId?: string;
}

export interface ChatResponse {
  response: string;
  avatarId: string;
  avatarName: string;
}

export class RATiVerseClient {
  private baseUrl: string;
  private apiKey?: string;
  
  constructor(config: RATiApiConfig) {
    this.baseUrl = config.baseUrl.endsWith('/') 
      ? config.baseUrl.slice(0, -1) 
      : config.baseUrl;
    this.apiKey = config.apiKey;
  }
  
  private async fetch<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers
    };
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error (${response.status}): ${error.message || 'Unknown error'}`);
    }
    
    return response.json() as Promise<T>;
  }
  
  // Avatar methods
  async getAllAvatars(): Promise<Avatar[]> {
    return this.fetch<Avatar[]>('/api/avatars');
  }
  
  async getAvatar(id: string): Promise<Avatar> {
    return this.fetch<Avatar>(`/api/avatars/${id}`);
  }
  
  async getAvatarMemory(id: string): Promise<Memory[]> {
    return this.fetch<Memory[]>(`/api/avatars/${id}/memory`);
  }
  
  // Item methods
  async getAllItems(): Promise<Item[]> {
    return this.fetch<Item[]>('/api/items');
  }
  
  async getItem(id: string): Promise<Item> {
    return this.fetch<Item>(`/api/items/${id}`);
  }
  
  // Location methods
  async getAllLocations(): Promise<Location[]> {
    return this.fetch<Location[]>('/api/locations');
  }
  
  async getLocation(id: string): Promise<Location> {
    return this.fetch<Location>(`/api/locations/${id}`);
  }
  
  async getAvatarsInLocation(id: string): Promise<Avatar[]> {
    return this.fetch<Avatar[]>(`/api/locations/${id}/avatars`);
  }
  
  // Chat method
  async chatWithAvatar(request: ChatRequest): Promise<ChatResponse> {
    return this.fetch<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
}
