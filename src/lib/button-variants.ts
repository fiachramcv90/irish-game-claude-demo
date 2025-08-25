import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-child text-child-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-irish-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-irish-green text-cream-white hover:bg-irish-green/90',
        secondary: 'bg-warm-orange text-cream-white hover:bg-warm-orange/90',
        outline:
          'border-2 border-irish-green bg-transparent text-irish-green hover:bg-irish-green hover:text-cream-white',
        ghost: 'hover:bg-light-green text-irish-green',
        success: 'bg-mint-green text-dark-gray hover:bg-mint-green/90',
        warning: 'bg-bright-yellow text-dark-gray hover:bg-bright-yellow/90',
        danger: 'bg-coral-pink text-cream-white hover:bg-coral-pink/90',
      },
      size: {
        default: 'h-touch-target px-6 py-3',
        sm: 'h-9 px-3 text-base',
        lg: 'h-12 px-8 text-child-2xl',
        icon: 'h-touch-target w-touch-target',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
