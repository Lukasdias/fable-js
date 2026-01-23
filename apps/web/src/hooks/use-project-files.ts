import { useState, useMemo } from 'react'

interface ProjectFile {
  name: string
  type: 'file' | 'folder'
  path: string
  fileType?: 'main' | 'page' | 'asset'
  children?: ProjectFile[]
  url?: string
  metadata?: any
}

interface UseProjectFilesResult {
  projectFiles: ProjectFile[]
  setProjectFiles: (files: ProjectFile[] | ((prev: ProjectFile[]) => ProjectFile[])) => void
  assets: Record<string, { url: string; type: string }>
}

export function useProjectFiles(): UseProjectFilesResult {
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([
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
      ] as ProjectFile[],
    },
    {
      name: 'assets',
      type: 'folder' as const,
      path: 'assets',
      children: [] as ProjectFile[],
    },
  ])

  // Extract assets from projectFiles
  const assets = useMemo(() => {
    const assetsMap: Record<string, { url: string; type: string }> = {}
    const assetsFolder = projectFiles.find(f => f.name === 'assets')
    if (assetsFolder?.children) {
      assetsFolder.children.forEach(asset => {
        if (asset.metadata) {
          assetsMap[`assets/${asset.name}`] = {
            url: asset.metadata.url,
            type: asset.metadata.type
          }
        }
      })
    }
    return assetsMap
  }, [projectFiles])

  return {
    projectFiles,
    setProjectFiles,
    assets,
  }
}