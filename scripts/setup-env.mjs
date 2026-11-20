// بينسخ ملفات .env.example إلى .env لو مش موجودة (بيشتغل ضمن npm run setup)
import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const dir of ['client', 'server']) {
  const from = path.join(root, dir, '.env.example');
  const to = path.join(root, dir, '.env');
  if (existsSync(to)) {
    console.log(`[setup-env] ${dir}/.env موجود (ما اتغيّرش)`);
  } else if (existsSync(from)) {
    copyFileSync(from, to);
    console.log(`[setup-env] اتعمل ${dir}/.env`);
  }
}
console.log('[setup-env] لو عايز تصنيف المنتجات بالـ AI: حط GEMINI_API_KEY في server/.env');
