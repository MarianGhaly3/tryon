import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// الملفات دي بيجهزها scripts/setup-assets.mjs في public/wasm و public/models
const BASE = import.meta.env.BASE_URL;

let pending: Promise<FaceLandmarker> | null = null;

async function create(delegate: 'GPU' | 'CPU'): Promise<FaceLandmarker> {
  const fileset = await FilesetResolver.forVisionTasks(`${BASE}wasm`);
  return FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: `${BASE}models/face_landmarker.task`, delegate },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });
}

/** بيحمّل الموديل مرة واحدة ويرجّع نفس النسخة. لو الـ GPU فشل بيجرّب الـ CPU. */
export function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (!pending) {
    pending = create('GPU')
      .catch((e) => {
        console.warn('GPU delegate failed, falling back to CPU', e);
        return create('CPU');
      })
      .catch((e) => {
        pending = null; // اسمح بمحاولة تانية
        throw e;
      });
  }
  return pending;
}

/** ابدأ التحميل بدري (أول ما الصفحة تفتح) عشان الضغط على Try it on يبقى سريع */
export function preloadFaceLandmarker(): void {
  getFaceLandmarker().catch(() => {
    /* الخطأ هيظهر للمستخدم لما يضغط Try it on */
  });
}
