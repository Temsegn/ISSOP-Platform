'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit2, Trash2, MapPin, Calendar, User, Map, List } from 'lucide-react'
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
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { Request, RequestStatus, RequestCategory } from '@/lib/types'

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

// Mock data for requests with real NYC locations
const mockRequests: Request[] = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues near the intersection of Main St and 5th Ave',
    category: 'INFRASTRUCTURE',
    status: 'PENDING',
    priority: 'HIGH',
    location: { lat: 40.7580, lng: -73.9855, address: 'Times Square, Manhattan' },
    citizenId: 'c1',
    citizen: { id: 'c1', email: 'john@city.com', firstName: 'John', lastName: 'Doe', role: 'CITIZEN', isActive: true, createdAt: '', updatedAt: '' },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Garbage Collection Missed',
    description: 'Garbage has not been collected for the past 3 days in District 7',
    category: 'SANITATION',
    status: 'ASSIGNED',
    priority: 'MEDIUM',
    location: { lat: 40.7484, lng: -73.9857, address: 'Empire State Building Area' },
    citizenId: 'c2',
    citizen: { id: 'c2', email: 'jane@city.com', firstName: 'Jane', lastName: 'Smith', role: 'CITIZEN', isActive: true, createdAt: '', updatedAt: '' },
    agentId: 'a1',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '3',
    title: 'Traffic Light Malfunction',
    description: 'Traffic light at Central Square not working properly, causing confusion',
    category: 'TRAFFIC',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    location: { lat: 40.7527, lng: -73.9772, address: 'Grand Central Terminal' },
    citizenId: 'c3',
    citizen: { id: 'c3', email: 'mike@city.com', firstName: 'Mike', lastName: 'Johnson', role: 'CITIZEN', isActive: true, createdAt: '', updatedAt: '' },
    agentId: 'a2',
    createdAt: '2024-01-13T08:45:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '4',
    title: 'Water Leak on Elm Street',
    description: 'Significant water leak from underground pipe causing road flooding',
    category: 'UTILITIES',
    status: 'COMPLETED',
    priority: 'HIGH',
    location: { lat: 40.7614, lng: -73.9776, address: 'Rockefeller Center' },
    citizenId: 'c4',
    citizen: { id: 'c4', email: 'sarah@city.com', firstName: 'Sarah', lastName: 'Williams', role: 'CITIZEN', isActive: true, createdAt: '', updatedAt: '' },
    agentId: 'a1',
    createdAt: '2024-01-10T16:00:00Z',
    updatedAt: '2024-01-14T10:30:00Z',
    resolvedAt: '2024-01-14T10:30:00Z',
  },
  {
    id: '5',
    title: 'Vandalism at Park',
    description: 'Graffiti and damaged benches at Central Park playground area',
    category: 'PUBLIC_SAFETY',
    status: 'PENDING',
    priority: 'MEDIUM',
    location: { lat: 40.7829, lng: -73.9654, address: 'Central Park - Playground' },
    citizenId: 'c5',
    citizen: { id: 'c5', email: 'tom@city.com', firstName: 'Tom', lastName: 'Brown', role: 'CITIZEN', isActive: true, createdAt: '', updatedAt: '' },
    createdAt: '2024-01-15T07:15:00Z',
    updatedAt: '2024-01-15T07:15:00Z',
  },
  {
    id: '6',
    title: 'Street Light Out',
    description: 'Multiple street lights not working on Oak Avenue for the past week',
    category: 'UTILITIES',
    status: 'ASSIGNED',
    priority: 'LOW',
    location: { lat: 40.7587, lng: -73.9787, address: 'Bryant Park' },
    citizenId: 'c6',
    citizen: { id: 'c6', email: 'lisa@city.com', firstName: 'Lisa', lastName: 'Davis', role: 'CITIZEN', isActive: true, createdAt: '', updatedAt: '' },
    agentId: 'a3',
    createdAt: '2024-01-12T20:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '7',
    title: 'Noise Complaint',
    description: 'Excessive noise from construction site during restricted hours',
    category: 'OTHER',
    status: 'REJECTED',
    priority: 'LOW',
    location: { lat: 40.7505, lng: -73.9934, address: 'Hudson Yards' },
    citizenId: 'c7',
    citizen: { id: 'c7', email: 'alex@city.com', firstName: 'Alex', lastName: 'Miller', role: 'CITIZEN', isActive: true, createdAt: '', updatedAt: '' },
    createdAt: '2024-01-11T22:00:00Z',
    updatedAt: '2024-01-13T14:00:00Z',
  },
  {
    id: '8',
    title: 'Sidewalk Damage',
    description: 'Cracked and uneven sidewalk creating hazard for pedestrians',
    category: 'INFRASTRUCTURE',
    status: 'PENDING',
    priority: 'MEDIUM',
    location: { lat: 40.7489, lng: -73.9680, address: 'UN Headquarters' },
    citizenId: 'c8',
    citizen: { id: 'c8', email: 'emma@city.com', firstName: 'Emma', lastName: 'Wilson', role: 'CITIZEN', isActive: true, createdAt: '', updatedAt: '' },
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-15T13:00:00Z',
  },
]

const categoryLabels: Record<RequestCategory, string> = {
  INFRASTRUCTURE: 'Infrastructure',
  SANITATION: 'Sanitation',
  TRAFFIC: 'Traffic',
  UTILITIES: 'Utilities',
  PUBLIC_SAFETY: 'Public Safety',
  OTHER: 'Other',
}

const categoryColors: Record<RequestCategory, string> = {
  INFRASTRUCTURE: 'bg-chart-1/10 text-chart-1',
  SANITATION: 'bg-chart-2/10 text-chart-2',
  TRAFFIC: 'bg-chart-3/10 text-chart-3',
  UTILITIES: 'bg-chart-4/10 text-chart-4',
  PUBLIC_SAFETY: 'bg-chart-5/10 text-chart-5',
  OTHER: 'bg-muted text-muted-foreground',
}

// Convert requests to map format
const mapRequests = mockRequests.map(r => ({
  id: r.id,
  title: r.title,
  category: r.category,
  status: r.status,
  latitude: r.location.lat,
  longitude: r.location.lng,
  description: r.description,
}))

export default function RequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  const columns = [
    {
      key: 'id',
      header: 'ID',
      cell: (request: Request) => (
        <span className="font-mono text-xs text-muted-foreground">#{request.id}</span>
      ),
      className: 'w-[60px]',
    },
    {
      key: 'title',
      header: 'Title',
      cell: (request: Request) => (
        <div className="max-w-[300px]">
          <p className="font-medium truncate">{request.title}</p>
          <p className="text-xs text-muted-foreground truncate">{request.description}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'category',
      header: 'Category',
      cell: (request: Request) => (
        <Badge variant="secondary" className={categoryColors[request.category]}>
          {categoryLabels[request.category]}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (request: Request) => <StatusBadge status={request.status} />,
    },
    {
      key: 'priority',
      header: 'Priority',
      cell: (request: Request) => <PriorityBadge priority={request.priority} />,
    },
    {
      key: 'citizen',
      header: 'Reported By',
      cell: (request: Request) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm">
            {request.citizen?.firstName} {request.citizen?.lastName}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      cell: (request: Request) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(request.createdAt).toLocaleDateString()}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: '',
      cell: (request: Request) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Edit2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setSelectedRequest(request)
                setIsDetailOpen(true)
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'LOW', label: 'Low' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'HIGH', label: 'High' },
        { value: 'URGENT', label: 'Urgent' },
      ],
    },
  ]

  const handleRequestClick = (mapRequest: { id: string }) => {
    const request = mockRequests.find(r => r.id === mapRequest.id)
    if (request) {
      setSelectedRequest(request)
      setIsDetailOpen(true)
    }
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
          <h1 className="text-2xl font-bold tracking-tight">Request Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all citizen requests and reports
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <Button className="gradient-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      {viewMode === 'list' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DataTable
            columns={columns}
            data={mockRequests}
            searchPlaceholder="Search requests..."
            filters={filters}
            onRowClick={(request) => {
              setSelectedRequest(request)
              setIsDetailOpen(true)
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Map View */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[600px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Request Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[520px]">
                <LiveMap
                  requests={mapRequests}
                  showAgents={false}
                  center={[40.7549, -73.9840]}
                  zoom={13}
                  onRequestClick={handleRequestClick}
                  selectedRequestId={selectedRequest?.id}
                  className="h-full"
                />
              </CardContent>
            </Card>
          </div>

          {/* Request List Sidebar */}
          <div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">
                  Requests ({mockRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <div className="space-y-3 h-full overflow-y-auto pr-2 scrollbar-thin">
                  {mockRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedRequest?.id === request.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                      }`}
                      onClick={() => {
                        setSelectedRequest(request)
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{request.title}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {request.location.address}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <StatusBadge status={request.status} />
                            <PriorityBadge priority={request.priority} />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedRequest(request)
                            setIsDetailOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Map Legend */}
      {viewMode === 'map' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-destructive" />
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-warning" />
                  <span className="text-sm text-muted-foreground">Assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-primary" />
                  <span className="text-sm text-muted-foreground">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-success" />
                  <span className="text-sm text-muted-foreground">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Request Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Request Details</span>
              {selectedRequest && <StatusBadge status={selectedRequest.status} />}
            </DialogTitle>
            <DialogDescription>
              View full details of the selected request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedRequest.title}</h3>
                <p className="text-muted-foreground mt-1">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="secondary" className={categoryColors[selectedRequest.category]}>
                    {categoryLabels[selectedRequest.category]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <PriorityBadge priority={selectedRequest.priority} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Reported By</p>
                  <p className="font-medium">
                    {selectedRequest.citizen?.firstName} {selectedRequest.citizen?.lastName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Location
                </p>
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <p className="font-medium">{selectedRequest.location.address || 'No address'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coordinates: {selectedRequest.location.lat.toFixed(4)}, {selectedRequest.location.lng.toFixed(4)}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status Timeline</p>
                <div className="flex items-center gap-2">
                  {(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as RequestStatus[]).map((status, index) => {
                    const isActive = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].indexOf(selectedRequest.status) >= index
                    return (
                      <div key={status} className="flex items-center gap-2">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < 3 && (
                          <div
                            className={`h-1 w-8 rounded transition-colors ${
                              isActive && index < ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].indexOf(selectedRequest.status)
                                ? 'bg-primary'
                                : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Pending</span>
                  <span>Assigned</span>
                  <span>In Progress</span>
                  <span>Completed</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                <Button className="gradient-primary text-white">
                  Assign Agent
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
