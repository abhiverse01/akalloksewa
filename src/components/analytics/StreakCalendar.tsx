'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface StreakCalendarProps {
  data: { date: string; questions: number }[]
}

export function StreakCalendar({ data }: StreakCalendarProps) {
  const chartData = useMemo(() => {
    if (!data.length) {
      return Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
        questions: 0,
      }))
    }
    return data.slice(-14).map((d) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    }))
  }, [data])

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--text-faint)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-faint)' }}
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
          <Bar
            dataKey="questions"
            fill="var(--ink-400)"
            radius={[4, 4, 0, 0]}
            name="Questions"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
