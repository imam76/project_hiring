import { Button, Typography } from 'antd';
import { useEffect, useRef, useState, useCallback } from 'react';

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
 * - autoCaptureDelay: number, delay (ms) sebelum capture otomatis setelah pose valid
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
  autoCaptureDelay = 1500, // ✅ Tambahkan prop untuk delay auto-capture (1.5 detik)
}) => {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const captureCanvasRef = useRef(null);

  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const lastResultRef = useRef(null);

  // ✅ Ref untuk menampung ID timer auto-capture
  const autoCaptureTimerRef = useRef(null); 
  // ✅ State untuk melacak apakah sudah tercapture (mencegah double capture)
  const [captured, setCaptured] = useState(false); 
  // State yang sudah ada
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

    // Cek semua kondisi
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

    // Validasi tambahan: telunjuk harus cukup lurus (tidak bengkok)
    const indexTip = hand[tipIdx.index];
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

  /**
   * ✅ Fungsi capture dipisahkan agar bisa dipanggil dari handleCapture (manual) dan onResults (otomatis)
   * Menggunakan useCallback agar stabil dan tidak memicu useEffect atau warning
   */
  const performCapture = useCallback(async (res) => {
    if (!videoRef.current || !res || captured) return;

    // Mengambil validasi yang sesuai
    let validationResult;
    switch (poseName) {
        case 'open_palm':
            validationResult = isOpenPalm(res);
            break;
        case 'v_pose':
            validationResult = isVPose(res);
            break;
        case 'three_fingers':
            validationResult = isThreeFingers(res);
            break;
        case 'one_finger':
            validationResult = isOneFinger(res);
            break;
        case 'no_pose':
        default:
            validationResult = isNoPose(res);
            break;
    }
    
    if (!validationResult.ok) {
        // Jika tidak valid saat auto-capture, tidak perlu melakukan apa-apa (pose sudah tervalidasi di onResults)
        return; 
    }

    setCaptured(true); // Set captured agar tidak double-capture
    // Clear timer jika ada, untuk jaga-jaga
    if (autoCaptureTimerRef.current) {
        clearTimeout(autoCaptureTimerRef.current);
        autoCaptureTimerRef.current = null;
    }

    // Render frame ke canvas non-mirror (video element tidak mempengaruhi drawImage)
    const canvas = captureCanvasRef.current;
    if (!canvas) return; // Guard
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const file = await dataUrlToFile(dataUrl);
    
    setStatus('Pose valid, foto diambil otomatis');
    onValid?.({ dataUrl, file });
  }, [captured, onValid, poseName]); // ✅ Tambahkan deps: captured, onValid, poseName

  // ✅ Fungsi untuk memvalidasi pose berdasarkan poseName saat onResults
  const validatePose = useCallback((res) => {
    switch (poseName) {
        case 'open_palm':
            return isOpenPalm(res);
        case 'v_pose':
            return isVPose(res);
        case 'three_fingers':
            return isThreeFingers(res);
        case 'one_finger':
            return isOneFinger(res);
        case 'no_pose':
            return isNoPose(res);
        default:
            return { ok: false, reason: 'Pose tidak dikenal' };
    }
  }, [poseName]);

  useEffect(() => {
    let disposed = false;
    let cam = null;
    let hands = null;

    // Helper untuk membersihkan timer
    const clearTimer = () => {
        if (autoCaptureTimerRef.current) {
            clearTimeout(autoCaptureTimerRef.current);
            autoCaptureTimerRef.current = null;
        }
    };
  
    const init = async () => {
      try {
        setStatus('Meminisialisasi kamera...');
        
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
          if (disposed) return;
          lastResultRef.current = result;
          
          if (overlayRef.current && showOverlay) {
            drawOverlay(result);
          }

          // ✅ LOGIKA AUTO-CAPTURE
          if (!captured && running) {
            const val = validatePose(result);
            const isCurrentlyValid = val.ok;
            const currentTimer = autoCaptureTimerRef.current;
            
            if (isCurrentlyValid) {
                setStatus(`Pose valid! Foto akan diambil dalam ${autoCaptureDelay / 1000} detik...`);
                if (!currentTimer) {
                    // Jika pose valid dan timer belum berjalan, mulai timer
                    autoCaptureTimerRef.current = setTimeout(() => {
                        if (disposed || captured) return;
                        performCapture(result);
                    }, autoCaptureDelay);
                }
            } else {
                // Jika pose tidak valid, bersihkan timer dan tampilkan reason
                clearTimer();
                setStatus(val.reason || getPoseDescription()); // Tampilkan reason atau deskripsi default
            }
          }
          // AKHIR LOGIKA AUTO-CAPTURE
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
        
        // 3. Setup camera
        if (!videoRef.current) throw new Error('Video element not found');
        
        cam = new Camera(videoRef.current, {
          onFrame: async () => {
            if (disposed || !handsRef.current || !videoRef.current) return;
            
            try {
              await handsRef.current.send({ image: videoRef.current });
            } catch (e) {
              if (!disposed) console.warn('MediaPipe send error:', e);
            }
          },
          width,
          height,
        });
        
        cameraRef.current = cam;
        await cam.start();
        
        if (disposed) {
          cam.stop();
          return;
        }
        
        setRunning(true);
        setReady(true);
        setStatus(getPoseDescription()); // Tampilkan deskripsi pose awal
        
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
      clearTimer(); // Pastikan timer juga dibersihkan saat unmount/re-run
      
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
          hands.close?.();
        } catch (e) {
          console.warn('Hands close error:', e);
        }
      }
      
      cameraRef.current = null;
      handsRef.current = null;
    };
  // ✅ Tambahkan deps yang diperlukan: captured, running, performCapture, validatePose, autoCaptureDelay, getPoseDescription
  }, [width, height, captured, running, showOverlay, autoCaptureDelay, performCapture, validatePose]); 

  const handleCapture = async () => {
    if (!ready || !videoRef.current) return;
    const res = lastResultRef.current;
    
    // Validasi pose
    const val = validatePose(res);

    if (!val.ok) {
        const reason = val.reason || 'Pose tidak valid';
        setStatus(reason);
        onInvalid?.(reason);
        return;
    }

    // Jika pose valid, langsung lakukan capture (manual override)
    await performCapture(res);
  };

  const handleRetake = () => {
    // ✅ Reset state captured dan error saat retake
    setCaptured(false); 
    setError(null);
    setStatus(getPoseDescription());
    
    // Clear timer jika ada
    if (autoCaptureTimerRef.current) {
        clearTimeout(autoCaptureTimerRef.current);
        autoCaptureTimerRef.current = null;
    }
    
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
        {/* Tombol capture manual hanya berfungsi jika belum tercapture */}
        <Button 
            type="primary" 
            onClick={handleCapture} 
            disabled={!running || captured}
        >
          {captureLabel}
        </Button>
        <Button onClick={handleRetake} disabled={!running}>
          Ulangi
        </Button>
        {/* Tampilkan status */}
        <Text type={error ? 'danger' : 'secondary'}>{status}</Text>
      </div>

      {/* Canvas untuk capture (disembunyikan) */}
      <canvas ref={captureCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default HandPoseCapture;