import { useState, useCallback, memo } from 'react'
import { X, Circle, FileText, Code } from 'lucide-react'

interface TabData {
  id: string
  name: string
  path: string
  content: string
  isDirty: boolean
  type: 'dsl' | 'asset'
}

interface FileTabsProps {
  tabs: TabData[]
  activeTab: string | null
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onTabSave: (tabId: string) => void
}

const FileTabs = memo(function FileTabs({
  tabs,
  activeTab,
  onTabSelect,
  onTabClose,
  onTabSave,
}: FileTabsProps) {
  return (
    <div className="w-full flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          className={`
            group flex items-center px-4 py-2 cursor-pointer relative transition-all duration-150
            ${activeTab === tab.id
              ? 'bg-gray-900 border-b-2 border-blue-400 text-gray-100'
              : 'bg-gray-800 hover:bg-gray-700/50 text-gray-300 hover:text-gray-200'
            }
          `}
          onClick={() => onTabSelect(tab.id)}
        >
          {/* File icon */}
          {tab.type === 'dsl' ? (
            <Code className="w-4 h-4 mr-2 flex-shrink-0" />
          ) : (
            <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
          )}

          {/* File name */}
          <span className="text-sm truncate max-w-40 flex-shrink-0">{tab.name}</span>

          {/* Dirty indicator */}
          {tab.isDirty && (
            <div className="w-2 h-2 ml-2 rounded-full bg-orange-400 flex-shrink-0" />
          )}

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (tab.isDirty) {
                // For now, just save automatically. In real implementation, show confirmation
                onTabSave(tab.id)
              }
              onTabClose(tab.id)
            }}
            className={`
              ml-3 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-600/50
              transition-all duration-150 flex-shrink-0
              ${activeTab === tab.id ? 'opacity-60' : ''}
            `}
            title="Close tab"
          >
            <X className="w-3 h-3 text-gray-400 hover:text-gray-200" />
          </button>

          {/* Active indicator line */}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
          )}
        </div>
      ))}
    </div>
  )
})

export { FileTabs }
export type { TabData }