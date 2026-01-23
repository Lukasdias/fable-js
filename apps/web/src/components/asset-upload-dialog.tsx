import { useState, useCallback, useRef, memo } from 'react'
import { Upload, X, File, Image, Music, Video, FileText } from 'lucide-react'

interface AssetUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: File[]) => void
  maxSizeMB: number
}

interface FilePreview {
  file: File
  preview?: string
  error?: string
}

const AssetUploadDialog = memo(function AssetUploadDialog({
  isOpen,
  onClose,
  onUpload,
  maxSizeMB,
}: AssetUploadDialogProps) {
  const [files, setFiles] = useState<FilePreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const getFileIcon = (file: File) => {
    const type = file.type

    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-purple-400" />
    } else if (type.startsWith('audio/')) {
      return <Music className="w-4 h-4 text-pink-400" />
    } else if (type.startsWith('video/')) {
      return <Video className="w-4 h-4 text-red-400" />
    } else {
      return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`
    }

    // Validate file type
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      // Video
      'video/mp4', 'video/webm', 'video/ogg',
      // Documents
      'application/pdf', 'text/plain', 'application/json', 'text/xml', 'text/csv', 'text/markdown'
    ]

    if (!allowedTypes.includes(file.type)) {
      return `Unsupported file type: ${file.type}`
    }

    return null
  }

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FilePreview[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const error = validateFile(file)

      newFiles.push({
        file,
        error: error || undefined,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      })
    }

    setFiles(newFiles)
  }, [maxSizeBytes])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles)
    }
  }, [handleFiles])

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      const removed = newFiles.splice(index, 1)[0]
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return newFiles
    })
  }, [])

  const handleUpload = useCallback(() => {
    const validFiles = files.filter(f => !f.error).map(f => f.file)
    if (validFiles.length > 0) {
      onUpload(validFiles)
      // Cleanup previews
      files.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview)
      })
      setFiles([])
      onClose()
    }
  }, [files, onUpload, onClose])

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0)
  const hasErrors = files.some(f => f.error)
  const validFilesCount = files.filter(f => !f.error).length

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Dialog */}
        <div
          className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-gray-200">Upload Assets</h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-700/50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Drop Zone */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${isDragging
                  ? 'border-blue-400 bg-blue-900/20'
                  : 'border-gray-600 hover:border-gray-500'
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Maximum {maxSizeMB}MB per upload • Images, audio, video, documents
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,audio/*,video/*,.pdf,.txt,.json,.xml,.csv,.md"
            />

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {files.map((filePreview, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded border border-gray-600"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(filePreview.file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate">
                          {filePreview.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(filePreview.file.size)}
                        </p>
                      </div>
                    </div>

                    {filePreview.error ? (
                      <div className="text-xs text-red-400 ml-2">
                        {filePreview.error}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 rounded hover:bg-gray-600/50 transition-colors ml-2"
                        title="Remove file"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {files.length > 0 && (
              <div className="mt-4 p-3 bg-gray-700/30 rounded border border-gray-600">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">
                    {validFilesCount} of {files.length} files valid
                  </span>
                  <span className="text-gray-300">
                    Total: {formatFileSize(totalSize)}
                  </span>
                </div>
                {hasErrors && (
                  <p className="text-xs text-red-400 mt-1">
                    Some files exceed the size limit and won't be uploaded
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={validFilesCount === 0}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              Upload {validFilesCount} File{validFilesCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </>
  )
})

export { AssetUploadDialog }