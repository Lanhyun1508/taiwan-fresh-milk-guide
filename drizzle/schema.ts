import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 鮮乳品牌資料表
 */
export const milkBrands = mysqlTable("milk_brands", {
  id: int("id").autoincrement().primaryKey(),
  // 基本資訊
  brandName: varchar("brandName", { length: 100 }).notNull(),
  productName: varchar("productName", { length: 200 }).notNull(),
  // 殺菌方式: LTLT(低溫長時間), HTST(高溫短時間), UHT(超高溫), ESL(延長保存期限)
  pasteurizationType: mysqlEnum("pasteurizationType", ["LTLT", "HTST", "UHT", "ESL"]).notNull(),
  // 容量 (毫升)
  volume: int("volume").notNull(),
  // 保存期限 (天數)
  shelfLife: int("shelfLife"),
  // 價格 (新台幣)
  price: int("price"),
  // 產地
  origin: varchar("origin", { length: 100 }),
  // 成分說明
  ingredients: text("ingredients"),
  // 品牌官網
  officialWebsite: varchar("officialWebsite", { length: 500 }),
  // 產品圖片 URL (S3)
  imageUrl: varchar("imageUrl", { length: 500 }),
  imageKey: varchar("imageKey", { length: 200 }),
  // 通路資訊 (JSON 格式儲存)
  // 實體通路: 全聯, 家樂福, 好市多, 7-11, 全家, 萊爾富, OK, 頂好, 大潤發, 愛買 等
  // 線上通路: 品牌官網, Uber Eats, foodpanda, momo, PChome 等
  physicalChannels: json("physicalChannels").$type<string[]>(),
  onlineChannels: json("onlineChannels").$type<string[]>(),
  // 備註
  notes: text("notes"),
  // 是否為有機認證
  isOrganic: boolean("isOrganic").default(false),
  // 是否為進口品牌
  isImported: boolean("isImported").default(false),
  // 狀態
  isActive: boolean("isActive").default(true),
  // 時間戳記
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MilkBrand = typeof milkBrands.$inferSelect;
export type InsertMilkBrand = typeof milkBrands.$inferInsert;

/**
 * 使用者投稿資料表
 */
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  // 投稿者資訊
  userId: int("userId"),
  submitterName: varchar("submitterName", { length: 100 }),
  submitterEmail: varchar("submitterEmail", { length: 320 }),
  // 投稿類型: brand(新品牌), update(更新資訊), image(圖片)
  submissionType: mysqlEnum("submissionType", ["brand", "update", "image"]).notNull(),
  // 若為更新或圖片投稿，關聯的品牌 ID
  relatedBrandId: int("relatedBrandId"),
  // 投稿內容 (JSON 格式)
  content: json("content").$type<Record<string, unknown>>().notNull(),
  // 圖片資訊 (若為圖片投稿)
  imageUrl: varchar("imageUrl", { length: 500 }),
  imageKey: varchar("imageKey", { length: 200 }),
  // 審核狀態
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  // 審核備註
  reviewNotes: text("reviewNotes"),
  // 審核者
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  // LLM 驗證結果
  llmValidation: json("llmValidation").$type<{
    isValid: boolean;
    confidence: number;
    issues: string[];
    suggestions: string[];
  }>(),
  // 時間戳記
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

/**
 * 公告資料表
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  // 公告標題
  title: varchar("title", { length: 200 }).notNull(),
  // 公告內容
  content: text("content").notNull(),
  // 公告類型: info(資訊), update(更新), important(重要)
  type: mysqlEnum("type", ["info", "update", "important"]).default("info").notNull(),
  // 是否顯示
  isActive: boolean("isActive").default(true),
  // 顯示順序
  displayOrder: int("displayOrder").default(0),
  // 開始顯示時間
  startDate: timestamp("startDate"),
  // 結束顯示時間
  endDate: timestamp("endDate"),
  // 建立者
  createdBy: int("createdBy"),
  // 時間戳記
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;
