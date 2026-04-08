'use client'

import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  index?: number
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  iconColor = 'text-primary',
  index = 0,
}: KPICardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                className="text-3xl font-bold tracking-tight"
              >
                {typeof value === 'number' ? value.toLocaleString() : value}
              </motion.p>
              {change !== undefined && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                  className="flex items-center gap-1"
                >
                  <span
                    className={cn(
                      'flex items-center text-xs font-medium',
                      isPositive ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {isPositive ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(change)}%
                  </span>
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                </motion.div>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10',
                iconColor
              )}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>

          {/* Decorative gradient */}
          <div className="absolute -bottom-1 -right-1 h-24 w-24 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </CardContent>
      </Card>
    </motion.div>
  )
}
