const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface TokenStorage {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
}

class APIClient {
  private tokens: TokenStorage = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadTokens();
    }
  }

  private loadTokens() {
    this.tokens = {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      expiresAt: localStorage.getItem('expiresAt'),
    };
  }

  private saveTokens(tokens: TokenStorage) {
    this.tokens = tokens;
    if (typeof window !== 'undefined') {
      if (tokens.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
      } else {
        localStorage.removeItem('accessToken');
      }

      if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken);
      } else {
        localStorage.removeItem('refreshToken');
      }

      if (tokens.expiresAt) {
        localStorage.setItem('expiresAt', tokens.expiresAt);
      } else {
        localStorage.removeItem('expiresAt');
      }
    }
  }

  private clearTokens() {
    this.saveTokens({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.tokens.accessToken) {
      headers['Authorization'] = `Bearer ${this.tokens.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || 'Request failed',
        response.status,
        errorData
      );
    }

    return response.json();
  }

  async register(email: string, password: string, fullName?: string) {
    const response = await this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });

    this.saveTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
    });

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.saveTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
    });

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken() {
    if (!this.tokens.refreshToken) {
      throw new APIError('No refresh token available', 401);
    }

    const response = await this.request<{
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.tokens.refreshToken }),
    });

    this.saveTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
    });

    return response;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  isAuthenticated(): boolean {
    return !!this.tokens.accessToken;
  }

  getAccessToken(): string | null {
    return this.tokens.accessToken;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new APIClient();
