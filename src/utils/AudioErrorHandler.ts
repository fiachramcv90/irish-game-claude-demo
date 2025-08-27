/**
 * AudioErrorHandler - Centralized error handling for audio operations
 * Provides categorization, recovery strategies, and user-friendly error management
 */

import { AudioErrorType, AudioErrorSeverity } from '../types/audio-errors';
import type {
  AudioError,
  AudioErrorHandlerConfig,
  AudioRecoveryOptions,
} from '../types/audio-errors';

const DEFAULT_CONFIG: AudioErrorHandlerConfig = {
  enableRetry: true,
  enableFallback: true,
  enableUserNotification: true,
  enableErrorReporting: true,
  recoveryOptions: {
    maxRetries: 3,
    retryDelay: 1000,
    fallbackStrategy: 'silent',
    showUserMessage: true,
  },
};

export class AudioErrorHandler {
  private config: AudioErrorHandlerConfig;
  private errorLog: AudioError[] = [];

  constructor(config: Partial<AudioErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create a categorized audio error from a raw error
   */
  createError(
    rawError: Error | string,
    context?: {
      audioId?: string;
      filePath?: string;
      operation?: string;
    }
  ): AudioError {
    const errorMessage =
      typeof rawError === 'string' ? rawError : rawError.message;
    const errorStack = rawError instanceof Error ? rawError.stack : undefined;

    const audioError: AudioError = {
      type: this.categorizeError(errorMessage),
      severity: this.determineSeverity(errorMessage),
      message: errorMessage,
      context: {
        ...context,
        browserInfo: this.getBrowserInfo(),
        timestamp: Date.now(),
        stack: errorStack,
      },
      userMessage: this.getUserFriendlyMessage(errorMessage),
      recoverable: this.isRecoverable(errorMessage),
      retryable: this.isRetryable(errorMessage),
    };

    // Log the error
    this.logError(audioError);

    return audioError;
  }

  /**
   * Categorize error based on message content
   */
  private categorizeError(message: string): AudioErrorType {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('manifest') && lowerMessage.includes('failed')) {
      return AudioErrorType.MANIFEST_FETCH_FAILED;
    }
    if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
      return AudioErrorType.AUDIO_FILE_NOT_FOUND;
    }
    if (lowerMessage.includes('timeout')) {
      return AudioErrorType.LOAD_TIMEOUT;
    }
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return AudioErrorType.NETWORK_ERROR;
    }
    if (lowerMessage.includes('format') || lowerMessage.includes('mime')) {
      return AudioErrorType.UNSUPPORTED_FORMAT;
    }
    if (lowerMessage.includes('decode') || lowerMessage.includes('corrupt')) {
      return AudioErrorType.DECODE_ERROR;
    }
    if (
      lowerMessage.includes('permission') ||
      lowerMessage.includes('denied')
    ) {
      return AudioErrorType.PERMISSION_DENIED;
    }
    if (lowerMessage.includes('cors')) {
      return AudioErrorType.CORS_ERROR;
    }
    if (
      lowerMessage.includes('audio context') ||
      lowerMessage.includes('webaudio')
    ) {
      return AudioErrorType.AUDIO_CONTEXT_FAILED;
    }
    if (lowerMessage.includes('codec')) {
      return AudioErrorType.CODEC_ERROR;
    }

    return AudioErrorType.UNKNOWN_ERROR;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(message: string): AudioErrorSeverity {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('manifest') ||
      lowerMessage.includes('audio context')
    ) {
      return AudioErrorSeverity.CRITICAL;
    }
    if (lowerMessage.includes('permission') || lowerMessage.includes('cors')) {
      return AudioErrorSeverity.HIGH;
    }
    if (lowerMessage.includes('not found') || lowerMessage.includes('format')) {
      return AudioErrorSeverity.MEDIUM;
    }

    return AudioErrorSeverity.LOW;
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('manifest')) {
      return 'Unable to load audio settings. Some sounds may not work properly.';
    }
    if (lowerMessage.includes('not found')) {
      return 'Audio file not available. Sound will be skipped.';
    }
    if (lowerMessage.includes('timeout')) {
      return 'Audio is taking longer than usual to load.';
    }
    if (lowerMessage.includes('network')) {
      return 'Network connection issue. Check your internet connection.';
    }
    if (
      lowerMessage.includes('format') ||
      lowerMessage.includes('unsupported')
    ) {
      return 'Audio format not supported by your browser.';
    }
    if (lowerMessage.includes('permission')) {
      return 'Audio permission required. Please allow audio playback.';
    }

    return 'Audio temporarily unavailable.';
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // These errors are generally not recoverable
    const unrecoverablePatterns = [
      'permission denied',
      'cors',
      'unsupported format',
      'audio context failed',
    ];

    return !unrecoverablePatterns.some(pattern =>
      lowerMessage.includes(pattern)
    );
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // These errors might succeed on retry
    const retryablePatterns = [
      'timeout',
      'network',
      'fetch failed',
      'load failed',
    ];

    return retryablePatterns.some(pattern => lowerMessage.includes(pattern));
  }

  /**
   * Get browser information for debugging
   */
  private getBrowserInfo(): string {
    if (typeof navigator !== 'undefined') {
      return `${navigator.userAgent} | Audio: ${navigator.mediaDevices ? 'supported' : 'not supported'}`;
    }
    return 'Unknown browser';
  }

  /**
   * Log error to internal log and external reporting if enabled
   */
  private logError(error: AudioError): void {
    this.errorLog.push(error);

    // Keep only last 50 errors in memory
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }

    // Console logging with appropriate level
    const logLevel =
      error.severity === AudioErrorSeverity.CRITICAL
        ? 'error'
        : error.severity === AudioErrorSeverity.HIGH
          ? 'error'
          : error.severity === AudioErrorSeverity.MEDIUM
            ? 'warn'
            : 'info';

    console[logLevel](`🎵 Audio Error [${error.type}]:`, {
      message: error.message,
      severity: error.severity,
      context: error.context,
      userMessage: error.userMessage,
    });

    // External error reporting could be added here
    if (this.config.enableErrorReporting) {
      this.reportError(error);
    }
  }

  /**
   * External error reporting (placeholder for analytics/monitoring)
   */
  private reportError(error: AudioError): void {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll just track it locally
    if (typeof window !== 'undefined') {
      const globalWindow = window as Window & {
        audioErrorStats?: Record<string, number>;
      };
      globalWindow.audioErrorStats = globalWindow.audioErrorStats || {};
      const stats = globalWindow.audioErrorStats;
      stats[error.type] = (stats[error.type] || 0) + 1;
    }
  }

  /**
   * Get recovery options for an error
   */
  getRecoveryOptions(error: AudioError): AudioRecoveryOptions {
    const options = { ...this.config.recoveryOptions };

    // Adjust options based on error type
    switch (error.type) {
      case AudioErrorType.MANIFEST_FETCH_FAILED:
        options.maxRetries = 5;
        options.retryDelay = 2000;
        break;
      case AudioErrorType.LOAD_TIMEOUT:
        options.maxRetries = 2;
        options.retryDelay = 500;
        break;
      case AudioErrorType.NETWORK_ERROR:
        options.maxRetries = 3;
        options.retryDelay = 1500;
        break;
      case AudioErrorType.PERMISSION_DENIED:
      case AudioErrorType.UNSUPPORTED_FORMAT:
        options.maxRetries = 0; // Don't retry these
        break;
    }

    return options;
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const errorTypes: { [key: string]: number } = {};
    const severityCount: { [key: string]: number } = {};

    this.errorLog.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
      severityCount[error.severity] = (severityCount[error.severity] || 0) + 1;
    });

    return {
      totalErrors: this.errorLog.length,
      errorTypes,
      severityCount,
      recentErrors: this.errorLog.slice(-10),
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Create singleton instance
export const audioErrorHandler = new AudioErrorHandler();
