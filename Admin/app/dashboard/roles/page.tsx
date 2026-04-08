'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import type { UserRole } from '@/lib/types'

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
  CITIZEN: [],
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

interface MockUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

const mockUsers: MockUser[] = [
  { id: '1', name: 'John Smith', email: 'john@issop.city', role: 'ADMIN' },
  { id: '2', name: 'Maria Garcia', email: 'maria@issop.city', role: 'AGENT' },
  { id: '3', name: 'Carlos Rodriguez', email: 'carlos@issop.city', role: 'AGENT' },
  { id: '4', name: 'Sarah Johnson', email: 'sarah@city.gov', role: 'CITIZEN' },
  { id: '5', name: 'Mike Davis', email: 'mike@issop.city', role: 'ADMIN' },
]

const roleIcons: Record<UserRole, typeof Shield> = {
  SUPERADMIN: Shield,
  ADMIN: UserCog,
  AGENT: Users,
  CITIZEN: User,
}

const roleColors: Record<UserRole, string> = {
  SUPERADMIN: 'bg-destructive/10 text-destructive border-destructive/20',
  ADMIN: 'bg-primary/10 text-primary border-primary/20',
  AGENT: 'bg-accent/10 text-accent border-accent/20',
  CITIZEN: 'bg-muted text-muted-foreground border-border',
}

const roleBgColors: Record<UserRole, string> = {
  SUPERADMIN: 'from-destructive/20 to-destructive/5',
  ADMIN: 'from-primary/20 to-primary/5',
  AGENT: 'from-accent/20 to-accent/5',
  CITIZEN: 'from-muted to-muted/50',
}

export default function RolesPage() {
  const [users, setUsers] = useState(mockUsers)
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null)
  const [newRole, setNewRole] = useState<UserRole | ''>('')
  const [isPromoteOpen, setIsPromoteOpen] = useState(false)

  const handleRoleChange = () => {
    if (selectedUser && newRole) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole as UserRole } : u
        )
      )
      setSelectedUser(null)
      setNewRole('')
      setIsPromoteOpen(false)
    }
  }

  const isPromotion = (from: UserRole, to: UserRole): boolean => {
    const hierarchy: UserRole[] = ['CITIZEN', 'AGENT', 'ADMIN', 'SUPERADMIN']
    return hierarchy.indexOf(to) > hierarchy.indexOf(from)
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and permissions (SuperAdmin only)
          </p>
        </motion.div>

        {/* Role Hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Role Hierarchy</CardTitle>
              <CardDescription>Overview of roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {(['SUPERADMIN', 'ADMIN', 'AGENT', 'CITIZEN'] as UserRole[]).map((role, index) => {
                  const Icon = roleIcons[role]
                  const permCount = rolePermissions[role].length
                  return (
                    <motion.div
                      key={role}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-4 rounded-xl border border-border/50 bg-gradient-to-b ${roleBgColors[role]}`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${roleColors[role]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{role}</h3>
                          <p className="text-xs text-muted-foreground">
                            {permCount} permissions
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {permissions.slice(0, 4).map((perm) => {
                          const hasPermission = rolePermissions[role].includes(perm.key)
                          return (
                            <div
                              key={perm.key}
                              className="flex items-center gap-2 text-xs"
                            >
                              {hasPermission ? (
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <X className="h-3 w-3 text-muted-foreground/50" />
                              )}
                              <span
                                className={
                                  hasPermission
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/50'
                                }
                              >
                                {perm.label}
                              </span>
                            </div>
                          )
                        })}
                        {permCount > 4 && (
                          <p className="text-xs text-muted-foreground pt-1">
                            +{permCount - 4} more
                          </p>
                        )}
                      </div>
                      {index < 3 && (
                        <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-5 w-5 text-muted-foreground hidden md:block" />
                      )}
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
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Permission Matrix</CardTitle>
                <CardDescription>Detailed permission breakdown by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-sm font-medium text-muted-foreground">
                          Permission
                        </th>
                        {(['CITIZEN', 'AGENT', 'ADMIN', 'SUPERADMIN'] as UserRole[]).map((role) => (
                          <th key={role} className="px-3 py-2 text-center">
                            <Badge variant="outline" className={`text-[10px] ${roleColors[role]}`}>
                              {role.slice(0, 2)}
                            </Badge>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((perm, index) => (
                        <motion.tr
                          key={perm.key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.03 }}
                          className="border-b border-border/50"
                        >
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{perm.label}</span>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs max-w-[200px]">{perm.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                          {(['CITIZEN', 'AGENT', 'ADMIN', 'SUPERADMIN'] as UserRole[]).map((role) => {
                            const hasPermission = rolePermissions[role].includes(perm.key)
                            return (
                              <td key={role} className="px-3 py-2 text-center">
                                {hasPermission ? (
                                  <Check className="h-4 w-4 text-success mx-auto" />
                                ) : (
                                  <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                                )}
                              </td>
                            )
                          })}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Role Changes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Role Changes</CardTitle>
                <CardDescription>Promote or demote users quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user, index) => {
                    const Icon = roleIcons[user.role]
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {user.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-[10px] ${roleColors[user.role]}`}>
                                <Icon className="h-2.5 w-2.5 mr-1" />
                                {user.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setNewRole('')
                            setIsPromoteOpen(true)
                          }}
                        >
                          Change Role
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Role Change Dialog */}
        <Dialog open={isPromoteOpen} onOpenChange={setIsPromoteOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Select a new role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedUser.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <Badge variant="outline" className={`mt-1 ${roleColors[selectedUser.role]}`}>
                      Current: {selectedUser.role}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Role</label>
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new role" />
                    </SelectTrigger>
                    <SelectContent>
                      {(['CITIZEN', 'AGENT', 'ADMIN', 'SUPERADMIN'] as UserRole[])
                        .filter((r) => r !== selectedUser.role)
                        .map((role) => {
                          const Icon = roleIcons[role]
                          const promoting = isPromotion(selectedUser.role, role)
                          return (
                            <SelectItem key={role} value={role}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{role}</span>
                                {promoting ? (
                                  <ArrowUpRight className="h-3 w-3 text-success ml-auto" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 text-warning ml-auto" />
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg ${
                      isPromotion(selectedUser.role, newRole as UserRole)
                        ? 'bg-success/10 border border-success/20'
                        : 'bg-warning/10 border border-warning/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isPromotion(selectedUser.role, newRole as UserRole) ? (
                        <>
                          <ArrowUpRight className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium text-success">Promotion</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-4 w-4 text-warning" />
                          <span className="text-sm font-medium text-warning">Demotion</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedUser.role} → {newRole}
                    </p>
                  </motion.div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPromoteOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="gradient-primary text-white"
                    onClick={handleRoleChange}
                    disabled={!newRole}
                  >
                    Confirm Change
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
