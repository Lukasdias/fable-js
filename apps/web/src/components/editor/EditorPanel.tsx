import { FableMonacoEditor } from '@fable-js/editor'
import { AlertCircle, Code2, FileCode } from 'lucide-react'
import * as monaco from 'monaco-editor'
import { memo, useCallback, useMemo } from 'react'

interface EditorPanelProps {
  value: string
  error: string | null
  onChange: (value: string) => void
  onSave: () => void
}

// Hoisted static options (vercel best practice: rendering-hoist-jsx)
const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  lineNumbers: 'on' as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on' as const,
  tabSize: 2,
  insertSpaces: true,
  folding: true,
  lineDecorationsWidth: 12,
  lineNumbersMinChars: 3,
  renderLineHighlight: 'line' as const,
  quickSuggestions: {
    other: true,
    comments: false,
    strings: true,
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on' as const,
  tabCompletion: 'on' as const,
  padding: { top: 16, bottom: 16 },
  smoothScrolling: true,
  cursorBlinking: 'smooth' as const,
  cursorSmoothCaretAnimation: 'on' as const,
} as const

// Header component
const EditorHeader = memo(function EditorHeader({
  lineCount,
}: {
  lineCount: number
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
            bg-gradient-to-br from-secondary/20 to-secondary/5
            border border-secondary/20
            flex items-center justify-center
          "
        >
          <Code2 className="h-4 w-4 text-secondary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            Script Editor
          </span>
          <span className="text-[10px] text-muted-foreground">
            FableDSL
          </span>
        </div>
      </div>

      {/* Line count badge */}
      <div
        className="
          flex items-center gap-1.5 px-2.5 py-1
          bg-muted/50 rounded-full
          text-xs text-muted-foreground
        "
      >
        <FileCode className="h-3 w-3" />
        <span>{lineCount} lines</span>
      </div>
    </div>
  )
})

// Error panel component
const ErrorPanel = memo(function ErrorPanel({ error }: { error: string }) {
  return (
    <div
      className="
        border-t border-destructive/20
        bg-gradient-to-r from-destructive/10 to-destructive/5
        p-4 max-h-36 overflow-auto
        animate-slide-up
        scrollbar-thin
      "
    >
      <div className="flex items-start gap-3">
        {/* Error icon */}
        <div
          className="
            shrink-0 w-8 h-8 rounded-lg
            bg-destructive/20
            flex items-center justify-center
          "
        >
          <AlertCircle className="h-4 w-4 text-destructive" />
        </div>

        {/* Error content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-destructive mb-1">
            Syntax Error
          </p>
          <pre
            className="
              text-xs text-destructive/80 
              font-mono whitespace-pre-wrap break-all
              leading-relaxed
            "
          >
            {error}
          </pre>
        </div>
      </div>
    </div>
  )
})

export const EditorPanel = memo(function EditorPanel({
  value,
  error,
  onChange,
  onSave,
}: EditorPanelProps) {
  const lineCount = useMemo(() => value.split('\n').length, [value])

  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      onChange(newValue || '')
    },
    [onChange]
  )

  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, onSave)
    },
    [onSave]
  )

  return (
    <div
      className="
        w-[42%] flex flex-col
        bg-surface
        border-r border-border/30
        overflow-hidden
      "
    >
      {/* Header */}
      <EditorHeader lineCount={lineCount} />

      {/* Monaco Editor Container */}
      <div
        className="
          flex-1 min-h-0
          bg-card
          relative
        "
      >
        {/* Subtle pattern overlay */}
        <div
          className="
            absolute inset-0 
            pattern-dots opacity-30
            pointer-events-none
          "
        />

        {/* Editor */}
        <div className="relative z-10 h-full">
          <FableMonacoEditor
            key="fable-editor"
            value={value}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="fable-dark"
            options={EDITOR_OPTIONS}
          />
        </div>
      </div>

      {/* Error Panel */}
      {error && <ErrorPanel error={error} />}
    </div>
  )
})
