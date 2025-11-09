'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { MapPicker } from './map-picker';
import { ClientOnly } from './client-only';

interface LocationPickerProps {
  onLocationSelected?: (location: { name: string; coordinates: { lat: number; lng: number } }) => void;
  onLocationSelect?: (location: { name: string; coordinates: { lat: number; lng: number } }) => void;
  defaultLocation?: { name: string; coordinates: { lat: number; lng: number } };
}

export function LocationPicker({ onLocationSelected, onLocationSelect, defaultLocation }: LocationPickerProps) {
  const [searchInput, setSearchInput] = useState('');
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>(
    defaultLocation ? [defaultLocation.coordinates.lat, defaultLocation.coordinates.lng] : [51.505, -0.09]
  ); // Default to London

  useEffect(() => {
    if (open) setOpenCount((c) => c + 1);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchInput
        )}`
      );
      const data = await response.json();

      if (data && data[0]) {
        const { lat, lon: lng } = data[0];
        setSelectedLocation([parseFloat(lat), parseFloat(lng)]);
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  };

  const handleLocationSelect = (latlng: [number, number]) => {
    setSelectedLocation(latlng);
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedLocation[0]}&lon=${selectedLocation[1]}`
      );
      const data = await response.json();

      const payload = {
        name: data.display_name || 'Selected Location',
        coordinates: {
          lat: selectedLocation[0],
          lng: selectedLocation[1],
        },
      };
      if (onLocationSelected) onLocationSelected(payload);
      if (onLocationSelect) onLocationSelect(payload);
      setOpen(false);
    } catch (error) {
      console.error('Error getting location details:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Pick Location
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pick a Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input
            placeholder="Search for a location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
        {open && (
          <ClientOnly>
            <MapPicker instanceKey={openCount} center={selectedLocation} onLocationSelected={handleLocationSelect} />
          </ClientOnly>
        )}
        <Button onClick={handleConfirm} className="mt-4">
          Confirm Location
        </Button>
      </DialogContent>
    </Dialog>
  );
}