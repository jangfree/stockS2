/**
 * 인증 관련 유틸리티
 */

import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UAParser } from 'ua-parser-js'
import { JWTPayload } from './types/member'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const SALT_ROUNDS = 12

// 비밀번호 해시
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// 비밀번호 검증
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// JWT 토큰 생성
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

// JWT 토큰 검증
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Request에서 토큰 추출
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

// Request에서 토큰 검증
export function verifyTokenFromRequest(request: NextRequest): JWTPayload | null {
  const token = extractToken(request)
  if (!token) return null
  return verifyToken(token)
}

// Request에서 세션 토큰 추출
export function getSessionToken(request: NextRequest): string | null {
  const tokenData = verifyTokenFromRequest(request)
  return tokenData?.session_token || null
}

// IP 주소 추출
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return 'unknown'
}

// IP 마스킹
export function maskIpAddress(ip: string): string {
  if (!ip || ip === 'unknown') return ip
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`
  }
  // IPv6 또는 다른 형식
  return ip.substring(0, Math.min(ip.length / 2, 10)) + '***'
}

// User-Agent 파싱
export interface DeviceInfo {
  deviceType: 'PC' | 'Mobile' | 'Tablet'
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  userAgent: string
}

export function parseUserAgent(request: NextRequest): DeviceInfo {
  const userAgent = request.headers.get('user-agent') || ''
  const parser = new UAParser(userAgent)
  const device = parser.getDevice()
  const browser = parser.getBrowser()
  const os = parser.getOS()

  let deviceType: 'PC' | 'Mobile' | 'Tablet' = 'PC'
  if (device.type === 'mobile') deviceType = 'Mobile'
  else if (device.type === 'tablet') deviceType = 'Tablet'

  return {
    deviceType,
    browser: browser.name || 'Unknown',
    browserVersion: browser.version || '',
    os: os.name || 'Unknown',
    osVersion: os.version || '',
    userAgent
  }
}

// 랜덤 세션 토큰 생성
export function generateSessionToken(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

// 입력 검증
export const validators = {
  userId: (value: string): boolean => {
    return /^[a-zA-Z0-9]{4,50}$/.test(value)
  },

  password: (value: string): boolean => {
    // 8자 이상, 영문+숫자+특수문자 포함
    return value.length >= 8 &&
           /[a-zA-Z]/.test(value) &&
           /[0-9]/.test(value) &&
           /[!@#$%^&*(),.?":{}|<>]/.test(value)
  },

  name: (value: string): boolean => {
    return value.length >= 2 && value.length <= 50
  },

  gender: (value: string): value is 'M' | 'F' => {
    return value === 'M' || value === 'F'
  },

  birthYear: (value: number): boolean => {
    const currentYear = new Date().getFullYear()
    return value >= 1940 && value <= currentYear - 14 // 최소 14세 이상
  }
}

// 비밀번호 강도 체크
export function getPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push('8자 이상 입력해주세요')

  if (password.length >= 12) score += 1

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('소문자를 포함해주세요')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('대문자를 포함해주세요')

  if (/[0-9]/.test(password)) score += 1
  else feedback.push('숫자를 포함해주세요')

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push('특수문자를 포함해주세요')

  return { score, feedback }
}
