import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 보호된 경로 정의
const protectedRoutes = ['/mypage']
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // 로그인 필요 페이지
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/mypage/:path*', '/login', '/register']
}
