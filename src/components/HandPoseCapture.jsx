import { Button, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
// MediaPipe dependencies
import { Hands } from '@mediapipe/hands';

const { Text } = Typography;

/**
 * Komponen kamera dengan validasi telapak tangan terbuka (open palm) menggunakan MediaPipe Hands
 * Props:
 * - width, height: ukuran video/canvas
 * - mirrored: boolean, mirror preview untuk front camera
 * - showOverlay: boolean, gambar landmarks di overlay
 * - captureLabel: label tombol capture
 * - onValid({ dataUrl, file }): callback saat pose valid dan foto berhasil diambil
 * - onInvalid(message): callback saat pose tidak valid / error
 */
const HandPoseCapture = ({
  width = 640,
  height = 480,
  mirrored = true,
  showOverlay = true,
  captureLabel = 'Capture',
  onValid,
  onInvalid,
  onRetake,
}) => {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const captureCanvasRef = useRef(null);

  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const lastResultRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('Menginisialisasi kamera...');
  const [error, setError] = useState(null);

  // Util konversi dataURL ke File
  const dataUrlToFile = async (dataUrl, filename = 'hand.jpg') => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  };

  // Validasi telapak tangan terbuka
  const isOpenPalm = (res) => {
    try {
      const hand = res?.multiHandLandmarks?.[0];
      if (!hand) return { ok: false, reason: 'Tangan tidak terdeteksi' };

      // Confidence dari handedness
      const conf = res?.multiHandedness?.[0]?.score ?? 0;
      if (conf < 0.7) return { ok: false, reason: 'Confidence terlalu rendah' };

      const tipIdx = { index: 8, middle: 12, ring: 16, pinky: 20 };
      const pipIdx = { index: 6, middle: 10, ring: 14, pinky: 18 };
      const extendedFlags = [
        hand[tipIdx.index].y < hand[pipIdx.index].y,
        hand[tipIdx.middle].y < hand[pipIdx.middle].y,
        hand[tipIdx.ring].y < hand[pipIdx.ring].y,
        hand[tipIdx.pinky].y < hand[pipIdx.pinky].y,
      ];

      // Ibu jari: cek jarak sumbu X dari pergelangan tangan
      const wristX = hand[0].x;
      const thumbOpen = Math.abs(hand[4].x - wristX) >= 0.07;

      const fourOpen = extendedFlags.filter(Boolean).length >= 4;

      // Sebaran jari (antisqueeze)
      const xs = [hand[8].x, hand[12].x, hand[16].x, hand[20].x];
      const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
      const spread = Math.sqrt(
        xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / xs.length,
      );
      const spreadOK = spread >= 0.03;

      if (fourOpen && (thumbOpen || spreadOK)) return { ok: true };
      return { ok: false, reason: 'Jari tidak terbuka' };
    } catch (_e) {
      return { ok: false, reason: 'Gagal memvalidasi pose' };
    }
  };

  // Gambar overlay landmarks
  const drawOverlay = (res) => {
    if (!showOverlay) return;
    const ctx = overlayRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);

    if (!res?.multiHandLandmarks) return;
    for (const landmarks of res.multiHandLandmarks) {
      drawConnectors(ctx, landmarks, Hands.HAND_CONNECTIONS, {
        color: 'rgba(0,255,136,0.6)',
        lineWidth: 2,
      });
      drawLandmarks(ctx, landmarks, {
        color: 'rgba(255,0,110,0.8)',
        lineWidth: 1,
      });
    }
  };

  useEffect(() => {
    let disposed = false;

    const init = async () => {
      try {
        setStatus('Meminta akses kamera...');

        // Inisialisasi Hands
        const hands = new Hands({
          locateFile: (file) => {
            const basePath =
              'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/';
            return `${basePath}${file}`;
          },
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((result) => {
          if (disposed) return;
          lastResultRef.current = result;
          drawOverlay(result);
        });

        handsRef.current = hands;

        // Siapkan canvas ukuran sesuai
        if (overlayRef.current) {
          overlayRef.current.width = width;
          overlayRef.current.height = height;
        }
        if (captureCanvasRef.current) {
          captureCanvasRef.current.width = width;
          captureCanvasRef.current.height = height;
        }

        // Inisialisasi Camera stream
        const cam = new Camera(videoRef.current, {
          onFrame: async () => {
            if (!handsRef.current) return;
            try {
              await handsRef.current.send({ image: videoRef.current });
            } catch (_e) {
              // noop; MediaPipe kadang melempar saat switching state
            }
          },
          width,
          height,
        });

        cameraRef.current = cam;
        await cam.start();
        if (disposed) return;
        setRunning(true);
        setReady(true);
        setStatus('Arahkan telapak tangan ke kamera');
      } catch (e) {
        if (disposed) return;
        setError(e?.message || 'Gagal mengakses kamera');
        setStatus('Gagal mengakses kamera');
        onInvalid?.('Izin kamera ditolak atau tidak tersedia');
      }
    };

    init();

    return () => {
      disposed = true;
      try {
        if (cameraRef.current) {
          cameraRef.current.stop();
          cameraRef.current = null;
        }
      } catch {}
      try {
        if (handsRef.current) {
          // MediaPipe Hands tidak punya destroy resmi; lepaskan referensi saja
          handsRef.current = null;
        }
      } catch {}
    };
  }, [width, height, onInvalid, showOverlay]);

  const handleCapture = async () => {
    if (!ready || !videoRef.current) return;
    const res = lastResultRef.current;
    const val = isOpenPalm(res);
    if (!val.ok) {
      const reason = val.reason || 'Pose tidak valid';
      setStatus(reason);
      onInvalid?.(reason);
      return;
    }

    // Render frame ke canvas non-mirror (video element tidak mempengaruhi drawImage)
    const canvas = captureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const file = await dataUrlToFile(dataUrl);
    setStatus('Pose valid, foto diambil');
    onValid?.({ dataUrl, file });
  };

  const handleRetake = () => {
    setError(null);
    setStatus('Arahkan telapak tangan ke kamera');
    if (typeof onRetake === 'function') onRetake();
  };

  return (
    <div style={{ width, maxWidth: '100%' }}>
      <div
        style={{
          position: 'relative',
          width,
          height,
          marginBottom: 12,
          background: '#000',
          overflow: 'hidden',
          borderRadius: 8,
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: mirrored ? 'scaleX(-1)' : 'none',
          }}
        />
        <canvas
          ref={overlayRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            transform: mirrored ? 'scaleX(-1)' : 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button type="primary" onClick={handleCapture} disabled={!running}>
          {captureLabel}
        </Button>
        <Button onClick={handleRetake} disabled={!running}>
          Ulangi
        </Button>
        <Text type={error ? 'danger' : 'secondary'}>{status}</Text>
      </div>

      {/* Canvas untuk capture (disembunyikan) */}
      <canvas ref={captureCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default HandPoseCapture;
