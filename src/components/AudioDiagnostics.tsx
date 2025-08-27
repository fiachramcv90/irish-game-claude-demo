import { useEffect, useState } from 'react';

import type { AudioError } from '../types/audio-errors';
import { audioManifestManager } from '../utils/AudioManifestManager';

interface AudioDiagnosticsProps {
  onClose: () => void;
}

export function AudioDiagnostics({ onClose }: AudioDiagnosticsProps) {
  const [stats, setStats] = useState<ReturnType<
    typeof audioManifestManager.getLoadingStats
  > | null>(null);
  const [retryingFiles, setRetryingFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    updateStats();
  }, []);

  const updateStats = () => {
    setStats(audioManifestManager.getLoadingStats());
  };

  const handleRetryFile = async (fileId: string) => {
    setRetryingFiles(prev => new Set(prev).add(fileId));
    try {
      await audioManifestManager.retryFailedFile(fileId);
    } finally {
      setRetryingFiles(prev => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
      updateStats();
    }
  };

  const handleRetryAll = async () => {
    if (!stats?.failedFiles?.length) return;

    setRetryingFiles(new Set(stats.failedFiles));
    try {
      const result = await audioManifestManager.retryAllFailedFiles();
      console.log('Retry all completed:', result);
    } finally {
      setRetryingFiles(new Set());
      updateStats();
    }
  };

  const getErrorDetails = (fileId: string): AudioError | null => {
    return audioManifestManager.getFileError(fileId);
  };

  if (!stats) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
        <div className='rounded-child bg-white p-6 max-w-md'>
          <div className='text-center'>
            <div className='text-4xl mb-4'>🎵</div>
            <p className='font-child-friendly'>Loading audio diagnostics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
      <div className='rounded-child bg-white max-w-2xl max-h-full overflow-y-auto'>
        <div className='p-6'>
          {/* Header */}
          <div className='flex justify-between items-center mb-6'>
            <div>
              <h2 className='font-child-friendly text-child-2xl font-bold text-irish-green'>
                🩺 Audio Diagnostics
              </h2>
              <p className='font-child-friendly text-dark-gray'>
                System status and error information
              </p>
            </div>
            <button
              onClick={onClose}
              className='rounded-child bg-soft-gray px-4 py-2 font-child-friendly text-dark-gray hover:bg-light-green transition-colors'
            >
              ✕ Close
            </button>
          </div>

          {/* Overview Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
            <div className='rounded-child bg-green-50 p-4 text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {stats.totalLoaded}
              </div>
              <div className='font-child-friendly text-child-sm text-green-700'>
                Files Loaded
              </div>
            </div>
            <div className='rounded-child bg-red-50 p-4 text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {stats.totalFailed}
              </div>
              <div className='font-child-friendly text-child-sm text-red-700'>
                Files Failed
              </div>
            </div>
            <div className='rounded-child bg-blue-50 p-4 text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.cacheSize}
              </div>
              <div className='font-child-friendly text-child-sm text-blue-700'>
                Cache Size
              </div>
            </div>
          </div>

          {/* Error Statistics */}
          {stats.errorStats.totalErrors > 0 && (
            <div className='mb-6'>
              <h3 className='font-child-friendly text-child-xl font-bold mb-4 text-dark-gray'>
                📊 Error Statistics
              </h3>
              <div className='rounded-child bg-yellow-50 p-4'>
                <div className='mb-3'>
                  <span className='font-semibold'>Total Errors: </span>
                  {stats.errorStats.totalErrors}
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
                  {Object.entries(stats.errorStats.errorTypes).map(
                    ([type, count]) => (
                      <div key={type} className='flex justify-between'>
                        <span>{type.replace(/_/g, ' ')}:</span>
                        <span className='font-semibold'>{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Failed Files */}
          {stats.failedFiles.length > 0 && (
            <div className='mb-6'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='font-child-friendly text-child-xl font-bold text-dark-gray'>
                  ❌ Failed Files
                </h3>
                <button
                  onClick={handleRetryAll}
                  disabled={retryingFiles.size > 0}
                  className='rounded-child bg-irish-green px-4 py-2 font-child-friendly text-cream-white hover:bg-green-600 transition-colors disabled:opacity-50'
                >
                  🔄 Retry All
                </button>
              </div>

              <div className='space-y-2'>
                {stats.failedFiles.map((fileId: string) => {
                  const error = getErrorDetails(fileId);
                  const isRetrying = retryingFiles.has(fileId);

                  return (
                    <div
                      key={fileId}
                      className='rounded-child border p-3 bg-red-50'
                    >
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <div className='font-semibold text-red-800'>
                            {fileId}
                          </div>
                          {error && (
                            <div className='text-sm text-red-600 mt-1'>
                              {error.userMessage || error.message}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRetryFile(fileId)}
                          disabled={isRetrying}
                          className='rounded-child bg-white px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50'
                        >
                          {isRetrying ? '⏳' : '🔄'} Retry
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Errors */}
          {stats.errorStats.recentErrors.length > 0 && (
            <div className='mb-6'>
              <h3 className='font-child-friendly text-child-xl font-bold mb-4 text-dark-gray'>
                📝 Recent Errors
              </h3>
              <div className='space-y-2'>
                {stats.errorStats.recentErrors.map(
                  (error: AudioError, index: number) => (
                    <div
                      key={index}
                      className='rounded-child border p-3 bg-gray-50'
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <span className='font-semibold text-sm'>
                          {error.type.replace(/_/g, ' ')}
                        </span>
                        <span className='text-xs text-gray-500'>
                          {error.context?.timestamp
                            ? new Date(
                                error.context.timestamp
                              ).toLocaleTimeString()
                            : 'Unknown'}
                        </span>
                      </div>
                      <div className='text-sm text-gray-700'>
                        {error.message}
                      </div>
                      {error.context?.audioId && (
                        <div className='text-xs text-gray-500 mt-1'>
                          File: {error.context.audioId}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Browser Compatibility */}
          <div className='rounded-child bg-blue-50 p-4'>
            <h3 className='font-child-friendly text-child-lg font-bold mb-2 text-blue-800'>
              🌐 Browser Compatibility
            </h3>
            <div className='text-sm text-blue-700 space-y-1'>
              <div>
                Audio Context:{' '}
                {typeof AudioContext !== 'undefined'
                  ? '✅ Supported'
                  : '❌ Not Supported'}
              </div>
              <div>
                Media Devices:{' '}
                {navigator.mediaDevices ? '✅ Supported' : '❌ Not Supported'}
              </div>
              <div>
                Web Audio API:{' '}
                {typeof (window as { webkitAudioContext?: unknown })
                  .webkitAudioContext !== 'undefined' ||
                typeof AudioContext !== 'undefined'
                  ? '✅ Supported'
                  : '❌ Not Supported'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
