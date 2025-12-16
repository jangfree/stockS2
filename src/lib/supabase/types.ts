/**
 * Supabase 데이터베이스 타입 정의
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      recommendations: {
        Row: {
          id: number
          recommendation_time: string
          stock_code: string
          stock_name: string
          current_price: number | null
          change_rate: number | null
          change_amount: number | null
          volume: number | null
          trading_value: number | null
          volume_rank: number | null
          theme_name: string | null
          is_active: boolean
          created_at: string
          cancelled_at: string | null
          cancelled_reason: string | null
        }
        Insert: {
          id?: never
          recommendation_time: string
          stock_code: string
          stock_name: string
          current_price?: number | null
          change_rate?: number | null
          change_amount?: number | null
          volume?: number | null
          trading_value?: number | null
          volume_rank?: number | null
          theme_name?: string | null
          is_active?: boolean
          created_at?: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
        }
        Update: {
          id?: number
          recommendation_time?: string
          stock_code?: string
          stock_name?: string
          current_price?: number | null
          change_rate?: number | null
          change_amount?: number | null
          volume?: number | null
          trading_value?: number | null
          volume_rank?: number | null
          theme_name?: string | null
          is_active?: boolean
          created_at?: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

/**
 * 추천 종목 타입 (편의를 위한 alias)
 */
export type Recommendation = Database['public']['Tables']['recommendations']['Row']
export type RecommendationRow = Database['public']['Tables']['recommendations']['Row']

/**
 * 추천 종목 생성 타입
 */
export type RecommendationInsert = Database['public']['Tables']['recommendations']['Insert']

/**
 * 추천 종목 업데이트 타입
 */
export type RecommendationUpdate = Database['public']['Tables']['recommendations']['Update']
