"use client"

import { Bot, User, Send, Copy, Loader2, Sparkles, File, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { useEditorStore } from '@/lib/store'
import { FormEvent, useRef, useState, useEffect } from 'react'

export function ChatPanel() {
  const { fileTree, chatHistory, isAiLoading, quickActions, sendMessage, runQuickAction, codeContext } = useEditorStore();
  const [message, setMessage] = useState('');
  const [attachCode, setAttachCode] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatHistory, isAiLoading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(message, attachCode);
    setMessage('');
  }

  return (
    <div className="flex flex-col h-full bg-secondary/30 dark:bg-card">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary"/>
            <h2 className="font-semibold text-base">AI Assistant</h2>
        </div>
        <Badge variant="outline" className="text-green-500 border-green-500">Online</Badge>
      </div>
      
      {quickActions.length > 0 && (
        <div className="p-2 border-b">
          <p className="text-xs text-muted-foreground mb-2 flex items-center"><Sparkles className="h-3 w-3 mr-1"/> Quick Actions:</p>
          <div className="flex flex-wrap gap-2">
              {quickActions.map(action => (
                  <Button key={action} variant="outline" size="sm" className="text-xs h-7" onClick={() => runQuickAction(action)}>
                      {action.replace(/_/g, ' ')}
                  </Button>
              ))}
          </div>
        </div>
      )}

      {/* Uploaded Files Section */}
      {fileTree.children.some(item => item.type === 'file' && item.uploadPath) && (
        <div className="p-2 border-b">
          <p className="text-xs text-muted-foreground mb-2 flex items-center">
            <Upload className="h-3 w-3 mr-1"/> Uploaded Files:
          </p>
          <div className="space-y-1">
            {fileTree.children
              .filter(item => item.type === 'file' && item.uploadPath)
              .map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-1 bg-muted/50 rounded text-xs">
                  <File className="h-3 w-3 text-blue-500" />
                  <span className="truncate">{file.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
            {chatHistory.length === 0 && !isAiLoading && (
              <div className="text-center text-sm text-muted-foreground pt-10">
                <p>Ask me to explain, write, or fix code!</p>
                <p className="text-xs mt-1">{codeContext}</p>
              </div>
            )}
            {chatHistory.map((item, index) => (
                <div key={index} className={`flex items-start gap-3 ${item.role === 'user' ? 'justify-end' : ''}`}>
                    {item.role === 'assistant' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`rounded-lg p-3 max-w-[85%] ${item.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm whitespace-pre-wrap">{item.message}</p>
                    </div>
                    {item.role === 'user' && (
                         <Avatar className="h-8 w-8">
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            ))}
            {isAiLoading && (
                <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
            )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
        <div className="relative">
            <Textarea 
                placeholder="Ask the AI to write or fix code..." 
                className="pr-16 min-h-[60px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
            />
            <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-9 w-9" disabled={isAiLoading}>
                <Send className="h-4 w-4" />
            </Button>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox id="attach-code" checked={attachCode} onCheckedChange={(checked) => setAttachCode(!!checked)} />
          <Label htmlFor="attach-code" className="text-xs font-normal">
            Attach current code context
          </Label>
        </div>
      </form>
    </div>
  )
}
