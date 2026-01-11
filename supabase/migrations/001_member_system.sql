-- =====================================================
-- 회원 시스템 데이터베이스 스키마
-- 버전: 1.2
-- 생성일: 2026-01-12
-- =====================================================

-- 1. referral_sources (유입 경로)
CREATE TABLE IF NOT EXISTS referral_sources (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 유입 경로 초기 데이터
INSERT INTO referral_sources (code, name, sort_order) VALUES
('search', '검색엔진 (네이버, 구글 등)', 1),
('youtube', '유튜브', 2),
('blog', '블로그/카페', 3),
('sns', 'SNS (인스타그램, 페이스북 등)', 4),
('friend', '지인 추천', 5),
('community', '투자 커뮤니티', 6),
('ad', '광고', 7),
('news', '뉴스/기사', 8),
('etc', '기타 (직접 입력)', 99)
ON CONFLICT (code) DO NOTHING;

-- 2. membership_levels (회원 등급 정의)
CREATE TABLE IF NOT EXISTS membership_levels (
    level INTEGER PRIMARY KEY CHECK (level BETWEEN 0 AND 5),
    name VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    max_sessions INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 회원 등급 초기 데이터
INSERT INTO membership_levels (level, name, price, max_sessions, description) VALUES
(0, '무료회원', 0, 1, '기본 추천 페이지 1개 이용 가능, 동시 접속 1대'),
(1, '1단계', 100000, 2, '추천 페이지 1-2개 이용 가능, 동시 접속 2대'),
(2, '2단계', 200000, 2, '추천 페이지 1-3개 이용 가능, 동시 접속 2대'),
(3, '3단계', 300000, 2, '추천 페이지 1-4개 이용 가능, 동시 접속 2대'),
(4, '4단계', 400000, 3, '추천 페이지 1-5개 이용 가능, 동시 접속 3대'),
(5, '5단계', 500000, 3, '전체 추천 페이지 이용 가능, 동시 접속 3대')
ON CONFLICT (level) DO NOTHING;

-- 3. members (회원)
CREATE TABLE IF NOT EXISTS members (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
    birth_year INTEGER NOT NULL CHECK (birth_year BETWEEN 1900 AND 2100),

    -- 유입 정보
    referral_source VARCHAR(50) NOT NULL REFERENCES referral_sources(code),
    referral_source_etc VARCHAR(100),
    referrer_id VARCHAR(50),

    -- 등급 정보
    membership_level INTEGER NOT NULL DEFAULT 0 REFERENCES membership_levels(level),
    membership_start_date DATE,
    membership_end_date DATE,
    grace_period_end_date DATE,

    -- 보안 상태
    security_status VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    suspicious_count INTEGER NOT NULL DEFAULT 0,
    last_suspicious_at TIMESTAMPTZ,
    blocked_at TIMESTAMPTZ,
    blocked_reason TEXT,

    -- 상태
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- 타임스탬프
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,

    -- 탈퇴 정보
    withdrawn_at TIMESTAMPTZ,
    withdrawn_reason TEXT,
    withdrawn_by VARCHAR(50)
);

-- members 인덱스
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_membership_level ON members(membership_level);
CREATE INDEX IF NOT EXISTS idx_members_membership_end_date ON members(membership_end_date);
CREATE INDEX IF NOT EXISTS idx_members_is_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_members_referrer_id ON members(referrer_id);
CREATE INDEX IF NOT EXISTS idx_members_security_status ON members(security_status) WHERE security_status != 'NORMAL';

-- 4. payments (결제 이력)
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id),
    amount INTEGER NOT NULL,
    membership_level INTEGER NOT NULL REFERENCES membership_levels(level),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    depositor_name VARCHAR(50),
    payment_date DATE NOT NULL,
    memo TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- payments 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date DESC);

-- 5. pages (페이지 정의)
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    page_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    min_level INTEGER NOT NULL DEFAULT 0 REFERENCES membership_levels(level),
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- pages 초기 데이터
INSERT INTO pages (page_id, name, url, min_level, sort_order) VALUES
('page_01', '기본 추천', '/', 0, 1),
('page_02', '프리미엄 추천 1', '/premium/1', 1, 2),
('page_03', '프리미엄 추천 2', '/premium/2', 2, 3),
('page_04', '프리미엄 추천 3', '/premium/3', 3, 4),
('page_05', '프리미엄 추천 4', '/premium/4', 4, 5),
('page_06', 'VIP 추천', '/vip', 5, 6)
ON CONFLICT (page_id) DO NOTHING;

-- 6. page_access (페이지 접근 권한)
CREATE TABLE IF NOT EXISTS page_access (
    id SERIAL PRIMARY KEY,
    page_id VARCHAR(50) NOT NULL REFERENCES pages(page_id),
    membership_level INTEGER NOT NULL REFERENCES membership_levels(level),
    can_access BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(page_id, membership_level)
);

-- 7. login_history (로그인 이력)
CREATE TABLE IF NOT EXISTS login_history (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id),
    login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(20),
    browser VARCHAR(50),
    browser_version VARCHAR(20),
    os VARCHAR(50),
    os_version VARCHAR(20),
    is_success BOOLEAN NOT NULL DEFAULT TRUE,
    failure_reason VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- login_history 인덱스
CREATE INDEX IF NOT EXISTS idx_login_history_member_id ON login_history(member_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON login_history(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_ip_address ON login_history(ip_address);

-- 8. page_visits (페이지 방문 이력)
CREATE TABLE IF NOT EXISTS page_visits (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id),
    page_id VARCHAR(50) NOT NULL REFERENCES pages(page_id),
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(20)
);

-- page_visits 인덱스
CREATE INDEX IF NOT EXISTS idx_page_visits_member_id ON page_visits(member_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_page_id ON page_visits(page_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at DESC);

-- 9. stock_clicks (종목 클릭 이력)
CREATE TABLE IF NOT EXISTS stock_clicks (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id),
    stock_code VARCHAR(20) NOT NULL,
    stock_name VARCHAR(100) NOT NULL,
    page_id VARCHAR(50) REFERENCES pages(page_id),
    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45),
    device_type VARCHAR(20)
);

-- stock_clicks 인덱스
CREATE INDEX IF NOT EXISTS idx_stock_clicks_member_id ON stock_clicks(member_id);
CREATE INDEX IF NOT EXISTS idx_stock_clicks_stock_code ON stock_clicks(stock_code);
CREATE INDEX IF NOT EXISTS idx_stock_clicks_clicked_at ON stock_clicks(clicked_at DESC);

-- 10. active_sessions (활성 세션)
CREATE TABLE IF NOT EXISTS active_sessions (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id),
    session_token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(20),
    browser VARCHAR(50),
    browser_version VARCHAR(20),
    os VARCHAR(50),
    os_version VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- active_sessions 인덱스
CREATE INDEX IF NOT EXISTS idx_active_sessions_member_id ON active_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires ON active_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_active_sessions_active ON active_sessions(member_id, is_active) WHERE is_active = TRUE;

-- 11. suspicious_access_logs (이상 접속 로그)
CREATE TABLE IF NOT EXISTS suspicious_access_logs (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id),
    detection_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    current_ip VARCHAR(45) NOT NULL,
    current_region VARCHAR(100),
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    previous_ip VARCHAR(45),
    previous_region VARCHAR(100),
    previous_latitude DECIMAL(10, 8),
    previous_longitude DECIMAL(11, 8),
    distance_km DECIMAL(10, 2),
    time_diff_minutes INTEGER,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(50),
    resolution_type VARCHAR(50),
    resolution_note TEXT,
    user_agent TEXT,
    device_type VARCHAR(20)
);

-- suspicious_access_logs 인덱스
CREATE INDEX IF NOT EXISTS idx_suspicious_access_member_id ON suspicious_access_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_access_detected_at ON suspicious_access_logs(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_suspicious_access_severity ON suspicious_access_logs(severity);
CREATE INDEX IF NOT EXISTS idx_suspicious_access_unresolved ON suspicious_access_logs(member_id, is_resolved) WHERE is_resolved = FALSE;

-- =====================================================
-- 데이터베이스 함수
-- =====================================================

-- 동시 접속 확인 함수
CREATE OR REPLACE FUNCTION check_concurrent_sessions(p_member_id BIGINT)
RETURNS TABLE (
    active_count INTEGER,
    max_allowed INTEGER,
    can_login BOOLEAN
) AS $$
DECLARE
    v_membership_level INTEGER;
    v_max_sessions INTEGER;
    v_active_count INTEGER;
BEGIN
    SELECT membership_level INTO v_membership_level
    FROM members
    WHERE id = p_member_id AND is_active = TRUE;

    SELECT max_sessions INTO v_max_sessions
    FROM membership_levels
    WHERE level = v_membership_level;

    SELECT COUNT(*)::INTEGER INTO v_active_count
    FROM active_sessions
    WHERE member_id = p_member_id
      AND is_active = TRUE
      AND expires_at > NOW();

    RETURN QUERY SELECT
        v_active_count,
        v_max_sessions,
        (v_active_count < v_max_sessions);
END;
$$ LANGUAGE plpgsql;

-- 활성 세션 목록 조회 함수
CREATE OR REPLACE FUNCTION get_active_sessions(p_member_id BIGINT)
RETURNS TABLE (
    session_id BIGINT,
    session_token VARCHAR,
    device_type VARCHAR,
    browser VARCHAR,
    ip_address VARCHAR,
    created_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.session_token,
        s.device_type,
        s.browser,
        s.ip_address,
        s.created_at,
        s.last_activity_at
    FROM active_sessions s
    WHERE s.member_id = p_member_id
      AND s.is_active = TRUE
      AND s.expires_at > NOW()
    ORDER BY s.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 가장 오래된 세션 종료 함수
CREATE OR REPLACE FUNCTION terminate_oldest_session(p_member_id BIGINT)
RETURNS BIGINT AS $$
DECLARE
    v_session_id BIGINT;
BEGIN
    SELECT id INTO v_session_id
    FROM active_sessions
    WHERE member_id = p_member_id
      AND is_active = TRUE
      AND expires_at > NOW()
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_session_id IS NOT NULL THEN
        UPDATE active_sessions
        SET is_active = FALSE
        WHERE id = v_session_id;
    END IF;

    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- 특정 세션 종료 함수
CREATE OR REPLACE FUNCTION terminate_session(p_member_id BIGINT, p_session_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    v_affected INTEGER;
BEGIN
    UPDATE active_sessions
    SET is_active = FALSE
    WHERE id = p_session_id
      AND member_id = p_member_id
      AND is_active = TRUE;

    GET DIAGNOSTICS v_affected = ROW_COUNT;
    RETURN v_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- 다른 모든 세션 종료 함수
CREATE OR REPLACE FUNCTION terminate_other_sessions(p_member_id BIGINT, p_current_session_token VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    v_affected INTEGER;
BEGIN
    UPDATE active_sessions
    SET is_active = FALSE
    WHERE member_id = p_member_id
      AND session_token != p_current_session_token
      AND is_active = TRUE;

    GET DIAGNOSTICS v_affected = ROW_COUNT;
    RETURN v_affected;
END;
$$ LANGUAGE plpgsql;

-- 세션 활동 갱신 함수
CREATE OR REPLACE FUNCTION update_session_activity(p_session_token VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_affected INTEGER;
BEGIN
    UPDATE active_sessions
    SET last_activity_at = NOW()
    WHERE session_token = p_session_token
      AND is_active = TRUE
      AND expires_at > NOW();

    GET DIAGNOSTICS v_affected = ROW_COUNT;
    RETURN v_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- 만료된 세션 정리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    v_affected INTEGER;
BEGIN
    UPDATE active_sessions
    SET is_active = FALSE
    WHERE expires_at < NOW() AND is_active = TRUE;

    GET DIAGNOSTICS v_affected = ROW_COUNT;
    RETURN v_affected;
END;
$$ LANGUAGE plpgsql;

-- 회원 등급 만료 체크 함수
CREATE OR REPLACE FUNCTION check_membership_expiry()
RETURNS INTEGER AS $$
DECLARE
    v_affected INTEGER;
BEGIN
    UPDATE members
    SET
        membership_level = 0,
        membership_start_date = NULL,
        membership_end_date = NULL,
        grace_period_end_date = NULL,
        updated_at = NOW()
    WHERE
        is_active = TRUE
        AND membership_level > 0
        AND grace_period_end_date < CURRENT_DATE;

    GET DIAGNOSTICS v_affected = ROW_COUNT;
    RETURN v_affected;
END;
$$ LANGUAGE plpgsql;

-- 결제 등록 시 회원 등급 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_membership_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE members
    SET
        membership_level = NEW.membership_level,
        membership_start_date = NEW.period_start,
        membership_end_date = NEW.period_end,
        grace_period_end_date = NEW.period_end + INTERVAL '7 days',
        updated_at = NOW()
    WHERE id = NEW.member_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 결제 등록 트리거
DROP TRIGGER IF EXISTS trg_payment_insert ON payments;
CREATE TRIGGER trg_payment_insert
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_membership_on_payment();

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- members 테이블 updated_at 트리거
DROP TRIGGER IF EXISTS trg_members_updated_at ON members;
CREATE TRIGGER trg_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- pages 테이블 updated_at 트리거
DROP TRIGGER IF EXISTS trg_pages_updated_at ON pages;
CREATE TRIGGER trg_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
