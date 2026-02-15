import QRCode from 'qrcode';
import type { QRCodeOptions, QRCodeResult } from '../types';

/**
 * Custom error class for QR code generation failures.
 */
export class QRGenerationError extends Error {
  readonly originalCause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'QRGenerationError';
    this.originalCause = cause;
  }
}

/**
 * Validates that the input text is non-empty and within length limits.
 * Throws QRGenerationError if validation fails.
 */
function validateInput(text: string): void {
  if (!text || text.trim().length === 0) {
    throw new QRGenerationError('Text input is required and cannot be empty.');
  }

  if (text.length > 4096) {
    throw new QRGenerationError(
      `Text exceeds maximum length of 4096 characters (got ${text.length}).`
    );
  }
}

/**
 * Generates a QR code as a PNG data URL from the given options.
 *
 * @param options - QR code generation options
 * @returns Promise resolving to a QRCodeResult with the data URL and dimensions
 * @throws QRGenerationError if input validation or generation fails
 */
export async function generateQRCode(
  options: QRCodeOptions
): Promise<QRCodeResult> {
  const {
    text,
    size,
    margin,
    foregroundColor,
    backgroundColor,
    errorCorrectionLevel,
  } = options;

  validateInput(text);

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
    });

    return {
      dataUrl,
      width: size,
      height: size,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown generation failure';
    throw new QRGenerationError(`QR code generation failed: ${message}`, error);
  }
}
