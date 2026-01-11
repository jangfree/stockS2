-- =====================================================
-- 회원 시스템 마이그레이션
-- 실시간 주식 추천 서비스
-- 작성일: 2026-01-12
-- =====================================================

-- =====================================================
-- 1. 기본 테이블 생성
-- =====================================================

-- 1.1 회원 등급 테이블
CREATE TABLE IF NOT EXISTS membership_levels (
  level INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  max_sessions INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 유입 경로 테이블
CREATE TABLE IF NOT EXISTS referral_sources (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 회원 테이블
CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  birth_year INTEGER NOT NULL CHECK (birth_year >= 1900 AND birth_year <= 2100),
  referral_source VARCHAR(50) NOT NULL REFERENCES referral_sources(code),
  referral_source_etc VARCHAR(100),
  referrer_id VARCHAR(50),
  membership_level INTEGER DEFAULT 0 REFERENCES membership_levels(level),
  membership_start_date DATE,
  membership_end_date DATE,
  grace_period_end_date DATE,
  security_status VARCHAR(20) DEFAULT 'NORMAL' CHECK (security_status IN ('NORMAL', 'WARNING', 'SUSPICIOUS', 'BLOCKED')),
  suspicious_count INTEGER DEFAULT 0,
  last_suspicious_at TIMESTAMPTZ,
  blocked_at TIMESTAMPTZ,
  blocked_reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  withdrawn_reason TEXT,
  withdrawn_by VARCHAR(50)
);

-- 1.4 활성 세션 테이블
CREATE TABLE IF NOT EXISTS active_sessions (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(20) CHECK (device_type IN ('PC', 'Mobile', 'Tablet')),
  browser VARCHAR(50),
  browser_version VARCHAR(20),
  os VARCHAR(50),
  os_version VARCHAR(20),
  is_active BOOLEAN DEFAULT true
);

-- 1.5 로그인 이력 테이블
CREATE TABLE IF NOT EXISTS login_history (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  login_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(20),
  browser VARCHAR(50),
  browser_version VARCHAR(20),
  os VARCHAR(50),
  os_version VARCHAR(20),
  is_success BOOLEAN DEFAULT true,
  failure_reason VARCHAR(100),
  region VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
);

-- 1.6 이상 접속 로그 테이블
CREATE TABLE IF NOT EXISTS suspicious_access_logs (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  detection_type VARCHAR(30) NOT NULL CHECK (detection_type IN ('MULTIPLE_IP', 'DIFFERENT_REGION', 'RAPID_CHANGE')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('WARNING', 'SUSPICIOUS', 'BLOCKED')),
  current_ip VARCHAR(45),
  current_region VARCHAR(100),
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  previous_ip VARCHAR(45),
  previous_region VARCHAR(100),
  previous_latitude DECIMAL(10, 8),
  previous_longitude DECIMAL(11, 8),
  distance_km DECIMAL(10, 2),
  time_diff_minutes INTEGER,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(50),
  resolution_type VARCHAR(30) CHECK (resolution_type IN ('CONFIRMED_OWNER', 'BLOCKED', 'FALSE_POSITIVE', 'TERMINATE_OTHERS')),
  resolution_note TEXT,
  user_agent TEXT,
  device_type VARCHAR(20)
);

-- 1.7 결제 이력 테이블
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  membership_level INTEGER NOT NULL REFERENCES membership_levels(level),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  depositor_name VARCHAR(50),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  memo TEXT,
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 페이지 테이블
CREATE TABLE IF NOT EXISTS pages (
  id BIGSERIAL PRIMARY KEY,
  page_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  min_level INTEGER DEFAULT 0 REFERENCES membership_levels(level),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.9 페이지 방문 이력 테이블
CREATE TABLE IF NOT EXISTS page_visits (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  page_id VARCHAR(50) NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(20)
);

-- 1.10 종목 클릭 이력 테이블
CREATE TABLE IF NOT EXISTS stock_clicks (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  stock_code VARCHAR(10) NOT NULL,
  stock_name VARCHAR(100) NOT NULL,
  page_id VARCHAR(50),
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  device_type VARCHAR(20)
);

-- =====================================================
-- 2. 인덱스 생성
-- =====================================================

-- members 인덱스
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_membership_level ON members(membership_level);
CREATE INDEX IF NOT EXISTS idx_members_is_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_members_security_status ON members(security_status);
CREATE INDEX IF NOT EXISTS idx_members_membership_end_date ON members(membership_end_date);

-- active_sessions 인덱스
CREATE INDEX IF NOT EXISTS idx_active_sessions_member_id ON active_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_session_token ON active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_active_sessions_is_active ON active_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires_at ON active_sessions(expires_at);

-- login_history 인덱스
CREATE INDEX IF NOT EXISTS idx_login_history_member_id ON login_history(member_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON login_history(login_at);
CREATE INDEX IF NOT EXISTS idx_login_history_ip_address ON login_history(ip_address);

-- suspicious_access_logs 인덱스
CREATE INDEX IF NOT EXISTS idx_suspicious_logs_member_id ON suspicious_access_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_logs_is_resolved ON suspicious_access_logs(is_resolved);
CREATE INDEX IF NOT EXISTS idx_suspicious_logs_detected_at ON suspicious_access_logs(detected_at);

-- payments 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- page_visits 인덱스
CREATE INDEX IF NOT EXISTS idx_page_visits_member_id ON page_visits(member_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at);

-- stock_clicks 인덱스
CREATE INDEX IF NOT EXISTS idx_stock_clicks_member_id ON stock_clicks(member_id);
CREATE INDEX IF NOT EXISTS idx_stock_clicks_clicked_at ON stock_clicks(clicked_at);

-- =====================================================
-- 3. RPC 함수 생성
-- =====================================================

-- 3.1 동시 접속 세션 수 확인
CREATE OR REPLACE FUNCTION check_concurrent_sessions(p_member_id BIGINT)
RETURNS TABLE(active_count INTEGER, max_allowed INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_membership_level INTEGER;
  v_max_sessions INTEGER;
  v_active_count INTEGER;
BEGIN
  -- 회원 등급 조회
  SELECT membership_level INTO v_membership_level
  FROM members WHERE id = p_member_id;

  -- 등급별 최대 세션 수
  SELECT max_sessions INTO v_max_sessions
  FROM membership_levels WHERE level = v_membership_level;

  -- 활성 세션 수
  SELECT COUNT(*)::INTEGER INTO v_active_count
  FROM active_sessions
  WHERE member_id = p_member_id
    AND is_active = true
    AND expires_at > NOW();

  RETURN QUERY SELECT v_active_count, COALESCE(v_max_sessions, 1);
END;
$$;

-- 3.2 활성 세션 목록 조회
CREATE OR REPLACE FUNCTION get_active_sessions(p_member_id BIGINT)
RETURNS SETOF active_sessions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM active_sessions
  WHERE member_id = p_member_id
    AND is_active = true
    AND expires_at > NOW()
  ORDER BY created_at DESC;
END;
$$;

-- 3.3 특정 세션 종료
CREATE OR REPLACE FUNCTION terminate_session(p_member_id BIGINT, p_session_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE active_sessions
  SET is_active = false
  WHERE id = p_session_id
    AND member_id = p_member_id
    AND is_active = true;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

-- 3.4 다른 모든 세션 종료 (현재 세션 제외)
CREATE OR REPLACE FUNCTION terminate_other_sessions(p_member_id BIGINT, p_current_session_token VARCHAR)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_terminated INTEGER;
BEGIN
  UPDATE active_sessions
  SET is_active = false
  WHERE member_id = p_member_id
    AND session_token != p_current_session_token
    AND is_active = true;

  GET DIAGNOSTICS v_terminated = ROW_COUNT;
  RETURN v_terminated;
END;
$$;

-- 3.5 가장 오래된 세션 종료
CREATE OR REPLACE FUNCTION terminate_oldest_session(p_member_id BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_oldest_session_id BIGINT;
BEGIN
  SELECT id INTO v_oldest_session_id
  FROM active_sessions
  WHERE member_id = p_member_id
    AND is_active = true
    AND expires_at > NOW()
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_oldest_session_id IS NOT NULL THEN
    UPDATE active_sessions
    SET is_active = false
    WHERE id = v_oldest_session_id;
  END IF;

  RETURN v_oldest_session_id;
END;
$$;

-- 3.6 만료된 세션 정리 (스케줄러용)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  UPDATE active_sessions
  SET is_active = false
  WHERE expires_at < NOW()
    AND is_active = true;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- 3.7 회원 등급 만료 처리 (스케줄러용)
CREATE OR REPLACE FUNCTION process_expired_memberships()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_processed INTEGER;
BEGIN
  -- 유예 기간도 만료된 회원을 무료회원으로 강등
  UPDATE members
  SET membership_level = 0,
      membership_start_date = NULL,
      membership_end_date = NULL,
      grace_period_end_date = NULL,
      updated_at = NOW()
  WHERE grace_period_end_date < CURRENT_DATE
    AND membership_level > 0
    AND is_active = true;

  GET DIAGNOSTICS v_processed = ROW_COUNT;
  RETURN v_processed;
END;
$$;

-- =====================================================
-- 4. 초기 데이터 삽입
-- =====================================================

-- 4.1 회원 등급 초기 데이터
INSERT INTO membership_levels (level, name, price, max_sessions, description) VALUES
  (0, '무료회원', 0, 1, '기본 추천 페이지 이용 가능'),
  (1, '1단계', 100000, 2, '프리미엄 추천 1 이용 가능'),
  (2, '2단계', 200000, 2, '프리미엄 추천 1-2 이용 가능'),
  (3, '3단계', 300000, 2, '프리미엄 추천 1-3 이용 가능'),
  (4, '4단계', 400000, 3, '프리미엄 추천 1-4 이용 가능'),
  (5, '5단계', 500000, 3, '전체 추천 페이지 이용 가능')
ON CONFLICT (level) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  max_sessions = EXCLUDED.max_sessions,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 4.2 유입 경로 초기 데이터
INSERT INTO referral_sources (code, name, sort_order) VALUES
  ('search', '검색엔진 (네이버, 구글 등)', 1),
  ('youtube', '유튜브', 2),
  ('blog', '블로그/카페', 3),
  ('sns', 'SNS (인스타그램, 페이스북 등)', 4),
  ('friend', '지인 소개', 5),
  ('ad', '광고', 6),
  ('news', '뉴스/기사', 7),
  ('etc', '기타', 99)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order;

-- 4.3 페이지 초기 데이터 (예시)
INSERT INTO pages (page_id, name, url, min_level, sort_order) VALUES
  ('page_01', '기본 추천', '/recommendations', 0, 1),
  ('page_02', '프리미엄 추천 1', '/premium/1', 1, 2),
  ('page_03', '프리미엄 추천 2', '/premium/2', 2, 3),
  ('page_04', '프리미엄 추천 3', '/premium/3', 3, 4),
  ('page_05', '프리미엄 추천 4', '/premium/4', 4, 5),
  ('page_06', 'VIP 추천', '/vip', 5, 6)
ON CONFLICT (page_id) DO UPDATE SET
  name = EXCLUDED.name,
  url = EXCLUDED.url,
  min_level = EXCLUDED.min_level,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- =====================================================
-- 5. Row Level Security (RLS) 설정
-- =====================================================

-- RLS 활성화
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_clicks ENABLE ROW LEVEL SECURITY;

-- 서비스 역할은 모든 접근 허용 (API 서버용)
CREATE POLICY "Service role has full access to members" ON members
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to active_sessions" ON active_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to login_history" ON login_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to suspicious_access_logs" ON suspicious_access_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to payments" ON payments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to page_visits" ON page_visits
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to stock_clicks" ON stock_clicks
  FOR ALL USING (auth.role() = 'service_role');

-- 공개 테이블은 anon 역할도 읽기 허용
CREATE POLICY "Anyone can read membership_levels" ON membership_levels
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read referral_sources" ON referral_sources
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can read pages" ON pages
  FOR SELECT USING (is_active = true);

-- =====================================================
-- 6. 트리거 생성
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- members 테이블 트리거
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- pages 테이블 트리거
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- membership_levels 테이블 트리거
DROP TRIGGER IF EXISTS update_membership_levels_updated_at ON membership_levels;
CREATE TRIGGER update_membership_levels_updated_at
  BEFORE UPDATE ON membership_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '회원 시스템 마이그레이션이 완료되었습니다.';
  RAISE NOTICE '생성된 테이블: members, active_sessions, login_history, suspicious_access_logs, payments, pages, page_visits, stock_clicks, membership_levels, referral_sources';
  RAISE NOTICE '생성된 함수: check_concurrent_sessions, get_active_sessions, terminate_session, terminate_other_sessions, terminate_oldest_session, cleanup_expired_sessions, process_expired_memberships';
END $$;
