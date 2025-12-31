import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '.manus/db/sqlite.db'));

console.log('=== 查詢待審核的投稿 ===\n');

const submissions = db.prepare(`
  SELECT * FROM submissions WHERE status = 'pending'
`).all();

console.log(`找到 ${submissions.length} 筆待審核的投稿\n`);

if (submissions.length > 0) {
  submissions.forEach((sub, index) => {
    console.log(`--- 投稿 ${index + 1} ---`);
    console.log(JSON.stringify(sub, null, 2));
    console.log('');
  });
} else {
  console.log('目前沒有待審核的投稿');
}

db.close();
