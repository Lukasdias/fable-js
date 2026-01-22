'use client'

import * as React from 'react'
import { Separator as SeparatorComponent } from 'radix-ui'
import { cn } from '@/lib/utils'

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorComponent.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorComponent.Root> & {
    /** Optional gradient variant */
    variant?: 'default' | 'gradient' | 'dashed'
  }
>(
  (
    {
      className,
      orientation = 'horizontal',
      decorative = true,
      variant = 'default',
      ...props
    },
    ref
  ) => (
    <SeparatorComponent.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0',
        // Base styles by orientation
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        // Variant styles
        variant === 'default' && 'bg-border/50',
        variant === 'gradient' &&
          'bg-gradient-to-r from-transparent via-border to-transparent',
        variant === 'dashed' &&
          'border-0 bg-transparent border-dashed border-b border-border/50',
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorComponent.Root.displayName

export { Separator }
