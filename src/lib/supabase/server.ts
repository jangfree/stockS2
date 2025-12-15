/**
 * Supabase 클라이언트 (서버용)
 * Server Components 및 API Routes에서 사용
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './types'

/**
 * 서버 환경에서 Supabase 클라이언트 생성
 * Server Components에서 사용
 *
 * @returns Supabase 클라이언트 인스턴스
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component에서 set은 불가능할 수 있음
            // 무시해도 됨
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component에서 remove는 불가능할 수 있음
            // 무시해도 됨
          }
        },
      },
    }
  )
}

/**
 * Service Role 클라이언트 생성
 * API Routes에서 RLS를 우회해야 할 때 사용
 * ⚠️ 주의: 클라이언트에 절대 노출하지 말 것!
 *
 * @returns Service Role 권한의 Supabase 클라이언트
 */
export function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined
        },
        set() {},
        remove() {},
      },
    }
  )
}
