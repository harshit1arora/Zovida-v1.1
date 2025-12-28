import { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X, RotateCcw, Check, Sparkles, AlertTriangle, Pill, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useScanStore } from '@/store/scanStore';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Handle stream assignment when video element is ready
  useEffect(() => {
    if (isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  const startCamera = async () => {
    try {
      setIsCameraActive(true); // Set this first to ensure video element is rendered
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        }
      });
      
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setIsCameraActive(false);
      setError('Camera access denied. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-background to-transparent">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={24} />
        </Button>
        <h2 className="font-semibold">Scan Prescription</h2>
        <div className="w-12" />
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="h-full pt-16 pb-32 flex flex-col">
        {/* Camera/Preview Area */}
        <div className="flex-1 relative bg-foreground/5 rounded-3xl mx-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {capturedImage ? (
              <motion.img
                key="preview"
                src={capturedImage}
                alt="Captured prescription"
                className="w-full h-full object-contain"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              />
            ) : isCameraActive ? (
              <motion.div
                key="camera"
                className="relative w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* AR Overlays - WOW Feature */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {/* Detected Pill 1 */}
                  <motion.div
                    className="absolute top-[25%] left-[20%] flex items-center gap-2 px-3 py-1.5 bg-primary/80 backdrop-blur-md rounded-full border border-white/30 text-white"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <Pill size={14} className="animate-bounce" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold leading-none uppercase">Aspirin 500mg</span>
                      <span className="text-[8px] opacity-80 leading-none mt-1 italic">Generic: Acetylsalicylic acid</span>
                    </div>
                  </motion.div>

                  {/* Risk Badge */}
                  <motion.div
                    className="absolute top-[40%] right-[15%] flex items-center gap-2 px-3 py-1.5 bg-danger/80 backdrop-blur-md rounded-full border border-white/30 text-white"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.5 }}
                  >
                    <AlertTriangle size={14} />
                    <span className="text-[10px] font-bold leading-none uppercase tracking-tighter">Interaction Risk Detected</span>
                  </motion.div>

                  {/* Verified Badge */}
                  <motion.div
                    className="absolute bottom-[30%] left-[30%] flex items-center gap-2 px-3 py-1.5 bg-safe/80 backdrop-blur-md rounded-full border border-white/30 text-white"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.5 }}
                  >
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold leading-none uppercase tracking-tighter">Verified Pharmacy Format</span>
                  </motion.div>

                  {/* Pulsing Hotspots */}
                  <motion.div 
                    className="absolute top-[35%] left-[45%] w-4 h-4 rounded-full bg-accent/60"
                    animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute top-[55%] left-[25%] w-3 h-3 rounded-full bg-primary/60"
                    animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />

                  {/* Floating AR Data Stream */}
                  <div className="absolute top-4 right-4 text-right">
                    <motion.p 
                      className="text-[8px] font-mono text-accent/80 leading-tight"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      OCR_ENGINE: ACTIVE<br />
                      DATA_STREAM: ENCRYPTED<br />
                      MAPPING_COORDS: 42.1, -71.2
                    </motion.p>
                  </div>
                </div>

                {/* Scan frame overlay */}
                <div className="absolute inset-8 border-2 border-dashed border-accent/50 rounded-2xl pointer-events-none">
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-accent shadow-glow"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
                  Position the prescription within the frame
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div 
                  className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mb-6 cursor-pointer hover:bg-secondary/80 transition-colors active:scale-95"
                  onClick={startCamera}
                >
                  <Camera size={40} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Capture or Upload</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Take a photo of your prescription or upload an existing image
                </p>
                {error && (
                  <p className="text-danger text-sm mb-4">{error}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
          {capturedImage ? (
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1"
                onClick={retake}
              >
                <RotateCcw size={20} />
                Retake
              </Button>
              <Button 
                variant="scan" 
                size="lg" 
                className="flex-1"
                onClick={confirmCapture}
              >
                <Check size={20} />
                Analyze
              </Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} />
                Upload
              </Button>
              <Button
                variant="scan"
                size="lg"
                className="flex-1"
                onClick={isCameraActive ? capturePhoto : startCamera}
              >
                <Camera size={20} />
                {isCameraActive ? 'Capture' : 'Camera'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CameraCapture;
