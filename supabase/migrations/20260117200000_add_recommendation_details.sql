-- =====================================================
-- 단타 추천 종목 상세 필드 추가 마이그레이션
-- recommendations 테이블에 추가 분석 정보 필드 추가
-- 작성일: 2026-01-17
-- =====================================================

-- 추천상태 컬럼 추가
ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS recommendation_status VARCHAR(50);

-- 감지패턴 컬럼 추가
ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS detected_patterns TEXT;

-- 패턴강도 컬럼 추가
ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS pattern_strength VARCHAR(20);

-- 최초추천시간 컬럼 추가
ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS first_recommendation_time TIMESTAMPTZ;

-- 급등일자 컬럼 추가
ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS surge_date VARCHAR(20);

-- 추천사유 컬럼 추가
ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS recommendation_reason TEXT;

-- 코멘트 추가
COMMENT ON COLUMN recommendations.recommendation_status IS '추천상태 (예: 추천제외, 추천유지 등)';
COMMENT ON COLUMN recommendations.detected_patterns IS '감지패턴 (쉼표로 구분된 패턴명)';
COMMENT ON COLUMN recommendations.pattern_strength IS '패턴강도 (LOW, MEDIUM, HIGH)';
COMMENT ON COLUMN recommendations.first_recommendation_time IS '최초추천시간';
COMMENT ON COLUMN recommendations.surge_date IS '급등일자 (YYYY.MM.DD 형식)';
COMMENT ON COLUMN recommendations.recommendation_reason IS '추천사유 (여러 줄 텍스트)';
