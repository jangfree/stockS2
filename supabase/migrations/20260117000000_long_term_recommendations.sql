-- =====================================================
-- 중장기 종목추천 테이블 마이그레이션
-- 실시간 주식 추천 서비스
-- 작성일: 2026-01-17
-- =====================================================

-- 중장기 종목추천 테이블 생성
CREATE TABLE IF NOT EXISTS long_term_recommendations (
  id BIGSERIAL PRIMARY KEY,
  recommendation_time TIMESTAMPTZ NOT NULL,
  stock_code VARCHAR(20) NOT NULL,
  stock_name VARCHAR(100) NOT NULL,
  current_price INTEGER,
  change_rate DECIMAL(10, 2),
  change_amount INTEGER,
  volume BIGINT,
  trading_value BIGINT,
  volume_rank INTEGER,
  theme_name VARCHAR(100),
  recommendation_strength INTEGER,      -- 추천강도 (1-10)
  expected_return DECIMAL(10, 2),       -- 예상수익률 (%)
  risk_level VARCHAR(20),               -- 리스크레벨 (LOW, MEDIUM, HIGH)
  main_pattern TEXT,                    -- 주요패턴
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_long_term_recommendations_time
  ON long_term_recommendations(recommendation_time DESC);
CREATE INDEX IF NOT EXISTS idx_long_term_recommendations_stock_code
  ON long_term_recommendations(stock_code);
CREATE INDEX IF NOT EXISTS idx_long_term_recommendations_active
  ON long_term_recommendations(is_active);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE long_term_recommendations;

-- RLS 정책 설정
ALTER TABLE long_term_recommendations ENABLE ROW LEVEL SECURITY;

-- 서비스 역할은 모든 작업 허용
CREATE POLICY "service_role_all_long_term_recommendations" ON long_term_recommendations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 인증된 사용자는 활성 추천만 조회 가능
CREATE POLICY "authenticated_select_long_term_recommendations" ON long_term_recommendations
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 익명 사용자도 활성 추천 조회 가능 (접근 제어는 애플리케이션 레벨에서)
CREATE POLICY "anon_select_long_term_recommendations" ON long_term_recommendations
  FOR SELECT
  TO anon
  USING (is_active = true);
