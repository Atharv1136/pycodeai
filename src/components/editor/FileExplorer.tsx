"use client"

import {
  Folder,
  File as FileIcon,
  Plus,
  ChevronDown,
  ChevronRight,
  Download,
  Trash2,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useEditorStore, FileOrFolder } from '@/lib/store'
import { FileUpload } from './FileUpload'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const FileTreeItem = ({ item, path = [] }: { item: FileOrFolder, path?: string[] }) => {
  const [isOpen, setIsOpen] = useState(item.type === 'folder');
  const { activeFile, openFile, deleteFile } = useEditorStore();

  const currentPath = [...path, item.name];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
  }

  const handleSelect = () => {
    if (item.type === 'file') {
      openFile(item);
    } else {
      setIsOpen(!isOpen);
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteFile(currentPath);
  }

  const isActive = item.type === 'file' && activeFile?.name === item.name;

  return (
    <div className="group/item">
      <div 
        onClick={handleSelect}
        className={cn(
          "flex items-center p-1.5 rounded-md cursor-pointer hover:bg-muted",
          isActive && 'bg-primary/10 text-primary'
        )}
      >
        <div className="flex items-center flex-1 truncate">
            {item.type === 'folder' ? (
                <>
                    {isOpen ? <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />}
                    <Folder className="h-4 w-4 mr-2 text-yellow-500 flex-shrink-0" />
                </>
            ) : (
                <>
                   <div className="w-4 mr-1"></div> {/* Spacer */}
                   <FileIcon className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                </>
            )}
            <span className="truncate">{item.name}</span>
        </div>
        {item.type === 'file' && (
          <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 opacity-0 group-hover/item:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the file "{item.name}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {isOpen && item.type === 'folder' && item.children && (
        <div>
          {[...item.children]
            .sort((a,b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'folder' ? -1 : 1;
            })
            .map((child) => (
              <FileTreeItem key={child.name} item={child} path={currentPath} />
          ))}
        </div>
      )}
    </div>
  );
};


export function FileExplorer() {
  const { fileTree, addNewFile, downloadProjectAsZip, addNewFileFromUpload } = useEditorStore();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleAddNewFile = () => {
    const newFileName = prompt("Enter file name (e.g., script.py):");
    if (newFileName && newFileName.trim()) {
      addNewFile(newFileName.trim());
    }
  };

  const handleFileUploaded = (file: any) => {
    // Add the uploaded file to the file tree
    addNewFileFromUpload(file.originalName, file.path, file.content || '');
    setIsUploadDialogOpen(false);
  };
  
  const countFiles = (item: FileOrFolder): number => {
    if (item.type === 'file') {
      return 1;
    }
    return item.children.reduce((acc, child) => acc + countFiles(child), 0);
  }

  return (
    <div className="flex flex-col h-full bg-secondary/30 dark:bg-card text-sm">
      <div className="flex items-center justify-between p-2 border-b">
        <h2 className="font-semibold text-base">Files</h2>
        <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddNewFile} title="New File">
              <Plus className="h-4 w-4" />
            </Button>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Upload File">
                  <Upload className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload File</DialogTitle>
                  <DialogDescription>
                    Upload a file from your computer to use in your project
                  </DialogDescription>
                </DialogHeader>
                <FileUpload onFileUploaded={handleFileUploaded} />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={downloadProjectAsZip} title="Download Project as ZIP">
              <Download className="h-4 w-4" />
            </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-2">
        {fileTree.children.length > 0 ? (
          [...fileTree.children]
            .sort((a,b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            })
            .map(item => (
                <FileTreeItem key={item.name} item={item} path={[]} />
            ))
        ) : (
          <div className="text-center text-xs text-muted-foreground p-4">
            <p>No files yet.</p>
            <p>Create a file to start.</p>
          </div>
        )}
      </ScrollArea>
      <div className="p-2 border-t text-xs text-muted-foreground">
        {countFiles(fileTree)} files
      </div>
    </div>
  )
}