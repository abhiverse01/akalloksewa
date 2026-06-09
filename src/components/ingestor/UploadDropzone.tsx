'use client'

import { useCallback, useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface UploadDropzoneProps {
  onTextSubmit: (text: string) => void
  onFileUpload: (content: string, filename: string) => void
  accept?: string
  maxSize?: number // KB
}

export function UploadDropzone({
  onTextSubmit,
  onFileUpload,
  accept = '.txt,.csv,.md,.json',
  maxSize = 500,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = useCallback(
    (file: File) => {
      setError(null)
      setSuccess(null)

      if (file.size > maxSize * 1024) {
        setError(`File too large. Maximum ${maxSize}KB.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content) {
          onFileUpload(content, file.name)
          setSuccess(`Loaded "${file.name}" (${content.length} chars)`)
          setTimeout(() => setSuccess(null), 3000)
        }
      }
      reader.onerror = () => setError('Failed to read file.')
      reader.readAsText(file, 'utf-8')
    },
    [maxSize, onFileUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-200
          ${isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/50'
          }
        `}
      >
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-10 px-6">
            <div className={`rounded-full p-4 mb-4 transition-colors ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
              <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <p className="text-sm font-medium text-center mb-1">
              {isDragging ? 'Drop your file here' : 'Drag & drop a question file'}
            </p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Supports .txt, .csv, .md, .json — max {maxSize}KB
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}
    </div>
  )
}
