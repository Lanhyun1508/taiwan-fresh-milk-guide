import { drizzle } from 'drizzle-orm/mysql2';
import { milkBrands } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

const missingBrands = [
  {
    brandName: '台農',
    productName: '台農純鮮乳',
    pasteurizationType: 'UHT',
    volume: 936,
    shelfLife: 14,
    price: 65,
    origin: '台灣',
    physicalChannels: ['全聯', '家樂福', '大潤發'],
    onlineChannels: [],
    isOrganic: false,
    isImported: false,
  },
  {
    brandName: '北海道別海',
    productName: '北海道別海的美味牛乳',
    pasteurizationType: 'ESL',
    volume: 946,
    shelfLife: 60,
    price: 95,
    origin: '日本北海道',
    physicalChannels: ['全聯', '家樂福'],
    onlineChannels: [],
    isOrganic: false,
    isImported: true,
  },
  {
    brandName: '福樂',
    productName: '福樂美國進口全脂牛乳',
    pasteurizationType: 'ESL',
    volume: 946,
    shelfLife: 90,
    price: 89,
    origin: '美國',
    physicalChannels: ['全聯', '家樂福', '好市多'],
    onlineChannels: [],
    isOrganic: false,
    isImported: true,
  },
];

async function addMissingBrands() {
  try {
    console.log('開始新增缺少的品牌...');
    
    for (const brand of missingBrands) {
      await db.insert(milkBrands).values(brand);
      console.log(`✓ 已新增: ${brand.brandName} - ${brand.productName}`);
    }
    
    console.log('\n所有品牌新增完成！');
    process.exit(0);
  } catch (error) {
    console.error('新增品牌時發生錯誤:', error);
    process.exit(1);
  }
}

addMissingBrands();
