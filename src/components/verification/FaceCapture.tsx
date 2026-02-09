"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  loadFaceDetectionModels,
  detectFaceOrientation,
  validatePose,
  cropToSquare,
  type FaceDetectionResult,
} from "@/lib/faceDetection";

type Pose = "front";

interface FaceCaptureProps {
  onComplete: (images: Record<Pose, string>) => void;
}

const POSES: { key: Pose; label: string; instruction: string }[] = [
  { key: "front", label: "Face Verification", instruction: "Look at camera, then slowly turn left and right" },
];

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

export default function FaceCapture({ onComplete }: FaceCaptureProps) {
  const webcamRef = useRef<Webcam>(null);

  const [currentPoseIdx, setCurrentPoseIdx] = useState(0);
  const [capturedImages, setCapturedImages] = useState<Partial<Record<Pose, string>>>({});
  const [cameraError, setCameraError] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [poseValid, setPoseValid] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [detectionResult, setDetectionResult] = useState<FaceDetectionResult | null>(null);
  const [validFramesCount, setValidFramesCount] = useState(0);
  const [hasMovedLeft, setHasMovedLeft] = useState(false);
  const [hasMovedRight, setHasMovedRight] = useState(false);

  const hasMovedLeftRef = useRef(false);
  const hasMovedRightRef = useRef(false);

  const currentPose = POSES[currentPoseIdx];
  const progress = (Object.keys(capturedImages).length / POSES.length) * 100;

  const REQUIRED_VALID_FRAMES = 2; // Require 2 consecutive valid frames to prevent flickering
  const isLivenessComplete = hasMovedLeft && hasMovedRight;

  // Load face detection models on mount
  useEffect(() => {
    loadFaceDetectionModels()
      .then(() => {
        setModelsLoading(false);
        console.log("Face detection models ready");
      })
      .catch((error) => {
        console.error("Failed to load face detection models:", error);
        setModelsLoading(false);
      });
  }, []);

  // Face detection with orientation validation
  const detectFace = useCallback(async () => {
    if (!webcamRef.current || !cameraReady || modelsLoading) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    try {
      const result = await detectFaceOrientation(video);
      setDetectionResult(result);
      
      if (result.detected && result.orientation) {
        const { yaw } = result.orientation;
        
        // Track left and right head movements using both state and ref
        if (yaw < -0.2) {
          setHasMovedLeft(true);
          hasMovedLeftRef.current = true;
        }
        if (yaw > 0.2) {
          setHasMovedRight(true);
          hasMovedRightRef.current = true;
        }
        
        setFaceDetected(true);
        
        // Check if looking at front and liveness check is complete
        const isValidFrontPose = Math.abs(yaw) < 0.45;
        const livenessComplete = hasMovedLeftRef.current && hasMovedRightRef.current;
        
        // Require multiple consecutive valid frames to prevent flickering
        if (isValidFrontPose && livenessComplete) {
          setValidFramesCount((count) => {
            const newCount = count + 1;
            if (newCount >= REQUIRED_VALID_FRAMES && !poseValid) {
              setPoseValid(true);
            }
            return newCount;
          });
        } else {
          setValidFramesCount(0);
          setPoseValid(false);
        }
      } else {
        setFaceDetected(false);
        setPoseValid(false);
        setValidFramesCount(0);
      }

      // Continue detection loop
      if (Object.keys(capturedImages).length < POSES.length) {
        setTimeout(() => detectFace(), 150); // Check every 150ms for better performance
      }
    } catch (error) {
      console.error("Face detection error:", error);
      setFaceDetected(false);
      setPoseValid(false);
      setValidFramesCount(0);
    }
  }, [cameraReady, modelsLoading, currentPoseIdx, capturedImages, poseValid]);

  // Start detection loop when camera is ready
  useEffect(() => {
    if (!cameraReady || modelsLoading || Object.keys(capturedImages).length === POSES.length) return;

    detectFace();

    return () => {
      // Cleanup if needed
    };
  }, [cameraReady, modelsLoading, detectFace, capturedImages]);

  // Auto-capture countdown when face is detected AND pose is valid
  useEffect(() => {
    if (!faceDetected || !poseValid || Object.keys(capturedImages).length === POSES.length) {
      setCountdown(0);
      return;
    }

    let currentCount = 1;
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
  }, [faceDetected, poseValid, currentPoseIdx, capturedImages]);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc || !detectionResult?.boundingBox) return;

    try {
      // Crop to square centered on face
      const croppedImage = await cropToSquare(imageSrc, detectionResult.boundingBox, 0.6);
      
      const pose = POSES[currentPoseIdx].key;
      const next = { ...capturedImages, [pose]: croppedImage };
      setCapturedImages(next);

      setFaceDetected(false);
      setPoseValid(false);
      setCountdown(0);
      setDetectionResult(null);
      setValidFramesCount(0);

      if (currentPoseIdx < POSES.length - 1) {
        setCurrentPoseIdx((i) => i + 1);
      } else {
        onComplete(next as Record<Pose, string>);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      // Fallback: use original image if cropping fails
      const pose = POSES[currentPoseIdx].key;
      const next = { ...capturedImages, [pose]: imageSrc };
      setCapturedImages(next);

      if (currentPoseIdx < POSES.length - 1) {
        setCurrentPoseIdx((i) => i + 1);
      } else {
        onComplete(next as Record<Pose, string>);
      }
    }
  }, [currentPoseIdx, capturedImages, detectionResult, onComplete]);

  const retake = () => {
    setCapturedImages({});
    setCurrentPoseIdx(0);
    setFaceDetected(false);
    setPoseValid(false);
    setCountdown(0);
    setDetectionResult(null);
    setValidFramesCount(0);
    setHasMovedLeft(false);
    setHasMovedRight(false);
    hasMovedLeftRef.current = false;
    hasMovedRightRef.current = false;
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
    <Card className="neo-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Face Verification - Auto Capture
        </CardTitle>
        <Progress value={progress} className="mt-2 h-2" />
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Pose indicators */}
        <div className="flex justify-center gap-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: !allCaptured ? 1.1 : 1,
              y: !allCaptured ? -4 : 0
            }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              capturedImages["front"]
                ? "text-green-600"
                : "font-semibold text-primary"
            }`}
          >
            {capturedImages["front"] ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <motion.span 
                animate={{
                  scale: !allCaptured ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex h-4 w-4 items-center justify-center rounded-full border-2 text-xs font-bold border-current"
              >
                1
              </motion.span>
            )}
            Face Verification
          </motion.div>
        </div>

        {/* Liveness Check Indicators */}
        {!allCaptured && (
          <div className="flex justify-center gap-6 text-sm">
            <div className={`flex items-center gap-2 transition-colors ${
              hasMovedLeft ? "text-green-600 font-semibold" : "text-muted-foreground"
            }`}>
              {hasMovedLeft ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-4 w-4 rounded-full border-2 border-current" />}
              Turn Left
            </div>
            <div className={`flex items-center gap-2 transition-colors ${
              hasMovedRight ? "text-green-600 font-semibold" : "text-muted-foreground"
            }`}>
              {hasMovedRight ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-4 w-4 rounded-full border-2 border-current" />}
              Turn Right
            </div>
          </div>
        )}

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
              {/* Animated Circle Overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    borderColor: faceDetected && poseValid ? "#22c55e" : faceDetected ? "#f59e0b" : "#ef4444",
                    scale: faceDetected && poseValid ? [1, 1.02, 1] : 1,
                  }}
                  transition={{ 
                    duration: faceDetected && poseValid ? 1 : 0.3,
                    repeat: faceDetected && poseValid ? Infinity : 0 
                  }}
                  className="h-72 w-72 rounded-full border-4"
                  style={{
                    borderColor: faceDetected && poseValid ? "#22c55e" : faceDetected ? "#f59e0b" : "#ef4444",
                    boxShadow: faceDetected && poseValid
                      ? "0 0 30px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.1)"
                      : faceDetected
                        ? "0 0 30px rgba(245, 158, 11, 0.6), inset 0 0 20px rgba(245, 158, 11, 0.1)"
                        : "0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.1)",
                  }}
                />
              </div>

              {/* Countdown */}
              <AnimatePresence>
                {faceDetected && poseValid && countdown > 0 && (
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
                    backgroundColor: faceDetected && poseValid ? "#22c55e" : faceDetected ? "#f59e0b" : "#ef4444",
                  }}
                  transition={{ duration: 0.3 }}
                  className="px-6 py-2 rounded-full text-white font-semibold text-sm shadow-lg backdrop-blur-sm flex items-center gap-2"
                >
                  {modelsLoading ? (
                    <>
                      <AlertCircle className="w-4 h-4 animate-spin" />
                      Loading AI Models...
                    </>
                  ) : faceDetected && poseValid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Perfect! Hold still...
                    </>
                  ) : faceDetected && !isLivenessComplete ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      {!hasMovedLeft && !hasMovedRight ? "Slowly turn left" : !hasMovedLeft ? "Now turn left" : "Now look straight"}
                    </>
                  ) : faceDetected ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Look straight at camera
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
              className="flex justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="relative">
                  <Image
                    src={capturedImages["front"] || ""}
                    alt="Face Verification"
                    width={280}
                    height={280}
                    className="rounded-xl border-4 border-green-500 shadow-lg"
                    unoptimized
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <span className="mt-2 block text-sm font-medium text-foreground">
                  Verified
                </span>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Instructions */}
        {!allCaptured ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <p className="font-semibold text-lg text-primary">{currentPose.instruction}</p>
            <p className="text-sm text-muted-foreground">
              1. Look straight at the camera<br />
              2. Slowly turn your head left<br />
              3. Slowly turn your head right<br />
              4. Look back at the camera - photo will be captured automatically
            </p>
            {modelsLoading && (
              <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xs text-orange-600 font-medium"
              >
                Loading face detection AI models...
              </motion.p>
            )}
            {!cameraReady && !modelsLoading && (
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
              <RotateCcw className="h-4 w-4" /> Retake Photo
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
