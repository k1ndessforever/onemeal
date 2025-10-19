'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Heart, TrendingUp, Shield, Globe, AlertCircle, CheckCircle, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [stats, setStats] = useState({ todayFeeds: 0, totalImpact: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/summary?range=today')
      .then(res => res.json())
      .then(data => {
        setStats({
          todayFeeds: data.stats?.today?.feeds || 0,
          totalImpact: data.stats?.totalImpact || 0
        });
      })
      .catch(console.error);
  }, []);

  const handleFeedNow = async () => {
    setIsLoading(true);
    setMessage({ type: null, text: '' });
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            switch(error.code) {
              case error.PERMISSION_DENIED:
                reject(new Error('Location permission denied. Please enable location access.'));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error('Location unavailable. Check your GPS/internet.'));
                break;
              case error.TIMEOUT:
                reject(new Error('Location request timed out. Please try again.'));
                break;
              default:
                reject(new Error('Unable to get your location.'));
            }
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      let anonymousId = localStorage.getItem('onemeal_anonymous_id');
      if (!anonymousId) {
        anonymousId = crypto.randomUUID();
        localStorage.setItem('onemeal_anonymous_id', anonymousId);
      }

      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, anonymousId })
      });

      const result = await response.json();

      if (response.ok) {
        const feeds = JSON.parse(localStorage.getItem('onemeal_user_feeds') || '[]');
        feeds.unshift({
          id: crypto.randomUUID(),
          lat,
          lng,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('onemeal_user_feeds', JSON.stringify(feeds));

        setStats(prev => ({ ...prev, todayFeeds: result.data.todayTotal }));
        setMessage({ type: 'success', text: '🎉 Feed recorded! Thank you for making a difference!' });
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to record feed. Please try again.' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Unable to submit feed.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">
                OneMeal
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/map" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                Global Map
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                How It Works
              </Link>
              <button
                onClick={handleFeedNow}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-medium hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Feed Now'}
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <Link href="/map" className="text-gray-600 hover:text-emerald-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Global Map
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-emerald-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/how-it-works" className="text-gray-600 hover:text-emerald-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  How It Works
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleFeedNow(); }}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-medium"
                >
                  {isLoading ? 'Processing...' : 'Feed Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Success/Error Message */}
      {message.type && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 ${
          message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        } text-white px-6 py-4 rounded-lg shadow-2xl flex items-start gap-3`}>
          {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <div className="flex-1">
            <p className="font-medium">{message.text}</p>
          </div>
          <button onClick={() => setMessage({ type: null, text: '' })} className="text-white hover:text-gray-200">✕</button>
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

          <button
            onClick={handleFeedNow}
            disabled={isLoading}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </button>

          <p className="text-sm text-gray-500 mt-4">
            📍 Approximate location only • No login • 100% anonymous
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
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

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">{stats.totalImpact.toLocaleString()}</div>
                <div className="text-gray-600">Total Impact</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Animals saved since launch 💚</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <Shield className="w-8 h-8 text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600 text-sm">
              No emails, no accounts, no tracking. Anonymous with rounded coordinates.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <Globe className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Global Impact</h3>
            <p className="text-gray-600 text-sm">
              Real-time heatmaps of feeding activity worldwide.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <Heart className="w-8 h-8 text-pink-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Personal Dashboard</h3>
            <p className="text-gray-600 text-sm">
              Track your streak locally. Your data stays with you.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/map" className="group bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white hover:shadow-xl transition-all">
            <Globe className="w-10 h-10 mb-4" />
            <h3 className="text-xl font-bold mb-2">View Global Map</h3>
            <p className="text-sm opacity-90">See feeding activity worldwide</p>
          </Link>

          <Link href="/dashboard" className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white hover:shadow-xl transition-all">
            <TrendingUp className="w-10 h-10 mb-4" />
            <h3 className="text-xl font-bold mb-2">My Dashboard</h3>
            <p className="text-sm opacity-90">Track your personal impact</p>
          </Link>

          <Link href="/how-it-works" className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white hover:shadow-xl transition-all">
            <Shield className="w-10 h-10 mb-4" />
            <h3 className="text-xl font-bold mb-2">How It Works</h3>
            <p className="text-sm opacity-90">Learn about our approach</p>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 italic mb-2">
            &ldquo;Code for compassion. Design for safety. Build for impact.&rdquo;
          </p>
          <p className="text-sm text-gray-500">Built with 💚 for the voiceless ones</p>
        </div>
      </footer>
    </div>
  );
}
