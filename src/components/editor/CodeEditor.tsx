"use client"

import React from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { useEditorStore } from "@/lib/store";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

export function CodeEditor() {
    const { theme } = useTheme();
    const { openFiles, activeFile, setActiveFile, closeFile, updateFileContent, addNewFile } = useEditorStore();
    const editorRef = React.useRef<any>(null);

    const handleEditorDidMount = (editor: any, monaco: any) => {
      editorRef.current = editor;
    };

    const handleTabChange = (value: string) => {
        setActiveFile(value);
    };

    const handleCloseTab = (e: React.MouseEvent, fileName: string) => {
        e.stopPropagation();
        closeFile(fileName);
    }

    const handleAddFile = () => {
        const newFileName = prompt("Enter file name (e.g., script.py):");
        if (newFileName && newFileName.trim()) {
          addNewFile(newFileName.trim());
        }
    }

    const handleContentChange = (value: string | undefined) => {
        if (activeFile && value !== undefined) {
            updateFileContent(activeFile.name, value);
        }
    }
    
    if (!activeFile && openFiles.length > 0) {
      setActiveFile(openFiles[0].name);
      return <Skeleton className="w-full h-full" />;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 border-b">
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex items-center px-2">
                    <Tabs value={activeFile?.name} onValueChange={handleTabChange} className="relative">
                        <TabsList className="bg-transparent p-0 border-none gap-0">
                            {openFiles.map(file => (
                                <div key={file.name} className="relative group flex items-center">
                                    <TabsTrigger 
                                        value={file.name} 
                                        className="h-10 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-secondary/50 rounded-none px-4 pr-10"
                                    >
                                        {file.name}
                                    </TabsTrigger>
                                    <button
                                        aria-label={`Close ${file.name}`}
                                        onClick={(e) => handleCloseTab(e, file.name)}
                                        className={cn(
                                            "absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-md flex items-center justify-center transition-colors",
                                            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                                            "hover:bg-muted-foreground/20",
                                            activeFile?.name === file.name && "opacity-100"
                                        )}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </TabsList>
                    </Tabs>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0" onClick={handleAddFile}>
                        <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            <div className="flex-grow relative">
                {activeFile ? (
                    <Editor
                        key={activeFile.name}
                        path={activeFile.name}
                        height="100%"
                        defaultLanguage="python"
                        value={activeFile.content}
                        onChange={handleContentChange}
                        onMount={handleEditorDidMount}
                        theme={theme === "dark" ? "vs-dark" : "light"}
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            wordWrap: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                            <p>No file open.</p>
                            <p className="text-sm mt-2">Select a file from the explorer or create a new one.</p>
                        </div>
                    </div>
                )}
            </div>
             <div className="flex-shrink-0 flex items-center justify-between p-1 border-t text-xs text-muted-foreground bg-secondary/30">
                <div className="flex items-center gap-4 px-2">
                    <span>Ln 1, Col 1</span>
                    <span>Spaces: 4</span>
                    <span>UTF-8</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>{activeFile ? 'Python' : 'No file'}</span>
                </div>
            </div>
        </div>
    );
}
