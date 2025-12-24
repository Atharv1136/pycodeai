"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Trash2, Play, Download, Loader2, Image, Code } from "lucide-react"
import { useEditorStore } from "@/lib/store"
import { useState, useEffect, useRef, useCallback } from "react"
import { Terminal } from "./Terminal"

export function OutputConsole() {
  const { output, runCode, clearOutput, isCodeRunning } = useEditorStore();
  const [hasImages, setHasImages] = useState(false);
  const outputScrollRef = useRef<HTMLDivElement>(null);
  const problemsScrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  // Check if output contains image references
  useEffect(() => {
    const imagePattern = /\.(png|jpg|jpeg|gif|bmp|svg|webp)/i;
    setHasImages(imagePattern.test(output));
  }, [output]);

  // Auto-scroll output to bottom when new content arrives (if auto-scroll is enabled)
  useEffect(() => {
    if (autoScrollRef.current && outputScrollRef.current && output) {
      const container = outputScrollRef.current;
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          left: container.scrollWidth,
          behavior: 'smooth'
        });
      });
    }
  }, [output]);

  // Handle scroll events to detect if user is scrolling up
  const handleOutputScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    autoScrollRef.current = isAtBottom;
  }, []);

  // Prevent scroll from bubbling to parent - always prevent page scroll when scrolling in output
  const handleOutputWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = container;
    
    const canScrollVertically = scrollHeight > clientHeight;
    const canScrollHorizontally = scrollWidth > clientWidth;
    const isVerticalScroll = Math.abs(e.deltaY) > Math.abs(e.deltaX);
    
    // Always prevent page scroll when we have scrollable content
    if (canScrollVertically || canScrollHorizontally) {
      // Prevent default and stop propagation to prevent page scroll
      e.preventDefault();
      e.stopPropagation();
      
      // Manually handle scrolling
      if (isVerticalScroll && canScrollVertically) {
        const deltaY = e.deltaY;
        container.scrollTop = scrollTop + deltaY;
      } else if (!isVerticalScroll && canScrollHorizontally) {
        const deltaX = e.deltaX;
        container.scrollLeft = scrollLeft + deltaX;
      }
    }
    
    // Update auto-scroll state
    if (canScrollVertically) {
      const isNowAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5;
      autoScrollRef.current = isNowAtBottom;
    }
  }, []);

  const handleProblemsWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = container;
    
    const canScrollVertically = scrollHeight > clientHeight;
    const canScrollHorizontally = scrollWidth > clientWidth;
    const isVerticalScroll = Math.abs(e.deltaY) > Math.abs(e.deltaX);
    
    // Always prevent page scroll when we have scrollable content
    if (canScrollVertically || canScrollHorizontally) {
      e.preventDefault();
      e.stopPropagation();
      
      // Manually handle scrolling
      if (isVerticalScroll && canScrollVertically) {
        const deltaY = e.deltaY;
        container.scrollTop = scrollTop + deltaY;
      } else if (!isVerticalScroll && canScrollHorizontally) {
        const deltaX = e.deltaX;
        container.scrollLeft = scrollLeft + deltaX;
      }
    }
  }, []);

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOutput = () => {
    if (!output) {
      return <span className="text-muted-foreground">Click the run button to see output.</span>;
    }

    // Split output into lines and process each line
    const lines = output.split('\n');
    return lines.map((line, index) => {
      // Check if line contains image file reference
      const imageMatch = line.match(/\.(png|jpg|jpeg|gif|bmp|svg|webp)/i);
      if (imageMatch) {
        return (
          <div key={index} className="my-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Image className="h-4 w-4" />
              <span className="text-sm font-medium">Image Generated:</span>
            </div>
            <div className="mt-1 text-sm text-blue-600 dark:text-blue-400 font-mono">
              {line.trim()}
            </div>
            <div className="mt-2 text-xs text-blue-500 dark:text-blue-400">
              💡 Tip: Use matplotlib.savefig() or similar methods to save images to files
            </div>
          </div>
        );
      }

      // Check if line contains success message for graphical apps
      if (line.includes('[SUCCESS] Graphical application executed successfully')) {
        return (
          <div key={index} className="my-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Code className="h-4 w-4" />
              <span className="text-sm font-medium">Graphical App Executed Successfully!</span>
            </div>
            <div className="mt-1 text-sm text-green-600 dark:text-green-400">
              {line.replace('[SUCCESS] ', '')}
            </div>
          </div>
        );
      }

      // Check if line contains error
      if (line.includes('Error:') || line.includes('Traceback')) {
        return (
          <div key={index} className="text-red-600 dark:text-red-400">
            {line}
          </div>
        );
      }

      // Check if line contains info message
      if (line.includes('[INFO]') || line.includes('[AI NOTE]')) {
        return (
          <div key={index} className="text-blue-600 dark:text-blue-400">
            {line}
          </div>
        );
      }

      // Regular output
      return <div key={index}>{line}</div>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-secondary/30 dark:bg-card">
      <Tabs defaultValue="output" className="flex flex-col flex-grow">
        <div className="flex items-center justify-between px-2 border-b">
          <TabsList className="bg-transparent border-none p-0">
            <TabsTrigger value="output" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-secondary/50">
              Output {hasImages && <Image className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="terminal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-secondary/50">Terminal</TabsTrigger>
            <TabsTrigger value="problems" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-secondary/50">Problems</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={runCode} disabled={isCodeRunning}>
                {isCodeRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload}>
                <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearOutput}>
                <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <TabsContent value="output" className="flex-grow mt-0 flex flex-col min-h-0 overflow-hidden">
          <div 
            ref={outputScrollRef}
            onScroll={handleOutputScroll}
            onWheel={handleOutputWheel}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-auto p-4 text-sm font-code output-scrollbar"
            style={{
              scrollbarWidth: 'auto',
              scrollbarColor: '#9CA3AF #374151',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain', // Prevent scroll chaining to parent
            }}
          >
            <div style={{ minWidth: 'min-content' }}>
              {renderOutput()}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="terminal" className="flex-grow mt-0 p-0 min-h-0 overflow-hidden">
          <Terminal />
        </TabsContent>
        <TabsContent value="problems" className="flex-grow mt-0 flex flex-col min-h-0 overflow-hidden">
          <div 
            ref={problemsScrollRef}
            onWheel={handleProblemsWheel}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-auto p-4 font-code text-sm output-scrollbar"
            style={{
              scrollbarWidth: 'auto',
              scrollbarColor: '#9CA3AF #374151',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain', // Prevent scroll chaining to parent
            }}
          >
            <div style={{ minWidth: 'min-content' }}>
              <p>No problems detected.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
