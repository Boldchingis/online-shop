// ==================== AUTH PROVIDER ====================
// Client-side auth provider with proper error handling and loading states

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'
import { User, AuthContextType, LoginCredentials, RegisterData } from '@/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        const token = authService.getAccessToken()
        setAccessToken(token)
        
        // Get current user data
        const userData = await authService.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      // Clear invalid tokens
      await logout()
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials, redirectUrl?: string) => {
    try {
      setIsLoading(true)
      
      const { user: userData, tokens } = await authService.login(credentials)
      
      setUser(userData)
      setAccessToken(tokens.accessToken)
      
      toast.success('Welcome back!')
      // Redirect to the specified URL or home page
      router.push(redirectUrl || '/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const register = useCallback(async (data: RegisterData, redirectUrl?: string) => {
    try {
      setIsLoading(true)
      
      const { user: userData, tokens } = await authService.register(data)
      
      setUser(userData)
      setAccessToken(tokens.accessToken)
      
      toast.success('Account created successfully!')
      // Redirect to the specified URL or home page
      router.push(redirectUrl || '/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setAccessToken(null)
      router.push('/login')
    }
  }, [router])

  const refreshToken = useCallback(async () => {
    try {
      const tokens = await authService.refreshToken()
      setAccessToken(tokens.accessToken)
    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
      throw error
    }
  }, [logout])

  const updateUser = useCallback(async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data)
      setUser(updatedUser)
      toast.success('Profile updated successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed'
      toast.error(message)
      throw error
    }
  }, [])

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!accessToken || !user) return

    const refreshInterval = setInterval(async () => {
      if (authService.isTokenExpired()) {
        try {
          await refreshToken()
        } catch (error) {
          // Token refresh failed, user will be logged out
          clearInterval(refreshInterval)
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(refreshInterval)
  }, [accessToken, user, refreshToken])

  const contextValue: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    // Return a default context when not within AuthProvider
    // This allows components to work without authentication until ordering
    return {
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
      login: async () => { throw new Error('Please log in to continue') },
      register: async () => { throw new Error('Please log in to continue') },
      logout: () => {},
      refreshToken: async () => {},
      updateUser: async () => { throw new Error('Please log in to continue') }
    }
  }
  
  return context
}
