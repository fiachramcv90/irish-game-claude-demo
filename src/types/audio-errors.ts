/**
 * Comprehensive Audio Error Handling Types
 */

export const AudioErrorType = {
  // Network errors
  MANIFEST_FETCH_FAILED: 'MANIFEST_FETCH_FAILED',
  AUDIO_FILE_NOT_FOUND: 'AUDIO_FILE_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',

  // Format/Browser compatibility errors
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  CODEC_ERROR: 'CODEC_ERROR',

  // Loading/Timeout errors
  LOAD_TIMEOUT: 'LOAD_TIMEOUT',
  DECODE_ERROR: 'DECODE_ERROR',

  // Permission/Security errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  CORS_ERROR: 'CORS_ERROR',

  // Device/Hardware errors
  AUDIO_CONTEXT_FAILED: 'AUDIO_CONTEXT_FAILED',
  NO_AUDIO_DEVICE: 'NO_AUDIO_DEVICE',

  // Validation errors
  INVALID_MANIFEST: 'INVALID_MANIFEST',
  MISSING_AUDIO_ID: 'MISSING_AUDIO_ID',

  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const AudioErrorSeverity = {
  LOW: 'LOW', // User can continue, feature degraded
  MEDIUM: 'MEDIUM', // Some functionality affected
  HIGH: 'HIGH', // Major functionality broken
  CRITICAL: 'CRITICAL', // App unusable
} as const;

export type AudioErrorType =
  (typeof AudioErrorType)[keyof typeof AudioErrorType];
export type AudioErrorSeverity =
  (typeof AudioErrorSeverity)[keyof typeof AudioErrorSeverity];

export interface AudioError {
  type: AudioErrorType;
  severity: AudioErrorSeverity;
  message: string;
  context?: {
    audioId?: string;
    filePath?: string;
    browserInfo?: string;
    timestamp?: number;
    stack?: string;
  };
  userMessage?: string;
  recoverable: boolean;
  retryable: boolean;
}

export interface AudioErrorState {
  hasError: boolean;
  errors: AudioError[];
  lastError?: AudioError;
  retryCount: number;
  isRecovering: boolean;
}

export interface AudioRecoveryOptions {
  maxRetries: number;
  retryDelay: number;
  fallbackStrategy: 'silent' | 'placeholder' | 'skip';
  showUserMessage: boolean;
}

export interface AudioErrorHandlerConfig {
  enableRetry: boolean;
  enableFallback: boolean;
  enableUserNotification: boolean;
  enableErrorReporting: boolean;
  recoveryOptions: AudioRecoveryOptions;
}
