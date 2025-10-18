// lib/utils/client.ts

/**
 * Client-side utilities for OneMeal
 * Handles anonymous ID generation and local dashboard storage
 */

export interface FeedRecord {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
  locationName?: string;
}

export interface UserStats {
  totalFeeds: number;
  streak: number;
  lastFeedDate: string | null;
  allFeeds: FeedRecord[];
}

// LocalStorage keys
const STORAGE_KEYS = {
  ANONYMOUS_ID: 'onemeal_anonymous_id',
  USER_FEEDS: 'onemeal_user_feeds',
  USER_STATS: 'onemeal_user_stats',
} as const;

/**
 * Get or create anonymous user ID
 * Stored in browser localStorage only
 */
export function getAnonymousId(): string {
  if (typeof window === 'undefined') return '';
  
  let anonymousId = localStorage.getItem(STORAGE_KEYS.ANONYMOUS_ID);
  
  if (!anonymousId) {
    anonymousId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.ANONYMOUS_ID, anonymousId);
  }
  
  return anonymousId;
}

/**
 * Save a feed record locally (for personal dashboard)
 */
export function saveFeedLocally(feed: Omit<FeedRecord, 'id'>): void {
  if (typeof window === 'undefined') return;
  
  const feeds = getLocalFeeds();
  const newFeed: FeedRecord = {
    id: crypto.randomUUID(),
    ...feed,
  };
  
  feeds.unshift(newFeed); // Add to beginning
  localStorage.setItem(STORAGE_KEYS.USER_FEEDS, JSON.stringify(feeds));
  
  // Update stats
  updateLocalStats(newFeed);
}

/**
 * Get all locally stored feeds
 */
export function getLocalFeeds(): FeedRecord[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_FEEDS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading local feeds:', error);
    return [];
  }
}

/**
 * Update local statistics
 */
function updateLocalStats(newFeed: FeedRecord): void {
  const stats = getLocalStats();
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate streak
  let streak = stats.streak;
  if (stats.lastFeedDate) {
    const lastDate = new Date(stats.lastFeedDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day, keep streak
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      streak += 1;
    } else {
      // Streak broken, reset to 1
      streak = 1;
    }
  } else {
    // First feed ever
    streak = 1;
  }
  
  const updatedStats: UserStats = {
    totalFeeds: stats.totalFeeds + 1,
    streak,
    lastFeedDate: today,
    allFeeds: [newFeed, ...stats.allFeeds],
  };
  
  localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updatedStats));
}

/**
 * Get local user statistics
 */
export function getLocalStats(): UserStats {
  if (typeof window === 'undefined') {
    return {
      totalFeeds: 0,
      streak: 0,
      lastFeedDate: null,
      allFeeds: [],
    };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading local stats:', error);
  }
  
  // Default stats
  return {
    totalFeeds: 0,
    streak: 0,
    lastFeedDate: null,
    allFeeds: [],
  };
}

/**
 * Clear all local data (for privacy/reset)
 */
export function clearLocalData(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Export user data as JSON (for download)
 */
export function exportUserData(): string {
  const stats = getLocalStats();
  const anonymousId = getAnonymousId();
  
  const exportData = {
    exportDate: new Date().toISOString(),
    anonymousId,
    stats,
    note: 'This data is stored locally in your browser only. OneMeal does not store personal information on servers.',
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Get user's current location (with privacy rounding)
 */
export function getCurrentLocation(precision: number = 3): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const multiplier = Math.pow(10, precision);
        const lat = Math.round(position.coords.latitude * multiplier) / multiplier;
        const lng = Math.round(position.coords.longitude * multiplier) / multiplier;
        resolve({ lat, lng });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false, // We don't need high accuracy for privacy
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}