'use client'

import * as React from 'react'
import { Tabs as TabsComponent } from 'radix-ui'
import { cn } from '@/lib/utils'

const Tabs = TabsComponent.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsComponent.List>,
  React.ComponentPropsWithoutRef<typeof TabsComponent.List>
>(({ className, ...props }, ref) => (
  <TabsComponent.List
    ref={ref}
    className={cn(
      // Pill container with soft background
      'inline-flex items-center justify-center gap-1',
      'p-1.5 rounded-2xl',
      'bg-muted/50',
      'border border-border/50',
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsComponent.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsComponent.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsComponent.Trigger>
>(({ className, ...props }, ref) => (
  <TabsComponent.Trigger
    ref={ref}
    className={cn(
      // Base styles
      'inline-flex items-center justify-center gap-2',
      'whitespace-nowrap px-4 py-2',
      'rounded-xl',
      'text-sm font-medium',
      'transition-all duration-200',
      'select-none',

      // Default state - subtle
      'text-muted-foreground',
      'hover:text-foreground',
      'hover:bg-background/50',

      // Focus state
      'ring-offset-background',
      'focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',

      // Disabled
      'disabled:pointer-events-none disabled:opacity-50',

      // Active state - elevated with shadow
      'data-[state=active]:bg-background',
      'data-[state=active]:text-foreground',
      'data-[state=active]:shadow-sm',
      'data-[state=active]:shadow-black/5',

      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsComponent.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsComponent.Content>,
  React.ComponentPropsWithoutRef<typeof TabsComponent.Content>
>(({ className, ...props }, ref) => (
  <TabsComponent.Content
    ref={ref}
    className={cn(
      // Smooth entrance animation
      'mt-4',
      'ring-offset-background',
      'focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',

      // Animation
      'data-[state=active]:animate-fade-in',
      'data-[state=inactive]:hidden',

      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsComponent.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
