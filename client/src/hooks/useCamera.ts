import { useCallback, useEffect, useRef, useState } from 'react';

export type Facing = 'user' | 'environment';

/** Messages of the ÉCLAT design for the camera errors. */
function explain(e: unknown): string {
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'Camera access requires HTTPS or localhost. Open the site over a secure address.';
  }
  const name = e instanceof DOMException ? e.name : '';
  const messages: Record<string, string> = {
    NotAllowedError: 'Camera permission was declined. You can still explore the styled preview.',
    NotFoundError: 'No camera was found. You can still use the styled preview.',
    NotReadableError: 'Your camera is in use by another app.',
  };
  return messages[name] ?? 'Could not start the camera. Please try again.';
}

/** Opens and closes the camera. The <video> element itself belongs to the page. */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pendingRef = useRef(false);
  const aliveRef = useRef(true);
  const facingRef = useRef<Facing>('user');
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(false);
  }, []);

  const start = useCallback(
    async (facing: Facing = facingRef.current) => {
      if (pendingRef.current) return;
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(explain(null));
        return;
      }
      pendingRef.current = true;
      setError(null);
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        const video = videoRef.current;
        if (!aliveRef.current || !video) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        facingRef.current = facing;
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
        setLive(true);
      } catch (e) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setLive(false);
        setError(explain(e));
      } finally {
        pendingRef.current = false;
      }
    },
    [],
  );

  /** Front camera <-> back camera, like the design's switch button. */
  const flip = useCallback(() => start(facingRef.current === 'user' ? 'environment' : 'user'), [start]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      stop();
    };
  }, [stop]);

  return { videoRef, streamRef, live, error, start, stop, flip };
}
