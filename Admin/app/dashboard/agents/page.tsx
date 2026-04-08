'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { MapPin, User, Star, CheckCircle, Clock, MoreHorizontal, Navigation } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
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

interface Agent {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  location?: { lat: number; lng: number; address: string }
  assignedTasks: number
  completedTasks: number
  rating: number
  completionRate: number
  avgResponseTime: string
}

interface Request {
  id: string
  title: string
  category: string
  status: string
  latitude: number
  longitude: number
  description?: string
}

// Mock agents with real NYC locations
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Maria Garcia',
    email: 'maria@issop.city',
    phone: '+1 555-0101',
    availability: 'BUSY',
    location: { lat: 40.7580, lng: -73.9855, address: 'Times Square, Manhattan' },
    assignedTasks: 3,
    completedTasks: 127,
    rating: 4.9,
    completionRate: 96,
    avgResponseTime: '1.2 hrs',
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@issop.city',
    phone: '+1 555-0102',
    availability: 'AVAILABLE',
    location: { lat: 40.7484, lng: -73.9857, address: 'Empire State Building' },
    assignedTasks: 0,
    completedTasks: 98,
    rating: 4.7,
    completionRate: 92,
    avgResponseTime: '1.8 hrs',
  },
  {
    id: '3',
    name: 'Carlos Rodriguez',
    email: 'carlos@issop.city',
    phone: '+1 555-0103',
    availability: 'BUSY',
    location: { lat: 40.7527, lng: -73.9772, address: 'Grand Central Terminal' },
    assignedTasks: 2,
    completedTasks: 156,
    rating: 4.8,
    completionRate: 94,
    avgResponseTime: '1.5 hrs',
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah@issop.city',
    phone: '+1 555-0104',
    availability: 'AVAILABLE',
    location: { lat: 40.7614, lng: -73.9776, address: 'Rockefeller Center' },
    assignedTasks: 1,
    completedTasks: 89,
    rating: 4.6,
    completionRate: 89,
    avgResponseTime: '2.1 hrs',
  },
  {
    id: '5',
    name: 'Mike Davis',
    email: 'mike@issop.city',
    phone: '+1 555-0105',
    availability: 'OFFLINE',
    assignedTasks: 0,
    completedTasks: 112,
    rating: 4.5,
    completionRate: 88,
    avgResponseTime: '2.4 hrs',
  },
  {
    id: '6',
    name: 'Emily Chen',
    email: 'emily@issop.city',
    phone: '+1 555-0106',
    availability: 'AVAILABLE',
    location: { lat: 40.7587, lng: -73.9787, address: 'Bryant Park' },
    assignedTasks: 0,
    completedTasks: 145,
    rating: 4.9,
    completionRate: 97,
    avgResponseTime: '1.1 hrs',
  },
  {
    id: '7',
    name: 'David Park',
    email: 'david@issop.city',
    phone: '+1 555-0107',
    availability: 'BUSY',
    location: { lat: 40.7489, lng: -73.9680, address: 'UN Headquarters' },
    assignedTasks: 4,
    completedTasks: 201,
    rating: 4.8,
    completionRate: 95,
    avgResponseTime: '1.3 hrs',
  },
]

// Mock requests with real NYC locations
const mockRequests: Request[] = [
  {
    id: 'r1',
    title: 'Water Leak',
    category: 'PLUMBING',
    status: 'PENDING',
    latitude: 40.7505,
    longitude: -73.9934,
    description: 'Main pipe burst on 34th Street',
  },
  {
    id: 'r2',
    title: 'Streetlight Out',
    category: 'ELECTRICAL',
    status: 'ASSIGNED',
    latitude: 40.7549,
    longitude: -73.9840,
    description: 'Multiple streetlights not working',
  },
  {
    id: 'r3',
    title: 'Pothole Repair',
    category: 'ROADS',
    status: 'IN_PROGRESS',
    latitude: 40.7614,
    longitude: -73.9776,
    description: 'Large pothole causing traffic issues',
  },
  {
    id: 'r4',
    title: 'Graffiti Removal',
    category: 'CLEANUP',
    status: 'PENDING',
    latitude: 40.7465,
    longitude: -73.9878,
    description: 'Vandalism on public property',
  },
]

const availabilityColors = {
  AVAILABLE: 'bg-success text-success-foreground',
  BUSY: 'bg-warning text-warning-foreground',
  OFFLINE: 'bg-muted text-muted-foreground',
}

const availabilityDotColors = {
  AVAILABLE: 'bg-success',
  BUSY: 'bg-warning',
  OFFLINE: 'bg-muted-foreground',
}

export default function AgentsPage() {
  const [filter, setFilter] = useState('all')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const filteredAgents = filter === 'all'
    ? mockAgents
    : mockAgents.filter(a => a.availability === filter)

  const stats = {
    total: mockAgents.length,
    available: mockAgents.filter(a => a.availability === 'AVAILABLE').length,
    busy: mockAgents.filter(a => a.availability === 'BUSY').length,
    offline: mockAgents.filter(a => a.availability === 'OFFLINE').length,
  }

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent)
  }

  const handleLocateAgent = (agent: Agent) => {
    setSelectedAgent(agent)
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
          <p className="text-muted-foreground mt-1">
            Track agent locations and performance in real-time
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[150px] bg-secondary/50 border-transparent">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="BUSY">Busy</SelectItem>
            <SelectItem value="OFFLINE">Offline</SelectItem>
          </SelectContent>
        </Select>
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
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
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
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[500px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Live Agent Map
              </CardTitle>
              <CardDescription>Real-time agent locations and request markers</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <LiveMap
                agents={mockAgents}
                requests={mockRequests}
                center={[40.7549, -73.9840]}
                zoom={14}
                onAgentClick={handleAgentClick}
                selectedAgentId={selectedAgent?.id}
                className="h-full"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Agent List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[500px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Agent List</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="space-y-3 h-full overflow-y-auto pr-2 scrollbar-thin">
                {filteredAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedAgent?.id === agent.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${availabilityDotColors[agent.availability]}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{agent.name}</p>
                          <div className="flex items-center gap-1">
                            {agent.location && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleLocateAgent(agent)
                                }}
                              >
                                <Navigation className="h-3.5 w-3.5 text-primary" />
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Assign Task</DropdownMenuItem>
                                <DropdownMenuItem>View History</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 ${availabilityColors[agent.availability]}`}
                          >
                            {agent.availability}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            {agent.rating}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {agent.assignedTasks} tasks
                          </span>
                        </div>
                        {agent.location && (
                          <p className="text-[11px] text-muted-foreground mt-1 truncate">
                            {agent.location.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Agent Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedAgent.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedAgent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedAgent.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedAgent.email}</p>
                    <Badge
                      className={`mt-1 ${availabilityColors[selectedAgent.availability]}`}
                    >
                      {selectedAgent.availability}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Completed Tasks</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedAgent.completedTasks}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-medium">{selectedAgent.completionRate}%</span>
                    </div>
                    <Progress value={selectedAgent.completionRate} className="h-2" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">Avg Response Time</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedAgent.avgResponseTime}</p>
                  <p className="text-xs text-muted-foreground">
                    Time from assignment to task start
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-warning" />
                    <span className="text-sm">Performance Rating</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold">{selectedAgent.rating}</p>
                    <span className="text-muted-foreground">/5.0</span>
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

      {/* Map Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-primary to-purple-500 border-2 border-white shadow" />
                <span className="text-sm text-muted-foreground">Agent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-sm text-muted-foreground">Busy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                <span className="text-sm text-muted-foreground">Offline</span>
              </div>
              <div className="h-4 border-l border-border" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-destructive" />
                <span className="text-sm text-muted-foreground">Pending Request</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-primary" />
                <span className="text-sm text-muted-foreground">In Progress</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
