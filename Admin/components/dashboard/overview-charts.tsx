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

const lineChartData = [
  { name: 'Jan', total: 186, completed: 120 },
  { name: 'Feb', total: 305, completed: 210 },
  { name: 'Mar', total: 237, completed: 180 },
  { name: 'Apr', total: 273, completed: 220 },
  { name: 'May', total: 209, completed: 170 },
  { name: 'Jun', total: 314, completed: 280 },
  { name: 'Jul', total: 291, completed: 250 },
]

const pieChartData = [
  { name: 'Infrastructure', value: 35, color: 'hsl(260, 60%, 60%)' },
  { name: 'Sanitation', value: 25, color: 'hsl(165, 60%, 50%)' },
  { name: 'Traffic', value: 20, color: 'hsl(50, 60%, 60%)' },
  { name: 'Utilities', value: 12, color: 'hsl(300, 60%, 55%)' },
  { name: 'Other', value: 8, color: 'hsl(25, 70%, 55%)' },
]

export function RequestsLineChart() {
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
            Monthly request volume and completion rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
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
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(260, 60%, 60%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(260, 60%, 60%)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(260, 60%, 60%)' }}
                  name="Total Requests"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(165, 60%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(165, 60%, 50%)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(165, 60%, 50%)' }}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function CategoryPieChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Requests by Category</CardTitle>
          <CardDescription>Distribution across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
