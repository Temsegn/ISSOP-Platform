'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  RefreshCw,
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
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { DashboardStats } from '@/lib/types'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [performance, setPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const [statsRes, perfRes] = await Promise.all([
        api.getSummaryStats(),
        api.getAgentPerformance()
      ])

      setStats(statsRes.data)
      setPerformance(perfRes.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to sync intelligence data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const kpis = useMemo(() => {
    if (!stats) return []
    return [
      {
        label: 'Total Requests',
        value: stats.totalRequests,
        change: 12.5, // Mocked change as backend doesn't provide historic yet
        icon: BarChart3,
        color: 'text-primary',
      },
      {
        label: 'Avg Resolution Time',
        value: '4.2 hrs', // Mocked as backend missing this aggregate
        change: -18.3,
        icon: Clock,
        color: 'text-accent',
      },
      {
        label: 'Completion Rate',
        value: stats.totalRequests > 0 
          ? `${Math.round((stats.completedRequests / stats.totalRequests) * 100)}%`
          : '0%',
        change: 5.8,
        icon: Target,
        color: 'text-success',
      },
      {
        label: 'Active Agents',
        value: stats.activeAgents,
        change: 8.1,
        icon: Users,
        color: 'text-warning',
      },
    ]
  }, [stats])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Intelligence Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Deep-dive analytics and system-wide performance indices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchData(true)} className="h-9 gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="gradient-primary text-white h-9">
            <Download className="h-4 w-4 mr-2" />
            Export Intel
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black mt-1 tracking-tighter">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.change > 0 ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      <span className={`text-[10px] font-bold ${stat.change > 0 ? 'text-success' : 'text-destructive'}`}>
                        {Math.abs(stat.change)}%
                      </span>
                      <span className="text-[9px] text-muted-foreground italic ml-0.5">vs last cycle</span>
                    </div>
                  </div>
                  <div className={`h-11 w-11 rounded-xl bg-secondary/50 flex items-center justify-center ${stat.color} shadow-lg shadow-black/5`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary/40 border-none p-1 gap-1 rounded-2xl h-12">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-card px-6">
            <Activity className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl data-[state=active]:bg-card px-6">
            <PieChartIcon className="h-4 w-4 mr-2" /> Categories
          </TabsTrigger>
          <TabsTrigger value="agents" className="rounded-xl data-[state=active]:bg-card px-6">
            <Users className="h-4 w-4 mr-2" /> Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Requests Trend */}
            <Card className="border-border/40 bg-card/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold tracking-tight">Active Operation Trend</CardTitle>
                <CardDescription className="text-xs italic">Live telemetry from the last 7 production days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.trend || []}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#colorTotal)" strokeWidth={3} name="Daily Submissions" />
                      <Area type="monotone" dataKey="completed" stroke="hsl(var(--success))" fill="transparent" strokeWidth={2} name="Resolutions" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Breakdown Bar */}
            <Card className="border-border/40 bg-card/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold tracking-tight">Status Distribution</CardTitle>
                <CardDescription className="text-xs italic">Current allocation of all requested services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats ? Object.entries(stats.statusCounts).map(([name, value]) => ({ name, value })) : []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Record Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/40 bg-card/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold tracking-tight">Sector Heatmap</CardTitle>
                <CardDescription className="text-xs italic">Density of incidents by public sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.categoryCounts || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {(stats?.categoryCounts || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${210 + index * 40}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/40 backdrop-blur-md p-6">
              <div className="space-y-6">
                {stats?.categoryCounts.map((category, index) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold tracking-tight">{category.name}</span>
                      <Badge variant="secondary" className="text-[10px] font-black">{category.value} units</Badge>
                    </div>
                    <Progress value={(category.value / (stats.totalRequests || 1)) * 100} className="h-2 rounded-full" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
            <Card className="border-border/40 bg-card/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold tracking-tight">Field Intelligence Leaderboard</CardTitle>
                <CardDescription className="text-xs italic">Operational efficiency by responder</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performance.slice(0, 10).map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/20 border border-border/10 group hover:bg-secondary/40 transition-all"
                    >
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-xs shadow-inner">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm tracking-tight">{agent.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{agent.area || 'Metro'} District</p>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-black tracking-tighter text-primary">{agent.completedTasks}</p>
                         <p className="text-[9px] uppercase font-bold text-muted-foreground">Successful Repairs</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
