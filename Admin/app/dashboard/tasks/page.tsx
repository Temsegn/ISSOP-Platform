'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCheck, MapPin, Clock, CheckCircle2, AlertCircle, Plus, RefreshCw, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/dashboard/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Request, User as AppUser, RequestStatus } from '@/lib/types'

export default function TasksPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [agents, setAgents] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const [reqsRes, usersRes] = await Promise.all([
        api.getRequests({ limit: 100 }),
        api.getUsers()
      ])

      setRequests(reqsRes.data)
      setAgents(usersRes.data.filter(u => u.role === 'AGENT'))
    } catch (error) {
      console.error('Error fetching tasks data:', error)
      toast.error('Failed to sync task data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const activeTasks = useMemo(() => {
    // Filter requests that are assigned/in-progress/completed
    return requests
      .filter(r => r.status !== 'PENDING' && r.status !== 'REJECTED')
      .filter(r => statusFilter === 'all' || r.status === statusFilter)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [requests, statusFilter])

  const taskStats = useMemo(() => ({
    total: requests.filter(r => r.status !== 'PENDING').length,
    assigned: requests.filter(r => r.status === 'ASSIGNED').length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
  }), [requests])

  const initials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

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
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-[500px]" />
          <Skeleton className="h-[500px]" />
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tracking {taskStats.total} active field operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchData(true)} className="h-9 gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Ops
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Deployed Tasks', value: taskStats.total, icon: UserCheck, color: 'text-primary' },
          { label: 'Awaiting Pickup', value: taskStats.assigned, icon: Clock, color: 'text-warning' },
          { label: 'Active Repairs', value: taskStats.inProgress, icon: AlertCircle, color: 'text-accent' },
          { label: 'Resolved Issues', value: taskStats.completed, icon: CheckCircle2, color: 'text-success' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-md">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl bg-secondary/50 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/40 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">Active Operations</CardTitle>
                  <CardDescription className="text-xs">Real-time status of assigned field work</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] bg-secondary/40 border-none rounded-xl">
                    <div className="flex items-center gap-2">
                       <Filter className="h-3 w-3" />
                       <SelectValue placeholder="All Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Every Status</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[550px] pr-4 scrollbar-thin">
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {activeTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-2xl border border-border/20 bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer group hover:scale-[1.01]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="h-11 w-11 border-2 border-primary/10">
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                {initials(task.agent?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-sm truncate tracking-tight">{task.title}</p>
                                <Badge variant="outline" className="text-[8px] bg-primary/5 text-primary border-primary/20 px-1.5 py-0 uppercase tracking-widest">
                                  {task.category}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground font-medium">
                                Agent: <span className="text-foreground">{task.agent?.name || 'Unlinked'}</span> 
                                <span className="mx-2">•</span> 
                                Area: <span className="text-foreground">{task.agent?.area || 'Central'}</span>
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-primary" />
                                  {task.address || 'District Map'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3 text-primary" />
                                  {new Date(task.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={task.status} />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {activeTasks.length === 0 && (
                    <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border/40">
                      <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-4" />
                      <p className="text-sm font-medium text-muted-foreground">No matching operations found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Agents Intel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/40 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-3 text-center">
              <CardTitle className="text-lg font-semibold tracking-tight">Responders Insight</CardTitle>
              <CardDescription className="text-xs">Current occupancy of field personnel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-2xl border border-border/20 bg-muted/10 hover:bg-secondary/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-11 w-11 border-2 border-border/10">
                          <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
                            {initials(agent.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${
                            agent.status === 'AVAILABLE' ? 'bg-success animate-pulse' : 'bg-warning'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                          {agent.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold mt-0.5">
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${agent.status === 'AVAILABLE' ? 'text-success border-success/30' : 'text-warning border-warning/30'}`}>
                            {agent.status}
                          </Badge>
                          <span>•</span>
                          <span>{agent.area || 'Metro'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
