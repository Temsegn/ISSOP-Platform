'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// Fix for default marker icons in Next.js
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

const createAgentIcon = (availability: string) => {
  const statusColors = {
    AVAILABLE: '#22c55e',
    BUSY: '#f59e0b',
    OFFLINE: '#6b7280',
  }
  const statusColor = statusColors[availability as keyof typeof statusColors] || '#6b7280'
  
  return L.divIcon({
    className: 'agent-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 36px;
          height: 36px;
          background: #22c55e;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.5), 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 18px;
          font-family: 'Inter', system-ui, sans-serif;
          z-index: 2;
        ">A</div>
        <div style="
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: ${statusColor};
          border: 2px solid white;
          border-radius: 50%;
          z-index: 3;
        "></div>
        ${availability === 'AVAILABLE' ? `
          <div style="
            position: absolute;
            width: 40px;
            height: 40px;
            background: rgba(34, 197, 94, 0.3);
            border-radius: 50%;
            animation: pulse-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            z-index: 1;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse-ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  })
}

const createRequestIcon = (status: string, category?: string) => {
  const statusColors = {
    PENDING: '#ef4444',
    ASSIGNED: '#f59e0b',
    IN_PROGRESS: '#3b82f6',
    COMPLETED: '#22c55e',
  }
  const color = statusColors[status as keyof typeof statusColors] || '#ef4444'
  
  return L.divIcon({
    className: 'request-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border: 2px solid white;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

interface Agent {
  id: string
  name: string
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  location?: { lat: number; lng: number; address: string }
  assignedTasks?: number
  rating?: number
}

interface Request {
  id: string
  title: string
  category: string
  status: string
  latitude: number
  longitude: number
  description?: string
}

interface LiveMapProps {
  agents?: Agent[]
  requests?: Request[]
  center?: [number, number]
  zoom?: number
  onAgentClick?: (agent: Agent) => void
  onRequestClick?: (request: Request) => void
  showAgents?: boolean
  showRequests?: boolean
  selectedAgentId?: string | null
  selectedRequestId?: string | null
  className?: string
}

function FlyToMarker({ position }: { position: [number, number] | null }) {
  const map = useMap()
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1 })
    }
  }, [map, position])
  
  return null
}

export function LiveMap({
  agents = [],
  requests = [],
  center = [40.7484, -73.9857], // NYC default
  zoom = 13,
  onAgentClick,
  onRequestClick,
  showAgents = true,
  showRequests = true,
  selectedAgentId,
  selectedRequestId,
  className = '',
}: LiveMapProps) {
  const [mounted, setMounted] = useState(false)
  const [flyToPosition, setFlyToPosition] = useState<[number, number] | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (selectedAgentId) {
      const agent = agents.find(a => a.id === selectedAgentId)
      if (agent?.location) {
        setFlyToPosition([agent.location.lat, agent.location.lng])
      }
    } else if (selectedRequestId) {
      const request = requests.find(r => r.id === selectedRequestId)
      if (request) {
        setFlyToPosition([request.latitude, request.longitude])
      }
    }
  }, [selectedAgentId, selectedRequestId, agents, requests])

  if (!mounted) {
    return (
      <div className={`bg-muted/30 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center space-y-2">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  const availabilityColors = {
    AVAILABLE: 'bg-success text-success-foreground',
    BUSY: 'bg-warning text-warning-foreground',
    OFFLINE: 'bg-muted text-muted-foreground',
  }

  const statusColors = {
    PENDING: 'bg-destructive text-destructive-foreground',
    ASSIGNED: 'bg-warning text-warning-foreground',
    IN_PROGRESS: 'bg-primary text-primary-foreground',
    COMPLETED: 'bg-success text-success-foreground',
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`rounded-lg ${className}`}
      style={{ height: '100%', width: '100%', minHeight: '300px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      <FlyToMarker position={flyToPosition} />

      {/* Agent Markers */}
      {showAgents && agents.filter(a => a.location).map((agent) => {
        const initials = agent.name.split(' ').map(n => n[0]).join('')
        const isSelected = selectedAgentId === agent.id
        
        return (
          <Marker
            key={`agent-${agent.id}`}
            position={[agent.location!.lat, agent.location!.lng]}
            icon={createAgentIcon(agent.availability, initials)}
            eventHandlers={{
              click: () => onAgentClick?.(agent),
            }}
          >
            <Popup className="agent-popup">
              <div className="p-1 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{agent.name}</p>
                    <Badge 
                      variant="secondary" 
                      className={`text-[10px] px-1.5 py-0 ${availabilityColors[agent.availability]}`}
                    >
                      {agent.availability}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{agent.location?.address}</p>
                  {agent.assignedTasks !== undefined && (
                    <p>Tasks: {agent.assignedTasks} assigned</p>
                  )}
                  {agent.rating !== undefined && (
                    <p>Rating: {agent.rating}/5.0</p>
                  )}
                </div>
              </div>
            </Popup>
            {isSelected && (
              <Circle
                center={[agent.location!.lat, agent.location!.lng]}
                radius={200}
                pathOptions={{
                  color: 'hsl(250, 80%, 55%)',
                  fillColor: 'hsl(250, 80%, 55%)',
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            )}
          </Marker>
        )
      })}

      {/* Request Markers */}
      {showRequests && requests.map((request) => {
        const isSelected = selectedRequestId === request.id
        
        return (
          <Marker
            key={`request-${request.id}`}
            position={[request.latitude, request.longitude]}
            icon={createRequestIcon(request.status, request.category)}
            eventHandlers={{
              click: () => onRequestClick?.(request),
            }}
          >
            <Popup className="request-popup">
              <div className="p-1 min-w-[180px]">
                <p className="font-semibold text-sm mb-1">{request.title}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {request.category}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={`text-[10px] px-1.5 py-0 ${statusColors[request.status as keyof typeof statusColors] || ''}`}
                  >
                    {request.status}
                  </Badge>
                </div>
                {request.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {request.description}
                  </p>
                )}
              </div>
            </Popup>
            {isSelected && (
              <Circle
                center={[request.latitude, request.longitude]}
                radius={150}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            )}
          </Marker>
        )
      })}
    </MapContainer>
  )
}
