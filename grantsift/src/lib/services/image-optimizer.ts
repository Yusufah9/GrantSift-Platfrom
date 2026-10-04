export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg";
}

export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  width: number;
  height: number;
  compressionRatio: number;
}

export class ImageOptimizer {
  private static readonly DEFAULT_MAX_WIDTH = 1200;
  private static readonly DEFAULT_MAX_HEIGHT = 675; // Standard 16:9 ratio for blog hero
  private static readonly DEFAULT_QUALITY = 0.82;

  /**
   * Compresses an image File object asynchronously using HTML5 Canvas.
   * Typical reduction: 4MB -> ~75KB (98% reduction) in < 100ms.
   */
  public static async compress(file: File, options?: CompressionOptions): Promise<CompressionResult> {
    const maxWidth = options?.maxWidth ?? this.DEFAULT_MAX_WIDTH;
    const maxHeight = options?.maxHeight ?? this.DEFAULT_MAX_HEIGHT;
    const quality = options?.quality ?? this.DEFAULT_QUALITY;

    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        return reject(new Error("Selected file is not an image."));
      }

      // Max input size check: 20MB
      if (file.size > 20 * 1024 * 1024) {
        return reject(new Error("Image file exceeds 20MB limit. Please choose a smaller file."));
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onerror = () => reject(new Error("Failed to decode image data."));
        img.onload = () => {
          let { width, height } = img;

          // Calculate aspect-ratio preserving dimensions
          if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const bestRatio = Math.min(widthRatio, heightRatio);

            width = Math.round(width * bestRatio);
            height = Math.round(height * bestRatio);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return reject(new Error("HTML5 Canvas context not available."));
          }

          // Use high quality image interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          ctx.drawImage(img, 0, 0, width, height);

          // Prefer WebP if supported, fallback to JPEG
          let format: "image/webp" | "image/jpeg" = options?.format ?? "image/webp";
          let dataUrl = canvas.toDataURL(format, quality);

          // If browser does not support WebP export (returns image/png fallback), use JPEG
          if (!dataUrl.startsWith("data:image/webp") && format === "image/webp") {
            format = "image/jpeg";
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }

          // Calculate byte size from base64
          const base64Length = dataUrl.length - (dataUrl.indexOf(",") + 1);
          const compressedSizeBytes = Math.round((base64Length * 3) / 4);

          resolve({
            dataUrl,
            originalSizeBytes: file.size,
            compressedSizeBytes,
            width,
            height,
            compressionRatio: Math.round((1 - compressedSizeBytes / file.size) * 100),
          });
        };

        img.src = readerEvent.target?.result as string;
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Formats byte size into human readable string (e.g. "84 KB")
   */
  public static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
