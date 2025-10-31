'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import L, { LatLng, type PointTuple } from 'leaflet';

// Only import Leaflet CSS on the client side
const LeafletCSS = dynamic(() => 
  import('leaflet/dist/leaflet.css').then(mod => {
    // This is a dummy component that just imports the CSS
    return function LeafletCSS() { return null; }
  }), 
  { ssr: false }
);

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

// Create an icon configuration object for the marker
const iconConfig = {
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41] as PointTuple,
  iconAnchor: [12, 41] as PointTuple,
};

interface LocationPickerProps {
  onLocationSelect: (location: { name: string; coordinates: { lat: number; lng: number } }) => void;
  defaultLocation?: { name: string; coordinates: { lat: number; lng: number } };
}

const MapEvents = dynamic(
  () => import('react-leaflet').then(mod => {
    const MapEvents = ({ onLocationSelect }: { onLocationSelect: (latlng: L.LatLng) => void }) => {
      const map = mod.useMapEvents({
        click(e: L.LeafletMouseEvent) {
          onLocationSelect(e.latlng);
        },
      });
      return null;
    };
    return MapEvents;
  }),
  { ssr: false }
);

export function LocationPicker({ onLocationSelect, defaultLocation }: LocationPickerProps) {
  const [searchInput, setSearchInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [mapCenter, setMapCenter] = useState(defaultLocation?.coordinates || { lat: 20, lng: 0 });
  const [markerPosition, setMarkerPosition] = useState(defaultLocation?.coordinates);
  const [key, setKey] = useState(0); // Add a key to force clean remounts

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up any Leaflet-related resources
      if (typeof window !== 'undefined') {
        const containers = document.getElementsByClassName('leaflet-container');
        Array.from(containers).forEach(container => {
          // @ts-ignore
          if (container._leaflet_id) {
            // @ts-ignore
            container._leaflet = null;
            // @ts-ignore
            container._leaflet_id = null;
          }
        });
      }
    };
  }, []);

  const handleMapClick = async (latlng: L.LatLng) => {
    try {
      // Use Nominatim for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
      );
      const data = await response.json();
      const placeName = data.display_name || 'Unknown location';
      
      const newLocation = {
        name: placeName,
        coordinates: {
          lat: latlng.lat,
          lng: latlng.lng
        }
      };
      
      setSelectedLocation(newLocation);
      setMarkerPosition(newLocation.coordinates);
      onLocationSelect(newLocation);
    } catch (error) {
      console.error('Error getting location name:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    try {
      // Use Nominatim for geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon: lng, display_name } = data[0];
        const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
        
        const newLocation = {
          name: display_name,
          coordinates
        };
        
        setSelectedLocation(newLocation);
        setMapCenter(coordinates);
        setMarkerPosition(coordinates);
        onLocationSelect(newLocation);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" type="button" className="w-full">
          {selectedLocation ? selectedLocation.name : 'Select Location'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pick a Location</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for a location..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} type="button">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-[400px] w-full rounded-lg overflow-hidden" key={key}>
            <MapContainer
              key={`map-${key}`}
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={defaultLocation ? 13 : 2}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapEvents onLocationSelect={handleMapClick} />
              {markerPosition && (
                <Marker 
                  position={[markerPosition.lat, markerPosition.lng]} 
                  icon={L.icon(iconConfig)}
                />
              )}
            </MapContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}