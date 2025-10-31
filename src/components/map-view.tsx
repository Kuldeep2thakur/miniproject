'use client';

import dynamic from 'next/dynamic';
import L, { type PointTuple } from 'leaflet';

// Only import Leaflet CSS on the client side
const LeafletCSS = dynamic(() => 
  import('leaflet/dist/leaflet.css').then(mod => {
    // This is a dummy component that just imports the CSS
    return function LeafletCSS() { return null; }
  }), 
  { ssr: false }
);

// Fix for default marker icon
const iconConfig = {
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41] as PointTuple,
  iconAnchor: [12, 41] as PointTuple,
};

// Dynamically import the map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

interface MapViewProps {
  location: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export function MapView({ location }: MapViewProps) {
  return (
    <>
      <LeafletCSS />
      <div className="h-[200px] w-full rounded-lg overflow-hidden">
        <MapContainer
          center={[location.coordinates.lat, location.coordinates.lng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker 
            position={[location.coordinates.lat, location.coordinates.lng]}
            icon={L.icon(iconConfig)}
          >
            <Popup>
              <div className="text-sm font-medium">{location.name}</div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </>
  );
}