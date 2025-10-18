'use client';

import { useEffect, useState } from 'react';

export default function MapPage() {
  const [FeedMap, setFeedMap] = useState<any>(null);

  useEffect(() => {
    // Dynamically import the map component on client side only
    import('@/components/FeedMap').then((mod) => {
      setFeedMap(() => mod.default);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Global Compassion Map 🌍
          </h1>
          <p className="text-gray-600">
            Real-time visualization of feeding activity worldwide
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
          {FeedMap ? (
            <FeedMap />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="/"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}