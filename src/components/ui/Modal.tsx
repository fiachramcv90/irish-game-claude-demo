import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../../lib/utils';
import type { ModalProps } from '../../types';

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-dark-gray/50 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Modal */}
      <div
        className={cn(
          'relative mx-4 w-full max-w-md transform overflow-hidden rounded-child bg-cream-white p-6 shadow-xl transition-all',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2'
        )}
        role='dialog'
        aria-modal='true'
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {title && (
          <div className='mb-4 flex items-center justify-between'>
            <h2
              id='modal-title'
              className='font-child-friendly text-child-2xl font-bold text-dark-gray'
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-full text-dark-gray/70 hover:bg-soft-gray hover:text-dark-gray focus:outline-none focus:ring-2 focus:ring-irish-green'
              aria-label='Close modal'
            >
              ×
            </button>
          </div>
        )}

        {/* Content */}
        <div className='text-dark-gray'>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export { Modal };
