"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Terminal as TerminalIcon, Loader2 } from 'lucide-react'
import { useEditorStore } from '@/lib/store'

interface TerminalHistory {
  command: string
  output: string
  timestamp: Date
  success: boolean
}

export function Terminal() {
  const { currentProject, currentUser } = useEditorStore()
  const [history, setHistory] = useState<TerminalHistory[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef(true)

  // Initialize welcome message
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{
        command: '',
        output: `Python Terminal\nType 'help' for available commands.\n\nExamples:\n  pip install pandas\n  pip install matplotlib\n  pip install numpy\n  pip list\n  python --version\n  install-all       - Install all recommended packages\n\nNote: Installed packages will be available when you run your Python code.\nBuilt-in modules like 'json' don't need to be installed.`,
        timestamp: new Date(),
        success: true
      }])
    }
  }, [])

  // Auto-install all packages when terminal opens (if user and project are available)
  useEffect(() => {
    if (currentProject && currentUser && history.length === 1 && !isExecuting) {
      // Wait a bit for terminal to render, then auto-install
      const timer = setTimeout(() => {
        const installCommand = async () => {
          setIsExecuting(true)
          
          const commandEntry: TerminalHistory = {
            command: 'install-all',
            output: 'Installing all recommended packages... This may take several minutes.\n\nPackages: numpy, pandas, matplotlib, seaborn, scipy, statsmodels, scikit-learn, xgboost, lightgbm, catboost, tensorflow, keras, torch, torchvision, torchaudio, missingno, category_encoders, imbalanced-learn, pyjanitor, plotly, bokeh, altair, dash, dask, pyspark, vaex, nltk, spacy, transformers, textblob, opencv-python, mediapipe, sqlalchemy',
            timestamp: new Date(),
            success: true
          }
          setHistory(prev => [...prev, commandEntry])

          try {
            const response = await fetch('/api/terminal/install-all-packages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId: currentProject.id,
                userId: currentUser.id
              })
            })

            const data = await response.json()

            setHistory(prev => {
              const newHistory = [...prev]
              const lastEntry = newHistory[newHistory.length - 1]
              if (lastEntry && lastEntry.command === 'install-all') {
                lastEntry.output = data.output || data.error || 'Installation completed.'
                lastEntry.success = data.success !== false
              }
              return newHistory
            })
          } catch (error) {
            setHistory(prev => {
              const newHistory = [...prev]
              const lastEntry = newHistory[newHistory.length - 1]
              if (lastEntry && lastEntry.command === 'install-all') {
                lastEntry.output = `Error: ${error instanceof Error ? error.message : 'Failed to install packages'}`
                lastEntry.success = false
              }
              return newHistory
            })
          } finally {
            setIsExecuting(false)
          }
        }
        
        installCommand()
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [currentProject, currentUser, history.length, isExecuting])

  // Scroll to bottom when new output is added (only if auto-scroll is enabled)
  useEffect(() => {
    if (autoScrollRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      // Smooth scroll to bottom
      const scrollToBottom = () => {
        if (container) {
          // Use smooth scrolling
          container.scrollTo({
            top: container.scrollHeight,
            left: container.scrollWidth,
            behavior: 'smooth'
          })
        }
      }
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        scrollToBottom()
        // Small delay to ensure DOM is fully updated
        setTimeout(scrollToBottom, 50)
      })
    }
  }, [history])

  // Handle scroll events to detect if user is scrolling up
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50
    autoScrollRef.current = isAtBottom
  }, [])

  // Handle wheel scroll - always prevent page scroll when scrolling in terminal
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = container
    
    // Check if content can scroll
    const canScrollVertically = scrollHeight > clientHeight
    const canScrollHorizontally = scrollWidth > clientWidth
    
    // Check boundaries
    const isAtTop = scrollTop <= 0
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5
    const isAtLeft = scrollLeft <= 0
    const isAtRight = scrollLeft + clientWidth >= scrollWidth - 5
    
    // Determine if we're scrolling vertically or horizontally
    const isVerticalScroll = Math.abs(e.deltaY) > Math.abs(e.deltaX)
    
    // Always prevent page scroll when we have scrollable content
    if (canScrollVertically || canScrollHorizontally) {
      // Prevent default and stop propagation to prevent page scroll
      e.preventDefault()
      e.stopPropagation()
      
      // Manually handle scrolling
      if (isVerticalScroll && canScrollVertically) {
        // Calculate new scroll position
        const deltaY = e.deltaY
        const currentScrollTop = scrollTop
        
        // Scroll the container
        container.scrollTop = currentScrollTop + deltaY
      } else if (!isVerticalScroll && canScrollHorizontally) {
        // Calculate new scroll position
        const deltaX = e.deltaX
        const currentScrollLeft = scrollLeft
        
        // Scroll the container
        container.scrollLeft = currentScrollLeft + deltaX
      }
    }
    
    // Update auto-scroll state
    if (canScrollVertically) {
      const isNowAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5
      autoScrollRef.current = isNowAtBottom
    }
  }, [])

  const executeCommand = async (command: string) => {
    if (!command.trim()) return

    if (command.trim().toLowerCase() === 'help') {
      setHistory(prev => [...prev, {
        command: command,
        output: `Available commands:\n  pip install <package>  - Install a Python package\n  pip uninstall <package> - Uninstall a package\n  pip list                - List installed packages\n  pip show <package>      - Show package info\n  pip freeze              - Show installed packages in requirements format\n  install-all            - Install all recommended packages (data science, ML, etc.)\n  python --version        - Show Python version\n  python --help           - Show Python help\n  ls                      - List files\n  pwd                     - Show current directory\n  echo <text>             - Echo text\n  clear                   - Clear terminal history`,
        timestamp: new Date(),
        success: true
      }])
      return
    }

    if (command.trim().toLowerCase() === 'install-all') {
      if (!currentProject || !currentUser) {
        setHistory(prev => [...prev, {
          command: command,
          output: 'Error: No project or user context. Please ensure you are logged in and have a project open.',
          timestamp: new Date(),
          success: false
        }])
        return
      }

      setIsExecuting(true)
      
      const commandEntry: TerminalHistory = {
        command: command,
        output: 'Installing all recommended packages... This may take several minutes.',
        timestamp: new Date(),
        success: true
      }
      setHistory(prev => [...prev, commandEntry])

      try {
        const response = await fetch('/api/terminal/install-all-packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: currentProject.id,
            userId: currentUser.id
          })
        })

        const data = await response.json()

        setHistory(prev => {
          const newHistory = [...prev]
          const lastEntry = newHistory[newHistory.length - 1]
          if (lastEntry && lastEntry.output.includes('Installing all recommended packages')) {
            lastEntry.output = data.output || data.error || 'Installation completed.'
            lastEntry.success = data.success !== false
          }
          return newHistory
        })
      } catch (error) {
        setHistory(prev => {
          const newHistory = [...prev]
          const lastEntry = newHistory[newHistory.length - 1]
          if (lastEntry && lastEntry.output.includes('Installing all recommended packages')) {
            lastEntry.output = `Error: ${error instanceof Error ? error.message : 'Failed to install packages'}`
            lastEntry.success = false
          }
          return newHistory
        })
      } finally {
        setIsExecuting(false)
        setCurrentCommand('')
        inputRef.current?.focus()
      }
      return
    }

    if (command.trim().toLowerCase() === 'clear') {
      setHistory([])
      return
    }

    // Allow basic commands without project context
    const basicCommands = ['pip list', 'pip show', 'pip freeze', 'python --version', 'python --help'];
    const isBasicCommand = basicCommands.some(cmd => command.toLowerCase().startsWith(cmd.toLowerCase()));
    
    // Only require context for commands that need project tracking
    const needsContext = command.toLowerCase().startsWith('pip install') || 
                         command.toLowerCase().startsWith('install-all');
    
    if (needsContext && (!currentProject || !currentUser)) {
      setHistory(prev => [...prev, {
        command: command,
        output: 'Error: No project or user context. Please ensure you are logged in and have a project open.',
        timestamp: new Date(),
        success: false
      }])
      return
    }

    setIsExecuting(true)
    
    // Add command to history
    const commandEntry: TerminalHistory = {
      command: command,
      output: 'Executing...',
      timestamp: new Date(),
      success: true
    }
    setHistory(prev => [...prev, commandEntry])

    // Add to command history
    setCommandHistory(prev => {
      const newHistory = [...prev, command]
      return newHistory.slice(-50) // Keep last 50 commands
    })
    setHistoryIndex(-1)

      try {
        const response = await fetch('/api/terminal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: command,
            projectId: currentProject?.id || null,
            userId: currentUser?.id || null
          })
        })

      const data = await response.json()

      // Update the last history entry with actual output
      setHistory(prev => {
        const newHistory = [...prev]
        const lastEntry = newHistory[newHistory.length - 1]
        if (lastEntry && lastEntry.output === 'Executing...') {
          // Combine output and error (pip sends some output to stderr)
          const combinedOutput = data.output || ''
          const errorOutput = data.error || ''
          // For pip commands, stderr often contains notices, not errors
          if (command.toLowerCase().startsWith('pip ') && errorOutput && !errorOutput.includes('ERROR')) {
            lastEntry.output = combinedOutput + (combinedOutput ? '\n' : '') + errorOutput
            lastEntry.success = true
          } else {
            lastEntry.output = combinedOutput || errorOutput || 'No output'
            lastEntry.success = data.success !== false && !errorOutput.includes('ERROR')
          }
        }
        return newHistory
      })
    } catch (error) {
      setHistory(prev => {
        const newHistory = [...prev]
        const lastEntry = newHistory[newHistory.length - 1]
        if (lastEntry && lastEntry.output === 'Executing...') {
          lastEntry.output = `Error: ${error instanceof Error ? error.message : 'Failed to execute command'}`
          lastEntry.success = false
        }
        return newHistory
      })
    } finally {
      setIsExecuting(false)
      setCurrentCommand('')
      // Re-enable auto-scroll after command execution
      autoScrollRef.current = true
      // Focus input after a short delay to ensure DOM is updated
      setTimeout(() => {
        inputRef.current?.focus()
      }, 10)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isExecuting) {
      e.preventDefault()
      const cmd = currentCommand.trim()
      if (cmd) {
        executeCommand(cmd)
      }
    } else if (e.key === 'ArrowUp' && !isExecuting) {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentCommand('')
        } else {
          setHistoryIndex(newIndex)
          setCurrentCommand(commandHistory[newIndex])
        }
      }
    }
  }

  const getPrompt = () => {
    const user = currentUser?.name || currentUser?.email?.split('@')[0] || 'user'
    const project = currentProject?.name || 'default'
    return `${user}@${project} $`
  }

  // Focus input when terminal tab becomes active
  useEffect(() => {
    const handleFocus = () => {
      inputRef.current?.focus()
    }
    
    // Focus on mount
    handleFocus()
    
    // Also focus when clicking in the terminal area
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('click', handleFocus)
      return () => {
        container.removeEventListener('click', handleFocus)
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono text-sm overflow-hidden select-text" style={{ height: '100%', maxHeight: '100%' }}>
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-auto terminal-scrollbar"
        style={{
          scrollbarWidth: 'auto',
          scrollbarColor: '#6B7280 #1F2937',
          position: 'relative',
          height: '100%',
          maxHeight: '100%',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain', // Prevent scroll chaining to parent
        }}
      >
        <div className="p-4 space-y-2" style={{ minWidth: 'min-content' }}>
          {history.map((entry, index) => (
            <div key={index} className="space-y-1">
              {entry.command && (
                <div className="flex items-start gap-2 whitespace-pre-wrap break-all">
                  <span className="text-blue-400 flex-shrink-0">{getPrompt()}</span>
                  <span className="text-green-400 break-all">{entry.command}</span>
                </div>
              )}
              <div className={`whitespace-pre-wrap break-all ${
                entry.success 
                  ? entry.command ? 'text-green-400' : 'text-gray-300'
                  : 'text-red-400'
              }`}>
                {entry.output}
              </div>
            </div>
          ))}
          {isExecuting && (
            <div className="flex items-center gap-2 text-yellow-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Executing command...</span>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-gray-700 px-3 py-2 flex items-center gap-2 bg-gray-900 flex-shrink-0">
        <span className="text-blue-400 flex-shrink-0 select-none font-semibold">{getPrompt()}</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => autoScrollRef.current = true}
          disabled={isExecuting}
          className="flex-1 bg-transparent outline-none text-green-400 disabled:opacity-50 caret-green-400 placeholder:text-gray-600"
          placeholder={isExecuting ? "Executing..." : "Type command here..."}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          style={{
            caretColor: '#10b981'
          }}
        />
      </div>
    </div>
  )
}
