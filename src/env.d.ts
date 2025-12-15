/**
 * 환경 변수 타입 정의
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase (공개)
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string

    // Supabase (비밀)
    SUPABASE_SERVICE_ROLE_KEY: string

    // 관리자
    ADMIN_PASSWORD: string
  }
}
