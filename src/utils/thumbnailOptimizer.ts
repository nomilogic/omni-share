/**
 * Thumbnail optimization utilities
 * Resizes thumbnails to 1280x720 and compresses to < 2 MiB
 */

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MiB
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;

/**
 * Optimize thumbnail: resize to 1280x720 and compress to < 2 MiB
 */
export async function optimizeThumbnailBlob(blob: Blob): Promise<Blob> {
  try {
    // Check if already optimized
    if (blob.size < MAX_FILE_SIZE) {
      console.log(
        `📊 Thumbnail size ${(blob.size / 1024 / 1024).toFixed(2)} MiB is already within limit`
      );
    }

    // Convert blob to data URL for image loading
    const dataUrl = URL.createObjectURL(blob);
    
    // Resize and compress
    const optimizedBlob = await compressImage(
      dataUrl,
      TARGET_WIDTH,
      TARGET_HEIGHT,
      MAX_FILE_SIZE
    );
    
    URL.revokeObjectURL(dataUrl);
    return optimizedBlob;
  } catch (error) {
    console.warn("⚠️ Failed to optimize thumbnail, using original:", error);
    return blob;
  }
}

/**
 * Compress image to fit file size and resolution requirements
 */
async function compressImage(
  imageUrl: string,
  targetWidth: number,
  targetHeight: number,
  maxFileSize: number,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Draw image to fit canvas (maintain aspect ratio with letterboxing)
      const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
      const x = (targetWidth - img.width * scale) / 2;
      const y = (targetHeight - img.height * scale) / 2;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      let currentQuality = quality;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }

            if (blob.size <= maxFileSize) {
              console.log(
                `✅ Thumbnail compressed to ${targetWidth}x${targetHeight}, quality: ${(currentQuality * 100).toFixed(0)}%, size: ${(blob.size / 1024 / 1024).toFixed(2)} MiB`
              );
              resolve(blob);
            } else if (currentQuality > 0.3) {
              // Reduce quality and try again
              currentQuality -= 0.1;
              tryCompress();
            } else {
              reject(
                new Error(
                  `Could not compress thumbnail below ${(maxFileSize / 1024 / 1024).toFixed(1)} MiB`
                )
              );
            }
          },
          "image/jpeg",
          currentQuality
        );
      };

      tryCompress();
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}
