'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  MoreHorizontal,
  User,
  Shield,
  UserCog,
  Users,
  Trash2,
  Edit2,
  Power,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { User as UserType, UserRole } from '@/lib/types'

const roleIcons: Record<string, typeof User> = {
  SUPERADMIN: Shield,
  ADMIN: UserCog,
  AGENT: Users,
  USER: User,
}

const roleColors: Record<string, string> = {
  SUPERADMIN: 'bg-destructive/10 text-destructive border-destructive/20',
  ADMIN: 'bg-primary/10 text-primary border-primary/20',
  AGENT: 'bg-accent/10 text-accent border-accent/20',
  USER: 'bg-muted text-muted-foreground border-border',
}

export default function UsersPage() {
  const currentUser = useAppSelector((state) => state.auth.user)
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null)
  
  // Create User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as UserRole,
    area: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      const res = await api.getUsers()
      setUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Admin can only see 'USER' (Citizens)
      const isAdminRestricted = currentUser?.role === 'ADMIN' && user.role !== 'USER'
      if (isAdminRestricted) return false

      const nameStr = user.name || 'Unnamed'
      const matchesSearch =
        nameStr.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter, currentUser])

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPERADMIN').length,
    agents: users.filter((u) => u.role === 'AGENT').length,
    citizens: users.filter((u) => u.role === 'USER').length,
  }), [users])

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return
      
      await api.updateUser(userId, { isActive: !user.isActive })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u))
      toast.success(`Account ${user.isActive ? 'deactivated' : 'activated'}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await api.deleteUser(userToDelete.id)
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id))
      setIsDeleteOpen(false)
      setUserToDelete(null)
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email || !newUser.password) {
      return toast.error('Please fill in all required fields')
    }

    try {
      setIsSubmitting(true)
      const res = await api.register(newUser)
      setUsers(prev => [res.data.user, ...prev])
      setIsCreateOpen(false)
      setNewUser({ name: '', email: '', password: '', role: 'USER', area: '' })
      toast.success('User account created')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const initials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const canAddRole = (role: UserRole) => {
    if (!currentUser) return false
    if (currentUser.role === 'SUPERADMIN') return true
    // Admin cannot change roles, they can only provision 'USER'
    return false
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Community</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Managing {stats.total} accounts across the smart city ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchData(true)} className="h-9 gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          {(currentUser?.role === 'SUPERADMIN' || currentUser?.role === 'ADMIN') && (
            <Button className="gradient-primary text-white h-9" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Identity
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Platform Users', value: stats.total, icon: Users, color: 'text-foreground' },
          { label: 'Administrators', value: stats.admins, icon: Shield, color: 'text-primary' },
          { label: 'Field Agents', value: stats.agents, icon: UserCog, color: 'text-accent' },
          { label: 'Verified Citizens', value: stats.citizens, icon: User, color: 'text-muted-foreground' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/40 p-2 rounded-2xl border border-border/20">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-transparent border-none focus-visible:ring-0"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px] bg-secondary/40 border-none rounded-xl">
            <SelectValue placeholder="Role View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Every Role</SelectItem>
            <SelectItem value="SUPERADMIN">SuperAdmin</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="AGENT">Agent</SelectItem>
            <SelectItem value="USER">Citizen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/20 bg-secondary/20">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Joined</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((user) => {
                    const RoleIcon = roleIcons[user.role] || User
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`group hover:bg-secondary/30 transition-colors ${!user.isActive ? 'opacity-50' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border/10">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {initials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{user.name || 'Anonymous'}</p>
                              {user.area && <p className="text-xs text-muted-foreground">{user.area}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium">{user.email}</p>
                            {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`${roleColors[user.role]} text-xs font-semibold`}>
                            <RoleIcon className="h-3 w-3 mr-1" /> {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-success' : 'bg-muted-foreground'}`} />
                            <span className="text-xs font-medium">{user.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                <Edit2 className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              {currentUser?.role === 'SUPERADMIN' && (
                                <>
                                  <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                                    <Power className="h-4 w-4 mr-2" /> {user.isActive ? 'Deactivate' : 'Activate'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive" 
                                    onClick={() => { setUserToDelete(user); setIsDeleteOpen(true); }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete User
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No users found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Intel Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md border-border/40 bg-card/95 backdrop-blur-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>User Intelligence</DialogTitle>
            <DialogDescription>Full archival record of this digital identity.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 pt-4">
              <div className="flex flex-col items-center gap-4 py-4">
                <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-2xl">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-black">{initials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-bold tracking-tight">{selectedUser.name || 'Unnamed Record'}</h3>
                  <Badge variant="outline" className={`mt-2 ${roleColors[selectedUser.role]}`}>{selectedUser.role}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { icon: Mail, label: 'Secure Email', val: selectedUser.email },
                  { icon: Phone, label: 'Emergency Contact', val: selectedUser.phone || 'Not Configured' },
                  { icon: Calendar, label: 'Enrollment Date', val: new Date(selectedUser.createdAt).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/20">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold">{item.val}</span>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button className="w-full h-12 rounded-2xl font-bold" onClick={() => setSelectedUser(null)}>Acknowledge</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create New Identity Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md border-border/40 bg-card/95 backdrop-blur-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>Forge New Identity</DialogTitle>
            <DialogDescription>Provision a new authenticated entity into the ISSOP ecosystem.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
              <Input placeholder="Citizen Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="h-12 rounded-2xl bg-secondary/30 border-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Secure Email</label>
              <Input type="email" placeholder="identity@issop.gov" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="h-12 rounded-2xl bg-secondary/30 border-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Encryption Key (Password)</label>
              <Input type="password" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="h-12 rounded-2xl bg-secondary/30 border-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Assigned Role</label>
                {currentUser?.role === 'SUPERADMIN' ? (
                  <Select value={newUser.role} onValueChange={val => setNewUser({ ...newUser, role: val as UserRole })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-secondary/30 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="USER">Citizen</SelectItem>
                      <SelectItem value="AGENT">Field Agent</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-12 rounded-2xl bg-secondary/30 flex items-center px-4 text-sm font-bold text-primary">
                    CITIZEN (Fixed)
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Ops Area</label>
                <Input placeholder="Zone/District" value={newUser.area} onChange={e => setNewUser({ ...newUser, area: e.target.value })} className="h-12 rounded-2xl bg-secondary/30 border-none" />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl gradient-primary text-white font-bold shadow-2xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
              {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'provision digital identity'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Erase Record Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-3xl border-border/40 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Erase Identity Record?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently purge {userToDelete?.name}'s encrypted profile from the central intelligence cluster. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-2xl h-11 border-none bg-secondary/50">Abort</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="rounded-2xl h-11 bg-destructive text-white border-none shadow-xl shadow-destructive/20">Purge Record</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
