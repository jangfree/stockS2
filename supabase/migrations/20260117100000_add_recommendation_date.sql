-- =====================================================
-- 추천일자 컬럼 추가 마이그레이션
-- 중기 종목추천 테이블에 recommendation_date 필드 추가
-- 작성일: 2026-01-17
-- =====================================================

-- recommendation_date 컬럼 추가 (YYYYMMDD 형식 문자열)
ALTER TABLE long_term_recommendations
ADD COLUMN IF NOT EXISTS recommendation_date VARCHAR(20);

-- 인덱스 생성 (추천일자로 정렬/필터링 최적화)
CREATE INDEX IF NOT EXISTS idx_long_term_recommendations_date
  ON long_term_recommendations(recommendation_date DESC);

COMMENT ON COLUMN long_term_recommendations.recommendation_date IS '추천일자 (YYYYMMDD 형식)';
