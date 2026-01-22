'use client'

import * as React from 'react'
import { Select } from 'radix-ui'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const SelectComponent = Select.Root

const SelectGroup = Select.Group

const SelectValue = Select.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof Select.Trigger>,
  React.ComponentPropsWithoutRef<typeof Select.Trigger>
>(({ className, children, ...props }, ref) => (
  <Select.Trigger
    ref={ref}
    className={cn(
      // Base styles
      'flex h-11 w-full items-center justify-between gap-2',
      'rounded-xl border-2 border-border/50',
      'bg-background px-4 py-2',
      'text-sm font-medium',
      'transition-all duration-200',

      // Placeholder
      'placeholder:text-muted-foreground',

      // Focus states
      'focus:outline-none',
      'focus:border-primary/50',
      'focus:ring-2 focus:ring-primary/20',

      // Hover
      'hover:border-border',
      'hover:bg-muted/30',

      // Disabled
      'disabled:cursor-not-allowed disabled:opacity-50',

      // Icon handling
      '[&>span]:line-clamp-1',

      className
    )}
    {...props}
  >
    {children}
    <Select.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </Select.Icon>
  </Select.Trigger>
))
SelectTrigger.displayName = Select.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof Select.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof Select.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <Select.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-2',
      'text-muted-foreground',
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </Select.ScrollUpButton>
))
SelectScrollUpButton.displayName = Select.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof Select.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof Select.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <Select.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-2',
      'text-muted-foreground',
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </Select.ScrollDownButton>
))
SelectScrollDownButton.displayName = Select.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof Select.Content>,
  React.ComponentPropsWithoutRef<typeof Select.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <Select.Portal>
    <Select.Content
      ref={ref}
      className={cn(
        // Base styles
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden',
        'rounded-xl border border-border/50',
        'bg-popover text-popover-foreground',
        'shadow-xl shadow-black/10',

        // Animation - bouncy entrance
        'data-[state=open]:animate-bounce-in',
        'data-[state=closed]:animate-fade-out',
        'data-[state=closed]:zoom-out-95',

        // Position-based animations
        'data-[side=bottom]:slide-in-from-top-2',
        'data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2',
        'data-[side=top]:slide-in-from-bottom-2',

        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',

        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <Select.Viewport
        className={cn(
          'p-1.5',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </Select.Viewport>
      <SelectScrollDownButton />
    </Select.Content>
  </Select.Portal>
))
SelectContent.displayName = Select.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof Select.Label>,
  React.ComponentPropsWithoutRef<typeof Select.Label>
>(({ className, ...props }, ref) => (
  <Select.Label
    ref={ref}
    className={cn(
      'py-2 px-3 text-xs font-semibold',
      'text-muted-foreground uppercase tracking-wider',
      className
    )}
    {...props}
  />
))
SelectLabel.displayName = Select.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof Select.Item>,
  React.ComponentPropsWithoutRef<typeof Select.Item>
>(({ className, children, ...props }, ref) => (
  <Select.Item
    ref={ref}
    className={cn(
      // Base styles
      'relative flex w-full cursor-default select-none items-center',
      'rounded-lg py-2.5 pl-10 pr-3',
      'text-sm font-medium',
      'transition-colors duration-150',

      // Focus/hover state
      'outline-none',
      'focus:bg-muted',
      'focus:text-foreground',

      // Disabled
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',

      className
    )}
    {...props}
  >
    <span className="absolute left-3 flex h-5 w-5 items-center justify-center">
      <Select.ItemIndicator>
        <div className="rounded-full bg-primary p-0.5">
          <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
        </div>
      </Select.ItemIndicator>
    </span>

    <Select.ItemText>{children}</Select.ItemText>
  </Select.Item>
))
SelectItem.displayName = Select.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof Select.Separator>,
  React.ComponentPropsWithoutRef<typeof Select.Separator>
>(({ className, ...props }, ref) => (
  <Select.Separator
    ref={ref}
    className={cn('-mx-1 my-1.5 h-px bg-border/50', className)}
    {...props}
  />
))
SelectSeparator.displayName = Select.Separator.displayName

export {
  SelectComponent as Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
