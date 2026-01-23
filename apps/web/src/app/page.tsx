'use client'

import dynamic from 'next/dynamic'
import { FableEditorLoading } from '@/components/fable-editor-loading'

const FableEditor = dynamic(() => import('@/components/fable-editor').then(mod => ({ default: mod.FableEditor })), {
  ssr: false,
  loading: () => <FableEditorLoading />
})

export default function Home() {
  return (
    <main className="h-screen bg-background">
      <FableEditor />
    </main>
  )
}