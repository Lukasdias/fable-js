import { useState, useCallback } from 'react'
import type { TabData } from '../components/file-tabs'

interface UseFileTabsResult {
  tabs: TabData[]
  activeTab: string | null
  handleTabSelect: (tabId: string) => void
  handleTabClose: (tabId: string) => void
  handleTabSave: (tabId: string) => void
  openTab: (tab: TabData) => void
  updateTabContent: (tabId: string, content: string) => void
}

export function useFileTabs(): UseFileTabsResult {
  const [tabs, setTabs] = useState<TabData[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)

  const handleTabSelect = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])

  const handleTabClose = useCallback((tabId: string) => {
    setTabs(prev => {
      const remainingTabs = prev.filter(tab => tab.id !== tabId)
      if (activeTab === tabId) {
        setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null)
      }
      return remainingTabs
    })
  }, [activeTab])

  const handleTabSave = useCallback((tabId: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, isDirty: false } : tab
    ))
    // In real implementation, would save to server
  }, [])

  const openTab = useCallback((tab: TabData) => {
    setTabs(prev => {
      const existing = prev.find(t => t.id === tab.id)
      if (existing) {
        return prev.map(t => t.id === tab.id ? { ...t, ...tab } : t)
      }
      return [...prev, tab]
    })
    setActiveTab(tab.id)
  }, [])

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId
        ? { ...tab, content, isDirty: content !== tab.content }
        : tab
    ))
  }, [])

  return {
    tabs,
    activeTab,
    handleTabSelect,
    handleTabClose,
    handleTabSave,
    openTab,
    updateTabContent,
  }
}