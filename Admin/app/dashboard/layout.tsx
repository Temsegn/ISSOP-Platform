'use client'

import { motion } from 'framer-motion'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardNavbar } from '@/components/dashboard/navbar'
import { useAppSelector } from '@/store/hooks'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <DashboardNavbar />
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-[calc(100vh-4rem)] p-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  )
}
