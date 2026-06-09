'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { LOKSEWA_SUBJECTS } from '@/lib/constants'

interface SubjectRadarProps {
  data: { subject: string; accuracy: number }[]
}

export function SubjectRadar({ data }: SubjectRadarProps) {
  const chartData = data.length > 0
    ? data.map((d) => {
        const subj = LOKSEWA_SUBJECTS.find((s) => s.id === d.subject)
        return {
          subject: subj?.labelEn?.substring(0, 15) || d.subject.substring(0, 15),
          accuracy: Math.round(d.accuracy * 100),
          fullMark: 100,
        }
      })
    : LOKSEWA_SUBJECTS.slice(0, 6).map((s) => ({
        subject: s.labelEn.substring(0, 15),
        accuracy: 0,
        fullMark: 100,
      }))

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="var(--border-subtle)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: 'var(--text-faint)' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
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
          <Radar
            name="Accuracy"
            dataKey="accuracy"
            stroke="var(--ink-400)"
            fill="var(--ink-400)"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
