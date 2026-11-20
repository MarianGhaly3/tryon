import 'dotenv/config';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { classifyProduct } from './classify.js';

type Category = 'glasses' | 'earrings' | 'necklace';
type Product = {
  id: string;
  name: string;
  category: Category;
  image: string;
  scale: number;
  offsetY: number;
};

// نفس القيم الافتراضية في client/src/data/categories.ts
const DEFAULTS: Record<Category, { scale: number; offsetY: number }> = {
  glasses: { scale: 1.6, offsetY: 0 },
  earrings: { scale: 0.12, offsetY: 0.12 },
  necklace: { scale: 0.85, offsetY: 0.3 },
};

const EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

class BadRequest extends Error {}

const PORT = Number(process.env.PORT ?? 4000);
const ORIGINS = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const UPLOAD_DIR = path.resolve('uploads');
const DATA_DIR = path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });

// ===== تخزين بسيط في ملف JSON (كفاية للتجربة. للإنتاج استخدم قاعدة بيانات) =====
function readDb(): Product[] {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Product[];
  } catch {
    return [];
  }
}

function writeDb(items: Product[]) {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(items, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

const removeFile = (p: string) => fs.unlink(p, () => {});

// ===== رفع الصور =====
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    // الامتداد بيتحدد من نوع الملف المسموح، مش من اسم الملف اللي بعته المستخدم
    filename: (_req, file, cb) => cb(null, randomUUID() + EXT[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype in EXT) cb(null, true);
    else cb(new BadRequest('نوع الملف غير مدعوم. استخدم PNG أو JPG أو WebP'));
  },
});

const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: ORIGINS }));
app.use(express.json({ limit: '10kb' }));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', immutable: true }));

const apiLimiter = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false });
// التصنيف بيستهلك من حد الـ AI المجاني، فله حد أقل
const classifyLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'طلبات كتير. استنى دقيقة وجرّب تاني' },
});
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: Boolean(process.env.GEMINI_API_KEY) });
});

app.get('/api/products', (_req, res) => {
  res.json(readDb());
});

// تصنيف صورة من غير حفظها
app.post('/api/classify', classifyLimiter, upload.single('image'), async (req, res, next) => {
  const file = req.file;
  try {
    if (!file) throw new BadRequest('صورة PNG أو JPG أو WebP مطلوبة (حد أقصى 5MB)');
    res.json(await classifyProduct(file.path, file.mimetype));
  } catch (e) {
    next(e);
  } finally {
    if (file) removeFile(file.path);
  }
});

// إضافة منتج
const Body = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.enum(['glasses', 'earrings', 'necklace']),
});

app.post('/api/products', upload.single('image'), (req, res, next) => {
  const file = req.file;
  try {
    const body = Body.safeParse(req.body);
    if (!body.success || !file) {
      if (file) removeFile(file.path);
      throw new BadRequest('بيانات غير صالحة: الاسم والنوع والصورة مطلوبين');
    }
    const product: Product = {
      id: randomUUID(),
      name: body.data.name,
      category: body.data.category,
      image: `/uploads/${file.filename}`,
      ...DEFAULTS[body.data.category],
    };
    writeDb([...readDb(), product]);
    res.status(201).json(product);
  } catch (e) {
    next(e);
  }
});

// معالج الأخطاء: أخطاء المستخدم (حجم/نوع الصورة...) = 400، وأي حاجة تانية = 500 من غير تسريب تفاصيل
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'الصورة أكبر من 5MB' : 'تعذر رفع الملف';
    res.status(400).json({ error: message });
    return;
  }
  if (err instanceof BadRequest) {
    res.status(400).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'خطأ في السيرفر' });
});

app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}  (AI ${process.env.GEMINI_API_KEY ? 'enabled' : 'disabled'})`);
});
