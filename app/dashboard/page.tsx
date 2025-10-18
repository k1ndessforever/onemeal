'use client';
import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Calendar, Download, Trash2, Award } from 'lucide-react';

interface FeedRecord {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
}

interface UserStats {
  totalFeeds: number;
  streak: number;
  lastFeedDate: string | null;
  allFeeds: FeedRecord[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<UserStats>({
    totalFeeds: 0,
    streak: 0,
    lastFeedDate: null,
    allFeeds: []
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadLocalStats();
  }, []);

  const loadLocalStats = () => {
    try {
      const stored = localStorage.getItem('onemeal_user_feeds');
      const feeds: FeedRecord[] = stored ? JSON.parse(stored) : [];
      
      // Calculate stats
      const totalFeeds = feeds.length;
      const streak = calculateStreak(feeds);
      const lastFeedDate = feeds.length > 0 ? feeds[0].timestamp.split('T')[0] : null;

      setStats({
        totalFeeds,
        streak,
        lastFeedDate,
        allFeeds: feeds
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const calculateStreak = (feeds: FeedRecord[]): number => {
    if (feeds.length === 0) return 0;

    const dates = feeds
      .map(f => f.timestamp.split('T')[0])
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const date of dates) {
      const feedDate = new Date(date);
      const diffDays = Math.floor((currentDate.getTime() - feedDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = feedDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      stats,
      note: 'This data is stored locally in your browser. OneMeal does not track your personal information.'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onemeal-impact-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    localStorage.removeItem('onemeal_user_feeds');
    localStorage.removeItem('onemeal_user_stats');
    setStats({ totalFeeds: 0, streak: 0, lastFeedDate: null, allFeeds: [] });
    setShowDeleteConfirm(false);
  };

  const getMotivationalMessage = () => {
    if (stats.totalFeeds === 0) return "Start your journey of compassion today! 🌱";
    if (stats.totalFeeds < 5) return "You're making a difference! Keep going! 💚";
    if (stats.totalFeeds < 20) return "Your kindness is creating ripples of change! 🌊";
    if (stats.totalFeeds < 50) return "You're a champion for the voiceless! 🏆";
    return "Your compassion has saved countless lives! You're a hero! ⭐";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Impact Dashboard</h1>
          <p className="text-gray-600">Stored privately in your browser • Never shared</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Feeds */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8" />
              <Award className="w-6 h-6 opacity-50" />
            </div>
            <div className="text-5xl font-bold mb-2">{stats.totalFeeds}</div>
            <div className="text-emerald-100">Animals Fed</div>
          </div>

          {/* Current Streak */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" />
              <span className="text-2xl">🔥</span>
            </div>
            <div className="text-5xl font-bold mb-2">{stats.streak}</div>
            <div className="text-orange-100">Day Streak</div>
          </div>

          {/* Last Feed */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="text-2xl font-bold mb-2">
              {stats.lastFeedDate ? new Date(stats.lastFeedDate).toLocaleDateString() : 'Never'}
            </div>
            <div className="text-blue-100">Last Feed</div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-white rounded-xl p-6 mb-8 border-2 border-emerald-200 shadow-sm">
          <p className="text-center text-lg text-gray-700 font-medium">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          
          {stats.allFeeds.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No feeds recorded yet</p>
              <a 
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Record Your First Feed
              </a>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.allFeeds.slice(0, 50).map((feed) => (
                <div 
                  key={feed.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Fed a stray
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(feed.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {feed.lat.toFixed(3)}, {feed.lng.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
          >
            <Download className="w-5 h-5" />
            Export My Data
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Clear All Data
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Clear All Data?</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete all your locally stored feed records and statistics. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={clearData}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🔒 All data is stored locally in your browser</p>
          <p>OneMeal never stores your personal information on our servers</p>
        </div>
      </div>
    </div>
  );
}