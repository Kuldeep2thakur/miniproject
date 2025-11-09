'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Entry } from '@/lib/types';

type ItineraryMapProps = {
  entries: Entry[];
  fallbackCenter?: [number, number];
  fallbackTitle?: string;
};

export function ItineraryMap({ entries, fallbackCenter, fallbackTitle }: ItineraryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [showPath, setShowPath] = useState(true);

  const points = useMemo(() => {
    return entries
      .filter((e) => !!e.location)
      .map((e) => ({
        lat: (e.location as any).coordinates.lat,
        lng: (e.location as any).coordinates.lng,
        title: e.title,
        content: e.content,
        locationName: (e.location as any).name,
        visitedAt: (e.visitedAt as any)?.toDate?.() || new Date(e.visitedAt as any),
      }))
      .sort((a, b) => +a.visitedAt - +b.visitedAt);
  }, [entries]);

  useEffect(() => {
    let mapInstance: any;
    let polyline: any;
    let markers: any[] = [];
    let resizeObs: ResizeObserver | undefined;

    const init = async () => {
      if (!containerRef.current) return;
      const L = (await import('leaflet')).default;
      // Ensure default icons render
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });

      mapInstance = L.map(containerRef.current, { scrollWheelZoom: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance);

      const latlngs = points.map((p) => [p.lat, p.lng]) as [number, number][];
      if (latlngs.length > 0) {
        polyline = L.polyline(latlngs, { color: '#3B82F6', weight: 4, opacity: 0.8 });
        if (showPath) polyline.addTo(mapInstance);
        const bounds = L.latLngBounds(latlngs);
        mapInstance.fitBounds(bounds.pad(0.15));
      } else {
        // When no entry points, use fallback center if provided
        if (fallbackCenter) {
          mapInstance.setView(fallbackCenter, 10);
          const m = (L as any).marker(fallbackCenter);
          if (fallbackTitle) {
            m.bindPopup(`<strong>${fallbackTitle}</strong>`).openPopup();
          }
          m.addTo(mapInstance);
          markers.push(m);
        } else {
          // Default world view
          mapInstance.setView([20, 0], 2);
        }
      }

      // Numbered divIcon markers (start/end accented)
      markers = points.map((p, i) => {
        const isStart = i === 0;
        const isEnd = i === points.length - 1;
        const bg = isStart ? '#10B981' : isEnd ? '#EF4444' : '#1F2937';
        const iconHtml = `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:${bg};color:white;font-size:13px;font-weight:600;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">${i + 1}</div>`;
        const divIcon = (L as any).divIcon({ html: iconHtml, className: 'itinerary-marker', iconSize: [28, 28] });
        const m = (L as any).marker([p.lat, p.lng], { icon: divIcon });
        m.bindPopup(`<strong>${i + 1}. ${p.title || ''}</strong>`);
        m.addTo(mapInstance);
        return m;
      });

      mapRef.current = mapInstance;
      polylineRef.current = polyline;
      markersRef.current = markers;

      // Invalidate size when container resizes (e.g., dialog opening)
      if ('ResizeObserver' in window) {
        resizeObs = new ResizeObserver(() => {
          try { mapInstance.invalidateSize(); } catch {}
        });
        resizeObs.observe(containerRef.current);
      } else {
        setTimeout(() => { try { mapInstance.invalidateSize(); } catch {} }, 50);
      }
    };

    init();
    return () => {
      try {
        markers.forEach((m) => m.remove());
        polyline?.remove();
        mapRef.current?.off();
        mapRef.current?.remove();
      } catch {}
      resizeObs?.disconnect?.();
      mapRef.current = null;
    };
  }, [points, showPath]);

  const fitAll = () => {
    const Lmod = (mapRef.current && (mapRef.current as any));
    if (!Lmod || !points.length) return;
    const bounds = (window as any).L
      ? (window as any).L.latLngBounds(points.map(p => [p.lat, p.lng]))
      : null;
    try {
      // Fallback compute bounds manually without relying on global L
      const lats = points.map(p => p.lat);
      const lngs = points.map(p => p.lng);
      const southWest = { lat: Math.min(...lats), lng: Math.min(...lngs) } as any;
      const northEast = { lat: Math.max(...lats), lng: Math.max(...lngs) } as any;
      mapRef.current.fitBounds([southWest, northEast], { padding: [50, 50] });
    } catch {}
  };

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full h-[60vh] rounded-lg overflow-hidden" />
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          className="px-3 py-1.5 rounded-md text-xs bg-black/60 text-white hover:bg-black/70"
          onClick={() => setShowPath((v) => !v)}
        >
          {showPath ? 'Hide Path' : 'Show Path'}
        </button>
        <button
          className="px-3 py-1.5 rounded-md text-xs bg-black/60 text-white hover:bg-black/70"
          onClick={fitAll}
        >
          Fit Bounds
        </button>
      </div>
    </div>
  );
}
