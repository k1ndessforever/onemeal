'use client';

import { useEffect, useRef, useState } from 'react';

export default function FeedMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [stats, setStats] = useState({ totalFeeds: 0, activeFeeders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (map.current) return; // Initialize only once

    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Import Leaflet
        const L = (await import('leaflet')).default;
        require('leaflet/dist/leaflet.css');

        // Create map instance
        map.current = L.map(mapContainer.current, {
          center: [20.5937, 78.9629],
          zoom: 5,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map.current);

        // Fetch and display data
        const response = await fetch('/api/summary?range=week');
        const data = await response.json();

        console.log('Data received:', data);

        if (data.heatmap && data.heatmap.length > 0) {
          // Add circle markers for each feed location
          data.heatmap.forEach((point: any) => {
            L.circleMarker([point.lat, point.lng], {
              radius: 8,
              fillColor: '#10b981',
              color: '#ffffff',
              weight: 2,
              fillOpacity: 0.7,
            })
              .bindPopup(`<strong>${point.intensity} feeds</strong><br/>in this area`)
              .addTo(map.current);
          });
        }

        setStats({
          totalFeeds: data.stats?.totalFeeds || 0,
          activeFeeders: data.stats?.uniqueFeeders || 0,
        });

        setLoading(false);
      } catch (error) {
        console.error('Map initialization error:', error);
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

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {!loading && stats.totalFeeds > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
          <h3 className="font-semibold text-gray-900 mb-2">Last 7 Days</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Total Feeds:</span>
              <span className="font-semibold">{stats.totalFeeds}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Active Feeders:</span>
              <span className="font-semibold">{stats.activeFeeders}</span>
            </div>
          </div>
        </div>
      )}

      {!loading && stats.totalFeeds === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95">
          <div className="text-center p-8">
            <p className="text-xl text-gray-700 mb-4">🌱 No feeds yet</p>
            <a 
              href="/"
              className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Record First Feed
            </a>
          </div>
        </div>
      )}
    </div>
  );
}