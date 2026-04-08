'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Shield,
  UserCog,
  Users,
  User,
  Check,
  X,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  RefreshCw,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAppSelector } from '@/store/hooks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { UserRole, User as AppUser } from '@/lib/types'

interface Permission {
  key: string
  label: string
  description: string
}

const permissions: Permission[] = [
  { key: 'view_requests', label: 'View Requests', description: 'View all citizen requests' },
  { key: 'manage_requests', label: 'Manage Requests', description: 'Update and manage request status' },
  { key: 'assign_tasks', label: 'Assign Tasks', description: 'Assign tasks to agents' },
  { key: 'view_agents', label: 'View Agents', description: 'Monitor agent locations and status' },
  { key: 'manage_agents', label: 'Manage Agents', description: 'Create and manage agent accounts' },
  { key: 'view_analytics', label: 'View Analytics', description: 'Access dashboard analytics' },
  { key: 'advanced_analytics', label: 'Advanced Analytics', description: 'Access detailed performance metrics' },
  { key: 'manage_users', label: 'Manage Users', description: 'Create, edit, and delete users' },
  { key: 'manage_roles', label: 'Manage Roles', description: 'Promote and demote user roles' },
  { key: 'system_settings', label: 'System Settings', description: 'Access and modify system settings' },
]

const rolePermissions: Record<UserRole, string[]> = {
  USER: ['view_requests'],
  AGENT: ['view_requests'],
  ADMIN: [
    'view_requests',
    'manage_requests',
    'assign_tasks',
    'view_agents',
    'view_analytics',
  ],
  SUPERADMIN: [
    'view_requests',
    'manage_requests',
    'assign_tasks',
    'view_agents',
    'manage_agents',
    'view_analytics',
    'advanced_analytics',
    'manage_users',
    'manage_roles',
    'system_settings',
  ],
}

const roleIcons: Record<UserRole, typeof Shield> = {
  SUPERADMIN: Shield,
  ADMIN: UserCog,
  AGENT: Users,
  USER: User,
}

const roleColors: Record<UserRole, string> = {
  SUPERADMIN: 'bg-destructive/10 text-destructive border-destructive/20',
  ADMIN: 'bg-primary/10 text-primary border-primary/20',
  AGENT: 'bg-accent/10 text-accent border-accent/20',
  USER: 'bg-muted text-muted-foreground border-border',
}

const roleBgColors: Record<UserRole, string> = {
  SUPERADMIN: 'from-destructive/20 to-destructive/5',
  ADMIN: 'from-primary/20 to-primary/5',
  AGENT: 'from-accent/20 to-accent/5',
  USER: 'from-muted to-muted/50',
}

export default function RolesPage() {
  const router = useRouter()
  const currentUser = useAppSelector((state) => state.auth.user)
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)
  const [newRole, setNewRole] = useState<UserRole | ''>('')
  const [isPromoteOpen, setIsPromoteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      const res = await api.getUsers()
      setUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load user records')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    // Basic protection (Auth middleware should also handle this)
    if (currentUser && currentUser.role !== 'SUPERADMIN') {
      toast.error('Access Denied: SuperAdmin Clearance Required')
      router.push('/dashboard')
    } else {
      fetchData()
    }
  }, [currentUser, router, fetchData])

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name?.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 10) // Only show first 10 for quick management
  }, [users, search])

  const handleRoleChange = async () => {
    if (selectedUser && newRole) {
      try {
        setIsSubmitting(true)
        await api.updateUserRole(selectedUser.id, newRole as UserRole)
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: newRole as UserRole } : u))
        toast.success(`Identity Reprovisioned: ${selectedUser.name} is now ${newRole}`)
        setIsPromoteOpen(false)
        setSelectedUser(null)
        setNewRole('')
      } catch (error: any) {
        toast.error(error.message || 'Reprovisioning failed')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const isPromotion = (from: UserRole, to: UserRole): boolean => {
    const hierarchy: UserRole[] = ['USER', 'AGENT', 'ADMIN', 'SUPERADMIN']
    return hierarchy.indexOf(to) > hierarchy.indexOf(from)
  }

  const initials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[300px] w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
           <Skeleton className="h-[400px] w-full" />
           <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Security Governance</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Critical oversight of platform roles and system-wide permissions.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchData(true)} className="h-9 gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Records
          </Button>
        </motion.div>

        {/* Role Hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold tracking-tight">Access Hierarchy</CardTitle>
              <CardDescription>Structural overview of permission escalation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {(['SUPERADMIN', 'ADMIN', 'AGENT', 'USER'] as UserRole[]).map((role, index) => {
                  const Icon = roleIcons[role]
                  const permCount = rolePermissions[role].length
                  return (
                    <motion.div
                      key={role}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-5 rounded-2xl border border-border/20 bg-gradient-to-br ${roleBgColors[role]}`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-lg ${roleColors[role]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm tracking-tight">{role}</h3>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">
                            {permCount} nodes active
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {permissions.slice(0, 3).map((perm) => {
                          const hasPermission = rolePermissions[role].includes(perm.key)
                          return (
                            <div key={perm.key} className="flex items-center gap-2 text-[11px] font-medium">
                              {hasPermission ? (
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <X className="h-3 w-3 text-muted-foreground/30" />
                              )}
                              <span className={hasPermission ? 'text-foreground' : 'text-muted-foreground/30'}>
                                {perm.label}
                              </span>
                            </div>
                          )
                        })}
                        {permCount > 3 && <p className="text-[10px] text-primary italic mt-2 font-bold">+{permCount - 3} auxiliary permissions</p>}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Permission Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/40 bg-card/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold tracking-tight">Full Matrix Analysis</CardTitle>
                <CardDescription>Granular breakdown of system capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20">
                        <th className="text-left py-3 pr-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">capability</th>
                        {(['USER', 'AGENT', 'ADMIN', 'SUPERADMIN'] as UserRole[]).map((role) => (
                          <th key={role} className="px-3 py-3 text-center">
                            <Badge variant="outline" className={`text-[9px] font-black tracking-tight ${roleColors[role]}`}>
                              {role.slice(0, 2)}
                            </Badge>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {permissions.map((perm, index) => (
                        <tr key={perm.key} className="group hover:bg-secondary/20 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">{perm.label}</span>
                              <Tooltip>
                                <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" /></TooltipTrigger>
                                <TooltipContent className="bg-popover/90 backdrop-blur rounded-xl border-border/40 shadow-2xl">
                                  <p className="text-[10px] font-medium max-w-[180px]">{perm.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                          {(['USER', 'AGENT', 'ADMIN', 'SUPERADMIN'] as UserRole[]).map((role) => {
                            const hasPermission = rolePermissions[role].includes(perm.key)
                            return (
                              <td key={role} className="px-3 py-3 text-center">
                                {hasPermission ? (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-4 w-4 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                                    <Check className="h-2.5 w-2.5 text-success" />
                                  </motion.div>
                                ) : (
                                  <X className="h-3 w-3 text-muted-foreground/10 mx-auto" />
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Identity Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/40 bg-card/40 backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold tracking-tight">Identity Reprovisioning</CardTitle>
                  <div className="relative w-32">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input 
                      placeholder="Search..." 
                      value={search} 
                      onChange={e => setSearch(e.target.value)}
                      className="h-8 pl-7 text-[10px] rounded-lg bg-secondary/50 border-none" 
                    />
                  </div>
                </div>
                <CardDescription>Hot-swapping roles for active personnel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user, index) => {
                      const Icon = roleIcons[user.role]
                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center justify-between p-3 rounded-2xl border border-border/10 bg-secondary/10 hover:bg-secondary/30 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-primary/10 shadow-lg shadow-black/5">
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                                {initials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-xs tracking-tight group-hover:text-primary transition-colors">{user.name || 'Unknown'}</p>
                              <Badge variant="outline" className={`text-[8px] h-4 mt-0.5 font-bold tracking-tighter ${roleColors[user.role]}`}>
                                <Icon className="h-2 w-2 mr-1" /> {user.role}
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 rounded-xl text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/10"
                            onClick={() => { setSelectedUser(user); setNewRole(''); setIsPromoteOpen(true); }}
                          >
                            Hot-Swap
                          </Button>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Identity Drift Dialog */}
        <Dialog open={isPromoteOpen} onOpenChange={setIsPromoteOpen}>
          <DialogContent className="max-w-md border-border/40 bg-card/95 backdrop-blur-xl rounded-3xl pb-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Modify Clearance Level</DialogTitle>
              <DialogDescription>Shifting the authority vector for this identity.</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-5 p-5 rounded-3xl bg-secondary/40 border border-border/10">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-2xl">
                    <AvatarFallback className="bg-primary/5 text-primary text-lg font-black">{initials(selectedUser.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-black text-lg tracking-tighter leading-none">{selectedUser.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 mb-2 font-medium">{selectedUser.email}</p>
                    <Badge variant="outline" className={`text-[9px] font-bold ${roleColors[selectedUser.role]}`}>
                      Active clearance: {selectedUser.role}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Permission Set</label>
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                    <SelectTrigger className="h-14 rounded-2xl bg-secondary/50 border-none shadow-inner">
                      <SelectValue placeholder="Select vector..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 backdrop-blur-xl">
                      {(['USER', 'AGENT', 'ADMIN', 'SUPERADMIN'] as UserRole[])
                        .filter((r) => r !== selectedUser.role)
                        .map((role) => {
                          const Icon = roleIcons[role]
                          const promoting = isPromotion(selectedUser.role, role)
                          return (
                            <SelectItem key={role} value={role} className="rounded-xl my-1 focus:bg-primary/10">
                              <div className="flex items-center gap-3">
                                <Icon className="h-4 w-4 text-primary" />
                                <span className="font-bold text-sm tracking-tight">{role}</span>
                                {promoting ? (
                                  <Badge className="bg-success text-white text-[8px] h-4 ml-auto">Ascend</Badge>
                                ) : (
                                  <Badge className="bg-warning text-white text-[8px] h-4 ml-auto">Descend</Badge>
                                )}
                              </div>
                            </SelectItem>
                          )
                        })}
                    </SelectContent>
                  </Select>
                </div>

                {newRole && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-3xl border ${isPromotion(selectedUser.role, newRole as UserRole) ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isPromotion(selectedUser.role, newRole as UserRole) ? 'bg-success/20' : 'bg-warning/20'}`}>
                        {isPromotion(selectedUser.role, newRole as UserRole) ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-warning" />}
                      </div>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${isPromotion(selectedUser.role, newRole as UserRole) ? 'text-success' : 'text-warning'}`}>
                          {isPromotion(selectedUser.role, newRole as UserRole) ? 'Authorization Upgrade' : 'Access Restricted'}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold">{selectedUser.role} → {newRole}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <DialogFooter className="gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setIsPromoteOpen(false)} className="h-14 rounded-2xl flex-1 font-bold text-muted-foreground">Abort Drift</Button>
                  <Button
                    className="gradient-primary h-14 rounded-2xl flex-1 font-black text-white shadow-xl shadow-primary/20 disabled:grayscale"
                    onClick={handleRoleChange}
                    disabled={!newRole || isSubmitting}
                  >
                    {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'execute swap'}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
