import type { Fable } from '@fable-js/parser'
import { FablePlayer } from '@fable-js/runtime'
import { Play } from 'lucide-react'
import { forwardRef, memo } from 'react'

interface PreviewPanelProps {
  ast: Fable | null
  playerKey: number
  previewSize: { width: number; height: number }
  isFullscreen: boolean
  hasError: boolean
}

// Hoisted static styles (vercel best practice: rendering-hoist-jsx)
const CHECKERBOARD_STYLE = {
  backgroundImage: `
    linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
  `,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  backgroundColor: '#0f0f0f',
} as const

const PreviewHeader = memo(function PreviewHeader({
  pageCount,
  previewSize,
}: {
  pageCount: number
  previewSize: { width: number; height: number }
}) {
  return (
    <div className="h-10 border-b border-zinc-800 px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-zinc-400">Preview</span>
        {pageCount > 0 && (
          <span className="text-xs text-zinc-600">
            Page 1 of {pageCount}
          </span>
        )}
      </div>
      <div className="text-xs text-zinc-600">
        {previewSize.width} x {previewSize.height}
      </div>
    </div>
  )
})

const EmptyPreview = memo(function EmptyPreview({
  hasError,
}: {
  hasError: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
        <Play className="h-10 w-10 text-zinc-700" />
      </div>
      <p className="text-zinc-500 text-sm mb-1">No preview available</p>
      <p className="text-zinc-600 text-xs">
        {hasError
          ? 'Fix syntax errors to see preview'
          : 'Write valid FableDSL code to preview'}
      </p>
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
        className={`${isFullscreen ? 'w-full' : 'w-[60%]'} flex flex-col bg-zinc-950`}
      >
        <PreviewHeader pageCount={pageCount} previewSize={previewSize} />

        <div className="flex-1 flex items-center justify-center p-6 bg-zinc-950 min-h-0">
          {ast ? (
            <div
              className="relative rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10"
              style={{
                width: previewSize.width,
                height: previewSize.height,
              }}
            >
              {/* Checkerboard pattern for transparency */}
              <div className="absolute inset-0" style={CHECKERBOARD_STYLE} />

              {/* Fable Player */}
              <div className="relative z-10">
                <FablePlayer
                  key={`preview-${playerKey}`}
                  ast={ast}
                  width={previewSize.width}
                  height={previewSize.height}
                />
              </div>
            </div>
          ) : (
            <EmptyPreview hasError={hasError} />
          )}
        </div>
      </div>
    )
  })
)
