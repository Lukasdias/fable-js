'use client'

import { motion } from 'motion/react'
import { BookOpen, Code2, Sparkles, Wand2 } from 'lucide-react'
import { memo } from 'react'

interface FableEditorLoadingProps {
  /** Custom message to display */
  message?: string
  /** Whether this is for the full page loading */
  fullscreen?: boolean
}



export const FableEditorLoading = memo(function FableEditorLoading({
  message = 'Loading FableJS Editor...',
  fullscreen = true
}: FableEditorLoadingProps) {
  const Container = fullscreen ? motion.div : motion.div

  return (
    <Container
      className={`
        ${fullscreen ? 'h-screen' : 'min-h-[400px]'}
        flex items-center justify-center
        bg-background
        relative overflow-hidden
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Subtle animated background gradient */}
      <motion.div
        className="
          absolute inset-0 pointer-events-none
          bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02]
        "
        animate={{
          background: [
            'linear-gradient(to bottom right, rgba(var(--primary), 0.02), transparent, rgba(var(--secondary), 0.02))',
            'linear-gradient(to bottom right, rgba(var(--secondary), 0.02), transparent, rgba(var(--primary), 0.02))',
            'linear-gradient(to bottom right, rgba(var(--primary), 0.02), transparent, rgba(var(--secondary), 0.02))'
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <motion.div
        className="
          relative z-10
          flex flex-col items-center justify-center
          text-center max-w-md px-8
        "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Main illustration with floating animation */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        >
          {/* Central book icon with glass effect */}
          <motion.div
            className="
              w-24 h-24 rounded-3xl
              bg-gradient-to-br from-card/80 to-card/60
              backdrop-blur-md
              border border-border/50
              shadow-xl shadow-black/10
              flex items-center justify-center
              ring-1 ring-border/30
            "
            animate={{
              y: [-6, 6, -6],
              rotate: [0, 3, 0, -3, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <BookOpen
              className="h-12 w-12 text-primary"
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Floating sparkles */}
          <motion.div
            className="
              absolute -top-2 -right-2
              w-8 h-8 rounded-xl
              bg-gradient-to-br from-accent/20 to-accent/10
              border border-accent/20
              flex items-center justify-center
              shadow-lg shadow-accent/20
            "
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: 0,
              ease: 'easeInOut'
            }}
          >
            <Sparkles className="h-4 w-4 text-accent" />
          </motion.div>

          <motion.div
            className="
              absolute -bottom-1 -left-3
              w-7 h-7 rounded-lg
              bg-gradient-to-br from-secondary/20 to-secondary/10
              border border-secondary/20
              flex items-center justify-center
              shadow-lg shadow-secondary/20
            "
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: 0.25,
              ease: 'easeInOut'
            }}
          >
            <Code2 className="h-3.5 w-3.5 text-secondary" />
          </motion.div>

          <motion.div
            className="
              absolute top-2 -left-2
              w-6 h-6 rounded-full
              bg-gradient-to-br from-primary/20 to-primary/10
              border border-primary/20
              flex items-center justify-center
              shadow-lg shadow-primary/20
            "
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: 0.5,
              ease: 'easeInOut'
            }}
          >
            <Wand2 className="h-3 w-3 text-primary" />
          </motion.div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h3 className="text-xl font-display font-semibold text-foreground">
            {message}
          </h3>

          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Preparing your interactive storytelling workspace
          </p>
        </motion.div>

        {/* Animated spinner with glass effect */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <motion.div
            className="
              w-12 h-12 rounded-2xl
              bg-gradient-to-br from-card/60 to-card/40
              backdrop-blur-sm
              border border-border/50
              shadow-lg shadow-black/10
              flex items-center justify-center
            "
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          >
            <motion.div
              className="
                w-6 h-6 rounded-full
                border-2 border-primary/30 border-t-primary
                shadow-sm shadow-primary/20
              "
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>

        {/* Subtle progress hint */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: 0
              }}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: 0.2
              }}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: 0.4
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </Container>
  )
})

FableEditorLoading.displayName = 'FableEditorLoading'