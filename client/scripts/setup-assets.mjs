// بيجهّز ملفات MediaPipe اللازمة للتشغيل (بيشتغل تلقائياً قبل dev و build):
//  1) بينسخ ملفات wasm من node_modules إلى public/wasm
//  2) بيحمّل موديل face_landmarker.task إلى public/models لو مش موجود
import { access, copyFile, mkdir, readdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wasmSrc = path.join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
const wasmDst = path.join(root, 'public', 'wasm');
const modelDst = path.join(root, 'public', 'models', 'face_landmarker.task');
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const exists = (p) => access(p).then(() => true, () => false);

async function copyWasm() {
  if (!(await exists(wasmSrc))) {
    throw new Error(
      'مش لاقي node_modules/@mediapipe/tasks-vision. شغّل `npm install` جوه مجلد client الأول.',
    );
  }
  await mkdir(wasmDst, { recursive: true });
  const files = await readdir(wasmSrc);
  for (const f of files) {
    await copyFile(path.join(wasmSrc, f), path.join(wasmDst, f));
  }
  console.log(`[setup-assets] تم نسخ ${files.length} ملف wasm`);
}

async function downloadModel() {
  if (await exists(modelDst)) {
    console.log('[setup-assets] الموديل موجود بالفعل');
    return;
  }
  await mkdir(path.dirname(modelDst), { recursive: true });
  console.log('[setup-assets] جاري تحميل موديل الوجه (حوالي 4MB)...');
  const res = await fetch(MODEL_URL);
  if (!res.ok) throw new Error(`فشل التحميل: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const tmp = modelDst + '.tmp';
  await writeFile(tmp, buf);
  await rename(tmp, modelDst);
  console.log(`[setup-assets] تم حفظ الموديل (${(buf.length / 1024 / 1024).toFixed(1)}MB)`);
}

try {
  await copyWasm();
  await downloadModel();
} catch (e) {
  console.error('\n[setup-assets] خطأ:', e instanceof Error ? e.message : e);
  console.error(
    '\nلو التحميل التلقائي فشل، نزّل الموديل بإيدك وحطه في client/public/models/face_landmarker.task :\n' +
      `  curl -L -o public/models/face_landmarker.task ${MODEL_URL}\n`,
  );
  process.exit(1);
}
