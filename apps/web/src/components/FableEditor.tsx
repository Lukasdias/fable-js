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
      <div className="flex-1 flex">
        {!isPlaying ? (
          // Editor Mode
          <div className="flex-1 flex">
            {/* Editor Pane */}
            <div className="flex-1 flex flex-col">
              <div className="border-b px-4 py-2 bg-muted/50">
                <h2 className="text-sm font-medium">DSL Editor</h2>
              </div>
              <div className="flex-1">
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
                  }}
                />
              </div>
            </div>

            <Separator orientation="vertical" />

            {/* Preview Pane */}
            <div className="w-96 flex flex-col">
              <div className="border-b px-4 py-2 bg-muted/50">
                <h2 className="text-sm font-medium">Live Preview</h2>
              </div>
              <div className="flex-1 p-4 bg-muted/20">
                {ast ? (
                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <FablePlayer ast={ast} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    {error ? (
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                        <p className="text-sm">Parse error in DSL</p>
                      </div>
                    ) : (
                      <p className="text-sm">Enter DSL to see preview</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Fullscreen Preview Mode
          <div className="flex-1 flex items-center justify-center bg-muted/20 p-8">
            <div className="w-full max-w-4xl aspect-video border rounded-lg overflow-hidden bg-white shadow-lg">
              {ast && <FablePlayer ast={ast} />}
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