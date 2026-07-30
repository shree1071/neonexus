/**
 * capture.ts
 * Helper functions for capturing the active browser tab via getDisplayMedia
 * and extracting base64 image frames for Gemma analysis.
 */

export async function startScreenCapture(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "browser",
      },
      audio: false,
    });
    return stream;
  } catch (err) {
    console.error("Error starting screen capture:", err);
    return null;
  }
}

export function captureFrameAsBase64(videoElement: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    // Return base64 JPEG string (lighter than PNG for network transport)
    return canvas.toDataURL("image/jpeg", 0.8);
  } catch (err) {
    console.error("Error capturing video frame:", err);
    return null;
  }
}
