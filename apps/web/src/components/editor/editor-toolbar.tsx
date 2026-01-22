import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  AlertCircle,
  BookOpen,
  Map,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Sparkles,
} from 'lucide-react'
import { memo } from 'react'

interface EditorToolbarProps {
  title?: string
  hasUnsavedChanges: boolean
  hasError: boolean
  hasAst: boolean
  isFullscreen: boolean
  showPageTraveller?: boolean
  onSave: () => void
  onRestart: () => void
  onToggleFullscreen: () => void
  onTogglePageTraveller?: () => void
}

// Animated logo component
const FableLogo = memo(function FableLogo() {
  return (
    <div className="flex items-center gap-3 group">
      {/* Animated book icon with gradient */}
      <div
        className="
          relative w-10 h-10 rounded-xl
          bg-gradient-to-br from-primary via-secondary to-accent
          flex items-center justify-center
          shadow-lg shadow-primary/30
          transition-all duration-300
          group-hover:shadow-xl group-hover:shadow-primary/40
          group-hover:scale-105
          group-hover:-rotate-3
        "
      >
        <BookOpen className="h-5 w-5 text-white" strokeWidth={2.5} />
        {/* Sparkle decoration */}
        <Sparkles
          className="
            absolute -top-1 -right-1 h-3.5 w-3.5 
            text-amber-400
            animate-pulse-soft
          "
        />
      </div>
      {/* Brand text */}
      <div className="flex flex-col">
        <span className="font-display font-bold text-lg text-foreground leading-tight">
          Fable<span className="text-primary">.js</span>
        </span>
        <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
          Story Editor
        </span>
      </div>
    </div>
  )
})

// Status badge component
const StatusBadge = memo(function StatusBadge({
  hasUnsavedChanges,
  hasError,
  title,
}: {
  hasUnsavedChanges: boolean
  hasError: boolean
  title?: string
}) {
  if (hasError) {
    return (
      <div
        className="
          flex items-center gap-2 px-3 py-1.5 
          bg-destructive/10 border border-destructive/20
          rounded-full
          animate-bounce-in
        "
      >
        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
        <span className="text-xs font-semibold text-destructive">
          Syntax Error
        </span>
      </div>
    )
  }

  if (hasUnsavedChanges) {
    return (
      <div
        className="
          flex items-center gap-2 px-3 py-1.5 
          bg-warning/10 border border-warning/20
          rounded-full
          animate-fade-in
        "
      >
        <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
        <span className="text-xs font-semibold text-warning">Unsaved</span>
      </div>
    )
  }

  if (title) {
    return (
      <div
        className="
          flex items-center gap-2 px-3 py-1.5 
          bg-muted/50 border border-border/50
          rounded-full
        "
      >
        <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
          {title}
        </span>
      </div>
    )
  }

  return null
})

export const EditorToolbar = memo(function EditorToolbar({
  title,
  hasUnsavedChanges,
  hasError,
  hasAst,
  isFullscreen,
  showPageTraveller = false,
  onSave,
  onRestart,
  onToggleFullscreen,
  onTogglePageTraveller,
}: EditorToolbarProps) {
  return (
    <header
      className="
        h-16 px-5
        flex items-center justify-between
        bg-card/80 backdrop-blur-md
        border-b border-border/50
        shrink-0
      "
    >
      {/* Left section - Logo & Status */}
      <div className="flex items-center gap-4">
        <FableLogo />

        {/* Divider */}
        <div className="h-8 w-px bg-border/50" />

        {/* Status badge */}
        <StatusBadge
          hasUnsavedChanges={hasUnsavedChanges}
          hasError={hasError}
          title={title}
        />
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Page traveller toggle */}
        {onTogglePageTraveller && (
          <Button
            onClick={onTogglePageTraveller}
            size="icon-sm"
            variant={showPageTraveller ? 'default' : 'soft'}
            className="rounded-lg mr-2"
            title="Toggle page navigator sidebar"
          >
            <Map className="h-4 w-4" />
          </Button>
        )}

        {/* Save button */}
        <Button
          onClick={onSave}
          size="sm"
          variant={hasUnsavedChanges ? 'default' : 'ghost'}
          disabled={!hasUnsavedChanges}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Fullscreen toggle */}
        <Button
          onClick={onToggleFullscreen}
          size="icon-sm"
          variant="soft"
          className="rounded-lg"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  )
})
