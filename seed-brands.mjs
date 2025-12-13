import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const initialBrands = [
  {
    brandName: "鮮乳坊",
    productName: "鮮乳坊鮮乳",
    pasteurizationType: "HTST",
    volume: 936,
    shelfLife: 14,
    price: 89,
    origin: "台灣",
    ingredients: "生乳",
    officialWebsite: "https://www.ilovemilk.com.tw/",
    physicalChannels: JSON.stringify(["全聯", "家樂福", "7-11", "全家"]),
    onlineChannels: JSON.stringify(["品牌官網", "momo購物網"]),
    isOrganic: false,
    isImported: false,
    notes: "小農鮮乳品牌，強調單一牧場乳源",
  },
  {
    brandName: "瑞穗",
    productName: "瑞穗鮮乳",
    pasteurizationType: "HTST",
    volume: 930,
    shelfLife: 14,
    price: 79,
    origin: "台灣",
    ingredients: "生乳",
    officialWebsite: "https://www.uni-president.com.tw/",
    physicalChannels: JSON.stringify(["全聯", "家樂福", "好市多", "7-11", "全家", "萊爾富", "OK"]),
    onlineChannels: JSON.stringify(["全聯線上購", "家樂福線上購", "momo購物網", "PChome"]),
    isOrganic: false,
    isImported: false,
    notes: "統一企業旗下品牌",
  },
  {
    brandName: "光泉",
    productName: "光泉鮮乳",
    pasteurizationType: "HTST",
    volume: 936,
    shelfLife: 14,
    price: 75,
    origin: "台灣",
    ingredients: "生乳",
    officialWebsite: "https://www.kuangchuan.com/",
    physicalChannels: JSON.stringify(["全聯", "家樂福", "7-11", "全家", "萊爾富"]),
    onlineChannels: JSON.stringify(["全聯線上購", "momo購物網"]),
    isOrganic: false,
    isImported: false,
    notes: null,
  },
  {
    brandName: "林鳳營",
    productName: "林鳳營鮮乳",
    pasteurizationType: "HTST",
    volume: 936,
    shelfLife: 14,
    price: 85,
    origin: "台灣",
    ingredients: "生乳",
    officialWebsite: "https://www.uni-president.com.tw/",
    physicalChannels: JSON.stringify(["全聯", "家樂福", "好市多", "7-11", "全家"]),
    onlineChannels: JSON.stringify(["全聯線上購", "家樂福線上購"]),
    isOrganic: false,
    isImported: false,
    notes: "統一企業旗下高端品牌",
  },
  {
    brandName: "義美",
    productName: "義美鮮乳",
    pasteurizationType: "HTST",
    volume: 936,
    shelfLife: 12,
    price: 82,
    origin: "台灣",
    ingredients: "生乳",
    officialWebsite: "https://www.imeifoods.com.tw/",
    physicalChannels: JSON.stringify(["全聯", "家樂福", "7-11", "全家"]),
    onlineChannels: JSON.stringify(["品牌官網"]),
    isOrganic: false,
    isImported: false,
    notes: null,
  },
  {
    brandName: "福樂",
    productName: "福樂一番鮮",
    pasteurizationType: "HTST",
    volume: 936,
    shelfLife: 14,
    price: 78,
    origin: "台灣",
    ingredients: "生乳",
    officialWebsite: "https://www.freshdelight.com.tw/",
    physicalChannels: JSON.stringify(["全聯", "家樂福", "7-11", "全家"]),
    onlineChannels: JSON.stringify(["全聯線上購"]),
    isOrganic: false,
    isImported: false,
    notes: null,
  },
  {
    brandName: "四方",
    productName: "四方鮮乳",
    pasteurizationType: "LTLT",
    volume: 946,
    shelfLife: 7,
    price: 95,
    origin: "台灣",
    ingredients: "生乳",
    officialWebsite: "https://www.fourway.com.tw/",
    physicalChannels: JSON.stringify(["全聯", "有機商店"]),
    onlineChannels: JSON.stringify(["品牌官網"]),
    isOrganic: false,
    isImported: false,
    notes: "低溫殺菌，保留更多營養",
  },
  {
    brandName: "主人牧場",
    productName: "主人牧場鮮乳",
    pasteurizationType: "LTLT",
    volume: 936,
    shelfLife: 7,
    price: 98,
    origin: "台灣",
    ingredients: "生乳",
    officialWebsite: null,
    physicalChannels: JSON.stringify(["全聯", "有機商店"]),
    onlineChannels: JSON.stringify([]),
    isOrganic: false,
    isImported: false,
    notes: "低溫長時間殺菌",
  },
  {
    brandName: "Costco Kirkland",
    productName: "Kirkland 有機鮮乳",
    pasteurizationType: "UHT",
    volume: 1892,
    shelfLife: 90,
    price: 189,
    origin: "美國",
    ingredients: "有機生乳",
    officialWebsite: "https://www.costco.com.tw/",
    physicalChannels: JSON.stringify(["好市多"]),
    onlineChannels: JSON.stringify(["好市多線上購"]),
    isOrganic: true,
    isImported: true,
    notes: "美國進口有機牛乳",
  },
  {
    brandName: "味全",
    productName: "味全高品質鮮乳",
    pasteurizationType: "ESL",
    volume: 936,
    shelfLife: 21,
    price: 88,
    origin: "台灣",
    ingredients: "生乳",
    officialWebsite: "https://www.weichuan.com.tw/",
    physicalChannels: JSON.stringify(["全聯", "家樂福", "7-11", "全家"]),
    onlineChannels: JSON.stringify(["全聯線上購", "家樂福線上購"]),
    isOrganic: false,
    isImported: false,
    notes: "ESL 延長保存期限技術",
  },
];

async function seed() {
  console.log("Connecting to database...");
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log("Seeding initial brand data...");
  
  for (const brand of initialBrands) {
    try {
      await connection.execute(
        `INSERT INTO milk_brands (brandName, productName, pasteurizationType, volume, shelfLife, price, origin, ingredients, officialWebsite, physicalChannels, onlineChannels, isOrganic, isImported, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         productName = VALUES(productName),
         pasteurizationType = VALUES(pasteurizationType),
         volume = VALUES(volume),
         shelfLife = VALUES(shelfLife),
         price = VALUES(price)`,
        [
          brand.brandName,
          brand.productName,
          brand.pasteurizationType,
          brand.volume,
          brand.shelfLife,
          brand.price,
          brand.origin,
          brand.ingredients,
          brand.officialWebsite,
          brand.physicalChannels,
          brand.onlineChannels,
          brand.isOrganic,
          brand.isImported,
          brand.notes,
        ]
      );
      console.log(`✓ Added: ${brand.brandName} - ${brand.productName}`);
    } catch (error) {
      console.error(`✗ Failed to add ${brand.brandName}:`, error.message);
    }
  }
  
  await connection.end();
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
