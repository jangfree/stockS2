/**
 * Supabase 클라이언트 (브라우저용)
 * Client Components에서 사용
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

/**
 * 브라우저 환경에서 Supabase 클라이언트 생성
 *
 * @returns Supabase 클라이언트 인스턴스
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
