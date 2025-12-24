"use client"

import { useState, useRef } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useEditorStore } from '@/lib/store'

interface UploadedFile {
  name: string
  originalName: string
  fileName: string
  size: number
  type: string
  path: string
  uploadedAt: string
  content?: string
}

interface FileUploadProps {
  onFileUploaded?: (file: UploadedFile) => void
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { currentProject, addNewFileFromUpload } = useEditorStore()

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', currentProject?.id || 'default')

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const data = await response.json()
        const uploadedFile = data.file
        
        // Read the file content
        try {
          const contentResponse = await fetch('/api/files/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: uploadedFile.path })
          });
          
          if (contentResponse.ok) {
            try {
              const contentData = await contentResponse.json();
              uploadedFile.content = contentData.content;
            } catch (parseError) {
              console.error('Error parsing file content response:', parseError);
              uploadedFile.content = 'Unable to read file content';
            }
          } else {
            console.error('Failed to read file content:', contentResponse.status);
            uploadedFile.content = 'Unable to read file content';
          }
        } catch (error) {
          console.error('Error reading file content:', error);
          uploadedFile.content = 'Unable to read file content';
        }
        
        setUploadedFiles(prev => [...prev, uploadedFile])
        
        // Add file to project file tree so it's accessible in the editor
        if (uploadedFile.content && currentProject) {
          addNewFileFromUpload(
            uploadedFile.originalName,
            uploadedFile.path,
            uploadedFile.content
          );
        }
        
        toast({
          title: "File uploaded successfully",
          description: `${uploadedFile.originalName} has been uploaded and added to your project`
        })

        if (onFileUploaded) {
          onFileUploaded(uploadedFile)
        }
      } else {
        let errorMessage = 'Upload failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          // If response is not JSON, get text content
          const textContent = await response.text()
          errorMessage = textContent || errorMessage
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          accept="*"
        />
        
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {isUploading ? 'Uploading...' : 'Upload a file'}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop or click to select
            </p>
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {uploadProgress}% complete
              </p>
            </div>
          )}
          
          {!isUploading && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-1">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <File className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
