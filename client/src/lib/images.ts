const cache = new Map<string, Promise<HTMLImageElement>>();

/** بيحمّل الصورة مرة واحدة ويحتفظ بها. crossOrigin ضروري عشان لقطة الشاشة (canvas) ما تتعطلش. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  let p = cache.get(src);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        cache.delete(src); // اسمح بمحاولة تانية
        reject(new Error(`تعذر تحميل الصورة: ${src}`));
      };
      img.src = src;
    });
    cache.set(src, p);
  }
  return p;
}
