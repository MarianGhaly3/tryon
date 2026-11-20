import { useEffect, useRef, useState, type RefObject } from 'react';
import { getFaceLandmarker } from '../lib/faceLandmarker';
import { renderFrame, type FrameState } from '../lib/renderFrame';

export type Tracking = 'off' | 'loading' | 'ready' | 'failed';

/**
 * While the camera is live: finds the face in every new video frame and draws the worn pieces on the two canvases.
 * `frame` is read on every frame, so the sliders of the studio take effect at once without restarting anything.
 */
export function useFaceTracking(
  live: boolean,
  videoRef: RefObject<HTMLVideoElement | null>,
  accRef: RefObject<HTMLCanvasElement | null>,
  makeupRef: RefObject<HTMLCanvasElement | null>,
  frame: FrameState,
) {
  const frameRef = useRef(frame);
  frameRef.current = frame;
  const [status, setStatus] = useState<Tracking>('off');
  const [face, setFace] = useState(false);

  useEffect(() => {
    const acc = accRef.current?.getContext('2d');
    const makeup = makeupRef.current?.getContext('2d');
    const video = videoRef.current;
    if (!live || !acc || !makeup || !video) {
      setStatus('off');
      setFace(false);
      return;
    }

    let stopped = false;
    let raf = 0;
    let lastTime = -1;
    let missing = 0;
    let seen = false;
    setStatus('loading');

    getFaceLandmarker()
      .then((landmarker) => {
        if (stopped) return;
        setStatus('ready');
        const tick = () => {
          if (stopped) return;
          raf = requestAnimationFrame(tick);
          const w = video.videoWidth;
          const h = video.videoHeight;
          if (video.readyState < 2 || !w || !h || video.currentTime === lastTime) return;
          lastTime = video.currentTime;
          for (const c of [accRef.current, makeupRef.current]) {
            if (c && (c.width !== w || c.height !== h)) {
              c.width = w;
              c.height = h;
            }
          }
          let lm;
          try {
            lm = landmarker.detectForVideo(video, performance.now()).faceLandmarks[0];
          } catch {
            lm = undefined;
          }
          renderFrame(acc, makeup, lm, w, h, frameRef.current);
          // A face that is lost for half a second switches the page back to its manual placement
          if (lm) {
            missing = 0;
            if (!seen) {
              seen = true;
              setFace(true);
            }
          } else if (seen && ++missing > 15) {
            seen = false;
            setFace(false);
          }
        };
        raf = requestAnimationFrame(tick);
      })
      .catch((e) => {
        console.warn('Face tracking could not start', e);
        if (!stopped) setStatus('failed');
      });

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      acc.clearRect(0, 0, acc.canvas.width, acc.canvas.height);
      makeup.clearRect(0, 0, makeup.canvas.width, makeup.canvas.height);
    };
  }, [live, videoRef, accRef, makeupRef]);

  return { status, face };
}
