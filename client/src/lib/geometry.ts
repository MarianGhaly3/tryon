import type { Landmark } from '../types';

/** أرقام النقاط في خريطة MediaPipe Face Mesh (الاسم هو الفهرس) */
export const LM = {
  rightEyeOuter: 33, // طرف عين الشخص اليمنى (بتظهر على يسار الصورة)
  leftEyeOuter: 263,
  chin: 152,
  foreheadTop: 10,
  faceRight: 234, // حافة الوش عند الودن
  faceLeft: 454,
  noseTip: 1,
} as const;

/** Face oval, in order. Used to hide things that pass behind the jaw. */
export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150,
  136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

export type Pt = { x: number; y: number };

export const toPx = (p: Landmark, w: number, h: number): Pt => ({ x: p.x * w, y: p.y * h });
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const angle = (a: Pt, b: Pt) => Math.atan2(b.y - a.y, b.x - a.x);

export type FaceMetrics = {
  right: Pt;
  left: Pt;
  top: Pt;
  chin: Pt;
  nose: Pt;
  faceW: number;
  faceH: number;
  /** ميل الراس (راديان) */
  roll: number;
  /** 0.5 = مواجه الكاميرا. أقل = لافف ناحية يسار الصورة، أكتر = ناحية يمينها */
  noseRatio: number;
};

/** قياسات الوش اللي بتتحسب منها أحجام وأماكن الحلق والعقد */
export function faceMetrics(lm: Landmark[], w: number, h: number): FaceMetrics {
  const right = toPx(lm[LM.faceRight], w, h);
  const left = toPx(lm[LM.faceLeft], w, h);
  const top = toPx(lm[LM.foreheadTop], w, h);
  const chin = toPx(lm[LM.chin], w, h);
  const nose = toPx(lm[LM.noseTip], w, h);
  const faceW = dist(right, left);
  const span = left.x - right.x;
  return {
    right,
    left,
    top,
    chin,
    nose,
    faceW,
    faceH: dist(top, chin),
    roll: angle(right, left),
    noseRatio: Math.abs(span) < 1e-6 ? 0.5 : (nose.x - right.x) / span,
  };
}
