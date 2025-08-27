import { useEffect, useState } from 'react';

import type { AudioError } from '../types/audio-errors';

interface AudioErrorToastProps {
  error: AudioError;
  duration?: number; // milliseconds
  onClose: () => void;
}

export function AudioErrorToast({
  error,
  duration = 5000,
  onClose,
}: AudioErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    if (duration === 0) return; // Don't auto-close if duration is 0

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow fade animation to complete
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const getSeverityStyles = () => {
    switch (error.severity) {
      case 'CRITICAL':
        return 'bg-red-500 border-red-600';
      case 'HIGH':
        return 'bg-orange-500 border-orange-600';
      case 'MEDIUM':
        return 'bg-yellow-500 border-yellow-600';
      case 'LOW':
      default:
        return 'bg-blue-500 border-blue-600';
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

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm rounded-child border-2 p-4 text-white shadow-lg
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getSeverityStyles()}
      `}
      role='alert'
    >
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0 text-xl'>{getSeverityIcon()}</div>
        <div className='flex-1 min-w-0'>
          <p className='font-child-friendly text-child-sm font-semibold mb-1'>
            Audio Issue
          </p>
          <p className='font-child-friendly text-child-xs opacity-90 break-words'>
            {error.userMessage || error.message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className='flex-shrink-0 rounded-full p-1 hover:bg-white hover:bg-opacity-20 transition-colors'
        >
          <span className='sr-only'>Close</span>✕
        </button>
      </div>

      {duration > 0 && (
        <div className='mt-2 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden'>
          <div
            className='h-full bg-white transition-all duration-100 ease-linear'
            style={{
              width: `${(timeRemaining / duration) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
