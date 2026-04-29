import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-[#d4af8a] to-[#c49a6e] text-[#1a0a32] hover:from-[#e0bfa0] hover:to-[#d4af8a] shadow-lg hover:shadow-xl font-semibold',
        destructive:
          'bg-red-600/80 text-white hover:bg-red-700/90 border border-red-500/50',
        outline:
          'border-2 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-[#d4af8a]/50',
        secondary:
          'bg-white/10 text-white hover:bg-white/20 border border-white/20',
        ghost: 'text-white hover:bg-white/10',
        link: 'text-[#d4af8a] underline-offset-4 hover:underline hover:text-[#e0bfa0]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
