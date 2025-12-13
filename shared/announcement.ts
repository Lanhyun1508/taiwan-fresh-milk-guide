// Current announcement content for the website banner
export const CURRENT_ANNOUNCEMENT = {
  title: "歡迎使用台灣鮮乳選購指南",
  content: "網站正式上線！歡迎使用搜尋、篩選、比較功能，也歡迎投稿新品牌資訊。",
  type: "info" as const,
  lastUpdated: new Date().toISOString().split('T')[0],
};

// Update log for transparency
export const UPDATE_LOG = [
  {
    date: "2024-12-11",
    version: "1.0.0",
    changes: [
      "網站正式上線",
      "品牌資料庫功能完成",
      "搜尋與篩選功能完成",
      "品牌比較功能完成",
      "使用者投稿系統完成",
    ],
  },
];
