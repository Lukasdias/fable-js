'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FableMonacoEditor } from '@fable-js/editor'
import { parseDSL, type Fable } from '@fable-js/parser'
import { FablePlayer } from '@fable-js/runtime'
import { AlertCircle, Eye, FileText, Play, Save } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import * as monaco from 'monaco-editor'

const DEFAULT_DSL = `fable "My Interactive Story" do
  init score to 0
  init health to 100
  init alive to true

  page 1 do
    text "Welcome to the adventure!" at [50, 50]
    text "Score: {score} | Health: {health}" at [50, 80]

    button "Start Adventure" at [50, 150] do
      on_click do
        set score to score + 10
        set health to health - 5
        // Using logical operators
        set alive to health > 0 and not (score < 0)
      end
    end

    button "Rest" at [250, 150] do
      on_click do
        set health to health + 20
      end
    end

    button "Go to Page 2" at [450, 150] do
      on_click do
        go_to_page 2
      end
    end
  end

  page 2 do
    init roll to random 1..6
    init critical to false

    text "Page 2 - Expressions Demo" at [50, 50]
    text "Random number: {roll}" at [50, 100]

    button "Roll Dice" at [50, 150] do
      on_click do
        set roll to random 1..6
        // Check if critical hit or miss
        set critical to roll == 6 or roll == 1
      end
    end

    button "Back to Page 1" at [250, 150] do
      on_click do
        go_to_page 1
      end
    end
  end
end`

export function FableEditor() {
  const [dsl, setDsl] = useState(DEFAULT_DSL)
  const [draft, setDraft] = useState(DEFAULT_DSL)
  const [ast, setAst] = useState<Fable | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (!dsl.trim()) {
      setAst(null)
      setError(null)
      return
    }

    try {
      const parsedAst = parseDSL(dsl)
      console.log('📝 FableEditor Debug - Parsed AST:', {
        ast: parsedAst,
        pages: parsedAst.pages,
        pageIds: parsedAst.pages.map(p => ({ id: p.id, type: typeof p.id })),
        dsl: dsl.slice(0, 100) + '...'
      });
      setAst(parsedAst)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Parse error'
      console.error('❌ FableEditor Parse Error:', errorMessage);
      setAst(null)
      setError(errorMessage)
    }
  }, [dsl])

  useEffect(() => {
    setHasUnsavedChanges(draft !== dsl)
  }, [draft, dsl])

  const handleEditorChange = useCallback((value: string | undefined) => {
    setDraft(value || '')
  }, [])

  const handleSave = useCallback(() => {
    setDsl(draft)
    setHasUnsavedChanges(false)
  }, [draft])

  const handleEditorDidMount = useCallback((editor: any) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, handleSave)
  }, [handleSave])

  const handlePlay = useCallback(() => {
    if (ast) {
      setIsPlaying(true)
    }
  }, [ast])

  const handleStop = useCallback(() => {
    setIsPlaying(false)
  }, [])

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h1 className="font-semibold">FableJS Editor</h1>
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-medium">• Draft</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <Alert className="w-auto py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Parse error
              </AlertDescription>
            </Alert>
          )}
          {hasUnsavedChanges && (
            <Button onClick={handleSave} size="sm" variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save (Ctrl+S)
            </Button>
          )}
          {!isPlaying ? (
            <Button onClick={handlePlay} disabled={!ast || hasUnsavedChanges} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Preview
            </Button>
          ) : (
            <Button onClick={handleStop} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Stop Preview
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {!isPlaying ? (
          <>
            {/* Editor Pane - Takes 60% on large screens */}
            <div className="flex-1 lg:flex-[3] flex flex-col min-h-0">
              <div className="border-b px-4 py-2 bg-muted/50 flex items-center justify-between">
                <h2 className="text-sm font-medium">DSL Editor</h2>
                <div className="text-xs text-muted-foreground">
                  {draft.split('\n').length} lines • Shift+Alt+F to format
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <FableMonacoEditor
                  key="fable-editor"
                  value={draft}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="fable-dark"
                  options={useMemo(() => ({
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrapColumn: 80,
                    rulers: [80],
                    quickSuggestions: {
                      other: true,
                      comments: false,
                      strings: true,
                    },
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'on',
                    tabCompletion: 'on',
                    formatOnType: true,
                    formatOnPaste: true,
                  }), [])}
                />
              </div>
            </div>

            <Separator orientation="vertical" className="hidden lg:block" />

            {/* Preview Pane - Takes 40% on large screens, full width on mobile */}
            <div className="lg:flex-[2] flex flex-col min-h-0 border-t lg:border-t-0 lg:border-l">
              <div className="border-b px-4 py-2 bg-muted/50 flex items-center justify-between">
                <h2 className="text-sm font-medium">Live Preview</h2>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">
                    {ast ? `${ast.pages.length} page${ast.pages.length !== 1 ? 's' : ''}` : 'No story'}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0 p-4 bg-muted/10 flex items-center justify-center">
                {ast ? (
                  <div className="w-full max-w-lg aspect-video border rounded-lg overflow-hidden bg-white shadow-lg">
                    <FablePlayer ast={ast} width={640} height={360} />
                  </div>
                ) : (
                  <div className="text-center">
                    {error ? (
                      <>
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                        <p className="text-sm text-muted-foreground mb-2">Parse error in DSL</p>
                        <p className="text-xs text-destructive font-mono max-w-md">{error.split('\n')[0]}</p>
                      </>
                    ) : (
                      <>
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Enter valid DSL to see preview</p>
                        <p className="text-xs text-muted-foreground mt-2">The preview will update automatically</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          // Fullscreen Preview Mode
          <div className="flex-1 flex items-center justify-center bg-muted/20 p-8">
            <div className="w-full max-w-6xl aspect-video border rounded-lg overflow-hidden bg-white shadow-2xl">
              {ast && <FablePlayer ast={ast} width={1280} height={720} />}
            </div>
          </div>
        )}
      </div>

      {/* Error Panel */}
      {error && (
        <div className="border-t bg-destructive/5 px-4 py-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-mono text-sm">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}