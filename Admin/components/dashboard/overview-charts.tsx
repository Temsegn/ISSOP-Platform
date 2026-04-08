'use client'

import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import { RequestsByCategory, RequestsTrend } from '@/lib/types'

const CATEGORY_COLORS: Record<string, string> = {
  INFRASTRUCTURE: 'hsl(260, 60%, 60%)',
  SANITATION: 'hsl(165, 60%, 50%)',
  TRAFFIC: 'hsl(50, 60%, 60%)',
  UTILITIES: 'hsl(300, 60%, 55%)',
  PUBLIC_SAFETY: 'hsl(0, 70%, 55%)',
  OTHER: 'hsl(25, 10%, 55%)',
}

interface LineChartProps {
  data: RequestsTrend[]
}

export function RequestsLineChart({ data }: LineChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Requests Over Time
          </CardTitle>
          <CardDescription>
            Last 7 days of activity and resolution trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(260, 60%, 60%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(260, 60%, 60%)', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(260, 60%, 60%)' }}
                    name="Daily Reports"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(165, 60%, 50%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(165, 60%, 50%)', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(165, 60%, 50%)' }}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                No activity data recorded in the last 7 days
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface PieChartProps {
  data: RequestsByCategory[]
}

export function CategoryPieChart({ data }: PieChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Incident Distribution</CardTitle>
          <CardDescription>Volume segmented by infrastructure category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.OTHER} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                No requests categorized yet
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.OTHER }}
                />
                <span className="text-[11px] text-muted-foreground font-medium">
                  {item.name}: <span className="text-foreground">{item.value}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
