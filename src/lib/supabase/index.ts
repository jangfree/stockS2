/**
 * Supabase 모듈 진입점
 */

export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient, createServiceClient } from './server'
export type { Database, Recommendation, RecommendationInsert, RecommendationUpdate } from './types'
