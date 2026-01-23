import { useState, useCallback, memo } from 'react'
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, Plus, Image, Music, Code } from 'lucide-react'

interface FileNode {
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileNode[]
  fileType?: 'page' | 'asset' | 'main'
}

interface FileTreeItemProps {
  node: FileNode
  level: number
  selectedPath: string | null
  onSelect: (path: string) => void
  onCreatePage: (folderPath: string, position?: { x: number; y: number }) => void
  onCreateAsset: (folderPath: string) => void
}

const FileTreeItem = memo(function FileTreeItem({
  node,
  level,
  selectedPath,
  onSelect,
  onCreatePage,
  onCreateAsset,
}: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2)
  const isSelected = selectedPath === node.path
  const isPagesFolder = node.name === 'pages' && node.type === 'folder'
  const isAssetsFolder = node.name === 'assets' && node.type === 'folder'

  const handleToggle = useCallback(() => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded)
    } else {
      onSelect(node.path)
    }
  }, [node, isExpanded, onSelect])

  const handleCreatePage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPagesFolder) {
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      onCreatePage(node.path, { x: rect.left, y: rect.top })
    }
  }, [isPagesFolder, node.path, onCreatePage])

  const handleCreateAsset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (isAssetsFolder) {
      onCreateAsset(node.path)
    }
  }, [isAssetsFolder, node.path, onCreateAsset])

  const getFileIcon = () => {
    if (node.type === 'folder') {
      return isExpanded ? (
        <FolderOpen className="w-4 h-4 text-blue-400" />
      ) : (
        <Folder className="w-4 h-4 text-blue-400" />
      )
    }

    switch (node.fileType) {
      case 'main':
        return <Code className="w-4 h-4 text-orange-400" />
      case 'page':
        return <FileText className="w-4 h-4 text-green-400" />
      case 'asset':
        if (node.name.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
          return <Image className="w-4 h-4 text-purple-400" />
        }
        if (node.name.match(/\.(mp3|wav|ogg)$/)) {
          return <Music className="w-4 h-4 text-pink-400" />
        }
        return <FileText className="w-4 h-4 text-gray-400" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div>
      <div
        className={`
          group flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-700/50 transition-all duration-150
          ${isSelected ? 'bg-blue-600/20 border-l-2 border-blue-400 shadow-sm' : ''}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleToggle}
      >
        {node.type === 'folder' && (
          <div className="mr-1">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
          </div>
        )}
        <div className="mr-2">{getFileIcon()}</div>
        <span className="text-sm text-gray-200 flex-1 truncate">{node.name}</span>

        {node.type === 'folder' && (
          <div className="flex items-center space-x-1 ml-2">
            {isPagesFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const rect = (e.target as HTMLElement).getBoundingClientRect()
                  onCreatePage(node.path, { x: rect.left, y: rect.top })
                }}
                className="p-1 rounded hover:bg-gray-600/50 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                title="Add Page"
              >
                <Plus className="w-3 h-3 text-green-400" />
              </button>
            )}
            {isAssetsFolder && (
              <button
                onClick={handleCreateAsset}
                className="p-1 rounded hover:bg-gray-600/50 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                title="Add Asset"
              >
                <Plus className="w-3 h-3 text-purple-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {node.type === 'folder' && isExpanded && node.children && (
        <div className="animate-in slide-in-from-top-1 duration-200">
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onCreatePage={onCreatePage}
              onCreateAsset={onCreateAsset}
            />
          ))}
        </div>
      )}
    </div>
  )
})

interface FileTreeProps {
  files: FileNode[]
  selectedPath: string | null
  onSelectFile: (path: string) => void
  onCreatePage: (folderPath: string, position?: { x: number; y: number }) => void
  onCreateAsset: (folderPath: string) => void
}

export const FileTree = memo(function FileTree({
  files,
  selectedPath,
  onSelectFile,
  onCreatePage,
  onCreateAsset,
}: FileTreeProps) {
  return (
    <div className="bg-gray-900 border-r border-gray-700 h-full overflow-y-auto">
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-200">Project Files</h3>
          <div className="text-xs text-gray-400">Fable</div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect()
              onCreatePage('pages', { x: rect.left, y: rect.bottom + 5 })
            }}
            className="flex items-center px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-all duration-200 hover:shadow-lg"
            title="Create new page in pages folder"
          >
            <Plus className="w-3 h-3 mr-1" />
            Page
          </button>
          <button
            onClick={() => onCreateAsset('assets')}
            className="flex items-center px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-all duration-200 hover:shadow-lg"
            title="Create new asset in assets folder"
          >
            <Plus className="w-3 h-3 mr-1" />
            Asset
          </button>
        </div>
      </div>

      <div className="py-2">
        {files.map((file) => (
          <FileTreeItem
            key={file.path}
            node={file}
            level={0}
            selectedPath={selectedPath}
            onSelect={onSelectFile}
            onCreatePage={onCreatePage}
            onCreateAsset={onCreateAsset}
          />
        ))}
      </div>
    </div>
  )
})