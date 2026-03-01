import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { scanCard } from '../../services/cardEvaluationApi';

const CardScanner = ({ onCardFound }) => {
  const [scanning, setScanning] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  }, []);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreaming(true);
    } catch {
      setError('Could not access camera. Please use file upload instead.');
    }
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    stopCamera();
    await processImage(base64);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      await processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64) => {
    setScanning(true);
    setResults(null);
    setError('');

    try {
      const data = await scanCard(base64);
      if (data.matches?.length > 0) {
        setResults(data.matches);
      } else {
        setError('No cards recognized. Try a clearer photo or use text search.');
      }
    } catch {
      setError('Card scanning failed. Please try again or use text search.');
    } finally {
      setScanning(false);
    }
  };

  const selectCard = (card) => {
    onCardFound(card);
    setResults(null);
  };

  return (
    <div className="space-y-4">
      {/* Camera or upload controls */}
      {!streaming && !scanning && !results && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm text-gray-600"
          >
            <Camera className="w-5 h-5" />
            Open Camera
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm text-gray-600"
          >
            <Upload className="w-5 h-5" />
            Upload Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Camera view */}
      {streaming && (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
            <button
              type="button"
              onClick={captureFromCamera}
              className="px-6 py-2.5 bg-white text-gray-900 text-sm font-medium rounded-full shadow-lg"
            >
              Capture
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="p-2.5 bg-white/80 text-gray-900 rounded-full shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Scanning spinner */}
      {scanning && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm">Recognizing card...</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {results.length} match{results.length !== 1 ? 'es' : ''} found — select your card:
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((card, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectCard(card)}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-900 transition-colors text-left"
              >
                {card.image && (
                  <img src={card.image} alt={card.name} className="w-12 h-16 object-contain rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{card.name}</p>
                  <p className="text-xs text-gray-500">{card.set_name} #{card.number}</p>
                  {card.confidence && (
                    <p className="text-xs text-gray-400">{Math.round(card.confidence * 100)}% match</p>
                  )}
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setResults(null)}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Try again
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CardScanner;
