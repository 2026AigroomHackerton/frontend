import React, { useRef, useState, useEffect } from 'react';

const MobileScanPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setCameraActive(true);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('카메라 접근 실패:', error);
      setErrorMessage('카메라 권한이 거부되었거나 카메라가 지원되지 않습니다.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

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
        stopCamera();
      }
    }
  };

  const runMockOCR = () => {
    if (!capturedImage) {
      setErrorMessage('먼저 이미지를 촬영하세요.');
      return;
    }
    const mockText = `2026학년도 가정통신문

안녕하세요.
본 문서는 카메라로 촬영된 이미지에서 추출된 OCR 결과 예시입니다.

제목: 학교 행사 안내
일시: 2026년 5월 9일
장소: 본관 강당
내용: 학생 대상 AI 문서 작성 서비스 시연 및 안내`;
    setOcrText(mockText);
    setErrorMessage('');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold">모바일 문서 스캔</h1>
        <div className="mt-6">
          {!cameraActive && !capturedImage && (
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              카메라 시작
            </button>
          )}
          {cameraActive && (
            <div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md border"
              />
              <div className="mt-4">
                <button
                  onClick={captureImage}
                  className="px-4 py-2 bg-green-500 text-white rounded mr-2"
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
                alt="촬영된 이미지"
                className="w-full max-w-md border"
              />
              <div className="mt-4">
                <button
                  onClick={runMockOCR}
                  className="px-4 py-2 bg-purple-500 text-white rounded mr-2"
                >
                  OCR 실행
                </button>
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setOcrText('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  다시 촬영
                </button>
              </div>
            </div>
          )}
          {ocrText && (
            <div className="mt-6">
              <h2 className="text-xl font-medium">OCR 결과</h2>
              <textarea
                value={ocrText}
                readOnly
                className="w-full mt-2 p-2 border rounded"
                rows={10}
              />
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