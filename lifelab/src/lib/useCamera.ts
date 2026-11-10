import { useEffect, useRef, useState, type RefObject } from 'react';
import type { HandLandmarker } from '@mediapipe/tasks-vision';
import { HandsController, type HandSample } from './hands';
import type { SceneAPI } from '../components/BalanceScene';
import type { Cursor, ObjectId } from './types';
interface Props {
  enabled: boolean;
  sceneRef: RefObject<SceneAPI | null>;
  onError: (message: string) => void;
}
export function useCamera({ enabled, sceneRef, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null),
    errorRef = useRef(onError);
  errorRef.current = onError;
  const [status, setStatus] = useState<'off' | 'loading' | 'ready'>('off'),
    [cursors, setCursors] = useState<Cursor[]>([]);
  useEffect(() => {
    if (!enabled) {
      setStatus('off');
      setCursors([]);
      return;
    }
    let cancelled = false,
      model: HandLandmarker | undefined,
      stream: MediaStream | undefined,
      frame = 0,
      last = 0;
    const controller = new HandsController({
      hit: (x, y) => sceneRef.current?.hit(x, y) ?? null,
      grab: (id) => sceneRef.current?.grab(id),
      move: (id, x, y) => sceneRef.current?.move(id, x, y),
      drop: (id, x, y) => sceneRef.current?.drop(id, x, y, 'gesture'),
      cancel: (id: ObjectId) => sceneRef.current?.cancel(id),
    });
    setStatus('loading');
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw new Error('Camera cần localhost hoặc kết nối HTTPS.');
        // Permission is requested only after the learner presses the camera button.
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) throw new Error('Không mở được khung camera.');
        video.srcObject = stream;
        await video.play();
        const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const files = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
        model = await HandLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: '/mediapipe/hand_landmarker.task', delegate: 'CPU' },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
        if (cancelled) {
          model.close();
          return;
        }
        setStatus('ready');
        function tick(now: number) {
          if (cancelled || !model) return;
          if (now - last >= 85 && video!.readyState >= 2) {
            last = now;
            try {
              const result = model.detectForVideo(video!, now);
              const samples: HandSample[] = result.landmarks.map((hand) => {
                const distance = (a: number, b: number) =>
                  Math.hypot(
                    (hand[a].x - hand[b].x) * video!.videoWidth,
                    (hand[a].y - hand[b].y) * video!.videoHeight,
                  );
                return {
                  x: 0.04 + 0.92 * (1 - hand[8].x),
                  y: 0.02 + 0.91 * hand[8].y,
                  pinch: distance(4, 8) / Math.max(distance(5, 17), 1),
                };
              });
              setCursors(controller.feed(samples, now));
            } catch {
              errorRef.current(
                'Nhận diện tay bị gián đoạn. Hãy tắt camera và bật lại, hoặc dùng chuột.',
              );
              return;
            }
          }
          frame = requestAnimationFrame(tick);
        }
        frame = requestAnimationFrame(tick);
      } catch (e) {
        if (!cancelled) {
          const reasons: Record<string, string> = {
            NotAllowedError: 'Chưa được cấp quyền camera. Em vẫn dùng chuột hoặc bàn phím được.',
            NotFoundError: 'Không tìm thấy camera. Em có thể tiếp tục bằng chuột hoặc thanh trượt.',
            NotReadableError:
              'Camera đang bận hoặc không đọc được. Hãy đóng ứng dụng dùng camera khác rồi thử lại.',
          };
          errorRef.current(
            e instanceof DOMException && reasons[e.name]
              ? reasons[e.name]
              : e instanceof Error
                ? e.message
                : 'Không thể khởi động camera.',
          );
        }
      }
    }
    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      controller.reset();
      stream?.getTracks().forEach((t) => t.stop());
      model?.close();
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [enabled, sceneRef]);
  return { videoRef, status, cursors };
}
