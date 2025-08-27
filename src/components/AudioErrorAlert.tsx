import type { AudioError } from '../types/audio-errors';

interface AudioErrorAlertProps {
  error: AudioError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function AudioErrorAlert({
  error,
  onRetry,
  onDismiss,
  className = '',
}: AudioErrorAlertProps) {
  const getSeverityStyles = () => {
    switch (error.severity) {
      case 'CRITICAL':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'HIGH':
        return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'MEDIUM':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'LOW':
      default:
        return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'CRITICAL':
        return '🚨';
      case 'HIGH':
        return '⚠️';
      case 'MEDIUM':
        return '⚡';
      case 'LOW':
      default:
        return 'ℹ️';
    }
  };

  const canRetry = error.retryable && onRetry;

  return (
    <div
      className={`rounded-child border-2 p-4 ${getSeverityStyles()} ${className}`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-3'>
          <div className='flex-shrink-0 text-2xl'>{getSeverityIcon()}</div>
          <div className='flex-1'>
            <h3 className='font-child-friendly text-child-lg font-bold mb-2'>
              Audio Issue
            </h3>
            <p className='font-child-friendly text-child-base mb-2'>
              {error.userMessage || error.message}
            </p>
            {error.context?.audioId && (
              <p className='font-child-friendly text-child-sm opacity-75'>
                Affected audio: {error.context.audioId}
              </p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {canRetry && (
            <button
              onClick={onRetry}
              className='rounded-child bg-white px-3 py-1 font-child-friendly text-child-sm font-semibold shadow-md hover:shadow-lg transition-shadow'
            >
              🔄 Try Again
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className='rounded-child bg-white px-2 py-1 font-child-friendly text-child-sm hover:bg-gray-50 transition-colors'
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
