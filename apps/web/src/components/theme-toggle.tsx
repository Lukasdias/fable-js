'use client'

import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

// Theme icons mapping
const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const

const themeLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
} as const

// Animation variants for smooth transitions
const iconVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -90,  },
  visible: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0.8, rotate: 90 },
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // Get the current theme (resolve 'system' to actual theme)
  const currentTheme = theme === 'system'
    ? (typeof window !== 'undefined' &&
       window.matchMedia('(prefers-color-scheme: dark)').matches
       ? 'dark'
       : 'light')
    : theme

  const CurrentIcon = themeIcons[currentTheme]
  const SystemIcon = themeIcons.system

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="
            rounded-xl
            transition-all duration-200
            hover:bg-accent/10
            hover:scale-105
            active:scale-95
          "
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTheme}
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative"
            >
              <CurrentIcon className="h-4 w-4 text-foreground/70" />
            </motion.div>
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 p-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {/* Light Theme */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 24 }}
          >
            <DropdownMenuItem
              onClick={() => setTheme('light')}
              className="
                rounded-lg px-3 py-2.5
                cursor-pointer
                transition-all duration-150
                hover:bg-accent/10
                focus:bg-accent/10
                data-[highlighted]:bg-accent/10
              "
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Sun className="h-4 w-4 text-foreground/70" />
                  <span className="text-sm font-medium">{themeLabels.light}</span>
                </div>
                <AnimatePresence>
                  {theme === 'light' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </DropdownMenuItem>
          </motion.div>

          {/* Dark Theme */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 24 }}
          >
            <DropdownMenuItem
              onClick={() => setTheme('dark')}
              className="
                rounded-lg px-3 py-2.5
                cursor-pointer
                transition-all duration-150
                hover:bg-accent/10
                focus:bg-accent/10
                data-[highlighted]:bg-accent/10
              "
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Moon className="h-4 w-4 text-foreground/70" />
                  <span className="text-sm font-medium">{themeLabels.dark}</span>
                </div>
                <AnimatePresence>
                  {theme === 'dark' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </DropdownMenuItem>
          </motion.div>

          <DropdownMenuSeparator className="my-1" />

          {/* System Theme */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 24 }}
          >
            <DropdownMenuItem
              onClick={() => setTheme('system')}
              className="
                rounded-lg px-3 py-2.5
                cursor-pointer
                transition-all duration-150
                hover:bg-accent/10
                focus:bg-accent/10
                data-[highlighted]:bg-accent/10
              "
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Monitor className="h-4 w-4 text-foreground/70" />
                  <span className="text-sm font-medium">{themeLabels.system}</span>
                </div>
                <AnimatePresence>
                  {theme === 'system' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </DropdownMenuItem>
          </motion.div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}