'use client'

import { motion } from 'framer-motion'
import { FileText, UserCheck, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Activity {
  id: string
  type: 'request_created' | 'task_assigned' | 'status_updated' | 'agent_online'
  title: string
  description: string
  time: string
  user?: string
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'request_created',
    title: 'New Request Submitted',
    description: 'Infrastructure issue reported at Main Street',
    time: '2 min ago',
    user: 'John Citizen',
  },
  {
    id: '2',
    type: 'task_assigned',
    title: 'Task Assigned',
    description: 'Sanitation request #1234 assigned to Agent Maria',
    time: '15 min ago',
  },
  {
    id: '3',
    type: 'status_updated',
    title: 'Status Updated',
    description: 'Request #1230 marked as completed',
    time: '1 hour ago',
    user: 'Agent Carlos',
  },
  {
    id: '4',
    type: 'agent_online',
    title: 'Agent Online',
    description: 'Agent Sarah is now available for assignments',
    time: '2 hours ago',
  },
  {
    id: '5',
    type: 'request_created',
    title: 'New Request Submitted',
    description: 'Traffic signal malfunction at 5th Avenue',
    time: '3 hours ago',
    user: 'Emily Resident',
  },
  {
    id: '6',
    type: 'status_updated',
    title: 'Status Updated',
    description: 'Request #1225 moved to In Progress',
    time: '4 hours ago',
    user: 'Agent John',
  },
]

const activityIcons = {
  request_created: FileText,
  task_assigned: UserCheck,
  status_updated: CheckCircle,
  agent_online: MapPin,
}

const activityColors = {
  request_created: 'text-primary bg-primary/10',
  task_assigned: 'text-accent bg-accent/10',
  status_updated: 'text-success bg-success/10',
  agent_online: 'text-warning bg-warning/10',
}

export function ActivityFeed() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {mockActivities.map((activity, index) => {
              const Icon = activityIcons[activity.type]
              const colorClass = activityColors[activity.type]

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex gap-4 group"
                >
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full shrink-0',
                        colorClass
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    {index < mockActivities.length - 1 && (
                      <div className="w-px h-full bg-border mt-2 min-h-[20px]" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {activity.description}
                        </p>
                        {activity.user && (
                          <p className="text-xs text-muted-foreground mt-1">
                            by {activity.user}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
