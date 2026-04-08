'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChartIcon,
  Activity,
  Users,
  Clock,
  Target,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Mock data for charts
const requestsTrend = [
  { month: 'Jan', requests: 186, completed: 145, pending: 41 },
  { month: 'Feb', requests: 305, completed: 256, pending: 49 },
  { month: 'Mar', requests: 237, completed: 198, pending: 39 },
  { month: 'Apr', requests: 273, completed: 234, pending: 39 },
  { month: 'May', requests: 209, completed: 178, pending: 31 },
  { month: 'Jun', requests: 314, completed: 289, pending: 25 },
  { month: 'Jul', requests: 291, completed: 267, pending: 24 },
]

const categoryData = [
  { name: 'Infrastructure', value: 35, count: 847, color: 'hsl(260, 60%, 60%)' },
  { name: 'Sanitation', value: 25, count: 605, color: 'hsl(165, 60%, 50%)' },
  { name: 'Traffic', value: 20, count: 484, color: 'hsl(50, 60%, 60%)' },
  { name: 'Utilities', value: 12, count: 290, color: 'hsl(300, 60%, 55%)' },
  { name: 'Other', value: 8, count: 194, color: 'hsl(25, 70%, 55%)' },
]

const agentPerformance = [
  { name: 'Maria G.', completed: 127, avgTime: 1.2, rating: 4.9 },
  { name: 'Carlos R.', completed: 156, avgTime: 1.5, rating: 4.8 },
  { name: 'Emily C.', completed: 145, avgTime: 1.1, rating: 4.9 },
  { name: 'John S.', completed: 98, avgTime: 1.8, rating: 4.7 },
  { name: 'Sarah J.', completed: 89, avgTime: 2.1, rating: 4.6 },
]

const weeklyData = [
  { day: 'Mon', requests: 45, resolved: 38 },
  { day: 'Tue', requests: 52, resolved: 47 },
  { day: 'Wed', requests: 38, resolved: 35 },
  { day: 'Thu', requests: 65, resolved: 58 },
  { day: 'Fri', requests: 48, resolved: 42 },
  { day: 'Sat', requests: 28, resolved: 25 },
  { day: 'Sun', requests: 22, resolved: 20 },
]

const resolutionTime = [
  { hour: '0-4', count: 145 },
  { hour: '4-8', count: 312 },
  { hour: '8-12', count: 478 },
  { hour: '12-24', count: 267 },
  { hour: '24-48', count: 156 },
  { hour: '48+', count: 62 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')

  const stats = [
    {
      label: 'Total Requests',
      value: '2,847',
      change: 12.5,
      icon: BarChart3,
      color: 'text-primary',
    },
    {
      label: 'Avg Resolution Time',
      value: '4.2 hrs',
      change: -18.3,
      icon: Clock,
      color: 'text-accent',
    },
    {
      label: 'Completion Rate',
      value: '94.2%',
      change: 5.8,
      icon: Target,
      color: 'text-success',
    },
    {
      label: 'Active Agents',
      value: '34',
      change: 8.1,
      icon: Users,
      color: 'text-warning',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] bg-secondary/50 border-transparent">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.change > 0 ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          stat.change > 0 ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {Math.abs(stat.change)}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs last period</span>
                    </div>
                  </div>
                  <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4 mr-2" />
            Agent Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Requests Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Request Trends</CardTitle>
                  <CardDescription>Monthly requests and completion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={requestsTrend}>
                        <defs>
                          <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(260, 60%, 60%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(260, 60%, 60%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(165, 60%, 50%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(165, 60%, 50%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area type="monotone" dataKey="requests" stroke="hsl(260, 60%, 60%)" fill="url(#colorRequests)" strokeWidth={2} name="Total Requests" />
                        <Area type="monotone" dataKey="completed" stroke="hsl(165, 60%, 50%)" fill="url(#colorCompleted)" strokeWidth={2} name="Completed" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Weekly Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Weekly Distribution</CardTitle>
                  <CardDescription>Requests by day of the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="requests" fill="hsl(260, 60%, 60%)" radius={[4, 4, 0, 0]} name="Requests" />
                        <Bar dataKey="resolved" fill="hsl(165, 60%, 50%)" radius={[4, 4, 0, 0]} name="Resolved" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Resolution Time Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Resolution Time Distribution</CardTitle>
                <CardDescription>Time taken to resolve requests (in hours)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resolutionTime} layout="vertical" barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="hour" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={50} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(260, 60%, 60%)" radius={[0, 4, 4, 0]} name="Requests" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Requests by Category</CardTitle>
                  <CardDescription>Distribution across different categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`${value}%`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {categoryData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">
                          {item.name} ({item.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Category Breakdown</CardTitle>
                  <CardDescription>Detailed statistics per category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map((category, index) => (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                            <span className="font-medium text-sm">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{category.count} requests</span>
                            <Badge variant="secondary">{category.value}%</Badge>
                          </div>
                        </div>
                        <Progress value={category.value} className="h-2" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Agent Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Agent Completion Rates</CardTitle>
                  <CardDescription>Tasks completed by each agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={agentPerformance} layout="vertical" barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={70} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="completed" fill="hsl(260, 60%, 60%)" radius={[0, 4, 4, 0]} name="Completed Tasks" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Agent Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-warning" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Agents ranked by performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agentPerformance
                      .sort((a, b) => b.rating - a.rating)
                      .map((agent, index) => (
                        <motion.div
                          key={agent.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                        >
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? 'bg-warning/20 text-warning'
                                : index === 1
                                ? 'bg-muted text-muted-foreground'
                                : index === 2
                                ? 'bg-accent/20 text-accent'
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{agent.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{agent.completed} completed</span>
                              <span>Avg: {agent.avgTime}h</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            {agent.rating} / 5.0
                          </Badge>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
