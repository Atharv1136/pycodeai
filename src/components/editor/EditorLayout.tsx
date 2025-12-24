"use client"

import dynamic from 'next/dynamic'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { FileExplorer } from '@/components/editor/FileExplorer'
import { OutputConsole } from '@/components/editor/OutputConsole'
import { ChatPanel } from '@/components/ai/ChatPanel'
import { Skeleton } from '@/components/ui/skeleton'
import { useEditorStore } from '@/lib/store'
import { useEffect } from 'react'

const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor').then(mod => mod.CodeEditor), {
  ssr: false, // Ensure this component only renders on the client
  loading: () => <Skeleton className="w-full h-full" />,
})


export function EditorLayout() {
  const { activeFile, fetchQuickActions } = useEditorStore();

  useEffect(() => {
    if (activeFile) {
      fetchQuickActions();
    }
  }, [activeFile, fetchQuickActions]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-background dark:bg-card">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={15} className="flex flex-col">
          <FileExplorer />
        </Panel>
        <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
        <Panel defaultSize={50} minSize={30}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} minSize={40}>
              <CodeEditor />
            </Panel>
            <PanelResizeHandle className="h-1 bg-border hover:bg-primary transition-colors" />
            <Panel defaultSize={30} minSize={20}>
              <OutputConsole />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
        <Panel defaultSize={30} minSize={20} className="flex flex-col">
          <ChatPanel />
        </Panel>
      </PanelGroup>
    </div>
  )
}
