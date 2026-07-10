// TWENTY3 virtual try-on compositor.
//
// Pipeline:
//   1. Detect the person with MediaPipe Pose (self-hosted wasm + model in
//      /public), giving real shoulder / hip / ankle coordinates.
//   2. Extract the garment from its product photo: flood-fill the studio
//      background away from the borders, isolate the largest garment region
//      (product shots often contain front+back views side by side), and crop
//      to the true garment bounds so proportions are exact.
//   3. Size and anchor the garment to the detected body — shoulder width for
//      tops, hip-to-ankle for bottoms — and rotate it to the shoulder tilt.
//
// If the pose model can't run (offline, unsupported browser) a pixel
// heuristic estimates the body instead, and if even that finds nothing the
// garment is placed with centered framing — the preview never hard-fails.
import { inferFunctionalCategory } from './styleEngine';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  if (!src.startsWith('data:') && !src.startsWith('blob:')) {
    img.crossOrigin = 'anonymous';
  }
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Image failed to load'));
  img.src = src;
});

/* ————————————————— Pose detection (MediaPipe, self-hosted) ————————————————— */

const LM = {
  nose: 0,
  leftEar: 7,
  rightEar: 8,
  leftShoulder: 11,
  rightShoulder: 12,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
};

let poseLandmarkerPromise = null;

function getPoseLandmarker() {
  if (!poseLandmarkerPromise) {
    poseLandmarkerPromise = (async () => {
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const fileset = await FilesetResolver.forVisionTasks('/mediapipe-wasm');
      const options = (delegate) => ({
        baseOptions: { modelAssetPath: '/models/pose_landmarker_lite.task', delegate },
        runningMode: 'IMAGE',
        numPoses: 1,
      });
      try {
        return await PoseLandmarker.createFromOptions(fileset, options('GPU'));
      } catch {
        return await PoseLandmarker.createFromOptions(fileset, options('CPU'));
      }
    })().catch((error) => {
      poseLandmarkerPromise = null;
      throw error;
    });
  }
  return poseLandmarkerPromise;
}

async function detectPose(canvas) {
  try {
    const landmarker = await getPoseLandmarker();
    const result = landmarker.detect(canvas);
    const landmarks = result?.landmarks?.[0];
    if (!landmarks?.length) return null;
    return landmarks.map(point => ({
      x: point.x * canvas.width,
      y: point.y * canvas.height,
      visibility: point.visibility ?? 1,
    }));
  } catch {
    return null;
  }
}

const visible = (point, threshold = 0.5) => Boolean(point && point.visibility >= threshold);

const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/* ————————————————— Garment extraction ————————————————— */

function sampleBorderColor(data, width, height) {
  const totals = [0, 0, 0];
  let count = 0;
  const push = (x, y) => {
    const i = (y * width + x) * 4;
    totals[0] += data[i];
    totals[1] += data[i + 1];
    totals[2] += data[i + 2];
    count += 1;
  };
  const step = Math.max(1, Math.floor(width / 80));
  for (let x = 0; x < width; x += step) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += step) {
    push(0, y);
    push(width - 1, y);
  }
  return totals.map(total => total / Math.max(1, count));
}

// Remove the studio background by flood-filling from the image borders, so
// light print inside the garment is preserved.
function floodRemoveBackground(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const bg = sampleBorderColor(data, width, height);
  const threshold = 78;

  const matchesBg = (i) => (
    Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) < threshold
  );

  const visited = new Uint8Array(width * height);
  const queue = [];
  for (let x = 0; x < width; x++) {
    queue.push(x, (height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width, y * width + width - 1);
  }

  while (queue.length) {
    const index = queue.pop();
    if (visited[index]) continue;
    visited[index] = 1;
    const i = index * 4;
    if (!matchesBg(i)) continue;
    data[i + 3] = 0;
    const x = index % width;
    const y = (index / width) | 0;
    if (x > 0) queue.push(index - 1);
    if (x < width - 1) queue.push(index + 1);
    if (y > 0) queue.push(index - width);
    if (y < height - 1) queue.push(index + width);
  }

  ctx.putImageData(imageData, 0, 0);
}

// Product shots often show multiple views (front + back side by side).
// Find the largest opaque region and crop to it so one garment is used.
function largestOpaqueRegionBounds(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  const step = Math.max(2, Math.round(width / 130));
  const cols = Math.ceil(width / step);
  const rows = Math.ceil(height / step);
  const grid = new Uint8Array(cols * rows);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const i = (Math.min(height - 1, gy * step) * width + Math.min(width - 1, gx * step)) * 4;
      if (data[i + 3] > 16) grid[gy * cols + gx] = 1;
    }
  }

  const seen = new Uint8Array(cols * rows);
  let best = null;
  for (let start = 0; start < grid.length; start++) {
    if (!grid[start] || seen[start]) continue;
    let minX = cols;
    let minY = rows;
    let maxX = 0;
    let maxY = 0;
    let area = 0;
    const queue = [start];
    seen[start] = 1;
    while (queue.length) {
      const index = queue.pop();
      const gx = index % cols;
      const gy = (index / cols) | 0;
      area += 1;
      minX = Math.min(minX, gx);
      minY = Math.min(minY, gy);
      maxX = Math.max(maxX, gx);
      maxY = Math.max(maxY, gy);
      const neighbors = [index - 1, index + 1, index - cols, index + cols];
      neighbors.forEach((n, direction) => {
        if (n < 0 || n >= grid.length) return;
        if (direction === 0 && gx === 0) return;
        if (direction === 1 && gx === cols - 1) return;
        if (!grid[n] || seen[n]) return;
        seen[n] = 1;
        queue.push(n);
      });
    }
    if (!best || area > best.area) {
      best = { area, minX, minY, maxX, maxY };
    }
  }

  if (!best) return { x: 0, y: 0, width, height };
  const pad = step * 2;
  const x = clamp(best.minX * step - pad, 0, width);
  const y = clamp(best.minY * step - pad, 0, height);
  return {
    x,
    y,
    width: clamp((best.maxX + 1) * step + pad, 0, width) - x,
    height: clamp((best.maxY + 1) * step + pad, 0, height) - y,
  };
}

async function extractGarment(product) {
  const image = await loadImage(product.image);
  const maxSide = 900;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(2, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  floodRemoveBackground(canvas);
  const bounds = largestOpaqueRegionBounds(canvas);

  const cropped = document.createElement('canvas');
  cropped.width = Math.max(2, Math.round(bounds.width));
  cropped.height = Math.max(2, Math.round(bounds.height));
  cropped.getContext('2d').drawImage(
    canvas,
    bounds.x, bounds.y, bounds.width, bounds.height,
    0, 0, cropped.width, cropped.height
  );
  return cropped;
}

/* ————————————————— Placement from pose landmarks ————————————————— */

function posePlacement(landmarks, category, garmentAspect, width, height) {
  const sL = landmarks[LM.leftShoulder];
  const sR = landmarks[LM.rightShoulder];
  if (!visible(sL) || !visible(sR)) return null;

  const shoulderCenter = midpoint(sL, sR);
  const shoulderWidth = distance(sL, sR);
  if (shoulderWidth < width * 0.04) return null;

  // Tilt of the shoulder line, measured left-to-right across the image.
  const [pLeft, pRight] = sL.x <= sR.x ? [sL, sR] : [sR, sL];
  const angle = clamp(Math.atan2(pRight.y - pLeft.y, pRight.x - pLeft.x), -0.35, 0.35);

  const hL = landmarks[LM.leftHip];
  const hR = landmarks[LM.rightHip];
  const hipsVisible = visible(hL, 0.4) && visible(hR, 0.4);
  const hipCenter = hipsVisible ? midpoint(hL, hR) : { x: shoulderCenter.x, y: shoulderCenter.y + shoulderWidth * 1.35 };
  const torsoLength = Math.max(shoulderWidth * 0.9, hipCenter.y - shoulderCenter.y);

  if (category === 'bottoms') {
    const aL = landmarks[LM.leftAnkle];
    const aR = landmarks[LM.rightAnkle];
    const kL = landmarks[LM.leftKnee];
    const kR = landmarks[LM.rightKnee];
    let hemY;
    if (visible(aL, 0.3) && visible(aR, 0.3)) {
      hemY = midpoint(aL, aR).y;
    } else if (visible(kL, 0.3) && visible(kR, 0.3)) {
      hemY = hipCenter.y + (midpoint(kL, kR).y - hipCenter.y) * 2;
    } else {
      hemY = hipCenter.y + torsoLength * 2.1;
    }
    const garmentHeight = clamp((hemY - hipCenter.y) * 1.06, height * 0.2, height * 0.85);
    const garmentWidth = clamp(garmentHeight * garmentAspect, shoulderWidth * 0.7, width * 0.85);
    return {
      x: hipCenter.x - garmentWidth / 2,
      y: hipCenter.y - garmentHeight * 0.04,
      width: garmentWidth,
      height: garmentHeight,
      angle: angle * 0.4,
      type: 'bottom',
    };
  }

  if (category === 'accessories') {
    const eL = landmarks[LM.leftEar];
    const eR = landmarks[LM.rightEar];
    const nose = landmarks[LM.nose];
    const headCenter = visible(eL, 0.3) && visible(eR, 0.3) ? midpoint(eL, eR) : (visible(nose, 0.3) ? nose : null);
    const headWidth = visible(eL, 0.3) && visible(eR, 0.3) ? distance(eL, eR) * 1.9 : shoulderWidth * 0.55;
    if (!headCenter) return null;
    const garmentWidth = clamp(headWidth * 1.15, width * 0.08, width * 0.4);
    const garmentHeight = garmentWidth / garmentAspect;
    return {
      x: headCenter.x - garmentWidth / 2,
      y: headCenter.y - garmentHeight * 1.05,
      width: garmentWidth,
      height: garmentHeight,
      angle: angle * 0.5,
      type: 'accessory',
    };
  }

  if (category === 'fullFit') {
    const aL = landmarks[LM.leftAnkle];
    const aR = landmarks[LM.rightAnkle];
    const hemY = visible(aL, 0.3) && visible(aR, 0.3)
      ? midpoint(aL, aR).y
      : hipCenter.y + torsoLength * 2.05;
    const garmentHeight = clamp((hemY - shoulderCenter.y) * 1.08, height * 0.3, height * 0.9);
    const garmentWidth = clamp(garmentHeight * garmentAspect, shoulderWidth * 1.1, width * 0.9);
    return {
      x: shoulderCenter.x - garmentWidth / 2,
      y: shoulderCenter.y - garmentHeight * 0.06,
      width: garmentWidth,
      height: garmentHeight,
      angle,
      type: 'full fit',
    };
  }

  // Tops and outerwear: TWENTY3 pieces are cut oversized, so a worn garment
  // spans sleeve-to-sleeve roughly 1.75× the shoulder-joint distance, with
  // the collar sitting just above the shoulder line.
  const garmentWidth = clamp(shoulderWidth * 1.75, width * 0.16, width * 0.92);
  let garmentHeight = garmentWidth / garmentAspect;
  const maxHeight = torsoLength * 1.8;
  if (garmentHeight > maxHeight) garmentHeight = maxHeight;
  return {
    x: shoulderCenter.x - garmentWidth / 2,
    y: shoulderCenter.y - garmentHeight * 0.12,
    width: garmentWidth,
    height: garmentHeight,
    angle,
    type: 'top',
  };
}

/* ————————————————— Heuristic fallback (no pose model) ————————————————— */

function getCornerBackgroundColor(ctx, width, height) {
  const sampleSize = Math.max(16, Math.round(Math.min(width, height) * 0.06));
  const zones = [
    [0, 0],
    [width - sampleSize, 0],
    [0, height - sampleSize],
    [width - sampleSize, height - sampleSize],
  ];
  const totals = [0, 0, 0];
  let count = 0;
  zones.forEach(([x, y]) => {
    const data = ctx.getImageData(x, y, sampleSize, sampleSize).data;
    for (let i = 0; i < data.length; i += 16) {
      totals[0] += data[i];
      totals[1] += data[i + 1];
      totals[2] += data[i + 2];
      count += 1;
    }
  });
  return totals.map(total => total / Math.max(1, count));
}

function heuristicScan(ctx, canvas) {
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  const bg = getCornerBackgroundColor(ctx, width, height);
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let foreground = 0;
  let centerForeground = 0;
  let upperSkin = 0;
  const stride = Math.max(3, Math.round(Math.min(width, height) / 260));

  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const bgDistance = Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(b - bg[2]);
      const brightness = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);
      const skinLike = r > 72 && g > 38 && b > 25 && r > g * 1.05 && r > b * 1.12 && saturation > 18;
      const subjectPixel = bgDistance > 58 || (saturation > 42 && brightness > 32 && brightness < 235);

      if (subjectPixel) {
        foreground += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        if (x > width * 0.22 && x < width * 0.78) centerForeground += 1;
      }
      if (skinLike && y < height * 0.48) upperSkin += 1;
    }
  }

  const sampleCount = Math.ceil(width / stride) * Math.ceil(height / stride);
  const foregroundRatio = foreground / Math.max(1, sampleCount);
  const centerRatio = centerForeground / Math.max(1, foreground);
  const skinRatio = upperSkin / Math.max(1, sampleCount);
  const box = foreground > 0
    ? { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
    : { x: width * 0.2, y: height * 0.12, width: width * 0.6, height: height * 0.76 };

  const personLike = box.height > height * 0.42 && box.width > width * 0.16 && box.width < width * 0.92 && centerRatio > 0.34;
  const humanDetected = personLike && (skinRatio > 0.004 || foregroundRatio > 0.08);

  const centerX = box.x + box.width / 2;
  const shoulderWidth = clamp(box.width * 0.52, width * 0.2, width * 0.6);
  return {
    humanDetected,
    confidence: humanDetected
      ? Math.round(clamp(58 + foregroundRatio * 30 + skinRatio * 250, 58, 84))
      : Math.round(clamp((foregroundRatio + skinRatio * 8) * 100, 30, 55)),
    method: humanDetected ? 'person foreground scan' : 'centered fit framing',
    note: humanDetected
      ? undefined
      : 'No clear person detected — the piece was placed with centered framing. A clear, front-facing photo gives the most accurate fit.',
    shoulderCenter: { x: centerX, y: box.y + box.height * 0.18 },
    shoulderWidth,
    hipCenter: { x: centerX, y: box.y + box.height * 0.52 },
    hemY: box.y + box.height * 0.96,
  };
}

function heuristicPlacement(scan, category, garmentAspect, width, height) {
  const { shoulderCenter, shoulderWidth, hipCenter, hemY } = scan;
  if (category === 'bottoms') {
    const garmentHeight = clamp((hemY - hipCenter.y) * 1.05, height * 0.2, height * 0.8);
    const garmentWidth = clamp(garmentHeight * garmentAspect, shoulderWidth * 0.7, width * 0.8);
    return { x: hipCenter.x - garmentWidth / 2, y: hipCenter.y, width: garmentWidth, height: garmentHeight, angle: 0, type: 'bottom' };
  }
  if (category === 'accessories') {
    const garmentWidth = clamp(shoulderWidth * 0.62, width * 0.1, width * 0.35);
    const garmentHeight = garmentWidth / garmentAspect;
    return { x: shoulderCenter.x - garmentWidth / 2, y: clamp(shoulderCenter.y - shoulderWidth * 0.9, 0, height), width: garmentWidth, height: garmentHeight, angle: 0, type: 'accessory' };
  }
  if (category === 'fullFit') {
    const garmentHeight = clamp((hemY - shoulderCenter.y) * 1.05, height * 0.3, height * 0.88);
    const garmentWidth = clamp(garmentHeight * garmentAspect, shoulderWidth, width * 0.88);
    return { x: shoulderCenter.x - garmentWidth / 2, y: shoulderCenter.y - garmentHeight * 0.05, width: garmentWidth, height: garmentHeight, angle: 0, type: 'full fit' };
  }
  const garmentWidth = clamp(shoulderWidth * 1.5, width * 0.16, width * 0.85);
  const torsoLength = Math.max(shoulderWidth, hipCenter.y - shoulderCenter.y);
  const garmentHeight = Math.min(garmentWidth / garmentAspect, torsoLength * 1.7);
  return { x: shoulderCenter.x - garmentWidth / 2, y: shoulderCenter.y - garmentHeight * 0.09, width: garmentWidth, height: garmentHeight, angle: 0, type: 'top' };
}

/* ————————————————— Composition ————————————————— */

function drawGarment(ctx, garment, placement, canvasWidth) {
  const centerX = placement.x + placement.width / 2;
  const centerY = placement.y + placement.height / 2;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(placement.angle || 0);
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = canvasWidth * 0.02;
  ctx.shadowOffsetY = canvasWidth * 0.008;
  ctx.drawImage(garment, -placement.width / 2, -placement.height / 2, placement.width, placement.height);
  ctx.restore();
}

export async function createTryOnPreview(photoSrc, product) {
  const subjectImage = await loadImage(photoSrc);
  const maxSide = 1080;
  const baseScale = Math.min(1, maxSide / Math.max(subjectImage.naturalWidth, subjectImage.naturalHeight));
  const minScale = Math.max(1, 420 / Math.max(1, Math.min(subjectImage.naturalWidth, subjectImage.naturalHeight)));
  const scale = Math.min(1.6, Math.max(baseScale, Math.min(minScale, 1.35)));
  const width = Math.round(subjectImage.naturalWidth * scale);
  const height = Math.round(subjectImage.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(subjectImage, 0, 0, width, height);

  const category = inferFunctionalCategory(product);
  const garmentCategory = category === 'shoes' ? 'accessories' : category;

  const [garment, landmarks] = await Promise.all([
    extractGarment(product),
    detectPose(canvas),
  ]);
  const garmentAspect = garment.width / garment.height;

  let placement = null;
  let scanMeta;
  if (landmarks) {
    placement = posePlacement(landmarks, garmentCategory, garmentAspect, width, height);
  }
  if (placement) {
    const shoulderVisibility = Math.min(
      landmarks[LM.leftShoulder].visibility,
      landmarks[LM.rightShoulder].visibility
    );
    scanMeta = {
      humanDetected: true,
      confidence: Math.round(clamp(80 + shoulderVisibility * 18, 80, 98)),
      method: 'pose landmark scan',
    };
  } else {
    const scan = heuristicScan(ctx, canvas);
    placement = heuristicPlacement(scan, garmentCategory, garmentAspect, width, height);
    scanMeta = {
      humanDetected: scan.humanDetected,
      confidence: scan.confidence,
      method: scan.method,
      note: scan.note,
    };
  }

  // Gentle bottom vignette keeps the caption readable without a plate.
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.74, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  drawGarment(ctx, garment, placement, width);

  ctx.save();
  const captionSize = Math.max(13, width * 0.02);
  ctx.strokeStyle = 'rgba(244,240,232,0.85)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(26, height - 54);
  ctx.lineTo(58, height - 54);
  ctx.stroke();
  ctx.fillStyle = 'rgba(244,240,232,0.95)';
  ctx.font = `italic 400 ${captionSize}px "DM Serif Display", Georgia, serif`;
  ctx.fillText(`TWENTY3 Atelier — ${product.name.slice(0, 42)}`, 68, height - 48);
  ctx.font = `400 ${Math.max(9, width * 0.011)}px "DM Mono", monospace`;
  ctx.fillStyle = 'rgba(244,240,232,0.6)';
  ctx.fillText(`${scanMeta.method.toUpperCase()} · ${scanMeta.confidence}% FIT`, 68, height - 28);
  ctx.restore();

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    scan: {
      ...scanMeta,
      placement: { type: placement.type },
    },
  };
}

// Warm the pose model in the background so the first preview is fast.
export function preloadTryOnModel() {
  getPoseLandmarker().catch(() => {});
}
