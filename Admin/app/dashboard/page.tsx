'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, Users, Map as MapIcon, Activity } from 'lucide-react'
import { KPICard } from '@/components/dashboard/kpi-card'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { RequestsLineChart, CategoryPieChart } from '@/components/dashboard/overview-charts'
import { api } from '@/lib/api'
import type { DashboardStats, Request as IssueRequest, User, Notification as AppNotification } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'

const LiveMap = dynamic(
  () => import('@/components/dashboard/live-map').then((mod) => mod.LiveMap),
  { ssr: false }
)

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [requests, setRequests] = useState<IssueRequest[]>([])
  const [agents, setAgents] = useState<User[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, requestsRes, usersRes, notifsRes] = await Promise.all([
          api.getSummaryStats(),
          api.getRequests({ limit: 50 }),
          api.getUsers(),
          api.getNotifications()
        ])

        setStats(statsRes.data)
        setRequests(requestsRes.data)
        setNotifications(notifsRes.data)
        // Filter agents from users
        const agentsList = usersRes.data.filter(u => u.role === 'AGENT')
        setAgents(agentsList)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const kpis = stats ? [
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      change: 0, // Backend could provide this later
      icon: FileText,
      iconColor: 'text-primary',
    },
    {
      title: 'Pending',
      value: stats.pendingRequests,
      change: 0,
      icon: Clock,
      iconColor: 'text-warning',
    },
    {
      title: 'Completed',
      value: stats.completedRequests,
      change: 0,
      icon: CheckCircle,
      iconColor: 'text-success',
    },
    {
      title: 'Active Agents',
      value: stats.activeAgents,
      change: 0,
      icon: Users,
      iconColor: 'text-accent',
    },
  ] : []

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights from the ISSOP Platform.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full border border-success/20">
          <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Live Connection
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={kpi.icon}
            iconColor={kpi.iconColor}
            index={index}
          />
        ))}
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapIcon size={16} /> Live Monitoring Map
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity size={16} /> Analytics & Trends
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="space-y-4">
          <div className="h-[600px] w-full rounded-xl border border-border/50 bg-card overflow-hidden">
            <LiveMap 
              agents={agents.map(a => ({
                id: a.id,
                name: a.name,
                availability: (a as any).status || 'AVAILABLE',
                location: a.latitude ? { lat: a.latitude, lng: a.longitude!, address: a.area || '' } : undefined
              }))}
              requests={requests}
              center={[agents[0]?.latitude || 0, agents[0]?.longitude || 0]}
              zoom={12}
              className="h-full w-full"
            />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <RequestsLineChart />
            <CategoryPieChart />
          </div>
        </TabsContent>
      </Tabs>

      {/* Activity Feed & Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed notifications={notifications} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-4"
        >
          {/* Quick Stats Card */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <h3 className="text-sm font-semibold mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Completion Time</span>
                <span className="text-sm font-medium">{stats?.avgCompletionTime || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Agents</span>
                <span className="text-sm font-medium">{stats?.activeAgents || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
