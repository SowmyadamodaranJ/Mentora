import { useEffect } from 'react';
import { Camera, CameraOff, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useWebcam } from '../../hooks/useWebcam';
import EmotionIndicator from './EmotionIndicator';
import { Emotion } from '../../types';

interface VideoPanelProps {
  isRecording: boolean;
  emotion: Emotion;
  eyeContact: number;
  confidence: number;
  isListening: boolean;
  onStreamReady: (stream: MediaStream) => void;
}

export default function VideoPanel({
  isRecording,
  emotion,
  eyeContact,
  confidence,
  isListening,
  onStreamReady,
}: VideoPanelProps) {
  const { videoRef, stream, isActive, error, startCamera, stopCamera } = useWebcam();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (stream) onStreamReady(stream);
  }, [stream]);

  return (
    <div className="space-y-3">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.08)',
          aspectRatio: '4/3',
        }}
      >
        {isActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  border: isRecording ? '2px solid rgba(239,68,68,0.6)' : '2px solid transparent',
                  boxShadow: isRecording ? 'inset 0 0 20px rgba(239,68,68,0.1)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-recording-pulse" />
                  <span className="text-xs font-medium text-red-400 bg-black/50 px-2 py-0.5 rounded-full">
                    REC
                  </span>
                </div>
              )}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                  style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                >
                  {isListening ? (
                    <>
                      <Mic size={10} className="text-green-400" />
                      <span className="text-green-400">Live</span>
                    </>
                  ) : (
                    <>
                      <MicOff size={10} className="text-gray-500" />
                      <span className="text-gray-500">Muted</span>
                    </>
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
            {error ? (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
                  <AlertCircle size={20} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300 font-medium">Camera Unavailable</p>
                  <p className="text-xs text-gray-500 mt-1">{error}</p>
                </div>
                <button onClick={startCamera} className="btn-secondary text-xs py-1.5 px-3">
                  Retry
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <Camera size={20} style={{ color: '#6366F1' }} />
                </div>
                <div>
                  <p className="text-sm text-gray-300 font-medium">Starting Camera...</p>
                  <p className="text-xs text-gray-500 mt-1">Allow camera access when prompted</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isActive && (
        <EmotionIndicator
          emotion={emotion}
          eyeContact={eyeContact}
          confidence={confidence}
        />
      )}
    </div>
  );
}
