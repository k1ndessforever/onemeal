'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Heart, TrendingUp, Shield, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [stats, setStats] = useState({ todayFeeds: 0, totalImpact: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    // Fetch global stats
    fetch('/api/summary?range=today')
      .then(res => res.json())
      .then(data => {
        setStats({
          todayFeeds: data.stats?.today?.feeds || 0,
          totalImpact: data.stats?.totalImpact || 0
        });
      })
      .catch(console.error);

    // Check if location permission was previously granted
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setLocationStatus('granted');
        } else if (result.state === 'denied') {
          setLocationStatus('denied');
        }
      });
    }
  }, []);

  const handleFeedNow = async () => {
    setIsLoading(true);
    setMessage({ type: null, text: '' });
    
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      setLocationStatus('requesting');
      setMessage({ type: null, text: 'Requesting location access...' });

      // Get user location with better error handling
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            console.error('Geolocation error:', error);
            
            switch(error.code) {
              case error.PERMISSION_DENIED:
                setLocationStatus('denied');
                reject(new Error('Location permission denied. Please enable location access in your browser settings.'));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error('Location information unavailable. Please check your GPS/internet connection.'));
                break;
              case error.TIMEOUT:
                reject(new Error('Location request timed out. Please try again.'));
                break;
              default:
                reject(new Error('An unknown error occurred while getting your location.'));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });

      setLocationStatus('granted');
      setMessage({ type: null, text: 'Location obtained! Submitting feed...' });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Get or create anonymous ID
      let anonymousId = localStorage.getItem('onemeal_anonymous_id');
      if (!anonymousId) {
        anonymousId = crypto.randomUUID();
        localStorage.setItem('onemeal_anonymous_id', anonymousId);
      }

      // Submit feed
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lng, anonymousId })
      });

      const result = await response.json();

      if (response.ok) {
        // Save locally
        const feeds = JSON.parse(localStorage.getItem('onemeal_user_feeds') || '[]');
        feeds.unshift({
          id: crypto.randomUUID(),
          lat,
          lng,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('onemeal_user_feeds', JSON.stringify(feeds));

        // Update stats
        setStats(prev => ({ ...prev, todayFeeds: result.data.todayTotal }));
        setMessage({ type: 'success', text: result.message || 'Feed recorded successfully! 🎉' });
        
        // Scroll to success message
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message || result.error || 'Failed to record feed. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Feed submission error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Unable to submit feed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Success/Error Message */}
      {message.type && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 ${
          message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        } text-white px-6 py-4 rounded-lg shadow-2xl flex items-start gap-3 animate-fade-in`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium">{message.text}</p>
            {message.type === 'error' && locationStatus === 'denied' && (
              <p className="text-sm mt-2 opacity-90">
                Please enable location in your browser settings and refresh the page.
              </p>
            )}
          </div>
          <button 
            onClick={() => setMessage({ type: null, text: '' })}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-6">
            <Heart className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Privacy-First Impact Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">
            Feed One, Heal Many
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Every time you feed a stray animal, you save a life. Track your compassion anonymously and see the global impact in real-time.
          </p>

          {/* Primary CTA */}
          <button
            onClick={handleFeedNow}
            disabled={isLoading}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                I Fed a Stray Today
              </>
            )}
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>

          <p className="text-sm text-gray-500 mt-4">
            📍 We only capture approximate location • No login required • 100% anonymous
          </p>

          {/* Location Permission Status */}
          {locationStatus === 'denied' && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              Location access denied. Please enable it in browser settings.
            </div>
          )}
        </div>

        {/* Live Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">{stats.todayFeeds}</div>
                <div className="text-gray-600">Feeds Today</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Lives saved across the world today 🌍</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">{stats.totalImpact.toLocaleString()}</div>
                <div className="text-gray-600">Total Impact</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Animals saved from hunger since launch 💚</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <Shield className="w-8 h-8 text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600 text-sm">
              No emails, no accounts, no tracking. Your compassion is recorded anonymously with rounded coordinates.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <Globe className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Global Impact</h3>
            <p className="text-gray-600 text-sm">
              See real-time heatmaps of feeding activity worldwide. Watch compassion spread across communities.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <Heart className="w-8 h-8 text-pink-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Personal Dashboard</h3>
            <p className="text-gray-600 text-sm">
              Track your feeding streak and contributions locally in your browser. Your data stays with you.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/map"
            className="px-6 py-3 bg-white border-2 border-gray-200 rounded-full font-medium hover:border-emerald-500 hover:text-emerald-600 transition-colors"
          >
            View Global Map 🗺️
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white border-2 border-gray-200 rounded-full font-medium hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            My Dashboard 📊
          </Link>
        </div>

        {/* Mission Statement */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <p className="text-gray-600 italic">
            &ldquo;Code for compassion. Design for safety. Build for impact.&rdquo;
          </p>
          <p className="text-sm text-gray-500 mt-4">
            OneMeal is a privacy-first platform that proves technology can serve compassion without compromising user safety.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
