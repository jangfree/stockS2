'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { MemberPublic, LoginResponse, ApiResponse, MeResponse } from '@/lib/types/member'

interface AuthContextType {
  user: MemberPublic | null
  token: string | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (user_id: string, password: string, options?: { force_login?: boolean; terminate_session_id?: number }) => Promise<LoginResponse | null>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  sessionInfo: { active_sessions: number; max_sessions: number } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MemberPublic | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<{ active_sessions: number; max_sessions: number } | null>(null)

  // 로컬 스토리지에서 토큰 복원
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  // 사용자 정보 가져오기
  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      const data: ApiResponse<MeResponse> = await response.json()

      if (data.success && data.data) {
        setUser(data.data.user)
        setSessionInfo(data.data.session_info)
      } else {
        // 토큰 무효화
        localStorage.removeItem('auth_token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // 로그인
  const login = useCallback(async (
    user_id: string,
    password: string,
    options?: { force_login?: boolean; terminate_session_id?: number }
  ): Promise<LoginResponse | null> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id,
          password,
          ...options
        })
      })

      const data: ApiResponse<LoginResponse> = await response.json()

      if (data.success && data.data) {
        const loginData = data.data
        setToken(loginData.token)
        setUser(loginData.user)
        setSessionInfo(loginData.session_info)
        localStorage.setItem('auth_token', loginData.token)
        return loginData
      }

      throw data.error || { code: 'UNKNOWN_ERROR', message: '로그인에 실패했습니다.' }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }, [])

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
      setSessionInfo(null)
    }
  }, [token])

  // 사용자 정보 새로고침
  const refreshUser = useCallback(async () => {
    if (token) {
      await fetchUser(token)
    }
  }, [token])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!user,
        login,
        logout,
        refreshUser,
        sessionInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
