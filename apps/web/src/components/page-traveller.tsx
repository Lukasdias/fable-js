'use client'

import { ChevronLeft, ChevronRight, Map, Play } from 'lucide-react'
import { motion } from 'motion/react'
import { memo, useState } from 'react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'

interface PageTravellerProps {
  pages: Array<{
    id: number
    agents: any[]
    statements?: any[]
    autoAdvance?: number
  }>
  currentPage: number
  onPageSelect: (pageId: number) => void
  className?: string
}

// Page preview card component
const PageCard = memo(function PageCard({
  page,
  isActive,
  onClick,
}: {
  page: { id: number; agents: any[]; statements?: any[]; autoAdvance?: number }
  isActive: boolean
  onClick: () => void
}) {
  const agentCount = page.agents.length
  const hasStatements = page.statements && page.statements.length > 0
  const hasAutoAdvance = page.autoAdvance !== undefined

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <button
        onClick={onClick}
        className={`
          w-full p-3 rounded-xl text-left transition-all duration-200
          hover:shadow-lg hover:shadow-primary/10
          active:scale-[0.98]
          ${
            isActive
              ? 'bg-primary/10 border-2 border-primary/30 shadow-md shadow-primary/20'
              : 'bg-card border border-border/50 hover:border-primary/30'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {page.id}
            </div>
            <div>
              <div className="font-semibold text-sm">
                Page {page.id}
              </div>
              <div className="text-xs text-muted-foreground">
                {agentCount} element{agentCount !== 1 ? 's' : ''}
                {hasStatements && ', with logic'}
                {hasAutoAdvance && ', auto-advances'}
              </div>
            </div>
          </div>

          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Play className="h-4 w-4 text-primary fill-primary" />
            </motion.div>
          )}
        </div>
      </button>
    </motion.div>
  )
})

// Navigation controls
const NavigationControls = memo(function NavigationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onPageSelect,
}: {
  currentPage: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
  onPageSelect: (pageId: number) => void
}) {
  const [jumpToPage, setJumpToPage] = useState('')

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNum = parseInt(jumpToPage)
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageSelect(pageNum)
      setJumpToPage('')
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 border-t border-border/50 bg-muted/30">
      {/* Previous/Next buttons */}
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onPrevious}
        disabled={currentPage <= 1}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex-1 flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">
          {currentPage} of {totalPages}
        </span>
      </div>

      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onNext}
        disabled={currentPage >= totalPages}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Jump to page */}
      <form onSubmit={handleJumpSubmit} className="flex items-center gap-1">
        <input
          type="number"
          min="1"
          max={totalPages}
          value={jumpToPage}
          onChange={(e) => setJumpToPage(e.target.value)}
          placeholder="Go to"
          className="
            w-16 h-8 px-2 text-xs rounded-md
            bg-background border border-border/50
            focus:outline-none focus:ring-1 focus:ring-primary/50
          "
        />
      </form>
    </div>
  )
})

export const PageTraveller = memo(function PageTraveller({
  pages,
  currentPage,
  onPageSelect,
  className,
}: PageTravellerProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageSelect(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < pages.length) {
      onPageSelect(currentPage + 1)
    }
  }

  return (
    <div
      className={`
        w-64 bg-surface border-r border-border/30 flex flex-col
        ${className}
      `}
    >
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center">
            <Map className="h-3.5 w-3.5 text-accent" />
          </div>
          <span className="font-semibold text-sm">Page Traveller</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {pages.length} pages
        </span>
      </div>

      {/* Page list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {pages.map((page) => (
            <PageCard
              key={page.id}
              page={page}
              isActive={page.id === currentPage}
              onClick={() => onPageSelect(page.id)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Navigation controls */}
      <NavigationControls
        currentPage={currentPage}
        totalPages={pages.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onPageSelect={onPageSelect}
      />
    </div>
  )
})