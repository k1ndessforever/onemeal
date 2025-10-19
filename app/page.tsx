'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, TrendingUp, Users, Calendar, Globe, ArrowLeft } from 'lucide-react';

export default function MapPage() {
  const [FeedMap, setFeedMap] = useState<React.ComponentType | null>(null);
  const [stats, setStats] = useState({
    totalFeeds: 0,
    uniqueFeeders: 0,
    todayFeeds: 0,
    weekFeeds: 0
  });
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    // Dynamically import the map component
    import('@/components/FeedMap').then((mod) => {
      setFeedMap(() => mod.default);
    });

    // Fetch stats
    fetchStats(timeRange);
  }, [timeRange]);

  const fetchStats = async (range: string) => {
    try {
      const response = await fetch(`/api/summary?range=${range}`);
      const data = await response.json();
      
      setStats({
        totalFeeds: data.stats?.totalFeeds || 0,
        uniqueFeeders: data.stats?.uniqueFeeders || 0,
        todayFeeds: data.stats?.today?.feeds || 0,
        weekFeeds: range === 'week' ? (data.stats?.totalFeeds || 0) : 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-emerald-600" />
                <h1 className="text-2xl font-bold text-gray-900">Global Compassion Map</h1>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              {(['today', 'week', 'month', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalFeeds}
                </div>
                <div className="text-xs text-gray-500">Total Feeds</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.uniqueFeeders}
                </div>
                <div className="text-xs text-gray-500">Feeders</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.todayFeeds}
                </div>
                <div className="text-xs text-gray-500">Today</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {timeRange === 'week' ? stats.weekFeeds : stats.totalFeeds}
                </div>
                <div className="text-xs text-gray-500">This {timeRange}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-lg font-semibold">Real-Time Feeding Activity</h2>
                <p className="text-sm opacity-90">Every marker represents acts of compassion</p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                  <span>Low Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-300"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-300"></div>
                  <span>High Activity</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ height: '600px' }} className="relative">
            {FeedMap ? (
              <FeedMap />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading compassion map...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg flex-shrink-0">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Privacy Protected</h3>
                <p className="text-sm text-gray-600">
                  All locations are rounded to ~111m precision to protect user privacy while showing impact.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
                <p className="text-sm text-gray-600">
                  Map updates automatically as people feed strays around the world. Join the movement!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Growing Impact</h3>
                <p className="text-sm text-gray-600">
                  {stats.totalFeeds > 0 
                    ? `${stats.totalFeeds.toLocaleString()} animals fed by ${stats.uniqueFeeders} kind souls!`
                    : 'Be the first to make a difference!'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl p-8 text-center text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-3">Ready to Make a Difference?</h3>
          <p className="text-lg mb-6 opacity-90">
            Every feed matters. Record your compassion and inspire others.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            <MapPin className="w-5 h-5" />
            Feed a Stray Today
          </Link>
        </div>
      </div>
    </div>
  );
}
