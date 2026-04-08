'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Eye, Edit2, Trash2, MapPin, Calendar, User, UserCog, 
  Map, List, CheckCircle2, AlertCircle, Search, RefreshCw, Radar 
} from 'lucide-react'
import { DataTable, StatusBadge, PriorityBadge } from '@/components/dashboard/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Request, RequestStatus, User as AppUser } from '@/lib/types'

// Dynamic import for Leaflet
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

const categoryLabels: Record<string, string> = {
  INFRASTRUCTURE: 'Infrastructure',
  SANITATION: 'Sanitation',
  TRAFFIC: 'Traffic',
  UTILITIES: 'Utilities',
  PUBLIC_SAFETY: 'Public Safety',
  OTHER: 'Other',
}

const categoryColors: Record<string, string> = {
  INFRASTRUCTURE: 'bg-chart-1/10 text-chart-1',
  SANITATION: 'bg-chart-2/10 text-chart-2',
  TRAFFIC: 'bg-chart-3/10 text-chart-3',
  UTILITIES: 'bg-chart-4/10 text-chart-4',
  PUBLIC_SAFETY: 'bg-chart-5/10 text-chart-5',
  OTHER: 'bg-muted text-muted-foreground',
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [agents, setAgents] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [assigning, setAssigning] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const [reqsRes, agentsRes] = await Promise.all([
        api.getRequests({ limit: 100 }),
        api.getUsers()
      ])

      setRequests(reqsRes.data)
      setAgents(agentsRes.data.filter(u => u.role === 'AGENT'))
    } catch (error) {
      console.error('Error fetching requests data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const nearbyAgents = useMemo(() => {
    if (!selectedRequest) return []
    return agents
      .filter(a => a.status === 'AVAILABLE' && a.latitude && a.longitude)
      .map(agent => ({
        ...agent,
        distance: calculateDistance(
          selectedRequest.latitude,
          selectedRequest.longitude,
          agent.latitude!,
          agent.longitude!
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
  }, [selectedRequest, agents])

  const handleAssign = async (agentId?: string) => {
    const targetAgentId = agentId || selectedAgentId
    if (!selectedRequest || !targetAgentId) return

    try {
      setAssigning(true)
      await api.assignRequest(selectedRequest.id, targetAgentId)
      toast.success('Agent assigned successfully')
      setIsAssignOpen(false)
      setIsDetailOpen(false)
      fetchData(true)
    } catch (error: any) {
      console.error('Assignment error:', error)
      toast.error(error.message || 'Failed to assign agent')
    } finally {
      setAssigning(false)
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      cell: (request: Request) => (
        <span className="font-mono text-[10px] text-muted-foreground">
          #{request.id.slice(-6).toUpperCase()}
        </span>
      ),
      className: 'w-[80px]',
    },
    {
      key: 'title',
      header: 'Request Details',
      cell: (request: Request) => (
        <div className="max-w-[300px]">
          <p className="font-medium truncate">{request.title}</p>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <MapPin size={10} />
            <span className="truncate">{request.address || `${request.latitude.toFixed(4)}, ${request.longitude.toFixed(4)}`}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'category',
      header: 'Category',
      cell: (request: Request) => (
        <Badge variant="secondary" className={categoryColors[request.category] || categoryColors.OTHER}>
          {categoryLabels[request.category] || request.category}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (request: Request) => <StatusBadge status={request.status} />,
    },
    {
      key: 'reporter',
      header: 'Reported By',
      cell: (request: Request) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm">
            {request.citizen?.name || 'Citizen User'}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date Reported',
      cell: (request: Request) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {new Date(request.createdAt).toLocaleDateString()}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: '',
      cell: (request: Request) => (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedRequest(request)
              setIsDetailOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-[50px]',
    },
  ]

  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'ASSIGNED', label: 'Assigned' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'REJECTED', label: 'Rejected' },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      options: Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Request Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review citizen reports and assign field agents to resolve issues.
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
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')}>
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2">
                <Map className="h-4 w-4" />
                Map
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <DataTable
              columns={columns}
              data={requests}
              searchPlaceholder="Search by title or description..."
              filters={filters}
              onRowClick={(request) => {
                setSelectedRequest(request)
                setIsDetailOpen(true)
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            <div className="lg:col-span-2">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[650px] overflow-hidden">
                <LiveMap
                  requests={requests}
                  agents={agents as any}
                  showAgents={true}
                  center={[requests[0]?.latitude || 9.145, requests[0]?.longitude || 40.48967]}
                  zoom={12}
                  onRequestClick={(r) => {
                    const req = requests.find(item => item.id === r.id)
                    if (req) {
                      setSelectedRequest(req)
                      setIsDetailOpen(true)
                    }
                  }}
                  radarCenter={isAssignOpen && selectedRequest ? [selectedRequest.latitude, selectedRequest.longitude] : null}
                  nearbyAgents={isAssignOpen ? (nearbyAgents as any) : []}
                  selectedRequestId={selectedRequest?.id}
                  className="h-full"
                />
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm flex-1 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    Request Sidebar
                    <Badge variant="outline">{requests.length} Total</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-y-auto h-[550px] pr-2 scrollbar-thin">
                  <div className="space-y-2">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        onClick={() => setSelectedRequest(request)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                          selectedRequest?.id === request.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border/50 hover:border-primary/30 hover:bg-muted/50'
                        }`}
                      >
                        <p className="font-medium text-sm truncate">{request.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <StatusBadge status={request.status} />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedRequest(request)
                              setIsDetailOpen(true)
                            }}
                          >
                            <Eye size={12} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl border-border/50 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Request Details
              {selectedRequest && <StatusBadge status={selectedRequest.status} />}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 py-4">
              <div className="md:col-span-3 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Category</p>
                    <p className="text-sm font-medium">{categoryLabels[selectedRequest.category] || selectedRequest.category}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Reported On</p>
                    <p className="text-sm font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Reporter Identity</p>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{selectedRequest.citizen?.name || 'Anonymous Citizen'}</p>
                      <p className="text-xs text-muted-foreground">{selectedRequest.citizen?.email || 'No email provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Detailed Description</p>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-sm leading-relaxed antialiased">
                    "{selectedRequest.description}"
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Geographic Location</p>
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/50">
                    <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{selectedRequest.address || 'Exact Location Pending'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        GPS: {selectedRequest.latitude.toFixed(6)}, {selectedRequest.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Evidence Gallery</p>
                <div className="grid grid-cols-1 gap-4">
                  {selectedRequest.mediaUrls && selectedRequest.mediaUrls.length > 0 ? (
                    selectedRequest.mediaUrls.map((url, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.02 }}
                        className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/50 cursor-pointer shadow-lg group"
                        onClick={() => setPreviewImage(url)}
                      >
                        <img src={url} alt="Proof" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Plus className="text-white h-8 w-8" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="aspect-video rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                      <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-xs">No visual proof provided</p>
                    </div>
                  )}
                </div>

                {selectedRequest.status === 'PENDING' && (
                  <div className="pt-6 space-y-3">
                    <Button 
                      className="w-full gradient-primary text-white h-12 shadow-xl hover:shadow-primary/20 transition-all font-bold" 
                      onClick={() => setIsAssignOpen(true)}
                    >
                      <UserCog className="h-5 w-5 mr-2" />
                      Dispatch Field Agent
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setViewMode('map')
                        setIsDetailOpen(false)
                      }} 
                      className="w-full h-11 border-border/50 gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Track on Live Map
                    </Button>
                    <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="w-full h-11">
                      Close Window
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none overflow-hidden">
          {previewImage && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 z-50 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </Button>
              <img 
                src={previewImage} 
                alt="Large Preview" 
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border-4 border-white/10" 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog - THE RADAR SEARCH */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-2xl border-border/50 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary animate-pulse" />
              Nearby Agent Intelligence
            </DialogTitle>
            <DialogDescription>
              Identifying top 5 nearest responders based on real-time geographic data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            <div className="grid gap-3">
              {nearbyAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    selectedAgentId === agent.id 
                      ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                      : 'border-border/50 bg-secondary/20 hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-card" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{agent.name}</p>
                        <Badge variant="outline" className="text-[10px] h-4 bg-primary/5 text-primary border-primary/20">
                          {agent.distance.toFixed(2)} km
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {agent.area || 'Central District'} • {agent.status}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-4 rounded-lg bg-card border border-border/50 hover:bg-muted"
                      onClick={() => {
                        setSelectedAgentId(agent.id)
                        toast.info(`Viewing ${agent.name}'s current tasks...`)
                      }}
                    >
                      Inspect
                    </Button>
                    <Button 
                      size="sm" 
                      className={`h-9 px-4 rounded-lg font-bold transition-all ${
                        selectedAgentId === agent.id ? 'gradient-primary text-white scale-105' : 'bg-muted hover:bg-primary/20'
                      }`}
                      onClick={() => handleAssign(agent.id)}
                    >
                      {assigning && selectedAgentId === agent.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        'Assign'
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}

              {nearbyAgents.length === 0 && (
                <div className="text-center py-12 animate-pulse">
                  <Radar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">Scanning for nearest agents...</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground italic text-center">
                Distances are calculated as the crow flies from reported GPS coordinates.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
