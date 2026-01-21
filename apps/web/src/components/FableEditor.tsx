'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { FablePlayer } from '@fable-js/runtime'
import { parseDSL, validateDSL, type Fable } from '@fable-js/parser'
import { cn } from '@/lib/utils'
import { registerFableLanguage } from '@/lib/fable-language'
import { EXAMPLES } from '@/lib/examples'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { AlertCircle, Play, FileText, Eye } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Monaco Editor needs to be client-only
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Loading editor...
    </div>
  )
})

const DEFAULT_DSL = `fable "My Interactive Story" do
  page 1 do
    set score to 0
    set health to 100

    text "Welcome to the adventure!" at [50, 50]
    text "Score: {score} | Health: {health}" at [50, 80]

    button "Start Adventure" at [50, 150] do
      on_click do
        set score to score + 10
        set health to health - 5
      end
    end

    button "Rest" at [250, 150] do
      on_click do
        set health to health + 20
      end
    end
  end
end`

export function FableEditor() {
  const [dsl, setDsl] = useState(DEFAULT_DSL)
  const [ast, setAst] = useState<Fable | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Register FableJS language for Monaco
  useEffect(() => {
    registerFableLanguage()
  }, [])

  // Parse DSL when it changes
  const parseResult = useMemo(() => {
    if (!dsl.trim()) {
      setAst(null)
      setError(null)
      return { ast: null, error: null }
    }

    try {
      const parsedAst = parseDSL(dsl)
      setAst(parsedAst)
      setError(null)
      return { ast: parsedAst, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Parse error'
      setAst(null)
      setError(errorMessage)
      return { ast: null, error: errorMessage }
    }
  }, [dsl])

  const handleEditorChange = useCallback((value: string | undefined) => {
    setDsl(value || '')
  }, [])

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
          {!isPlaying ? (
            <Button onClick={handlePlay} disabled={!ast} size="sm">
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
                  {dsl.split('\n').length} lines
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <MonacoEditor
                  height="100%"
                  language="fable"
                  value={dsl}
                  onChange={handleEditorChange}
                  theme="vs-light"
                  options={{
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
                  }}
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