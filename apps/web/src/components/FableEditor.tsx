'use client'

import { Button } from '@/components/ui/button'
import { FableMonacoEditor } from '@fable-js/editor'
import { parseDSL, type Fable } from '@fable-js/parser'
import { FablePlayer } from '@fable-js/runtime'
import { AlertCircle, Code, Maximize2, Minimize2, Play, RotateCcw, Save } from 'lucide-react'
import * as monaco from 'monaco-editor'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_DSL = `fable "Interactive Animation Demo" do
  init score to 0
  init health to 100
  init bouncing to true

  page 1 do
    // Animated title with pulse effect
    text #title "Welcome to FableJS!" at [180, 30] animate "pulse" duration 2s

    // Score display with bounce animation
    text #score "Score: {score}" at [50, 100] animate "bounce" duration 1s
    
    // Health display
    text #health "Health: {health}" at [400, 100] animate "pulse" duration 1s

    // Collect points button
    button #collect-btn "Collect Points (+10)" at [50, 180] animate "pulse" duration 2s do
      on_click do
        set score to score + 10
        // Move the score text when clicked
        move #score to [80, 120] duration 300ms easing "ease-out"
      end
    end

    // Take damage button
    button #damage-btn "Take Damage (-15)" at [250, 180] animate "shake" duration 500ms repeat 3 do
      on_click do
        set health to health - 15
      end
    end

    // Heal button
    button #heal-btn "Heal (+25)" at [450, 180] do
      on_click do
        set health to health + 25
      end
    end

    // Animated decorative elements
    text #deco-1 "~~~" at [100, 280] animate "spin" duration 3s
    text #deco-2 "***" at [300, 280] animate "bounce" duration 800ms
    text #deco-3 "+++" at [500, 280] animate "pulse" duration 1500ms

    // Navigation with animation
    button #next-btn "Next Page" at [250, 320] animate "fade_in" duration 1s do
      on_click do
        go_to_page 2
      end
    end
  end

  page 2 do
    init roll to random 1..6

    // Title
    text #page2-title "Animation Playground" at [200, 30] animate "pulse" duration 2s

    // Dice with shake animation
    text #dice "Dice: {roll}" at [280, 100] animate "shake" duration 200ms repeat 2

    // Roll button
    button #roll-btn "Roll & Move!" at [50, 160] do
      on_click do
        set roll to random 1..6
        // Animate the dice text
        move #dice to [280, 130] duration 500ms easing "bounce-ease-out"
      end
    end

    // Spin button
    button #spin-btn "Spin Effect" at [250, 160] animate "spin" duration 2s do
      on_click do
        // Move itself
        move #spin-btn to [300, 180] duration 400ms easing "elastic-ease-out"
      end
    end

    // Reset button
    button #reset-btn "Reset Positions" at [450, 160] do
      on_click do
        move #dice to [280, 100] duration 300ms easing "ease-in-out"
        move #spin-btn to [250, 160] duration 300ms easing "ease-in-out"
      end
    end

    // Floating animated elements
    text #float-1 "~o~" at [100, 260] animate "bounce" duration 600ms
    text #float-2 "~o~" at [300, 260] animate "bounce" duration 800ms
    text #float-3 "~o~" at [500, 260] animate "bounce" duration 1000ms

    // Back button
    button #back-btn "Back to Page 1" at [250, 320] animate "fade_in" duration 500ms do
      on_click do
        go_to_page 1
      end
    end

    button #to-end-btn "Go to The End" at [400, 320] animate "fade_in" duration 500ms do
      on_click do
        go_to_page 3
      end
    end
  end

  page 3 do
    text #end-text "The End! Thanks for trying FableJS!" at [150, 200] animate "pulse" duration 2s
    button #restart-btn "Restart Demo" at [250, 300] do
      on_click do
        go_to_page 1
        set score to 0
        set health to 100
      end   
    end
  end
end`

export function FableEditor() {
  const [dsl, setDsl] = useState(DEFAULT_DSL)
  const [draft, setDraft] = useState(DEFAULT_DSL)
  const [ast, setAst] = useState<Fable | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [playerKey, setPlayerKey] = useState(0)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [previewSize, setPreviewSize] = useState({ width: 800, height: 450 })

  // Calculate preview size based on container
  useEffect(() => {
    const updateSize = () => {
      if (previewContainerRef.current) {
        const container = previewContainerRef.current
        const containerWidth = container.clientWidth - 48 // padding
        const containerHeight = container.clientHeight - 48
        
        // Maintain 16:9 aspect ratio
        const aspectRatio = 16 / 9
        let width = containerWidth
        let height = width / aspectRatio
        
        if (height > containerHeight) {
          height = containerHeight
          width = height * aspectRatio
        }
        
        setPreviewSize({ 
          width: Math.floor(Math.max(640, width)), 
          height: Math.floor(Math.max(360, height)) 
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [isFullscreen])

  useEffect(() => {
    if (!dsl.trim()) {
      setAst(null)
      setError(null)
      return
    }

    try {
      const parsedAst = parseDSL(dsl)
      setAst(parsedAst)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Parse error'
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

  const handleRestart = useCallback(() => {
    setPlayerKey(prev => prev + 1)
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  // Monaco editor options
  const editorOptions = useMemo(() => ({
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
  }), [])

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Top Toolbar */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-900 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Play className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-semibold text-white">FableJS</span>
          </div>
          {ast && (
            <span className="text-xs text-zinc-500 border-l border-zinc-700 pl-3">
              {ast.title}
            </span>
          )}
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-500 font-medium">Unsaved</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Syntax Error</span>
            </div>
          )}
          
          <Button 
            onClick={handleSave} 
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
            onClick={handleRestart} 
            size="sm" 
            variant="ghost"
            disabled={!ast}
            className="text-zinc-400 hover:text-white h-8"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Restart
          </Button>
          
          <Button 
            onClick={toggleFullscreen} 
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

      {/* Main Content - 40/60 Split */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Code Editor (40%) */}
        {!isFullscreen && (
          <div className="w-[40%] flex flex-col border-r border-zinc-800 bg-zinc-900">
            {/* Editor Header */}
            <div className="h-10 border-b border-zinc-800 px-3 flex items-center justify-between shrink-0 bg-zinc-900/50">
              <div className="flex items-center gap-2 text-zinc-400">
                <Code className="h-4 w-4" />
                <span className="text-xs font-medium">Script Editor</span>
              </div>
              <div className="text-xs text-zinc-600">
                {draft.split('\n').length} lines
              </div>
            </div>
            
            {/* Monaco Editor */}
            <div className="flex-1 min-h-0">
              <FableMonacoEditor
                key="fable-editor"
                value={draft}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="fable-dark"
                options={editorOptions}
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
        )}

        {/* Right Panel - Preview Canvas (60% or 100% in fullscreen) */}
        <div 
          ref={previewContainerRef}
          className={`${isFullscreen ? 'w-full' : 'w-[60%]'} flex flex-col bg-zinc-950`}
        >
          {/* Preview Header */}
          <div className="h-10 border-b border-zinc-800 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-zinc-400">Preview</span>
              {ast && (
                <span className="text-xs text-zinc-600">
                  Page {ast.pages.length > 0 ? '1' : '0'} of {ast.pages.length}
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-600">
              {previewSize.width} x {previewSize.height}
            </div>
          </div>

          {/* Canvas Container - Centered with padding */}
          <div className="flex-1 flex items-center justify-center p-6 bg-zinc-950 min-h-0">
            {ast ? (
              <div 
                className="relative rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10"
                style={{ 
                  width: previewSize.width, 
                  height: previewSize.height,
                }}
              >
                {/* Checkerboard pattern for transparency (like design tools) */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
                      linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
                      linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    backgroundColor: '#0f0f0f',
                  }}
                />
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
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                  <Play className="h-10 w-10 text-zinc-700" />
                </div>
                <p className="text-zinc-500 text-sm mb-1">No preview available</p>
                <p className="text-zinc-600 text-xs">
                  {error ? 'Fix syntax errors to see preview' : 'Write valid FableDSL code to preview'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
