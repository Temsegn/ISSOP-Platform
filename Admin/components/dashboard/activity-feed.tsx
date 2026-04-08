'use client'

import { motion } from 'framer-motion'
import { FileText, UserCheck, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import type { Notification as AppNotification } from '@/lib/types'

interface ActivityFeedProps {
  notifications: AppNotification[]
}

const activityIcons: Record<string, any> = {
  REQUEST_CREATED: FileText,
  TASK_ASSIGNED: UserCheck,
  STATUS_UPDATED: CheckCircle,
  AGENT_ONLINE: MapPin,
}

const activityColors: Record<string, string> = {
  REQUEST_CREATED: 'text-primary bg-primary/10',
  TASK_ASSIGNED: 'text-accent bg-accent/10',
  STATUS_UPDATED: 'text-success bg-success/10',
  AGENT_ONLINE: 'text-warning bg-warning/10',
}

export function ActivityFeed({ notifications }: ActivityFeedProps) {
  const displayNotifications = notifications || []
  
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
            {displayNotifications.map((notification, index) => {
              const Icon = activityIcons[notification.type] || AlertCircle
              const colorClass = activityColors[notification.type] || 'text-muted bg-muted/10'

              return (
                <motion.div
                  key={notification.id}
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
                    {index < displayNotifications.length - 1 && (
                      <div className="w-px h-full bg-border mt-2 min-h-[20px]" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                          {notification.type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            {displayNotifications.length === 0 && (
              <div className="py-10 text-center text-muted-foreground">
                <p>No recent activity found.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
