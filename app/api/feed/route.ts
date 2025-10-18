import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const FeedSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  anonymousId: z.string().uuid(),
});

function roundCoordinate(coord: number, precision: number = 3): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(coord * multiplier) / multiplier;
}

function getRegionKey(lat: number, lng: number, precision: number = 2): string {
  const roundedLat = roundCoordinate(lat, precision);
  const roundedLng = roundCoordinate(lng, precision);
  return `${roundedLat}_${roundedLng}`;
}

async function checkRateLimit(identifier: string): Promise<boolean> {
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10');
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '86400000');
  
  const windowStart = new Date(Date.now() - windowMs);
  
  const recentCount = await prisma.feed.count({
    where: {
      anonymousId: identifier,
      createdAt: {
        gte: windowStart,
      },
    },
  });
  
  return recentCount < maxRequests;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = FeedSchema.parse(body);
    
    const canSubmit = await checkRateLimit(validatedData.anonymousId);
    if (!canSubmit) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'You can submit up to 10 feeds per day. Thank you for your compassion! 🙏'
        },
        { status: 429 }
      );
    }
    
    const precision = parseInt(process.env.COORDINATE_PRECISION || '3');
    const roundedLat = roundCoordinate(validatedData.lat, precision);
    const roundedLng = roundCoordinate(validatedData.lng, precision);
    
    const regionPrecision = parseInt(process.env.REGION_PRECISION || '2');
    const regionKey = getRegionKey(validatedData.lat, validatedData.lng, regionPrecision);
    
    const result = await prisma.$transaction(async (tx) => {
      const feed = await tx.feed.create({
        data: {
          lat: roundedLat,
          lng: roundedLng,
          anonymousId: validatedData.anonymousId,
        },
      });
      
      const regionAggregate = await tx.regionAggregate.upsert({
        where: { regionKey },
        update: {
          feedCount: { increment: 1 },
        },
        create: {
          regionKey,
          feedCount: 1,
        },
      });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dailyStats = await tx.dailyStats.upsert({
        where: { date: today },
        update: {
          totalFeeds: { increment: 1 },
        },
        create: {
          date: today,
          totalFeeds: 1,
          uniqueFeeders: 1,
        },
      });
      
      return { feed, regionAggregate, dailyStats };
    });
    
    return NextResponse.json({
      success: true,
      message: 'Feed recorded! Thank you for making a difference. 💚',
      data: {
        feedId: result.feed.id,
        todayTotal: result.dailyStats.totalFeeds,
        timestamp: result.feed.createdAt,
      },
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid data',
          details: error.issues, // Changed from error.errors to error.issues
        },
        { status: 400 }
      );
    }
    
    console.error('Feed submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'OneMeal Feed API',
    endpoint: 'POST /api/feed',
    requiredFields: ['lat', 'lng', 'anonymousId'],
  });
}