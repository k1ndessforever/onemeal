'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Heart, TrendingUp, Shield, Globe } from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({ todayFeeds: 0, totalImpact: 0 });
  const [isLoading, setIsLoading] = useState(false);

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
  }, []);

  const handleFeedNow = async () => {
    setIsLoading(true);
    
    try {
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000
        });
      });

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
        headers: { 'Content-Type': 'application/json' },
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
        alert(result.message);
      } else {
        alert(result.message || 'Failed to record feed');
      }
    } catch (error) {
      alert('Unable to get location or submit feed. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
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
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MapPin className="w-5 h-5" />
            {isLoading ? 'Recording...' : 'I Fed a Stray Today'}
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>

          <p className="text-sm text-gray-500 mt-4">
            📍 We only capture approximate location • No login required • 100% anonymous
          </p>
        </div>

        {/* Live Stats */}
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
            <p className="text-sm text-gray-500">Animals saved from hunger since launch 💚</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <Shield className="w-8 h-8 text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600 text-sm">
              No emails, no accounts, no tracking. Your compassion is recorded anonymously with rounded coordinates.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <Globe className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Global Impact</h3>
            <p className="text-gray-600 text-sm">
              See real-time heatmaps of feeding activity worldwide. Watch compassion spread across communities.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <Heart className="w-8 h-8 text-pink-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Personal Dashboard</h3>
            <p className="text-gray-600 text-sm">
              Track your feeding streak and contributions locally in your browser. Your data stays with you.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="/map"
            className="px-6 py-3 bg-white border-2 border-gray-200 rounded-full font-medium hover:border-emerald-500 hover:text-emerald-600 transition-colors"
          >
            View Global Map 🗺️
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-white border-2 border-gray-200 rounded-full font-medium hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            My Dashboard 📊
          </a>
        </div>

        {/* Mission Statement */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <p className="text-gray-600 italic">
            "Code for compassion. Design for safety. Build for impact."
          </p>
          <p className="text-sm text-gray-500 mt-4">
            OneMeal is a privacy-first platform that proves technology can serve compassion without compromising user safety.
          </p>
        </div>
      </div>
    </div>
  );
}