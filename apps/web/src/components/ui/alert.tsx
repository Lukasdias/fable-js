'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  // Base styles - rounded, friendly, with nice spacing
  `relative w-full rounded-2xl p-4 
   border
   flex gap-4 items-start
   animate-slide-up`,
  {
    variants: {
      variant: {
        // Default - neutral info
        default: `
          bg-muted/50 
          border-border
          text-foreground
          [&>svg]:text-muted-foreground
        `,
        // Info - soft blue
        info: `
          bg-info/10
          border-info/20
          text-info
          [&>svg]:text-info
        `,
        // Success - friendly green
        success: `
          bg-success/10
          border-success/20
          text-success
          [&>svg]:text-success
        `,
        // Warning - warm amber
        warning: `
          bg-warning/10
          border-warning/20
          text-warning
          [&>svg]:text-warning
        `,
        // Destructive - soft red
        destructive: `
          bg-destructive/10
          border-destructive/20
          text-destructive
          [&>svg]:text-destructive
        `,
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// Icon container styles
const iconContainerVariants = cva(
  'shrink-0 rounded-xl p-2',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        info: 'bg-info/15',
        success: 'bg-success/15',
        warning: 'bg-warning/15',
        destructive: 'bg-destructive/15',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Optional icon to display */
  icon?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon && (
        <div className={cn(iconContainerVariants({ variant }))}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
)
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      'font-semibold leading-tight tracking-tight mb-1',
      'font-display',
      className
    )}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'text-sm opacity-90 leading-relaxed',
      '[&_p]:leading-relaxed',
      className
    )}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
