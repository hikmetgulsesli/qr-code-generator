/**
 * Downloads a QR code data URL as a PNG file.
 *
 * @param dataUrl - The base64 PNG data URL from QR code generation
 * @param filename - Optional custom filename (defaults to qr-code-YYYYMMDD-HHMMSS.png)
 * @throws Error if download fails
 */
export function downloadQRCode(
  dataUrl: string,
  filename?: string
): void {
  // Validate data URL
  if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
    throw new Error('Invalid PNG data URL provided');
  }

  // Generate default filename with timestamp if not provided
  const finalFilename = filename ?? generateDefaultFilename();

  try {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = finalFilename;

    // Append to body, click, and remove (required for Firefox)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw new Error(
      `Failed to download QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generates a default filename with timestamp.
 * Format: qr-code-YYYYMMDD-HHMMSS.png
 */
function generateDefaultFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `qr-code-${year}${month}${day}-${hours}${minutes}${seconds}.png`;
}

/**
 * Converts a data URL to a Blob.
 * Useful for advanced download scenarios or File API operations.
 *
 * @param dataUrl - The base64 data URL
 * @returns Blob representing the image
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  if (!dataUrl.startsWith('data:')) {
    throw new Error('Invalid data URL format');
  }

  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid data URL structure');
  }

  const header = parts[0];
  const base64 = parts[1];

  // Extract mime type from header (e.g., "data:image/png;base64")
  const mimeMatch = header.match(/data:([^;]+)/);
  const mime = mimeMatch?.[1] ?? 'image/png';

  // Decode base64 to binary
  const byteString = atob(base64);
  const byteArray = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([byteArray], { type: mime });
}
