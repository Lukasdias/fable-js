'use client'

import { DEFAULT_AST, DEFAULT_DSL } from '@/constants/default-dsl'
import { useDSLParser } from '@/hooks/use-dsl-parser'
import { MAIN_DSL } from '@/constants/main.fable'
import { PAGE1_DSL } from '@/constants/pages/page1.fable'
import { PAGE2_DSL } from '@/constants/pages/page2.fable'
import { PAGE3_DSL } from '@/constants/pages/page3.fable'
import { useFileOperations } from '@/hooks/use-file-operations'
import { useFileTabs } from '@/hooks/use-file-tabs'
import { usePreviewSize } from '@/hooks/use-preview-size'
import { useProjectFiles } from '@/hooks/use-project-files'
import { useRuntimeActions } from '@fable-js/runtime'
import { useCallback, useMemo, useRef, useState } from 'react'
import { AssetUploadDialog } from './asset-upload-dialog'
import { EditorPanel, EditorToolbar, PreviewPanel } from './editor'
import { FileTabs } from './file-tabs'
import type { TabData } from './file-tabs'
import { FileTree } from './file-tree'
import { PageCreationPopover } from './page-creation-popover'
import { PageTraveller } from './page-traveller'

export function FableEditor() {
  // State for editor content
  const [dsl, setDsl] = useState(DEFAULT_DSL)
  const [draft, setDraft] = useState(DEFAULT_DSL)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playerKey, setPlayerKey] = useState(0)
  // UI State
  const [showPageTraveller, setShowPageTraveller] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
   const { projectFiles, setProjectFiles, assets } = useProjectFiles()
  const [tabs, setTabs] = useState<TabData[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [showPageCreation, setShowPageCreation] = useState(false)
  const [showAssetUpload, setShowAssetUpload] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })

  // File management hooks
  const fileTabs = useFileTabs()
  const fileOperations = useFileOperations({
    dsl,
    setDsl,
    setDraft,
    projectFiles,
    setProjectFiles,
    openTab: fileTabs.openTab,
    setShowAssetUpload,
  })

  // Refs
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const fablePlayerRef = useRef<any>(null)

  // Custom hooks
  const { ast, error } = useDSLParser(dsl, DEFAULT_AST)
  const previewSize = usePreviewSize(previewContainerRef, [isFullscreen])
  const { goToPage, reset } = useRuntimeActions()

  // File tree data
  const fileTree = [
    {
      name: 'main.fable',
      type: 'file' as const,
      path: 'main.fable',
      fileType: 'main' as const,
    },
    {
      name: 'pages',
      type: 'folder' as const,
      path: 'pages',
      children: [
        {
          name: 'page1.fable',
          type: 'file' as const,
          path: 'pages/page1.fable',
          fileType: 'page' as const,
        },
        {
          name: 'page2.fable',
          type: 'file' as const,
          path: 'pages/page2.fable',
          fileType: 'page' as const,
        },
        {
          name: 'page3.fable',
          type: 'file' as const,
          path: 'pages/page3.fable',
          fileType: 'page' as const,
        },
      ],
    },
    {
      name: 'assets',
      type: 'folder' as const,
      path: 'assets',
      children: [
        // Assets would be listed here
      ],
    },
  ]

  // File operations
  const handleCreatePage = useCallback((folderPath: string, position?: { x: number; y: number }) => {
    if (folderPath !== 'pages') return

    if (position) {
      setPopoverPosition(position)
    }
    setShowPageCreation(true)
  }, [])

  const handleCreateAsset = useCallback((folderPath: string) => {
    if (folderPath !== 'assets') return
    setShowAssetUpload(true)
  }, [])

  const handlePageCreated = useCallback((fileName: string) => {
    const pagesFolder = projectFiles.find(f => f.name === 'pages')
    if (!pagesFolder || !pagesFolder.children) return

    const pageNum = pagesFolder.children.length + 1
    const newPagePath = `pages/${fileName}`

    // Update file tree
    setProjectFiles(prev => prev.map(file =>
      file.name === 'pages' && file.children
        ? {
            ...file,
            children: [...file.children, {
              name: fileName,
              type: 'file' as const,
              path: newPagePath,
              fileType: 'page' as const,
            }]
          }
        : file
    ))

    // Create new tab
    const tabId = `page-${Date.now()}`
    const initialContent = `page ${pageNum} do\n  text #placeholder "New page ${pageNum}" at [200, 200] animate "pulse" duration 1s\nend`

    const newTab: TabData = {
      id: tabId,
      name: fileName,
      path: newPagePath,
      content: initialContent,
      isDirty: true,
      type: 'dsl',
    }

    setTabs(prev => [...prev, newTab])
    setActiveTab(tabId)

    // Add to DSL
    const newDsl = `${dsl}\n\n${initialContent}`
    setDsl(newDsl)
    setDraft(newDsl)
  }, [dsl, projectFiles])

  // Tab operations
  const handleTabSelect = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])

  const handleTabClose = useCallback((tabId: string) => {
    setTabs(prev => prev.filter(tab => tab.id !== tabId))
    if (activeTab === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId)
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null)
    }
  }, [activeTab, tabs])

  const handleTabSave = useCallback((tabId: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, isDirty: false } : tab
    ))
    // In real implementation, would save to server
  }, [])

  // Derived state
  const hasUnsavedChanges = draft !== dsl



  // Handlers
  const handleSave = useCallback(() => {
    setDsl(draft)
  }, [draft])

  const handleRestart = useCallback(() => {
    // Reset the runtime store and restart the player
    reset()
    setPlayerKey((prev) => prev + 1)
    setCurrentPage(1) // Reset to first page on restart
  }, [reset])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  const togglePageTraveller = useCallback(() => {
    setShowPageTraveller((prev) => !prev)
  }, [])

  const handlePageSelect = useCallback((pageId: number) => {
    // Navigate to the specific page using the runtime store
    goToPage(pageId)
    setCurrentPage(pageId)
  }, [goToPage])

  const handlePlayerStateChange = useCallback((state: {
    currentPage: number
    variables: Record<string, any>
    pageHistory: number[]
  }) => {
    setCurrentPage(state.currentPage)
  }, [])

  const handleEditorChange = useCallback((value: string) => {
    setDraft(value)
  }, [])

  // Content mapping for existing project files
  const fileContents: Record<string, string> = {
    'main.fable': MAIN_DSL,
    'pages/page1.fable': PAGE1_DSL,
    'pages/page2.fable': PAGE2_DSL,
    'pages/page3.fable': PAGE3_DSL,
  }

  const handleFileSelect = useCallback((filePath: string) => {
    setSelectedFile(filePath)

    // Find the file in projectFiles
    const findFile = (files: any[]): any => {
      for (const file of files) {
        if (file.path === filePath) {
          return file
        }
        if (file.children) {
          const found = findFile(file.children)
          if (found) return found
        }
      }
      return null
    }

    const file = findFile(projectFiles)
    if (!file || file.type !== 'file') return

    // Check if tab already exists
    const existingTab = fileTabs.tabs.find(tab => tab.path === filePath)
    if (existingTab) {
      fileTabs.handleTabSelect(existingTab.id)
      return
    }

    // Create content based on file type
    let content = ''
    let type: 'dsl' | 'asset' = 'dsl'

    if (file.fileType === 'asset') {
      type = 'asset'
      // Assets don't have editable content
    } else {
      // Get content from the mapping
      content = fileContents[filePath] || `// Content for ${filePath}\n// TODO: Load from file system`
    }

    // Create new tab
    const tabId = `file-${Date.now()}-${Math.random()}`
    const newTab: TabData = {
      id: tabId,
      name: file.name,
      path: filePath,
      content,
      isDirty: false,
      type,
    }

    fileTabs.openTab(newTab)
  }, [projectFiles, fileTabs, fileContents, setSelectedFile])

  return (
    <div
      className="
        h-screen flex flex-col
        bg-background
        text-foreground
        overflow-hidden
      "
    >
      {/* Subtle gradient background overlay */}
      <div
        className="
          fixed inset-0 pointer-events-none
          bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02]
        "
      />

      {/* Toolbar */}
      <EditorToolbar
        title={ast?.title}
        hasUnsavedChanges={hasUnsavedChanges}
        hasError={!!error}
        hasAst={!!ast}
        isFullscreen={isFullscreen}
        showPageTraveller={showPageTraveller}
        onSave={handleSave}
        onRestart={handleRestart}
        onToggleFullscreen={toggleFullscreen}
        onTogglePageTraveller={togglePageTraveller}
      />

      {/* Main content area */}
      <main
        className="
          flex-1 flex flex-col min-h-0
          relative
        "
      >
        {/* File Tabs - Full width at top, hidden in fullscreen */}
        {!isFullscreen && fileTabs.tabs.length > 0 && (
          <FileTabs
            tabs={fileTabs.tabs}
            activeTab={fileTabs.activeTab}
            onTabSelect={fileTabs.handleTabSelect}
            onTabClose={fileTabs.handleTabClose}
            onTabSave={fileTabs.handleTabSave}
          />
        )}

        {/* Content area with panels */}
        <div className="flex-1 flex min-h-0">
          {/* Page Traveller - Hidden in fullscreen */}
          {!isFullscreen && showPageTraveller && ast && (
            <PageTraveller
              pages={ast.pages}
              currentPage={currentPage}
              onPageSelect={handlePageSelect}
            />
          )}

          {/* File Tree - Hidden in fullscreen */}
          {!isFullscreen && (
            <FileTree
              files={projectFiles}
              selectedPath={selectedFile}
              onSelectFile={handleFileSelect}
              onCreatePage={handleCreatePage}
              onCreateAsset={handleCreateAsset}
            />
          )}

          {/* Editor Panel - Hidden in fullscreen */}
          {!isFullscreen && (
            <EditorPanel
              value={fileTabs.activeTab ? fileTabs.tabs.find(t => t.id === fileTabs.activeTab)?.content || draft : draft}
              error={error}
              onChange={(value) => {
                if (fileTabs.activeTab) {
                  fileTabs.updateTabContent(fileTabs.activeTab, value)
                } else {
                  handleEditorChange(value)
                }
              }}
              onSave={() => {
                if (fileTabs.activeTab) {
                  fileTabs.handleTabSave(fileTabs.activeTab)
                } else {
                  handleSave()
                }
              }}
            />
          )}

          {/* Preview Panel */}
          <PreviewPanel
            ast={ast}
            assets={assets}
            playerKey={playerKey}
            previewSize={previewSize}
            isFullscreen={isFullscreen}
            hasError={!!error}
          />
        </div>
      </main>

      {/* Dialogs */}
      <PageCreationPopover
        isOpen={showPageCreation}
        onClose={() => setShowPageCreation(false)}
        onCreate={fileOperations.handlePageCreated}
        position={popoverPosition}
      />

      <AssetUploadDialog
        isOpen={showAssetUpload}
        onClose={() => setShowAssetUpload(false)}
        onUpload={fileOperations.handleAssetsUploaded}
        maxSizeMB={50}
      />
    </div>
  )
}
