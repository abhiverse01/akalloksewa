'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TextIngestorProps {
  onSubmit: (text: string) => void
  isProcessing?: boolean
}

export function TextIngestor({ onSubmit, isProcessing }: TextIngestorProps) {
  const [text, setText] = useState('')
  const [charCount, setCharCount] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setCharCount(e.target.value.length)
  }

  const handlePaste = () => {
    navigator.clipboard.readText().then((clip) => {
      setText(clip)
      setCharCount(clip.length)
    }).catch(() => {
      // Clipboard access denied — ignore
    })
  }

  const handleSubmit = () => {
    if (text.trim().length < 10) return
    onSubmit(text.trim())
  }

  const handleClear = () => {
    setText('')
    setCharCount(0)
  }

  const estimatedQuestions = Math.max(0, Math.floor(charCount / 100))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Paste Questions</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {charCount > 0 ? `~${estimatedQuestions} Qs` : 'Ready'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder={`Paste your questions here...\n\nSupported formats:\n• 1. What is the capital of Nepal?\n  a) Kathmandu\n  b) Pokhara\n  c) Biratnagar\n  d) Lalitpur\n  ans: a\n\n• नेपालको राजधानी कहाँ छ?\n  क. काठमाडौं\n  ख. पोखरा\n  ग. विराटनगर\n  घ. ललितपुर\n  उत्तर: क`}
          value={text}
          onChange={handleChange}
          className="min-h-[240px] font-mono text-sm resize-y"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {charCount.toLocaleString()} characters
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePaste}>
              From Clipboard
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={text.trim().length < 10 || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Parse & Ingest
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
