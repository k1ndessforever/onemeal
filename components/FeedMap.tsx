'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface MapInstance {
  remove: () => void;
}

export default function FeedMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapInstance | null>(null);
  const [stats, setStats] = useState({ totalFeeds: 0, activeFeeders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (map.current) return;

    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        // Fix default marker icons
        delete (L.Icon.Default.prototype as never)['_getIconUrl'];
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        map.current = L.map(mapContainer.current, {
          center: [20.5937, 78.9629],
          zoom: 5,
          zoomControl: true,
          scrollWheelZoom: true,
        }) as unknown as MapInstance;

        // Add tile layer with attribution
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map.current as never);

        // Fetch and display data
        const response = await fetch('/api/summary?range=week');
        
        if (!response.ok) {
          throw new Error('Failed to fetch map data');
        }
        
        const data = await response.json();

        console.log('Map data loaded:', data);

        if (data.heatmap && data.heatmap.length > 0) {
          const bounds: [number, number][] = [];

          // Add circle markers for each location
          data.heatmap.forEach((point: { lat: number; lng: number; intensity: number }) => {
            bounds.push([point.lat, point.lng]);

            // Color based on intensity
            let color = '#3b82f6'; // blue (low)
            if (point.intensity > 20) color = '#ef4444'; // red (high)
            else if (point.intensity > 10) color = '#f59e0b'; // orange (medium)
            else if (point.intensity > 5) color = '#10b981'; // green (medium-low)

            const marker = L.circleMarker([point.lat, point.lng], {
              radius: Math.min(6 + point.intensity / 2, 15),
              fillColor: color,
              color: '#ffffff',
              weight: 2,
              fillOpacity: 0.7,
              opacity: 1
            });

            marker.bindPopup(`
              <div style="text-align: center; padding: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: ${color};">
                  ${point.intensity}
                </div>
                <div style="font-size: 14px; color: #666; margin-top: 4px;">
                  ${point.intensity === 1 ? 'feed' : 'feeds'} in this area
                </div>
                <div style="font-size: 12px; color: #10b981; margin-top: 8px; font-weight: 500;">
                  💚 Making a difference!
                </div>
              </div>
            `);

            marker.addTo(map.current as never);
          });

          // Fit map to show all markers with padding
          if (bounds.length > 0) {
            const leafletBounds = L.latLngBounds(bounds);
            (map.current as never).fitBounds(leafletBounds, { 
              padding: [50, 50],
              maxZoom: 12 
            });
          }
        }

        setStats({
          totalFeeds: data.stats?.totalFeeds || 0,
          activeFeeders: data.stats?.uniqueFeeders || 0,
        });

        setLoading(false);
      } catch (err) {
        console.error('Map initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Map</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading compassion map...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching feeding data from around the world</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {stats.totalFeeds === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 backdrop-blur-sm z-[1000]">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Feeds Yet</h3>
            <p className="text-gray-600 mb-6">
              Be the first to make a difference! Your act of kindness will appear here and inspire others.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-medium"
            >
              <span>🐾</span>
              Record Your First Feed
            </Link>
          </div>
        </div>
      )}

      {/* Floating Legend */}
      {stats.totalFeeds > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] max-w-xs">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-xl">📍</span>
            Map Legend
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">1-5 feeds (New area)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
              <span className="text-gray-600">6-10 feeds (Active)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">11-20 feeds (Very active)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-600">20+ feeds (Hotspot)</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 Click markers to see details
            </p>
          </div>
        </div>
      )}

      {/* Zoom Controls Info */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-[999] text-sm text-gray-600">
        <p className="font-medium">🔍 Use mouse wheel or +/- to zoom</p>
      </div>
    </div>
  );
}
