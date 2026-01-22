import type { Fable } from '@fable-js/parser'
import { FablePlayer } from '@fable-js/runtime'
import { BookOpen, Pen, Play, Sparkles } from 'lucide-react'
import { forwardRef, memo } from 'react'

interface PreviewPanelProps {
  ast: Fable | null
  playerKey: number
  previewSize: { width: number; height: number }
  isFullscreen: boolean
  hasError: boolean
}

// Header component
const PreviewHeader = memo(function PreviewHeader({
  pageCount,
  previewSize,
}: {
  pageCount: number
  previewSize: { width: number; height: number }
}) {
  return (
    <div
      className="
        h-12 px-4
        flex items-center justify-between
        bg-surface/50 backdrop-blur-sm
        border-b border-border/30
        shrink-0
      "
    >
      <div className="flex items-center gap-3">
        {/* Icon with gradient background */}
        <div
          className="
            w-8 h-8 rounded-lg
            bg-gradient-to-br from-accent/20 to-accent/5
            border border-accent/20
            flex items-center justify-center
          "
        >
          <Play className="h-4 w-4 text-accent fill-accent" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            Story Preview
          </span>
          {pageCount > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {pageCount} {pageCount === 1 ? 'page' : 'pages'}
            </span>
          )}
        </div>
      </div>

      {/* Size indicator */}
      <div
        className="
          flex items-center gap-1.5 px-2.5 py-1
          bg-muted/50 rounded-full
          text-xs text-muted-foreground font-mono
        "
      >
        {previewSize.width} × {previewSize.height}
      </div>
    </div>
  )
})

// Beautiful empty state component
const EmptyPreview = memo(function EmptyPreview({
  hasError,
}: {
  hasError: boolean
}) {
  return (
    <div
      className="
        flex flex-col items-center justify-center 
        text-center p-8
        animate-fade-in
      "
    >
      {/* Illustrated empty state */}
      <div className="relative mb-6">
        {/* Main book illustration */}
        <div
          className="
            w-28 h-28 rounded-3xl
            bg-gradient-to-br from-muted/80 to-muted/40
            border-2 border-dashed border-border
            flex items-center justify-center
            animate-float
          "
        >
          <BookOpen
            className="h-12 w-12 text-muted-foreground/50"
            strokeWidth={1.5}
          />
        </div>

        {/* Floating decorations */}
        <div
          className="
            absolute -top-2 -right-2
            w-10 h-10 rounded-xl
            bg-gradient-to-br from-primary/20 to-primary/10
            border border-primary/20
            flex items-center justify-center
            animate-bounce-in
          "
          style={{ animationDelay: '200ms' }}
        >
          <Pen className="h-4 w-4 text-primary" />
        </div>

        <div
          className="
            absolute -bottom-1 -left-3
            w-8 h-8 rounded-lg
            bg-gradient-to-br from-secondary/20 to-secondary/10
            border border-secondary/20
            flex items-center justify-center
            animate-bounce-in
          "
          style={{ animationDelay: '400ms' }}
        >
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
        </div>
      </div>

      {/* Text content */}
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        {hasError ? 'Oops! Something went wrong' : 'Your story awaits'}
      </h3>

      <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
        {hasError
          ? 'Fix the syntax errors in your script to see your story come to life.'
          : 'Write valid FableDSL code in the editor and watch your interactive story unfold here.'}
      </p>

      {/* Hint */}
      {!hasError && (
        <div
          className="
            mt-6 px-4 py-2
            bg-muted/50 rounded-xl
            border border-border/50
          "
        >
          <p className="text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">
              Ctrl
            </kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">
              S
            </kbd>
            {' to save and preview'}
          </p>
        </div>
      )}
    </div>
  )
})

// Preview frame - clean container that lets canvas content shine
const PreviewFrame = memo(function PreviewFrame({
  children,
  width,
  height,
}: {
  children: React.ReactNode
  width: number
  height: number
}) {
  return (
    <div
      className="
        relative rounded-2xl overflow-hidden
        shadow-2xl shadow-black/20
        ring-1 ring-border/50
      "
      style={{ width, height }}
    >
      {/* Content - canvas provides its own background */}
      <div className="relative">{children}</div>
    </div>
  )
})

export const PreviewPanel = memo(
  forwardRef<HTMLDivElement, PreviewPanelProps>(function PreviewPanel(
    { ast, playerKey, previewSize, isFullscreen, hasError },
    ref
  ) {
    const pageCount = ast?.pages.length ?? 0

    return (
      <div
        ref={ref}
        className={`
          ${isFullscreen ? 'w-full' : 'flex-1'} 
          flex flex-col
          bg-background
          overflow-hidden
        `}
      >
        {/* Header */}
        <PreviewHeader pageCount={pageCount} previewSize={previewSize} />

        {/* Preview Area - neutral background for canvas */}
        <div
          className="
            flex-1 min-h-0
            flex items-center justify-center
            p-6 lg:p-8
            bg-muted/30
          "
        >
          {ast ? (
            <PreviewFrame width={previewSize.width} height={previewSize.height}>
              <FablePlayer
                key={`preview-${playerKey}`}
                ast={ast}
                width={previewSize.width}
                height={previewSize.height}
              />
            </PreviewFrame>
          ) : (
            <EmptyPreview hasError={hasError} />
          )}
        </div>
      </div>
    )
  })
)
