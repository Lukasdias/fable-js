'use client'

import * as React from 'react'
import { ScrollArea } from 'radix-ui'
import { cn } from '@/lib/utils'

const ScrollAreaComponent = React.forwardRef<
  React.ElementRef<typeof ScrollArea.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollArea.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollArea.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <ScrollArea.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollArea.Viewport>
    <ScrollBar />
    <ScrollArea.Corner />
  </ScrollArea.Root>
))
ScrollAreaComponent.displayName = ScrollArea.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollArea.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollArea.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollArea.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      className
    )}
    {...props}
  >
    <ScrollArea.ScrollAreaThumb className="relative flex-1 rounded-full bg-border/50 transition-colors hover:bg-border" />
  </ScrollArea.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollArea.ScrollAreaScrollbar.displayName

export { ScrollAreaComponent as ScrollArea, ScrollBar }