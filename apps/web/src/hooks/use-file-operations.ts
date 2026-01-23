import { useCallback } from 'react'
import type { TabData } from '../components/file-tabs'

interface UseFileOperationsProps {
  dsl: string
  setDsl: (dsl: string) => void
  setDraft: (dsl: string) => void
  projectFiles: any[]
  setProjectFiles: (files: any[] | ((prev: any[]) => any[])) => void
  openTab: (tab: TabData) => void
  setShowAssetUpload?: (show: boolean) => void
}

interface UseFileOperationsResult {
  handleCreatePage: (folderPath: string, position?: { x: number; y: number }) => void
  handlePageCreated: (fileName: string) => void
  handleCreateAsset: (folderPath: string) => void
  handleAssetsUploaded: (files: File[]) => void
}

export function useFileOperations({
  dsl,
  setDsl,
  setDraft,
  projectFiles,
  setProjectFiles,
  openTab,
  setShowAssetUpload,
}: UseFileOperationsProps): UseFileOperationsResult {

  const handleCreatePage = useCallback((folderPath: string, position?: { x: number; y: number }) => {
    if (folderPath !== 'pages') return
    // Logic moved to handlePageCreated
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

    openTab(newTab)

    // Add to DSL
    const newDsl = `${dsl}\n\n${initialContent}`
    setDsl(newDsl)
    setDraft(newDsl)
  }, [dsl, projectFiles, setDsl, setDraft, setProjectFiles, openTab])

  const handleCreateAsset = useCallback((folderPath: string) => {
    if (folderPath !== 'assets') return
    setShowAssetUpload?.(true)
  }, [setShowAssetUpload])

  const handleAssetsUploaded = useCallback(async (files: File[]) => {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Upload failed:', result.error)
        alert(`Upload failed: ${result.error}`)
        return
      }

      // Update file tree with uploaded assets
      setProjectFiles(prev => prev.map(file =>
        file.name === 'assets' && file.children
          ? {
              ...file,
              children: [...file.children, ...result.assets.map((asset: any) => ({
                name: asset.originalName,
                type: 'file' as const,
                path: `assets/${asset.originalName}`,
                fileType: 'asset' as const,
                url: asset.url,
                metadata: asset,
              }))]
            }
          : file
      ))

      // Create tabs for uploaded files
      const newTabs: TabData[] = result.assets.map((asset: any) => ({
        id: `asset-${asset.id}`,
        name: asset.originalName,
        path: `assets/${asset.originalName}`,
        content: '', // Assets don't have editable content
        isDirty: false,
        type: 'asset',
        url: asset.url,
        metadata: asset,
      }))

      newTabs.forEach(tab => openTab(tab))

      // Show success message
      if (result.errors && result.errors.length > 0) {
        alert(`Upload completed with some errors:\n${result.errors.join('\n')}`)
      } else {
        alert(`Successfully uploaded ${result.assets.length} asset(s)`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed due to network error')
    }
  }, [setProjectFiles, openTab])

  return {
    handleCreatePage,
    handlePageCreated,
    handleCreateAsset,
    handleAssetsUploaded,
  }
}