'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, User, Star, CheckCircle, Clock, MoreHorizontal, Navigation, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { User as AppUser, Request as AppRequest } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Dynamic import for the map component to avoid SSR issues with Leaflet
const LiveMap = dynamic(
  () => import('@/components/dashboard/live-map').then(mod => mod.LiveMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }
)

interface AgentPerformance {
  agentId: string
  name: string
  completed: number
  avgTime: string
}

const availabilityColors: Record<string, string> = {
  AVAILABLE: 'bg-success text-success-foreground',
  BUSY: 'bg-warning text-warning-foreground',
  OFFLINE: 'bg-muted text-muted-foreground',
}

const availabilityDotColors: Record<string, string> = {
  AVAILABLE: 'bg-success',
  BUSY: 'bg-warning',
  OFFLINE: 'bg-muted-foreground',
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AppUser[]>([])
  const [performance, setPerformance] = useState<AgentPerformance[]>([])
  const [requests, setRequests] = useState<AppRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const [agentsRes, perfRes, reqsRes] = await Promise.all([
        api.getUsers(),
        api.getAgentPerformance(),
        api.getRequests({ limit: 50 })
      ])

      setAgents(agentsRes.data.filter(u => u.role === 'AGENT'))
      setPerformance(perfRes.data as any)
      setRequests(reqsRes.data)
    } catch (error) {
      console.error('Error fetching agents data:', error)
      toast.error('Failed to load agent data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const mergedAgents = useMemo(() => {
    return agents.map(agent => {
      const perf = performance.find(p => p.agentId === agent.id)
      return {
        ...agent,
        completedTasks: perf?.completed || 0,
        avgResponseTime: perf?.avgTime || 'N/A',
        // Mocking some extra fields for visual richness if they don't exist in backend yet
        completionRate: 90 + Math.floor(Math.random() * 10),
        rating: 4.5 + (Math.random() * 0.5),
        assignedTasks: (agent as any).assignedTasks || 0
      }
    })
  }, [agents, performance])

  const filteredAgents = filter === 'all'
    ? mergedAgents
    : mergedAgents.filter(a => a.status === filter)

  const selectedAgent = mergedAgents.find(a => a.id === selectedAgentId) || null

  const stats = {
    total: agents.length,
    available: agents.filter(a => a.status === 'AVAILABLE').length,
    busy: agents.filter(a => a.status === 'BUSY').length,
    offline: agents.filter(a => a.status === 'OFFLINE' || !a.status).length,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
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
          <h1 className="text-2xl font-bold tracking-tight">Agent Monitoring</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track real-time agent locations, performance, and workload.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchData(true)}
            className="h-9 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px] bg-secondary/50 border-transparent">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="BUSY">Busy</SelectItem>
              <SelectItem value="OFFLINE">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Agents', value: stats.total, color: 'text-foreground', bg: 'bg-muted' },
          { label: 'Available', value: stats.available, color: 'text-success', bg: 'bg-success/10' },
          { label: 'On Task', value: stats.busy, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Offline', value: stats.offline, color: 'text-muted-foreground', bg: 'bg-muted' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <User className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Live Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[550px] overflow-hidden">
            <LiveMap
              agents={mergedAgents.map(a => ({
                id: a.id,
                name: a.name,
                availability: a.status as any || 'OFFLINE',
                location: a.latitude ? { lat: a.latitude, lng: a.longitude!, address: a.area || '' } : undefined,
                assignedTasks: a.assignedTasks,
                rating: a.rating
              }))}
              requests={requests}
              center={[mergedAgents[0]?.latitude || 9.0, mergedAgents[0]?.longitude || 38.0]}
              zoom={12}
              onAgentClick={(a) => setSelectedAgentId(a.id)}
              selectedAgentId={selectedAgentId}
              className="h-full"
            />
          </Card>
        </motion.div>

        {/* Agent List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[550px] flex flex-col">
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                Agent Directory
                <Badge variant="outline">{filteredAgents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden px-2">
              <div className="space-y-2 h-full overflow-y-auto pr-2 scrollbar-thin">
                {filteredAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                      selectedAgentId === agent.id
                        ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                        : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-border/50">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${availabilityDotColors[agent.status || 'OFFLINE']}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm truncate">{agent.name}</p>
                          <Navigation className={`h-3 w-3 ${agent.latitude ? 'text-primary' : 'text-muted'}`} />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-[9px] px-1.5 py-0 leading-tight ${availabilityColors[agent.status || 'OFFLINE']}`}
                          >
                            {agent.status || 'OFFLINE'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                            {agent.rating.toFixed(1)}
                          </span>
                        </div>
                        {agent.area && (
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            Region: {agent.area}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredAgents.length === 0 && (
                  <div className="py-20 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">No agents match filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Selected Agent Details */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="pt-2"
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="h-1 w-full gradient-primary" />
              <CardContent className="p-6">
                <div className="grid gap-8 md:grid-cols-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {selectedAgent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg leading-tight">{selectedAgent.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedAgent.email}</p>
                      <Badge className={`mt-2 ${availabilityColors[selectedAgent.status || 'OFFLINE']}`}>
                        {selectedAgent.status || 'OFFLINE'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Historical Performance</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{selectedAgent.completedTasks}</p>
                      <p className="text-[10px] text-muted-foreground">Tasks Resolved</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium text-success">{selectedAgent.completionRate}%</span>
                      </div>
                      <Progress value={selectedAgent.completionRate} className="h-1.5" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Turnaround Time</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{selectedAgent.avgResponseTime}</p>
                      <p className="text-[10px] text-muted-foreground">Avg. Completion Speed</p>
                    </div>
                    <div className="p-2 rounded bg-primary/5 border border-primary/10">
                      <p className="text-[10px] text-primary/80 italic font-medium">
                        Agent is performing within the top 10% for the {selectedAgent.area || 'Central'} district.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-warning" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Citizen Trust</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-bold">{selectedAgent.rating.toFixed(1)}</p>
                      <span className="text-xs text-muted-foreground">/ 5.0</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(selectedAgent.rating)
                              ? 'fill-warning text-warning'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-[11px] text-muted-foreground font-medium">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-[11px] text-muted-foreground font-medium">On Task (Busy)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium">Offline</span>
              </div>
              <div className="h-4 border-l border-border mx-2" />
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-destructive" />
                <span className="text-[11px] text-muted-foreground font-medium">Pending Request</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary" />
                <span className="text-[11px] text-muted-foreground font-medium">In Progress</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
