// ==================== AUTH SERVICE ====================
// Server-side authentication service with proper token management

import { apiService } from './api'
import { User, AuthTokens, LoginCredentials, RegisterData, ApiResponse } from '@/types'

export class AuthService {
  private static instance: AuthService
  private tokenRefreshPromise: Promise<void> | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiService.post<{ user: User; tokens: AuthTokens }>('/auth/login', credentials)
    
    if (response.success && response.data) {
      this.storeTokens(response.data.tokens)
      return response.data
    }
    
    throw new Error(response.error || 'Login failed')
  }

  // Register user
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiService.post<{ user: User; tokens: AuthTokens }>('/auth/register', data)
    
    if (response.success && response.data) {
      this.storeTokens(response.data.tokens)
      return response.data
    }
    
    throw new Error(response.error || 'Registration failed')
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>('/auth/me')
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to get user data')
  }

  // Refresh token
  async refreshToken(): Promise<AuthTokens> {
    // Prevent multiple simultaneous refresh requests
    if (this.tokenRefreshPromise) {
      await this.tokenRefreshPromise
      return this.getStoredTokens()!
    }

    this.tokenRefreshPromise = this.performTokenRefresh()
    
    try {
      await this.tokenRefreshPromise
      return this.getStoredTokens()!
    } finally {
      this.tokenRefreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<void> {
    const refreshToken = this.getRefreshToken()
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiService.post<AuthTokens>('/auth/refresh', {
      refreshToken
    })
    
    if (response.success && response.data) {
      this.storeTokens(response.data)
    } else {
      this.clearTokens()
      throw new Error(response.error || 'Token refresh failed')
    }
  }

  // Logout user
  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken()
    
    if (refreshToken) {
      try {
        await apiService.post('/auth/logout', { refreshToken })
      } catch (error) {
        // Continue with logout even if server request fails
        console.error('Logout request failed:', error)
      }
    }
    
    this.clearTokens()
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.patch<User>('/auth/profile', data)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Profile update failed')
  }

  // Token management
  private storeTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('tokenExpiry', String(Date.now() + tokens.expiresIn * 1000))
    }
  }

  private getStoredTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null

    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const expiry = localStorage.getItem('tokenExpiry')

    if (!accessToken || !refreshToken || !expiry) return null

    return {
      accessToken,
      refreshToken,
      expiresIn: Math.max(0, Math.floor((Number(expiry) - Date.now()) / 1000))
    }
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refreshToken')
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tokenExpiry')
    }
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true

    const expiry = localStorage.getItem('tokenExpiry')
    if (!expiry) return true

    return Date.now() >= Number(expiry)
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return !!token && !this.isTokenExpired()
  }
}

export const authService = AuthService.getInstance()
