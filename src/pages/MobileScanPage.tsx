import React, { useCallback, useEffect, useRef, useState } from 'react';

type ImageSource = 'camera' | 'upload';

interface MobileScanPageProps {
  onOpenEditor?: (payload: { title: string; content: string }) => void;
}

const MobileScanPage: React.FC<MobileScanPageProps> = ({ onOpenEditor }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const attachStream = (node: HTMLVideoElement, mediaStream: MediaStream) => {
    node.srcObject = mediaStream;
    const playPromise = node.play();
    if (playPromise !== undefined) {
      playPromise.catch((playError) => {
        console.warn('비디오 재생 실패:', playError);
      });
    }
  };

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      attachStream(node, streamRef.current);
    }
  }, []);

  const startCamera = async () => {
    if (streamRef.current) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('이 브라우저는 카메라를 지원하지 않습니다. (HTTPS 또는 localhost 필요)');
      return;
    }

    const tryGetCamera = async (constraints: MediaStreamConstraints) => {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setErrorMessage('');
      setCameraActive(true);
      if (videoRef.current) {
        attachStream(videoRef.current, mediaStream);
      }
    };

    try {
      await tryGetCamera({ video: { facingMode: { ideal: 'environment' } } });
    } catch (error) {
      console.warn('후면 카메라 시작 실패, 기본 카메라로 재시도:', error);
      try {
        await tryGetCamera({ video: true });
      } catch (fallbackError) {
        console.error('카메라 접근 실패:', fallbackError);
        setErrorMessage('카메라 권한이 거부되었거나 카메라가 지원되지 않습니다.');
      }
    }
  };

  const stopCamera = useCallback(() => {
    const current = streamRef.current;
    if (current) {
      current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        setImageSource('camera');
        setOcrText('');
        setOcrError('');
        stopCamera();
      }
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('이미지 파일만 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setCapturedImage(result);
        setImageSource('upload');
        setOcrText('');
        setOcrError('');
        setErrorMessage('');
      }
    };
    reader.onerror = () => {
      setErrorMessage('이미지를 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const resetImage = () => {
    setCapturedImage(null);
    setImageSource(null);
    setOcrText('');
    setOcrError('');
  };

  const saveImage = () => {
    if (capturedImage) {
      alert('이미지가 저장되었습니다!');
      console.log('저장된 이미지:', capturedImage);
    }
  };

  const runMockOCR = async () => {
    if (!capturedImage) {
      setOcrError('먼저 이미지를 촬영하거나 업로드해 주세요.');
      return;
    }

    setOcrLoading(true);
    setOcrError('');
    setOcrText('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockText = `2026학년도 가정통신문

안녕하세요.
본 문서는 ${imageSource === 'upload' ? '업로드된' : '카메라로 촬영된'} 이미지에서 추출된 OCR 결과 예시입니다.

제목: 학교 행사 안내
일시: 2026년 5월 9일
장소: 본관 강당
내용: 학생 대상 AI 문서 작성 서비스 시연 및 안내`;

      setOcrText(mockText);
    } catch (error) {
      console.error('OCR 실행 실패:', error);
      setOcrError('텍스트 추출에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setOcrLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleVideoCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((playError) => {
        console.warn('비디오 재생 실패:', playError);
      });
    }
  };

  const retakeLabel = imageSource === 'upload' ? '다시 선택' : '다시 촬영';
  const retakeAction = imageSource === 'upload' ? openFilePicker : startCamera;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold">모바일 문서 스캔</h1>
        <div className="mt-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {!cameraActive && !capturedImage && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                카메라 시작
              </button>
              <button
                onClick={openFilePicker}
                className="px-4 py-2 bg-indigo-500 text-white rounded"
              >
                이미지 업로드
              </button>
            </div>
          )}

          {cameraActive && (
            <div className="mx-auto w-full max-w-md">
              <div className="relative h-[400px] overflow-hidden rounded-lg border">
                <video
                  ref={setVideoRef}
                  autoPlay
                  playsInline
                  muted
                  onCanPlay={handleVideoCanPlay}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ backgroundColor: '#000' }}
                />
                {/* 문서 스캔 가이드라인 overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-x-0 top-0 h-24 bg-black bg-opacity-50"></div>
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-black bg-opacity-50"></div>
                  <div className="absolute inset-y-0 left-0 w-10 bg-black bg-opacity-50"></div>
                  <div className="absolute inset-y-0 right-0 w-10 bg-black bg-opacity-50"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-80 border-2 border-white rounded-lg">
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-white rounded-full border-2 border-gray-300"></div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-gray-300"></div>
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white rounded-full border-2 border-gray-300"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-gray-300"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black bg-opacity-60 text-white rounded">
                    모서리를 맞춰 문서를 촬영해 주세요.
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={captureImage}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  촬영
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  카메라 끄기
                </button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div>
              <img
                src={capturedImage}
                alt={imageSource === 'upload' ? '업로드된 이미지' : '촬영된 이미지'}
                className="w-full max-w-md border"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={retakeAction}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  {retakeLabel}
                </button>
                <button
                  onClick={saveImage}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  저장
                </button>
                <button
                  onClick={runMockOCR}
                  disabled={ocrLoading}
                  className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {ocrLoading ? '텍스트 추출 중…' : 'OCR 실행'}
                </button>
                <button
                  onClick={resetImage}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded"
                >
                  처음으로
                </button>
              </div>
            </div>
          )}

          {ocrLoading && (
            <div className="mt-6 flex items-center gap-2 text-slate-600">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              <span>텍스트 추출 중…</span>
            </div>
          )}

          {ocrError && !ocrLoading && (
            <div className="mt-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">
              {ocrError}
            </div>
          )}

          {ocrText && !ocrLoading && (
            <div className="mt-6">
              <h2 className="text-xl font-medium">OCR 결과</h2>
              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="w-full mt-2 p-2 border rounded"
                rows={10}
                placeholder="OCR 결과를 확인하고 수정할 수 있습니다."
              />
              {onOpenEditor && (
                <button
                  onClick={() =>
                    onOpenEditor({
                      title: ocrText.split('\n')[0]?.slice(0, 40) || '제목 없음',
                      content: ocrText,
                    })
                  }
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded"
                >
                  편집기로 이동 →
                </button>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 text-red-500">{errorMessage}</div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </section>
    </div>
  );
};

export default MobileScanPage;
