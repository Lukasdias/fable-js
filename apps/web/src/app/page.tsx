'use client'

import dynamic from 'next/dynamic'

const FableEditor = dynamic(() => import('@/components/fable-editor').then(mod => ({ default: mod.FableEditor })), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading FableJS Editor...</p>
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <main className="h-screen bg-background">
      <FableEditor />
    </main>
  )
}