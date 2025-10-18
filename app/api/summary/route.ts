// app/api/summary/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache duration for summary data (5 minutes)
const CACHE_DURATION = 300;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'today';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
      default:
        startDate = new Date(0);
        break;
    }
    
    console.log('Fetching stats from:', startDate);
    
    // Get total feeds count
    const totalFeeds = await prisma.feed.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }).catch(err => {
      console.error('Error counting feeds:', err);
      return 0;
    });
    
    console.log('Total feeds:', totalFeeds);
    
    // Get unique feeders
    const feedGroups = await prisma.feed.groupBy({
      by: ['anonymousId'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    }).catch(err => {
      console.error('Error grouping feeds:', err);
      return [];
    });
    
    const uniqueFeeders = feedGroups.length;
    console.log('Unique feeders:', uniqueFeeders);
    
    // Get region aggregates
    const regionAggregates = await prisma.regionAggregate.findMany({
      orderBy: {
        feedCount: 'desc',
      },
      take: 100,
      select: {
        regionKey: true,
        feedCount: true,
        lastFeedAt: true,
      },
    }).catch(err => {
      console.error('Error fetching regions:', err);
      return [];
    });
    
    console.log('Region aggregates:', regionAggregates.length);
    
    // Get recent daily stats
    const recentDailyStats = await prisma.dailyStats.findMany({
      orderBy: {
        date: 'desc',
      },
      take: 30,
      select: {
        date: true,
        totalFeeds: true,
        uniqueFeeders: true,
      },
    }).catch(err => {
      console.error('Error fetching daily stats:', err);
      return [];
    });
    
    // Calculate today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayFeeds = await prisma.feed.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    }).catch(err => {
      console.error('Error counting today feeds:', err);
      return 0;
    });
    
    const todayGroups = await prisma.feed.groupBy({
      by: ['anonymousId'],
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
      _count: true,
    }).catch(err => {
      console.error('Error grouping today feeds:', err);
      return [];
    });
    
    const todayFeeders = todayGroups.length;
    
    // Parse region data for map
    const heatmapData = regionAggregates.map(region => {
      const [lat, lng] = region.regionKey.split('_').map(Number);
      return {
        lat,
        lng,
        intensity: region.feedCount,
        lastFeed: region.lastFeedAt,
      };
    });
    
    // Prepare response
    const summary = {
      range,
      stats: {
        totalFeeds,
        uniqueFeeders,
        totalImpact: totalFeeds,
        today: {
          feeds: todayFeeds,
          feeders: todayFeeders,
        },
      },
      heatmap: heatmapData,
      trending: recentDailyStats,
      message: generateMotivationalMessage(todayFeeds, totalFeeds),
    };
    
    console.log('Summary generated successfully');
    
    // Set cache headers
    const response = NextResponse.json(summary);
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`);
    
    return response;
    
  } catch (error) {
    console.error('Summary API error:', error);
    
    // Return more detailed error in development
    return NextResponse.json(
      { 
        error: 'Failed to fetch summary',
        message: 'Unable to retrieve statistics at this time.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

function generateMotivationalMessage(todayFeeds: number, totalImpact: number): string {
  if (totalImpact === 0) {
    return "Be the first to make a difference! Feed a stray today. 🌱";
  }
  
  const messages = [
    `Today, ${todayFeeds} animals were fed by kind souls across the world 🌍`,
    `Together, we've saved ${totalImpact.toLocaleString()} animals from hunger 💚`,
    `${todayFeeds} acts of compassion today. Every meal matters. 🙏`,
    `${totalImpact.toLocaleString()} lives touched through simple acts of kindness 🐾`,
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}