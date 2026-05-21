# 供應商評鑑系統 — Vendor Evaluation System

> Sky Blue Enterprise 天藍企業風格儀表板 | Next.js 14 + Supabase + Vercel

---

## 功能概覽

| 模組 | 功能 |
|------|------|
| 儀表板 | KPI 卡片、月度趨勢圖、等級分佈、最新評鑑紀錄 |
| 供應商管理 | 新增/編輯/查詢供應商，等級徽章，多條件篩選 |
| 評鑑作業 | 建立/填寫/提交/審核評鑑，狀態流程管理 |
| 報表分析 | 趨勢圖、各指標平均、等級圓餅圖、優良/待改善列表 |
| 使用者管理 | 角色指派、權限矩陣、帳號啟停 |
| 系統設定 | 評鑑指標（含權重）、公司設定、通知設定 |

---

## 使用者角色與權限

| 角色 | 說明 | 可存取模組 |
|------|------|-----------|
| `super_admin` 系統管理員 | 全權限，可管理所有設定 | 全部 |
| `admin` 企業管理員 | 供應商/評鑑/使用者管理 | 全部（除系統底層設定）|
| `manager` 評鑑主管 | 審核評鑑、查看所有報表 | 儀表板、供應商(讀)、評鑑、報表 |
| `evaluator` 評鑑人員 | 填寫評鑑表單 | 儀表板、供應商(讀)、評鑑(建/填) |
| `viewer` 唯讀觀察者 | 查看報表與儀表板 | 儀表板、供應商(讀)、報表 |

---

## 快速開始

```bash
# 安裝依賴
npm install

# 複製環境變數範本
cp .env.local.example .env.local

# 啟動開發伺服器（Demo 模式，無需 Supabase）
npm run dev
```

開啟 http://localhost:3000，選擇角色快速登入體驗不同權限。

---

## 環境變數設定

`.env.local.example` 複製為 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> 不填寫則使用 Demo 模式（mock 資料，無需資料庫）

---

## 資料庫部署（Supabase）

1. 在 [Supabase](https://supabase.com) 建立新專案
2. 至 **SQL Editor** 執行 `supabase/migrations/001_initial_schema.sql`
3. 設定 `.env.local` 中的 URL 與 API Key
4. 重新啟動開發伺服器

---

## 部署到 Vercel

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入並部署
vercel --prod
```

或直接在 [vercel.com](https://vercel.com) 匯入 GitHub Repository，  
設定以下環境變數後自動部署：

| 變數名稱 | 說明 |
|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名金鑰 |

---

## 上傳到 GitHub

```bash
cd C:\supabase2\vendor-eval-01

# 初始化 git
git init
git add .
git commit -m "feat: 供應商評鑑系統初始版本"

# 建立 GitHub Repository 後
git remote add origin https://github.com/YOUR_USERNAME/vendor-eval-01.git
git branch -M main
git push -u origin main
```

---

## 檔案命名規則

| 類型 | 規則 | 範例 |
|------|------|------|
| 目錄 | kebab-case | `mock-data/`, `(dashboard)/` |
| React 元件 | PascalCase.tsx | `Sidebar.tsx`, `KpiCard.tsx` |
| 工具函式 | camelCase.ts | `utils.ts`, `mock-data.ts` |
| 型別定義 | camelCase.ts | `index.ts` (in types/) |
| SQL 遷移 | 序號\_描述.sql | `001_initial_schema.sql` |
| 環境變數 | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |

---

## 技術棧

- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS（自訂 Sky Blue Enterprise 主題）
- **圖表**: Recharts
- **圖示**: Bootstrap Icons（CDN）
- **字體**: Noto Sans TC（Google Fonts）
- **後端**: Supabase（PostgreSQL + Auth + RLS）
- **部署**: Vercel

---

## 評分等級制度

| 等級 | 分數範圍 | 說明 |
|------|---------|------|
| A 優選 | 90–100 | 長期首選合作夥伴 |
| B 合格 | 70–89 | 一般合格供應商 |
| C 觀察 | 50–69 | 列入觀察，需輔導改善 |
| D 不合格 | 0–49 | 建議終止合作 |

---

*Designed & Developed by Lingo｜2026*
