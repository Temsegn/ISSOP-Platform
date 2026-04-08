'use client'

import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, Users } from 'lucide-react'
import { KPICard } from '@/components/dashboard/kpi-card'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { RequestsLineChart, CategoryPieChart } from '@/components/dashboard/overview-charts'

const kpiData = [
  {
    title: 'Total Requests',
    value: 2847,
    change: 12.5,
    icon: FileText,
    iconColor: 'text-primary',
  },
  {
    title: 'Pending Requests',
    value: 423,
    change: -8.2,
    icon: Clock,
    iconColor: 'text-warning',
  },
  {
    title: 'Completed',
    value: 2198,
    change: 18.3,
    icon: CheckCircle,
    iconColor: 'text-success',
  },
  {
    title: 'Active Agents',
    value: 34,
    change: 5.1,
    icon: Users,
    iconColor: 'text-accent',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s what&apos;s happening in your city today.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
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

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RequestsLineChart />
        <CategoryPieChart />
      </div>

      {/* Activity Feed & Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed />
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
                <span className="text-sm text-muted-foreground">Avg Response Time</span>
                <span className="text-sm font-medium">2.4 hours</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full gradient-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Resolution Rate</span>
                <span className="text-sm font-medium">94.2%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '94%' }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full rounded-full bg-success"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Citizen Satisfaction</span>
                <span className="text-sm font-medium">4.8/5.0</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '96%' }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full rounded-full bg-accent"
                />
              </div>
            </div>
          </div>

          {/* Agent Status Card */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <h3 className="text-sm font-semibold mb-4">Agent Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm">Available</span>
                </div>
                <span className="text-sm font-medium">18</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <span className="text-sm">On Task</span>
                </div>
                <span className="text-sm font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span className="text-sm">Offline</span>
                </div>
                <span className="text-sm font-medium">4</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
