// Pasteurization type definitions
export type PasteurizationType = "LTLT" | "HTST" | "UHT" | "ESL";

export const PASTEURIZATION_LABELS: Record<PasteurizationType, string> = {
  LTLT: "低溫長時間殺菌",
  HTST: "高溫短時間殺菌",
  UHT: "超高溫殺菌",
  ESL: "延長保存期限",
};

export const PASTEURIZATION_SHORT_LABELS: Record<PasteurizationType, string> = {
  LTLT: "低溫長時",
  HTST: "高溫短時",
  UHT: "超高溫",
  ESL: "ESL",
};

export const PASTEURIZATION_DESCRIPTIONS: Record<PasteurizationType, string> = {
  LTLT: "62-65°C 加熱 30 分鐘，保留最多營養與風味",
  HTST: "72-75°C 加熱 15 秒，平衡營養保留與保存期限",
  UHT: "135-150°C 加熱 2-4 秒，可常溫保存數月",
  ESL: "微過濾或高溫處理，延長冷藏保存期限",
};

// Common physical channels
export const PHYSICAL_CHANNELS = [
  "全聯",
  "家樂福",
  "好市多",
  "大潤發",
  "愛買",
  "頂好",
  "全家",
  "7-11",
  "萊爾富",
  "OK",
  "美廉社",
  "楓康",
  "Jason's",
  "city'super",
  "微風超市",
  "新光三越超市",
  "SOGO超市",
  "農會超市",
  "有機商店",
] as const;

// Common online channels
export const ONLINE_CHANNELS = [
  "品牌官網",
  "Uber Eats",
  "foodpanda",
  "全聯線上購",
  "家樂福線上購",
  "好市多線上購",
  "momo購物網",
  "PChome",
  "蝦皮購物",
] as const;

// Submission types
export type SubmissionType = "brand" | "update" | "image";

export const SUBMISSION_TYPE_LABELS: Record<SubmissionType, string> = {
  brand: "新增品牌",
  update: "更新資訊",
  image: "上傳圖片",
};

// Announcement types
export type AnnouncementType = "info" | "update" | "important";

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  info: "資訊",
  update: "更新",
  important: "重要",
};

// Volume options (in ml)
export const COMMON_VOLUMES = [200, 290, 400, 500, 936, 1000, 1858, 1892, 2000] as const;

// Format volume for display
export function formatVolume(ml: number): string {
  if (ml >= 1000) {
    const liters = ml / 1000;
    return liters % 1 === 0 ? `${liters}L` : `${liters.toFixed(2)}L`;
  }
  return `${ml}ml`;
}

// Format price for display
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "價格未定";
  return `NT$${price}`;
}

// Format shelf life for display
export function formatShelfLife(days: number | null | undefined): string {
  if (days === null || days === undefined) return "未標示";
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `約 ${months} 個月`;
  }
  return `${days} 天`;
}
