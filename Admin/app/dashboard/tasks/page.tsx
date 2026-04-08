'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, MapPin, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/dashboard/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TaskItem {
  id: string
  requestTitle: string
  requestCategory: string
  status: string
  agent: {
    name: string
    avatar?: string
    availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  }
  location: string
  assignedAt: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

const mockTasks: TaskItem[] = [
  {
    id: '1',
    requestTitle: 'Pothole on Main Street',
    requestCategory: 'INFRASTRUCTURE',
    status: 'IN_PROGRESS',
    agent: { name: 'Maria Garcia', availability: 'BUSY' },
    location: 'Main Street & 5th Avenue',
    assignedAt: '2024-01-15T08:00:00Z',
    priority: 'HIGH',
  },
  {
    id: '2',
    requestTitle: 'Garbage Collection Missed',
    requestCategory: 'SANITATION',
    status: 'ASSIGNED',
    agent: { name: 'John Smith', availability: 'BUSY' },
    location: 'District 7, Block B',
    assignedAt: '2024-01-15T09:30:00Z',
    priority: 'MEDIUM',
  },
  {
    id: '3',
    requestTitle: 'Traffic Light Malfunction',
    requestCategory: 'TRAFFIC',
    status: 'IN_PROGRESS',
    agent: { name: 'Carlos Rodriguez', availability: 'BUSY' },
    location: 'Central Square',
    assignedAt: '2024-01-14T14:00:00Z',
    priority: 'URGENT',
  },
  {
    id: '4',
    requestTitle: 'Street Light Out',
    requestCategory: 'UTILITIES',
    status: 'ASSIGNED',
    agent: { name: 'Sarah Johnson', availability: 'BUSY' },
    location: 'Oak Avenue',
    assignedAt: '2024-01-15T07:00:00Z',
    priority: 'LOW',
  },
  {
    id: '5',
    requestTitle: 'Water Leak Repair',
    requestCategory: 'UTILITIES',
    status: 'COMPLETED',
    agent: { name: 'Mike Davis', availability: 'AVAILABLE' },
    location: 'Elm Street 142',
    assignedAt: '2024-01-14T10:00:00Z',
    priority: 'HIGH',
  },
]

const availableAgents = [
  { id: 'a1', name: 'Emily Chen', distance: '0.5 km', tasks: 2, availability: 'AVAILABLE' as const },
  { id: 'a2', name: 'David Park', distance: '1.2 km', tasks: 1, availability: 'AVAILABLE' as const },
  { id: 'a3', name: 'Lisa Taylor', distance: '2.1 km', tasks: 0, availability: 'AVAILABLE' as const },
  { id: 'a4', name: 'Robert Kim', distance: '3.5 km', tasks: 3, availability: 'BUSY' as const },
]

const priorityColors = {
  LOW: 'text-muted-foreground',
  MEDIUM: 'text-primary',
  HIGH: 'text-warning',
  URGENT: 'text-destructive',
}

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTasks = statusFilter === 'all'
    ? mockTasks
    : mockTasks.filter(t => t.status === statusFilter)

  const taskStats = {
    total: mockTasks.length,
    assigned: mockTasks.filter(t => t.status === 'ASSIGNED').length,
    inProgress: mockTasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: mockTasks.filter(t => t.status === 'COMPLETED').length,
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
          <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground mt-1">
            Assign and monitor agent tasks
          </p>
        </div>
        <Button className="gradient-primary text-white">
          <Plus className="h-4 w-4 mr-2" />
          Assign Task
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Tasks', value: taskStats.total, icon: UserCheck, color: 'text-primary' },
          { label: 'Assigned', value: taskStats.assigned, icon: Clock, color: 'text-warning' },
          { label: 'In Progress', value: taskStats.inProgress, icon: AlertCircle, color: 'text-accent' },
          { label: 'Completed', value: taskStats.completed, icon: CheckCircle2, color: 'text-success' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
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
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Active Tasks</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-secondary/50 border-transparent">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {filteredTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={task.agent.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {task.agent.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{task.requestTitle}</p>
                              <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Assigned to {task.agent.name}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {task.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(task.assignedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={task.status} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Agent Assignment Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Available Agents</CardTitle>
              <CardDescription>Select an agent for task assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                            agent.availability === 'AVAILABLE'
                              ? 'bg-success'
                              : agent.availability === 'BUSY'
                              ? 'bg-warning'
                              : 'bg-muted-foreground'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                          {agent.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {agent.distance}
                          </span>
                          <span>|</span>
                          <span>{agent.tasks} active tasks</span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          agent.availability === 'AVAILABLE'
                            ? 'bg-success/10 text-success'
                            : agent.availability === 'BUSY'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {agent.availability}
                      </Badge>
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
