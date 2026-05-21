-- ================================================================
-- 供應商評鑑系統 - 初始資料庫架構
-- Vendor Evaluation System - Initial Schema
-- ================================================================

-- 啟用必要擴充功能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- ENUM 型別
-- ================================================================

CREATE TYPE user_role AS ENUM (
  'super_admin',   -- 系統管理員（全權限）
  'admin',         -- 企業管理員
  'manager',       -- 評鑑主管
  'evaluator',     -- 評鑑人員
  'viewer'         -- 唯讀觀察者
);

CREATE TYPE supplier_tier AS ENUM ('A', 'B', 'C', 'D');
CREATE TYPE supplier_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE evaluation_status AS ENUM ('draft', 'in_progress', 'completed', 'approved', 'rejected');

-- ================================================================
-- 使用者個人資料（擴展 Supabase Auth）
-- ================================================================

CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'viewer',
  department    TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS '使用者個人資料，擴展 Supabase Auth 使用者表';
COMMENT ON COLUMN user_profiles.role IS '使用者角色：super_admin > admin > manager > evaluator > viewer';

-- ================================================================
-- 供應商
-- ================================================================

CREATE TABLE suppliers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT UNIQUE NOT NULL,            -- 供應商代碼，如 SUP-001
  name           TEXT NOT NULL,                   -- 公司全名
  category       TEXT NOT NULL,                   -- 供應分類（機械零件、電子元件...）
  tier           supplier_tier DEFAULT 'B',        -- 評鑑等級
  overall_score  DECIMAL(5,2) DEFAULT 0,           -- 最新綜合評分
  eval_count     INTEGER DEFAULT 0,               -- 歷史評鑑次數
  contact_name   TEXT,
  contact_email  TEXT,
  contact_phone  TEXT,
  address        TEXT,
  status         supplier_status DEFAULT 'active',
  notes          TEXT,
  created_by     UUID REFERENCES user_profiles(id),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE suppliers IS '供應商主檔';
COMMENT ON COLUMN suppliers.tier IS 'A≥90, B 70-89, C 50-69, D<50';

-- ================================================================
-- 評鑑指標
-- ================================================================

CREATE TABLE evaluation_criteria (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,           -- 指標類別（品質/交期/價格/服務/技術/財務/合規）
  weight      DECIMAL(5,2) NOT NULL,   -- 權重 (%)，所有指標加總需等於 100
  max_score   INTEGER DEFAULT 100,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE evaluation_criteria IS '評鑑指標定義，支援動態調整';

-- ================================================================
-- 評鑑主表
-- ================================================================

CREATE TABLE evaluations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id    UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  evaluator_id   UUID REFERENCES user_profiles(id),   -- 評鑑人員
  reviewer_id    UUID REFERENCES user_profiles(id),   -- 審核主管
  period         TEXT NOT NULL,                        -- 評鑑期間，如 2025-Q1
  status         evaluation_status DEFAULT 'draft',
  total_score    DECIMAL(5,2),                        -- 加權後總分
  tier           supplier_tier,                        -- 本次評鑑等級結果
  notes          TEXT,                                -- 整體備註
  reviewer_note  TEXT,                                -- 審核人備註
  reviewed_at    TIMESTAMPTZ,
  submitted_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE evaluations IS '評鑑作業主表';

-- 唯一約束：同一供應商同一期間只能有一份評鑑
CREATE UNIQUE INDEX uq_eval_supplier_period ON evaluations (supplier_id, period);

-- ================================================================
-- 評鑑分項明細
-- ================================================================

CREATE TABLE evaluation_scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  criteria_id   UUID NOT NULL REFERENCES evaluation_criteria(id),
  score         DECIMAL(5,2) NOT NULL,        -- 原始分數（0-max_score）
  weighted_score DECIMAL(5,2),               -- 計算後加權分數
  evidence      TEXT,                        -- 佐證資料
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (evaluation_id, criteria_id)
);

COMMENT ON TABLE evaluation_scores IS '評鑑分項得分明細';

-- ================================================================
-- 評鑑附件
-- ================================================================

CREATE TABLE evaluation_attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  file_name     TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  file_size     INTEGER,
  mime_type     TEXT,
  uploaded_by   UUID REFERENCES user_profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 觸發器：自動更新 updated_at
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- 觸發器：評鑑核准後更新供應商分數與等級
-- ================================================================

CREATE OR REPLACE FUNCTION sync_supplier_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.total_score IS NOT NULL THEN
    UPDATE suppliers
    SET
      overall_score = NEW.total_score,
      tier = NEW.tier,
      eval_count = eval_count + 1,
      updated_at = NOW()
    WHERE id = NEW.supplier_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_eval_approved_sync_supplier
  AFTER UPDATE ON evaluations
  FOR EACH ROW
  WHEN (OLD.status <> 'approved' AND NEW.status = 'approved')
  EXECUTE FUNCTION sync_supplier_score();

-- ================================================================
-- Row Level Security (RLS)
-- ================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_attachments ENABLE ROW LEVEL SECURITY;

-- user_profiles: 本人可讀自己，admin 可讀全部
CREATE POLICY "profiles_select" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "profiles_insert" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'admin')
    )
  );

-- suppliers: 所有登入者可讀，admin 以上可寫
CREATE POLICY "suppliers_select" ON suppliers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "suppliers_insert" ON suppliers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "suppliers_update" ON suppliers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'admin')
    )
  );

-- evaluation_criteria: 所有人可讀，admin 可寫
CREATE POLICY "criteria_select" ON evaluation_criteria
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "criteria_write" ON evaluation_criteria
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'admin')
    )
  );

-- evaluations: evaluator 只能看自己的，manager+ 可看全部
CREATE POLICY "evals_select" ON evaluations
  FOR SELECT USING (
    evaluator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'admin', 'manager', 'viewer')
    )
  );

CREATE POLICY "evals_insert" ON evaluations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'admin', 'manager', 'evaluator')
    )
  );

CREATE POLICY "evals_update" ON evaluations
  FOR UPDATE USING (
    evaluator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'admin', 'manager')
    )
  );

-- evaluation_scores: 跟著 evaluations 的權限
CREATE POLICY "scores_select" ON evaluation_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      WHERE e.id = evaluation_id
      AND (
        e.evaluator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles p
          WHERE p.id = auth.uid()
          AND p.role IN ('super_admin', 'admin', 'manager', 'viewer')
        )
      )
    )
  );

CREATE POLICY "scores_write" ON evaluation_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      JOIN user_profiles p ON p.id = auth.uid()
      WHERE e.id = evaluation_id
      AND (
        e.evaluator_id = auth.uid()
        OR p.role IN ('super_admin', 'admin', 'manager')
      )
    )
  );

-- ================================================================
-- 預設評鑑指標資料
-- ================================================================

INSERT INTO evaluation_criteria (name, category, weight, max_score, description, sort_order) VALUES
  ('品質合格率',     '品質', 20, 100, '產品合格率與退貨率統計',           1),
  ('交貨準時率',     '交期', 20, 100, '依約定日期準時交貨比例',           2),
  ('價格競爭力',     '價格', 15, 100, '市場價格比較與報價合理性',         3),
  ('服務回應速度',   '服務', 10, 100, '詢價、問題處理、售後服務效率',     4),
  ('技術能力',       '技術', 10, 100, '研發能力與技術支援水準',           5),
  ('品質管理系統',   '品質', 10, 100, 'ISO 認證、品管程序完善度',         6),
  ('財務穩定性',     '財務', 10, 100, '資本額、信用紀錄、財報健全',       7),
  ('環保合規性',     '合規',  5, 100, '環保法規遵循與 ESG 表現',          8);
