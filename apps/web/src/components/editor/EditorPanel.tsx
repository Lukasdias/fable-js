import { FableMonacoEditor } from '@fable-js/editor'
import { AlertCircle, Code } from 'lucide-react'
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
  fontSize: 13,
  lineNumbers: 'on' as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on' as const,
  tabSize: 2,
  insertSpaces: true,
  folding: true,
  lineDecorationsWidth: 8,
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
} as const

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
    <div className="w-[40%] flex flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Editor Header */}
      <div className="h-10 border-b border-zinc-800 px-3 flex items-center justify-between shrink-0 bg-zinc-900/50">
        <div className="flex items-center gap-2 text-zinc-400">
          <Code className="h-4 w-4" />
          <span className="text-xs font-medium">Script Editor</span>
        </div>
        <div className="text-xs text-zinc-600">{lineCount} lines</div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <FableMonacoEditor
          key="fable-editor"
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="fable-dark"
          options={EDITOR_OPTIONS}
        />
      </div>

      {/* Error Panel */}
      {error && (
        <div className="border-t border-zinc-800 bg-red-950/30 p-3 max-h-32 overflow-auto">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap break-all">
              {error}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
})
