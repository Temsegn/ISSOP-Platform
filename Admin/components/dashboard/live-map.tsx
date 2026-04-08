'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// Fix for default marker icons in Next.js
const statusColors: Record<string, string> = {
  AVAILABLE: '#22c55e',
  BUSY: '#f59e0b',
  OFFLINE: '#6b7280',
}

const createAgentIcon = (availability: string) => {
  const statusColor = statusColors[availability as keyof typeof statusColors] || statusColors.OFFLINE
  
  return L.divIcon({
    className: 'agent-marker',
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- Outer Glow/Pulse -->
        ${availability === 'AVAILABLE' ? `
          <div style="
            position: absolute;
            width: 40px;
            height: 40px;
            background: rgba(34, 197, 94, 0.4);
            border-radius: 50%;
            animation: pulse-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            z-index: 0;
          "></div>
        ` : ''}
        
        <!-- Main 'A' Circle -->
        <div style="
          width: 36px;
          height: 36px;
          background: #10b981; /* Vibrant Emerald Green */
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 10px rgba(16, 185, 129, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 19px;
          font-family: 'Inter', system-ui, sans-serif;
          z-index: 2;
          transform: translateY(-2px);
        ">A</div>
        
        <!-- Status Indicator Dot -->
        <div style="
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 14px;
          height: 14px;
          background: ${statusColor};
          border: 2px solid white;
          border-radius: 50%;
          z-index: 3;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        "></div>
      </div>
      <style>
        @keyframes pulse-ping {
          0% { transform: scale(1); opacity: 0.6; }
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
      </style>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
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
  radarCenter?: [number, number] | null
  nearbyAgents?: Agent[]
  className?: string
}

function FlyToMarker({ position, zoom = 15 }: { position: [number, number] | null; zoom?: number }) {
  const map = useMap()
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom, { duration: 1.5 })
    }
  }, [map, position, zoom])
  
  return null
}

function ScanningRadar({ center }: { center: [number, number] }) {
  return (
    <>
      <Circle
        center={center}
        radius={1000}
        pathOptions={{
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.1,
          weight: 1,
          dashArray: '5, 10'
        }}
        className="radar-circle"
      />
      <Circle
        center={center}
        radius={500}
        pathOptions={{
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.2,
          weight: 2,
        }}
        className="radar-pulse"
      />
      <style>{`
        .radar-pulse {
          animation: radar-pulse-anim 3s ease-out infinite;
        }
        @keyframes radar-pulse-anim {
          0% { transform: scale(0.1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </>
  )
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
  radarCenter,
  nearbyAgents = [],
  className = '',
}: LiveMapProps) {
  const [mounted, setMounted] = useState(false)
  const [flyToPosition, setFlyToPosition] = useState<[number, number] | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (radarCenter) {
      setFlyToPosition(radarCenter)
    } else if (selectedAgentId) {
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
  }, [selectedAgentId, selectedRequestId, radarCenter, agents, requests])

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
      
      <FlyToMarker position={flyToPosition} zoom={radarCenter ? 14 : 15} />

      {radarCenter && <ScanningRadar center={radarCenter} />}

      {/* Connection Lines to Nearby Agents */}
      {radarCenter && nearbyAgents.map(agent => (
        agent.location && (
          <Polyline
            key={`line-${agent.id}`}
            positions={[
              radarCenter,
              [agent.location.lat, agent.location.lng]
            ]}
            pathOptions={{
              color: '#10b981', // Green Light
              weight: 2,
              opacity: 0.6,
              dashArray: '8, 12',
            }}
            className="moving-dash"
          />
        )
      ))}
      <style>{`
        .moving-dash {
          stroke-dasharray: 10, 20;
          animation: dash-move 20s linear infinite;
        }
        @keyframes dash-move {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Nearby Agent Highlights */}
      {radarCenter && nearbyAgents.map(agent => agent.location && (
        <Circle
          key={`nearby-highlight-${agent.id}`}
          center={[agent.location.lat, agent.location.lng]}
          radius={100}
          pathOptions={{
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.4,
            weight: 2
          }}
        />
      ))}

      {/* Agent Markers */}
      {(showAgents || nearbyAgents.length > 0) && agents.concat(nearbyAgents).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).filter(a => a.location).map((agent) => {
        const initials = agent.name.split(' ').map(n => n[0]).join('')
        const isSelected = selectedAgentId === agent.id || nearbyAgents.some(na => na.id === agent.id)
        
        return (
          <Marker
            key={`agent-${agent.id}`}
            position={[agent.location!.lat, agent.location!.lng]}
            icon={createAgentIcon(agent.availability)}
            eventHandlers={{
              click: () => onAgentClick?.(agent),
            }}
          >
            <Popup className="agent-popup">
              <div className="p-1 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold uppercase">
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
                    <p>Rating: {agent.rating.toFixed(1)}/5.0</p>
                  )}
                </div>
              </div>
            </Popup>
            {isSelected && (
              <Circle
                center={[agent.location!.lat, agent.location!.lng]}
                radius={200}
                pathOptions={{
                  color: '#10b981',
                  fillColor: '#10b981',
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
        const isSelected = selectedRequestId === request.id || (radarCenter && radarCenter[0] === request.latitude && radarCenter[1] === request.longitude)
        
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
          </Marker>
        )
      })}
    </MapContainer>
  )
}
