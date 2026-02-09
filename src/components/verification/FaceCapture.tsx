"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Pose = "front" | "left" | "right";

interface FaceCaptureProps {
  onComplete: (images: Record<Pose, string>) => void;
}

const POSES: { key: Pose; label: string; instruction: string }[] = [
  { key: "front", label: "Front", instruction: "Look straight at the camera" },
  { key: "left", label: "Left", instruction: "Turn your head slightly to the left" },
  { key: "right", label: "Right", instruction: "Turn your head slightly to the right" },
];

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

export default function FaceCapture({ onComplete }: FaceCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentPoseIdx, setCurrentPoseIdx] = useState(0);
  const [capturedImages, setCapturedImages] = useState<Partial<Record<Pose, string>>>({});
  const [cameraError, setCameraError] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  const currentPose = POSES[currentPoseIdx];
  const progress = (Object.keys(capturedImages).length / POSES.length) * 100;

  // Simple face detection using video brightness/motion
  const detectFace = useCallback(() => {
    if (!webcamRef.current || !canvasRef.current || !cameraReady) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      
      if (!context) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get center region of the frame
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const regionSize = 100;

      const imageData = context.getImageData(
        centerX - regionSize / 2,
        centerY - regionSize / 2,
        regionSize,
        regionSize
      );

      // Calculate average brightness
      let totalBrightness = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
      }

      const avgBrightness = totalBrightness / (regionSize * regionSize);

      // Simple heuristic: if there's reasonable brightness in the center, assume face present
      const detected = avgBrightness > 40 && avgBrightness < 220;
      
      setFaceDetected(detected);

      animationFrameRef.current = requestAnimationFrame(detectFace);
    } catch (error) {
      console.error("Face detection error:", error);
      setFaceDetected(true);
    }
  }, [cameraReady]);

  // Start detection loop
  useEffect(() => {
    if (!cameraReady || Object.keys(capturedImages).length === POSES.length) return;

    animationFrameRef.current = requestAnimationFrame(detectFace);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraReady, detectFace, capturedImages]);

  // Auto-capture countdown
  useEffect(() => {
    if (!faceDetected || Object.keys(capturedImages).length === POSES.length) {
      setCountdown(0);
      return;
    }

    let currentCount = 2;
    setCountdown(currentCount);

    const interval = setInterval(() => {
      currentCount--;
      setCountdown(currentCount);

      if (currentCount <= 0) {
        clearInterval(interval);
        capture();
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceDetected, currentPoseIdx, capturedImages]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    const pose = POSES[currentPoseIdx].key;
    const next = { ...capturedImages, [pose]: imageSrc };
    setCapturedImages(next);

    setFaceDetected(false);
    setCountdown(0);

    if (currentPoseIdx < POSES.length - 1) {
      setCurrentPoseIdx((i) => i + 1);
    } else {
      onComplete(next as Record<Pose, string>);
    }
  }, [currentPoseIdx, capturedImages, onComplete]);

  const retake = () => {
    setCapturedImages({});
    setCurrentPoseIdx(0);
    setFaceDetected(false);
    setCountdown(0);
  };

  const handleUserMedia = () => {
    setTimeout(() => setCameraReady(true), 500);
  };

  if (cameraError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-center text-muted-foreground">
            Unable to access camera. Please allow camera permissions and try again.
          </p>
          <Button variant="outline" onClick={() => setCameraError(false)}>
            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const allCaptured = Object.keys(capturedImages).length === POSES.length;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-linear-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Face Verification - Auto Capture
        </CardTitle>
        <Progress value={progress} className="mt-2 h-2" />
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Pose indicators */}
        <div className="flex justify-center gap-4">
          {POSES.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: i === currentPoseIdx && !allCaptured ? 1.1 : 1,
                y: i === currentPoseIdx && !allCaptured ? -4 : 0
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                capturedImages[p.key]
                  ? "text-green-600"
                  : i === currentPoseIdx
                    ? "font-semibold text-primary"
                    : "text-muted-foreground"
              }`}
            >
              {capturedImages[p.key] ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <motion.span 
                  animate={{
                    scale: i === currentPoseIdx && !allCaptured ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex h-4 w-4 items-center justify-center rounded-full border-2 text-xs font-bold border-current"
                >
                  {i + 1}
                </motion.span>
              )}
              {p.label}
            </motion.div>
          ))}
        </div>

        {/* Camera / Preview */}
        <div className="relative mx-auto w-fit overflow-hidden rounded-2xl bg-linear-to-br from-gray-900 to-gray-800 shadow-2xl">
          {!allCaptured ? (
            <div className="relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={() => setCameraError(true)}
                className="rounded-2xl"
                mirrored
              />
              
              <canvas ref={canvasRef} className="hidden" />

              {/* Animated Circle Overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    borderColor: faceDetected ? "#22c55e" : "#ef4444",
                    scale: faceDetected ? [1, 1.02, 1] : 1,
                  }}
                  transition={{ 
                    duration: faceDetected ? 1 : 0.3,
                    repeat: faceDetected ? Infinity : 0 
                  }}
                  className="h-72 w-72 rounded-full border-4"
                  style={{
                    borderColor: faceDetected ? "#22c55e" : "#ef4444",
                    boxShadow: faceDetected
                      ? "0 0 30px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.1)"
                      : "0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.1)",
                  }}
                />
              </div>

              {/* Countdown */}
              <AnimatePresence>
                {faceDetected && countdown > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-full w-28 h-28 flex items-center justify-center shadow-2xl"
                    >
                      <span className="text-5xl font-bold">{countdown}</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Badge */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    backgroundColor: faceDetected ? "#22c55e" : "#ef4444",
                  }}
                  transition={{ duration: 0.3 }}
                  className="px-6 py-2 rounded-full text-white font-semibold text-sm shadow-lg backdrop-blur-sm flex items-center gap-2"
                >
                  {faceDetected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Face Detected
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      No Face Detected
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 gap-3 p-4"
            >
              {POSES.map((p, idx) => (
                <motion.div
                  key={p.key}
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="relative">
                    <Image
                      src={capturedImages[p.key] || ""}
                      alt={p.label}
                      width={180}
                      height={180}
                      className="rounded-xl border-4 border-green-500 shadow-lg"
                      unoptimized
                    />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="mt-2 block text-sm font-medium text-foreground">
                    {p.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Instructions */}
        {!allCaptured ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3 bg-orange-50/50 rounded-lg p-4 border border-primary/10"
          >
            <p className="font-semibold text-lg text-primary">{currentPose.instruction}</p>
            <p className="text-sm text-muted-foreground">
              Position your face within the circle. Auto-capture activates when face is detected for 2 seconds.
            </p>
            {!cameraReady && (
              <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xs text-orange-600 font-medium"
              >
                Initializing camera...
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-3"
          >
            <Button 
              variant="outline" 
              onClick={retake}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Retake All
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
