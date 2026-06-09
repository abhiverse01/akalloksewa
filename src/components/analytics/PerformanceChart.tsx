'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface PerformanceChartProps {
  data: { date: string; score: number }[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!data.length) {
      return Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: 0,
      }))
    }
    return data.map((d) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
  }, [data])

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'var(--text-faint)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: 'var(--text-faint)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--text-primary)',
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--ink-400)"
            strokeWidth={2}
            dot={{ r: 4, fill: 'var(--ink-400)' }}
            activeDot={{ r: 6 }}
            name="Score %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
