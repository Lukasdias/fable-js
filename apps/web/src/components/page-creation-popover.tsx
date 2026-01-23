import { useState, useCallback, useEffect, memo } from 'react'
import { Check, X } from 'lucide-react'

interface PageCreationPopoverProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => void
  position: { x: number; y: number }
}

const PageCreationPopover = memo(function PageCreationPopover({
  isOpen,
  onClose,
  onCreate,
  position,
}: PageCreationPopoverProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  const validateInput = useCallback((value: string): string => {
    if (!value.trim()) {
      return 'Name cannot be empty'
    }
    if (value.includes(' ')) {
      return 'Name cannot contain spaces'
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      return 'Name can only contain letters, numbers, hyphens, and underscores'
    }
    return ''
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setError(validateInput(value))
  }, [validateInput])

  const handleSubmit = useCallback(() => {
    if (!error && inputValue.trim()) {
      const slugified = slugify(inputValue)
      onCreate(`${slugified}.fable`)
      setInputValue('')
      setError('')
      onClose()
    }
  }, [error, inputValue, onCreate, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !error && inputValue.trim()) {
      handleSubmit()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [error, inputValue, handleSubmit, onClose])

  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Popover */}
      <div
        className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 min-w-80"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 200),
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-200">Create New Page</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Page Name (will be slugified)
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter page name..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 placeholder-gray-500 focus:border-blue-400 focus:outline-none"
              autoFocus
            />
            {inputValue && (
              <div className="mt-1 text-xs text-gray-400">
                Result: <code className="bg-gray-600 px-1 py-0.5 rounded">{slugify(inputValue)}.fable</code>
              </div>
            )}
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded p-2">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-300 hover:text-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!!error || !inputValue.trim()}
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center"
            >
              <Check className="w-3 h-3 mr-1" />
              Create Page
            </button>
          </div>
        </div>
      </div>
    </>
  )
})

export { PageCreationPopover }