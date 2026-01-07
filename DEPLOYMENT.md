# 台灣鮮乳選購指南 - 部署指南

本專案已準備好三個主流部署平台的配置文件，您可以選擇任一平台進行部署。

## 快速部署步驟

### 方案一：Vercel（推薦）

**優點**：部署最快、自動CI/CD、免費額度充足

**步驟**：
1. 前往 https://vercel.com/new
2. 點擊「Continue with GitHub」登入
3. 選擇 `Lanhyun1508/taiwan-fresh-milk-guide` repository
4. 點擊「Deploy」
5. 等待 2-3 分鐘完成部署

**環境變數設定**（部署後在 Settings > Environment Variables 添加）：
```
DATABASE_URL=your_database_connection_string
NODE_ENV=production
```

---

### 方案二：Railway

**優點**：支援資料庫、配置簡單

**步驟**：
1. 前往 https://railway.app/new
2. 點擊「Deploy from GitHub repo」
3. 選擇 `Lanhyun1508/taiwan-fresh-milk-guide`
4. Railway 會自動偵測 `railway.json` 配置
5. 添加 MySQL 資料庫：
   - 點擊「+ New」> 「Database」> 「Add MySQL」
   - 複製 `DATABASE_URL` 環境變數
6. 點擊「Deploy」

---

### 方案三：Render

**優點**：免費方案包含資料庫

**步驟**：
1. 前往 https://render.com/
2. 點擊「New +」> 「Web Service」
3. 連接 GitHub repository `Lanhyun1508/taiwan-fresh-milk-guide`
4. Render 會自動偵測 `render.yaml` 配置
5. 添加 PostgreSQL 資料庫：
   - 點擊「New +」> 「PostgreSQL」
   - 複製 `Internal Database URL`
   - 在 Web Service 的 Environment 添加 `DATABASE_URL`
6. 點擊「Create Web Service」

---

## 資料庫設定

### 初始化資料庫

部署完成後，需要初始化資料庫結構：

```bash
# 在本地執行（需要設定 DATABASE_URL 環境變數）
pnpm db:push
```

或在部署平台的 Shell/Console 執行相同命令。

### 匯入初始資料

```bash
# 匯入品牌資料
node seed-brands.mjs

# 匯入舊資料（如果需要）
node import-old-data.mjs
```

---

## 環境變數說明

所有平台都需要設定以下環境變數：

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `DATABASE_URL` | 資料庫連線字串 | `mysql://user:pass@host:3306/db` |
| `NODE_ENV` | 運行環境 | `production` |

---

## 自訂網域（選填）

### Vercel
1. 前往專案 Settings > Domains
2. 輸入您的網域名稱
3. 按照指示設定 DNS 記錄

### Railway
1. 前往專案 Settings > Domains
2. 點擊「Generate Domain」或「Custom Domain」
3. 設定 CNAME 記錄指向 Railway 提供的網址

### Render
1. 前往專案 Settings > Custom Domain
2. 輸入網域名稱
3. 設定 CNAME 記錄

---

## 故障排除

### 建置失敗
- 確認 `pnpm` 版本：專案使用 pnpm 8+
- 檢查 Node.js 版本：需要 Node.js 18+

### 資料庫連線失敗
- 確認 `DATABASE_URL` 環境變數格式正確
- 檢查資料庫服務是否正常運行
- 確認防火牆規則允許連線

### 網站無法訪問
- 檢查部署日誌是否有錯誤
- 確認 `startCommand` 正確執行
- 檢查端口設定（應使用環境變數 `PORT`）

---

## 預估部署時間

- **Vercel**：2-3 分鐘
- **Railway**：3-5 分鐘
- **Render**：5-8 分鐘

---

## 支援

如有問題，請查看：
- [Vercel 文檔](https://vercel.com/docs)
- [Railway 文檔](https://docs.railway.app/)
- [Render 文檔](https://render.com/docs)
