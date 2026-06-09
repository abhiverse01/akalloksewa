'use client'

import { Component, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorFallback extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorFallback caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 px-4"
          style={{ background: 'var(--bg-surface)', borderRadius: '18px', border: '1px solid var(--border-subtle)' }}
        >
          <div className="size-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(193, 39, 45, 0.1)' }}>
            <AlertTriangle className="size-6" style={{ color: 'var(--red-500)' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Something went wrong</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'var(--ink-500)', color: '#fff' }}
          >
            <RefreshCw className="size-3" /> Try Again
          </button>
        </motion.div>
      )
    }

    return this.props.children
  }
}
