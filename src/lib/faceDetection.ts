import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face-api.js models from CDN
 * Only needs to be called once
 */
export async function loadFaceDetectionModels() {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
    console.log('Face detection models loaded successfully');
  } catch (error) {
    console.error('Error loading face detection models:', error);
    throw error;
  }
}

export interface FaceOrientation {
  yaw: number;   // Left/right rotation (-1 to 1, negative = left, positive = right)
  pitch: number; // Up/down tilt (-1 to 1, negative = down, positive = up)
  roll: number;  // Side tilt (-1 to 1)
}

export interface FaceDetectionResult {
  detected: boolean;
  orientation?: FaceOrientation;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Calculate face orientation from landmarks
 * Uses nose, eyes, and face outline to estimate head pose
 */
function calculateOrientation(landmarks: faceapi.FaceLandmarks68): FaceOrientation {
  const positions = landmarks.positions;
  
  // Key facial landmarks (0-indexed)
  const leftEye = positions[36]; // Left eye outer corner
  const rightEye = positions[45]; // Right eye outer corner
  const nose = positions[30]; // Nose tip
  const leftMouth = positions[48]; // Left mouth corner
  const rightMouth = positions[54]; // Right mouth corner
  const chin = positions[8]; // Chin center
  
  // Calculate yaw (left-right rotation)
  // Compare distances from nose to left/right face edges
  const leftFaceEdge = positions[0];
  const rightFaceEdge = positions[16];
  
  const noseToLeft = Math.abs(nose.x - leftFaceEdge.x);
  const noseToRight = Math.abs(rightFaceEdge.x - nose.x);
  const totalWidth = noseToLeft + noseToRight;
  
  // Normalize: -1 (left) to 1 (right), 0 (center)
  const yaw = totalWidth > 0 ? (noseToRight - noseToLeft) / totalWidth : 0;
  
  // Calculate pitch (up-down tilt)
  // Compare vertical distances
  const eyesCenterY = (leftEye.y + rightEye.y) / 2;
  const noseToEyes = nose.y - eyesCenterY;
  const noseToChin = chin.y - nose.y;
  const totalHeight = Math.abs(noseToEyes) + Math.abs(noseToChin);
  
  // Normalize: -1 (down) to 1 (up), 0 (level)
  const pitch = totalHeight > 0 ? (noseToEyes - noseToChin) / totalHeight : 0;
  
  // Calculate roll (side tilt)
  const eyesDeltaY = rightEye.y - leftEye.y;
  const eyesDeltaX = rightEye.x - leftEye.x;
  const roll = eyesDeltaX !== 0 ? Math.atan2(eyesDeltaY, eyesDeltaX) / Math.PI : 0;
  
  return { yaw, pitch, roll };
}

/**
 * Detect face in video element or image and return orientation
 */
export async function detectFaceOrientation(
  input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<FaceDetectionResult> {
  if (!modelsLoaded) {
    await loadFaceDetectionModels();
  }

  try {
    const detection = await faceapi
      .detectSingleFace(
        input,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.4,
        })
      )
      .withFaceLandmarks();

    if (!detection) {
      return { detected: false, confidence: 0 };
    }

    const orientation = calculateOrientation(detection.landmarks);
    const box = detection.detection.box;

    return {
      detected: true,
      orientation,
      confidence: detection.detection.score,
      boundingBox: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      },
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return { detected: false, confidence: 0 };
  }
}

/**
 * Check if face orientation matches the required pose
 */
export function validatePose(
  orientation: FaceOrientation,
  requiredPose: 'front' | 'left' | 'right'
): boolean {
  const { yaw, pitch, roll } = orientation;
  
  // More forgiving tilt tolerance
  if (Math.abs(pitch) > 0.5 || Math.abs(roll) > 0.5) {
    return false;
  }

  switch (requiredPose) {
    case 'front':
      // Face should be roughly centered (more forgiving)
      return Math.abs(yaw) < 0.35;
    
    case 'left':
      // Face should be turned left (more forgiving range)
      return yaw < -0.15 && yaw > -0.8;
    
    case 'right':
      // Face should be turned right (more forgiving range)
      return yaw > 0.15 && yaw < 0.8;
    
    default:
      return false;
  }
}

/**
 * Crop image to square centered on face
 * @param imageDataUrl Base64 image data URL
 * @param boundingBox Face bounding box from detection
 * @param padding Padding factor around face (default 0.5 = 50% larger than face)
 */
export async function cropToSquare(
  imageDataUrl: string,
  boundingBox: { x: number; y: number; width: number; height: number },
  padding: number = 0.5
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      if (img.width === 0 || img.height === 0) {
        resolve(imageDataUrl);
        return;
      }

      // Calculate square size with padding
      const faceSize = Math.max(boundingBox.width, boundingBox.height);
      const squareSize = Math.round(faceSize * (1 + padding));

      if (squareSize <= 0) {
        resolve(imageDataUrl);
        return;
      }
      
      // Calculate center of face
      const faceCenterX = boundingBox.x + boundingBox.width / 2;
      const faceCenterY = boundingBox.y + boundingBox.height / 2;
      
      // Calculate crop position (ensure within image bounds)
      const cropX = Math.max(0, Math.min(faceCenterX - squareSize / 2, img.width - squareSize));
      const cropY = Math.max(0, Math.min(faceCenterY - squareSize / 2, img.height - squareSize));

      if (cropX < 0 || cropY < 0) {
        resolve(imageDataUrl);
        return;
      }
      
      // Set canvas to square size
      canvas.width = squareSize;
      canvas.height = squareSize;
      
      // Draw cropped and centered image
      ctx.drawImage(
        img,
        cropX, cropY, squareSize, squareSize,  // Source
        0, 0, squareSize, squareSize           // Destination
      );
      
      // Convert to data URL
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageDataUrl;
  });
}
