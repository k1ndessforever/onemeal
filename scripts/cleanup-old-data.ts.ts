// scripts/cleanup-old-data.ts
// Run this as a cron job to delete old feed data (keeping aggregates)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOldData() {
  try {
    console.log('🧹 Starting data cleanup...');
    
    // Get retention period from env (default 90 days)
    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '90');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    console.log(`📅 Deleting feed records older than ${cutoffDate.toISOString()}`);
    
    // Delete old feed records (aggregates are kept permanently)
    const deletedFeeds = await prisma.feed.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    console.log(`✅ Deleted ${deletedFeeds.count} old feed records`);
    
    // Clean up old rate limit records (older than 7 days)
    const rateLimitCutoff = new Date();
    rateLimitCutoff.setDate(rateLimitCutoff.getDate() - 7);
    
    const deletedRateLimits = await prisma.rateLimit.deleteMany({
      where: {
        windowStart: {
          lt: rateLimitCutoff,
        },
      },
    });
    
    console.log(`✅ Deleted ${deletedRateLimits.count} old rate limit records`);
    
    // Update region aggregates to remove stale entries (no activity in 180 days)
    const staleRegionCutoff = new Date();
    staleRegionCutoff.setDate(staleRegionCutoff.getDate() - 180);
    
    const deletedRegions = await prisma.regionAggregate.deleteMany({
      where: {
        lastFeedAt: {
          lt: staleRegionCutoff,
        },
        feedCount: {
          lt: 5, // Only remove regions with minimal activity
        },
      },
    });
    
    console.log(`✅ Deleted ${deletedRegions.count} stale region aggregates`);
    
    console.log('🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup
cleanupOldData();