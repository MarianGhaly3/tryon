/** تنعيم أُسّي (EMA): alpha أصغر = أنعم لكن أبطأ في اللحاق بالحركة */
export class Ema {
  private v: number | null = null;
  constructor(private alpha = 0.5) {}
  next(x: number): number {
    this.v = this.v === null ? x : this.alpha * x + (1 - this.alpha) * this.v;
    return this.v;
  }
  reset() {
    this.v = null;
  }
}

/** مجموعة EMA بأسماء، عشان كل رسمة تنعّم أكتر من قيمة (x, y, الحجم, الزاوية...) */
export class SmoothBag<K extends string> {
  private map = new Map<K, Ema>();
  constructor(alphas: Record<K, number>) {
    for (const k of Object.keys(alphas) as K[]) this.map.set(k, new Ema(alphas[k]));
  }
  next(key: K, value: number): number {
    return this.map.get(key)!.next(value);
  }
  reset() {
    this.map.forEach((e) => e.reset());
  }
}
