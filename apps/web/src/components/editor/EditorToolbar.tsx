import { Button } from '@/components/ui/button'
import { AlertCircle, Maximize2, Minimize2, Play, RotateCcw, Save } from 'lucide-react'
import { memo } from 'react'

interface EditorToolbarProps {
  title?: string
  hasUnsavedChanges: boolean
  hasError: boolean
  hasAst: boolean
  isFullscreen: boolean
  onSave: () => void
  onRestart: () => void
  onToggleFullscreen: () => void
}

export const EditorToolbar = memo(function EditorToolbar({
  title,
  hasUnsavedChanges,
  hasError,
  hasAst,
  isFullscreen,
  onSave,
  onRestart,
  onToggleFullscreen,
}: EditorToolbarProps) {
  return (
    <div className="h-12 border-b border-zinc-800 bg-zinc-900 px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Play className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-semibold text-white">FableJS</span>
        </div>
        {title && (
          <span className="text-xs text-zinc-500 border-l border-zinc-700 pl-3">
            {title}
          </span>
        )}
        {hasUnsavedChanges && (
          <span className="text-xs text-amber-500 font-medium">Unsaved</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {hasError && (
          <div className="flex items-center gap-1.5 text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Syntax Error</span>
          </div>
        )}

        <Button
          onClick={onSave}
          size="sm"
          variant="ghost"
          disabled={!hasUnsavedChanges}
          className="text-zinc-400 hover:text-white h-8"
        >
          <Save className="h-4 w-4 mr-1.5" />
          Save
        </Button>

        <div className="w-px h-5 bg-zinc-700" />

        <Button
          onClick={onRestart}
          size="sm"
          variant="ghost"
          disabled={!hasAst}
          className="text-zinc-400 hover:text-white h-8"
        >
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Restart
        </Button>

        <Button
          onClick={onToggleFullscreen}
          size="sm"
          variant="ghost"
          className="text-zinc-400 hover:text-white h-8"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4 mr-1.5" />
          ) : (
            <Maximize2 className="h-4 w-4 mr-1.5" />
          )}
          {isFullscreen ? 'Exit' : 'Fullscreen'}
        </Button>
      </div>
    </div>
  )
})
