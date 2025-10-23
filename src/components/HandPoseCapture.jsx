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
  poseName = 'open_palm' | 'v_pose' | 'three_fingers' | 'one_finger' | 'no_pose',
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

  // Validasi pose V (peace sign)
const isVPose = (res) => {
  try {
    const hand = res?.multiHandLandmarks?.[0];
    if (!hand) return { ok: false, reason: 'Tangan tidak terdeteksi' };

    // Confidence dari handedness
    const conf = res?.multiHandedness?.[0]?.score ?? 0;
    if (conf < 0.7) return { ok: false, reason: 'Confidence terlalu rendah' };

    // Indeks landmark
    const tipIdx = { index: 8, middle: 12, ring: 16, pinky: 20 };
    const pipIdx = { index: 6, middle: 10, ring: 14, pinky: 18 };
    const mcpIdx = { index: 5, middle: 9, ring: 13, pinky: 17 };

    // Cek jari telunjuk dan tengah terangkat
    const indexExtended = hand[tipIdx.index].y < hand[pipIdx.index].y;
    const middleExtended = hand[tipIdx.middle].y < hand[pipIdx.middle].y;

    // Cek jari manis dan kelingking dilipat
    const ringFolded = hand[tipIdx.ring].y > hand[mcpIdx.ring].y;
    const pinkyFolded = hand[tipIdx.pinky].y > hand[mcpIdx.pinky].y;

    // Validasi jarak antara telunjuk dan tengah (harus terpisah)
    const fingerSpread = Math.abs(hand[tipIdx.index].x - hand[tipIdx.middle].x);
    const spreadOK = fingerSpread >= 0.04; // Threshold bisa disesuaikan

    // Validasi ibu jari (opsional, bisa dilipat atau terbuka)
    // Untuk V pose yang ketat, ibu jari biasanya dilipat
    const thumbTip = hand[4];
    const thumbMCP = hand[2];
    const thumbFolded = Math.abs(thumbTip.x - thumbMCP.x) < 0.08;

    // Cek semua kondisi
    if (indexExtended && middleExtended && ringFolded && pinkyFolded) {
      if (spreadOK) {
        return { ok: true };
      }
      return { ok: false, reason: 'Jari telunjuk dan tengah terlalu rapat' };
    }

    // Berikan feedback spesifik
    if (!indexExtended || !middleExtended) {
      return { ok: false, reason: 'Angkat telunjuk dan jari tengah' };
    }
    if (!ringFolded || !pinkyFolded) {
      return { ok: false, reason: 'Lipat jari manis dan kelingking' };
    }

    return { ok: false, reason: 'Pose V tidak terdeteksi' };
  } catch (_e) {
    return { ok: false, reason: 'Gagal memvalidasi pose' };
  }
};

// Validasi pose 3 jari (telunjuk, tengah, manis terangkat)
const isThreeFingers = (res) => {
  try {
    const hand = res?.multiHandLandmarks?.[0];
    if (!hand) return { ok: false, reason: 'Tangan tidak terdeteksi' };

    // Confidence dari handedness
    const conf = res?.multiHandedness?.[0]?.score ?? 0;
    if (conf < 0.7) return { ok: false, reason: 'Confidence terlalu rendah' };

    // Indeks landmark
    const tipIdx = { index: 8, middle: 12, ring: 16, pinky: 20 };
    const pipIdx = { index: 6, middle: 10, ring: 14, pinky: 18 };
    const mcpIdx = { index: 5, middle: 9, ring: 13, pinky: 17 };

    // Cek telunjuk, tengah, dan manis terangkat
    const indexExtended = hand[tipIdx.index].y < hand[pipIdx.index].y;
    const middleExtended = hand[tipIdx.middle].y < hand[pipIdx.middle].y;
    const ringExtended = hand[tipIdx.ring].y < hand[pipIdx.ring].y;

    // Cek kelingking dilipat
    const pinkyFolded = hand[tipIdx.pinky].y > hand[mcpIdx.pinky].y;

    // Validasi sebaran jari (harus terpisah, tidak mengepal)
    const xs = [hand[tipIdx.index].x, hand[tipIdx.middle].x, hand[tipIdx.ring].x];
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const spread = Math.sqrt(
      xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / xs.length
    );
    const spreadOK = spread >= 0.025; // Threshold untuk memastikan jari terpisah

    // Validasi ibu jari (opsional)
    // Bisa dilipat atau terbuka tergantung kebutuhan
    const thumbTip = hand[4];
    const thumbMCP = hand[2];
    const wristX = hand[0].x;
    
    // Opsi 1: Ibu jari bebas (tidak divalidasi)
    // Opsi 2: Ibu jari harus terbuka
    const thumbOpen = Math.abs(thumbTip.x - wristX) >= 0.07;

    // Cek semua kondisi (tanpa validasi ibu jari)
    if (indexExtended && middleExtended && ringExtended && pinkyFolded) {
      if (spreadOK) {
        return { ok: true };
      }
      return { ok: false, reason: 'Jari terlalu rapat, buka lebih lebar' };
    }

    // Berikan feedback spesifik
    if (!indexExtended || !middleExtended || !ringExtended) {
      return { ok: false, reason: 'Angkat telunjuk, jari tengah, dan jari manis' };
    }
    if (!pinkyFolded) {
      return { ok: false, reason: 'Lipat jari kelingking' };
    }

    return { ok: false, reason: 'Pose 3 jari tidak terdeteksi' };
  } catch (_e) {
    return { ok: false, reason: 'Gagal memvalidasi pose' };
  }
};

// Validasi pose 1 jari (hanya telunjuk terangkat)
const isOneFinger = (res) => {
  try {
    const hand = res?.multiHandLandmarks?.[0];
    if (!hand) return { ok: false, reason: 'Tangan tidak terdeteksi' };

    // Confidence dari handedness
    const conf = res?.multiHandedness?.[0]?.score ?? 0;
    if (conf < 0.7) return { ok: false, reason: 'Confidence terlalu rendah' };

    // Indeks landmark
    const tipIdx = { index: 8, middle: 12, ring: 16, pinky: 20 };
    const pipIdx = { index: 6, middle: 10, ring: 14, pinky: 18 };
    const mcpIdx = { index: 5, middle: 9, ring: 13, pinky: 17 };

    // Cek telunjuk terangkat
    const indexExtended = hand[tipIdx.index].y < hand[pipIdx.index].y;

    // Cek jari tengah, manis, dan kelingking dilipat
    const middleFolded = hand[tipIdx.middle].y > hand[mcpIdx.middle].y;
    const ringFolded = hand[tipIdx.ring].y > hand[mcpIdx.ring].y;
    const pinkyFolded = hand[tipIdx.pinky].y > hand[mcpIdx.pinky].y;

    // Validasi ibu jari dilipat (opsional, tapi lebih strict)
    const thumbTip = hand[4];
    const thumbMCP = hand[2];
    const wristX = hand[0].x;
    
    // Ibu jari dianggap dilipat jika dekat dengan pergelangan
    const thumbFolded = Math.abs(thumbTip.x - wristX) < 0.08;

    // Validasi tambahan: telunjuk harus cukup lurus (tidak bengkok)
    const indexTip = hand[tipIdx.index];
    const indexPIP = hand[pipIdx.index];
    const indexMCP = hand[mcpIdx.index];
    
    // Cek kemiringan vertikal (tip harus jauh lebih tinggi dari MCP)
    const indexStraight = (indexMCP.y - indexTip.y) > 0.1;

    // Cek semua kondisi (tanpa validasi strict ibu jari)
    if (indexExtended && middleFolded && ringFolded && pinkyFolded) {
      if (indexStraight) {
        return { ok: true };
      }
      return { ok: false, reason: 'Luruskan jari telunjuk' };
    }

    // Berikan feedback spesifik
    if (!indexExtended) {
      return { ok: false, reason: 'Angkat jari telunjuk' };
    }
    if (!middleFolded || !ringFolded || !pinkyFolded) {
      return { ok: false, reason: 'Lipat jari tengah, manis, dan kelingking' };
    }

    return { ok: false, reason: 'Pose 1 jari tidak terdeteksi' };
  } catch (_e) {
    return { ok: false, reason: 'Gagal memvalidasi pose' };
  }
};

const isNoPose = (res) => {
  return { ok: true };
};

  // Fungsi untuk mendapatkan deskripsi pose berdasarkan poseName
  const getPoseDescription = () => {
    switch (poseName) {
      case 'open_palm':
        return 'Buka telapak tangan dengan semua jari terbuka dan renggang';
      case 'v_pose':
        return 'Bentuk pose V: angkat telunjuk dan jari tengah, lipat jari lainnya';
      case 'three_fingers':
        return 'Bentuk pose 3 jari: angkat telunjuk, tengah, dan manis, lipat kelingking';
      case 'one_finger':
        return 'Bentuk pose 1 jari: angkat hanya jari telunjuk, lipat jari lainnya';
      case 'no_pose':
        return 'Tidak ada persyaratan pose khusus';
      default:
        return 'Arahkan telapak tangan ke kamera';
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
    let cam = null;
    let hands = null;
  
    const init = async () => {
      try {
        setStatus('Meminta akses kamera...');
        
        // 1. Setup hands
        hands = new Hands({
          locateFile: (file) => 
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });
        
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        
        hands.onResults((result) => {
          if (disposed) return; // ✅ Early exit
          lastResultRef.current = result;
          
          // ✅ Check canvas existence
          if (overlayRef.current && showOverlay) {
            drawOverlay(result);
          }
        });
        
        if (disposed) return;
        handsRef.current = hands;
        
        // 2. Setup canvas
        if (overlayRef.current) {
          overlayRef.current.width = width;
          overlayRef.current.height = height;
        }
        if (captureCanvasRef.current) {
          captureCanvasRef.current.width = width;
          captureCanvasRef.current.height = height;
        }
        
        // 3. Setup camera dengan disposed check
        if (!videoRef.current) throw new Error('Video element not found');
        
        cam = new Camera(videoRef.current, {
          onFrame: async () => {
            if (disposed || !handsRef.current || !videoRef.current) return; // ✅
            
            try {
              await handsRef.current.send({ image: videoRef.current });
            } catch (e) {
              // Log untuk debugging
              if (!disposed) console.warn('MediaPipe send error:', e);
            }
          },
          width,
          height,
        });
        
        cameraRef.current = cam;
        await cam.start();
        
        if (disposed) {
          // ✅ Cleanup jika disposed saat async operation
          cam.stop();
          return;
        }
        
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
      
      // Cleanup dengan urutan yang benar
      if (cam) {
        try {
          cam.stop();
        } catch (e) {
          console.warn('Camera stop error:', e);
        }
      }
      
      if (hands) {
        try {
          hands.close?.(); // MediaPipe 0.4+ punya close()
        } catch (e) {
          console.warn('Hands close error:', e);
        }
      }
      
      cameraRef.current = null;
      handsRef.current = null;
    };
  }, [width, height]); // ⚠️ Hapus onInvalid & showOverlay dari deps
  
  // useEffect(() => {
  //   let disposed = false;

  //   const init = async () => {
  //     try {
  //       setStatus('Meminta akses kamera...');

  //       // Inisialisasi Hands
  //       const hands = new Hands({
  //         locateFile: (file) => {
  //           const basePath =
  //             'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/';
  //           return `${basePath}${file}`;
  //         },
  //       });
  //       hands.setOptions({
  //         maxNumHands: 1,
  //         modelComplexity: 1,
  //         minDetectionConfidence: 0.5,
  //         minTrackingConfidence: 0.5,
  //       });

  //       hands.onResults((result) => {
  //         if (disposed) return;
  //         lastResultRef.current = result;
  //         drawOverlay(result);
  //       });

  //       handsRef.current = hands;

  //       // Siapkan canvas ukuran sesuai
  //       if (overlayRef.current) {
  //         overlayRef.current.width = width;
  //         overlayRef.current.height = height;
  //       }
  //       if (captureCanvasRef.current) {
  //         captureCanvasRef.current.width = width;
  //         captureCanvasRef.current.height = height;
  //       }

  //       // Inisialisasi Camera stream
  //       const cam = new Camera(videoRef.current, {
  //         onFrame: async () => {
  //           if (!handsRef.current) return;
  //           try {
  //             await handsRef.current.send({ image: videoRef.current });
  //           } catch (_e) {
  //             // noop; MediaPipe kadang melempar saat switching state
  //           }
  //         },
  //         width,
  //         height,
  //       });

  //       cameraRef.current = cam;
  //       await cam.start();
  //       if (disposed) return;
  //       setRunning(true);
  //       setReady(true);
  //       setStatus('Arahkan telapak tangan ke kamera');
  //     } catch (e) {
  //       if (disposed) return;
  //       setError(e?.message || 'Gagal mengakses kamera');
  //       setStatus('Gagal mengakses kamera');
  //       onInvalid?.('Izin kamera ditolak atau tidak tersedia');
  //     }
  //   };

  //   init();

  //   return () => {
  //     disposed = true;
  //     try {
  //       if (cameraRef.current) {
  //         cameraRef.current.stop();
  //         cameraRef.current = null;
  //       }
  //     } catch {}
  //     try {
  //       if (handsRef.current) {
  //         // MediaPipe Hands tidak punya destroy resmi; lepaskan referensi saja
  //         handsRef.current = null;
  //       }
  //     } catch {}
  //   };
  // }, [width, height, onInvalid, showOverlay]);

  const handleCapture = async () => {
    if (!ready || !videoRef.current) return;
    const res = lastResultRef.current;
    const val = isOpenPalm(res);
    const valPoseV = isVPose(res);
    const valThreeFingers = isThreeFingers(res);
    const valOneFinger = isOneFinger(res);
    const valNoPose = isNoPose(res);

    console.log('valPoseV =>', valPoseV);
    console.log('val =>', val);
    console.log('valThreeFingers =>', valThreeFingers);
    console.log('valOneFinger =>', valOneFinger);
    console.log('valNoPose =>', valNoPose);

    if (poseName === 'open_palm') {
      if (!val.ok) {
        const reason = val.reason || 'Pose tidak valid';
        setStatus(reason);
        onInvalid?.(reason);
        return;
      }
    }
    if (poseName === 'v_pose') {
      if (!valPoseV.ok) {
        const reason = valPoseV.reason || 'Pose tidak valid';
        setStatus(reason);
        onInvalid?.(reason);
        return;
      }
    }
    if (poseName === 'three_fingers') { 
      if (!valThreeFingers.ok) {
        const reason = valThreeFingers.reason || 'Pose tidak valid';
        setStatus(reason);
        onInvalid?.(reason);
        return;
      }
    }
    if (poseName === 'one_finger') {
      if (!valOneFinger.ok) {
        const reason = valOneFinger.reason || 'Pose tidak valid';
        setStatus(reason);
        onInvalid?.(reason);
        return;
      }
    }

    if (poseName === 'no_pose') {
      if (!valNoPose.ok) {
        const reason = isNoPose.reason || 'Pose tidak valid';
        setStatus(reason);
        onInvalid?.(reason);
        return;
      }
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
        {/* Info pose di atas video */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 14,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {getPoseDescription()}
        </div>
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
