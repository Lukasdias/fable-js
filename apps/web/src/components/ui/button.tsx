'use client'

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot as SlotPrimitive } from 'radix-ui'
import * as React from 'react'

const buttonVariants = cva(
  // Base styles - rounded, playful, with smooth transitions
  `inline-flex items-center justify-center gap-2 whitespace-nowrap 
   font-semibold text-sm tracking-wide
   rounded-xl
   ring-offset-background 
   transition-all duration-200
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
   disabled:pointer-events-none disabled:opacity-50
   active:scale-[0.98]
   select-none`,
  {
    variants: {
      variant: {
        // Primary - warm coral gradient with glow
        default: `
          bg-gradient-to-br from-primary to-primary/80
          text-primary-foreground 
          shadow-lg shadow-primary/25
          hover:shadow-xl hover:shadow-primary/30
          hover:-translate-y-0.5
          active:shadow-md
        `,
        // Secondary - soft lavender
        secondary: `
          bg-gradient-to-br from-secondary to-secondary/80
          text-secondary-foreground
          shadow-lg shadow-secondary/25
          hover:shadow-xl hover:shadow-secondary/30
          hover:-translate-y-0.5
          active:shadow-md
        `,
        // Outline - bordered with fill on hover
        outline: `
          border-2 border-primary/30
          bg-transparent
          text-primary
          hover:bg-primary/10
          hover:border-primary/50
          hover:-translate-y-0.5
        `,
        // Ghost - subtle but delightful
        ghost: `
          bg-transparent
          text-foreground/70
          hover:bg-muted
          hover:text-foreground
          hover:-translate-y-0.5
        `,
        // Destructive - friendly but serious
        destructive: `
          bg-gradient-to-br from-destructive to-destructive/80
          text-destructive-foreground
          shadow-lg shadow-destructive/25
          hover:shadow-xl hover:shadow-destructive/30
          hover:-translate-y-0.5
          active:shadow-md
        `,
        // Link - underline animation
        link: `
          text-primary 
          underline-offset-4 
          hover:underline
          p-0 h-auto
        `,
        // Soft - muted background, nice for secondary actions
        soft: `
          bg-muted
          text-muted-foreground
          hover:bg-muted/80
          hover:text-foreground
          hover:-translate-y-0.5
        `,
        // Glass - frosted glass effect
        glass: `
          bg-card/60 backdrop-blur-md
          border border-border/50
          text-foreground
          shadow-lg
          hover:bg-card/80
          hover:shadow-xl
          hover:-translate-y-0.5
        `,
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-4 py-2 text-xs rounded-lg',
        lg: 'h-12 px-8 py-3 text-base rounded-2xl',
        xl: 'h-14 px-10 py-4 text-lg rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Optional loading state */
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp  = asChild ? SlotPrimitive.Slot : 'button'
    
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            children
          )}
        </Comp>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
