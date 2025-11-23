/**
 * Cloudflare Worker - Backend & Social Media Chaos
 * Person 4: Backend & Social Media Integration
 * 
 * Handles:
 * - Snooze event processing from Person 1
 * - Database operations (snooze history, excuse patterns, stats)
 * - Twitter/X API integration for posting threats
 * - Escalation logic (snooze thresholds → action triggers)
 * - Authentication & user data management
 * - SMS threats via Twilio (optional)
 * - Coordination with Person 2 on roast intensity
 */

// import { DatabaseService } from './database.js';  // Supabase - commented out for hackathon
import { SimpleStorage } from './storage.js';  // Simple JSON storage for hackathon
import { TwitterService } from './twitter.js';
import { TwilioService } from './twilio.js';
import { EscalationService } from './escalation.js';
import { IntegrationService } from './integration.js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Initialize services
      // Using SimpleStorage instead of Supabase for hackathon (no external DB required!)
      const db = new SimpleStorage(env);
      const twitter = new TwitterService(env);
      const twilio = new TwilioService(env);
      const escalation = new EscalationService(env, db, twitter, twilio);
      const integration = new IntegrationService(env);

      // Route handling
      if (path === '/' || path === '/health') {
        return handleHealth(request);
      }

      if (path === '/snooze/event' && request.method === 'POST') {
        return handleSnoozeEvent(request, db, escalation, integration);
      }

      if (path === '/snooze/count' && request.method === 'POST') {
        return handleSnoozeCount(request, db, escalation, integration);
      }

      if (path === '/escalate' && request.method === 'POST') {
        return handleEscalation(request, escalation, db);
      }

      if (path === '/social/twitter/post' && request.method === 'POST') {
        return handleTwitterPost(request, twitter, db);
      }

      if (path === '/social/sms/threat' && request.method === 'POST') {
        return handleSMSThreat(request, twilio, db);
      }

      if (path === '/user/stats' && request.method === 'GET') {
        return handleGetUserStats(request, db, url);
      }

      if (path === '/user/excuses' && request.method === 'GET') {
        return handleGetUserExcuses(request, db, url);
      }

      if (path === '/user/history' && request.method === 'GET') {
        return handleGetSnoozeHistory(request, db, url);
      }

      // Export data (for debugging/backup)
      if (path === '/debug/export' && request.method === 'GET') {
        return handleExportData(db);
      }

      // Unknown route
      return jsonResponse(
        { error: 'Not found' },
        404
      );
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse(
        { error: error.message, stack: error.stack },
        500
      );
    }
  },
};

/**
 * Health check endpoint
 */
async function handleHealth(request) {
  return jsonResponse({
    status: 'ok',
    service: 'Backend & Social Media Chaos',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle snooze event from Person 1
 * Expected payload:
 * {
 *   user_id: string,
 *   snooze_count: number,
 *   excuse: string (optional),
 *   transcribed_excuse: string (optional),
 *   alarm_time: string (ISO timestamp),
 *   wake_up_time: string (ISO timestamp),
 *   sentiment: object (optional),
 *   legitimacy_score: number (optional)
 * }
 */
async function handleSnoozeEvent(request, db, escalation, integration) {
  const body = await request.json();

  if (!body.user_id || typeof body.snooze_count !== 'number') {
    return jsonResponse(
      { error: 'Missing required fields: user_id, snooze_count' },
      400
    );
  }

  try {
    // Get or create user with crush_phone_number
    const user = await db.getOrCreateUser(body.user_id, {
      email: body.email || null,
      phone_number: body.phone_number || null,
      mom_phone_number: body.mom_phone_number || null,
      crush_phone_number: body.crush_phone_number || null,
      twitter_handle: body.twitter_handle || null,
    });

    // Record snooze in database
    const snoozeRecord = await db.recordSnooze(body.user_id, {
      alarm_time: body.alarm_time || new Date().toISOString(),
      snooze_count: body.snooze_count,
      excuse: body.excuse || null,
      transcribed_excuse: body.transcribed_excuse || null,
      wake_up_time: body.wake_up_time || new Date().toISOString(),
      legitimacy_score: body.legitimacy_score || null,
      sentiment: body.sentiment || null,
    });

    // Prepare context with image data if provided (for snooze 5)
    const context = {
      excuse: body.excuse,
      snoozeRecord,
    };

    // If image data is provided (base64), convert it to a format Twitter can use
    if (body.image_data && body.image_type) {
      // Convert base64 to Blob for Twitter API
      const binaryString = atob(body.image_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: body.image_type });
      context.imageData = blob;
    }

    // Log for debugging
    console.log(`🔔 Snooze event received:`, {
      user_id: body.user_id,
      snooze_count: body.snooze_count,
      crush_phone_number: body.crush_phone_number || 'NOT PROVIDED',
      user_crush_phone: user.crush_phone_number || 'NOT SET IN DB'
    });

    // Check escalation thresholds and trigger actions
    const escalationResult = await escalation.checkAndTrigger(
      body.user_id,
      body.snooze_count,
      context
    );
    
    console.log(`🔔 Escalation result:`, JSON.stringify(escalationResult, null, 2));

    // Get user's embarrassing stats
    const stats = await db.getEmbarrassingStats(body.user_id);

    // Coordinate with Person 2 on roast intensity (if needed)
    if (body.snooze_count >= 3) {
      await integration.notifyPerson2({
        user_id: body.user_id,
        snooze_count: body.snooze_count,
        current_roast_intensity: escalation.getRoastIntensity(body.snooze_count),
      });
    }

    return jsonResponse({
      success: true,
      snooze_record: snoozeRecord,
      escalation: escalationResult,
      stats: stats,
      message: `Snooze event recorded. Escalation: ${escalationResult.action_taken ? 'YES' : 'NO'}`,
    });
  } catch (error) {
    console.error('Error handling snooze event:', error);
    return jsonResponse(
      { error: error.message },
      500
    );
  }
}

/**
 * Handle snooze count notification (from Person 2 or Person 1)
 * This is used when Person 2 needs to escalate roast intensity
 */
async function handleSnoozeCount(request, db, escalation, integration) {
  const body = await request.json();

  if (!body.user_id || typeof body.snooze_count !== 'number') {
    return jsonResponse(
      { error: 'Missing required fields: user_id, snooze_count' },
      400
    );
  }

  try {
    // Get user info
    const user = await db.getOrCreateUser(body.user_id, {
      email: body.email || null,
      phone_number: body.phone_number || null,
      mom_phone_number: body.mom_phone_number || null,
      twitter_handle: body.twitter_handle || null,
    });

    // Check if we need to trigger social media threat
    const shouldThreaten = body.snooze_count >= 5;

    if (shouldThreaten) {
      // Trigger social media threat (but don't post yet)
      const threatResult = await escalation.generateSocialMediaThreat(
        body.user_id,
        body.snooze_count,
        body.wake_up_time || new Date().toISOString()
      );

      return jsonResponse({
        success: true,
        should_threaten: true,
        threat_generated: true,
        threat_message: threatResult.message,
        snooze_count: body.snooze_count,
        user: user,
      });
    }

    return jsonResponse({
      success: true,
      should_threaten: false,
      snooze_count: body.snooze_count,
      threshold: 5,
    });
  } catch (error) {
    console.error('Error handling snooze count:', error);
    return jsonResponse(
      { error: error.message },
      500
    );
  }
}

/**
 * Handle explicit escalation request
 * This can be called manually or by Person 2 to force escalation
 */
async function handleEscalation(request, escalation, db) {
  const body = await request.json();

  if (!body.user_id || typeof body.snooze_count !== 'number') {
    return jsonResponse(
      { error: 'Missing required fields: user_id, snooze_count' },
      400
    );
  }

  try {
    const result = await escalation.forceEscalation(
      body.user_id,
      body.snooze_count,
      body.action_type || 'auto'
    );

    return jsonResponse({
      success: true,
      escalation: result,
    });
  } catch (error) {
    console.error('Error handling escalation:', error);
    return jsonResponse(
      { error: error.message },
      500
    );
  }
}

/**
 * Handle Twitter post request
 * This executes the actual Twitter post
 */
async function handleTwitterPost(request, twitter, db) {
  const body = await request.json();

  if (!body.user_id || !body.message) {
    return jsonResponse(
      { error: 'Missing required fields: user_id, message' },
      400
    );
  }

  try {
    // Get user's Twitter handle
    const user = await db.getOrCreateUser(body.user_id);
    
    if (!user.twitter_handle && !body.force) {
      return jsonResponse(
        { error: 'User has no Twitter handle configured. Set force=true to post anyway.' },
        400
      );
    }

    // Post to Twitter
    const postResult = await twitter.postTweet(
      body.message,
      body.user_id
    );

    // Record the post in database
    if (postResult.success) {
      await db.recordSocialMediaPost(body.user_id, {
        snooze_count: body.snooze_count || 0,
        post_type: 'twitter',
        post_content: body.message,
        post_url: postResult.url || null,
        post_id: postResult.tweet_id || null,
        status: 'posted',
        posted_at: new Date().toISOString(),
      });
    }

    return jsonResponse({
      success: postResult.success,
      tweet_id: postResult.tweet_id,
      url: postResult.url,
      message: postResult.message || 'Tweet posted successfully',
    });
  } catch (error) {
    console.error('Error posting to Twitter:', error);
    return jsonResponse(
      { error: error.message },
      500
    );
  }
}

/**
 * Handle SMS threat request
 */
async function handleSMSThreat(request, twilio, db) {
  const body = await request.json();

  if (!body.user_id || !body.message) {
    return jsonResponse(
      { error: 'Missing required fields: user_id, message' },
      400
    );
  }

  try {
    // Get user's phone number
    const user = await db.getOrCreateUser(body.user_id);
    
    if (!user.phone_number) {
      return jsonResponse(
        { error: 'User has no phone number configured' },
        400
      );
    }

    // Send SMS via Twilio
    const smsResult = await twilio.sendSMS(
      user.phone_number,
      body.message
    );

    // Record the SMS in database
    if (smsResult.success) {
      await db.recordSocialMediaPost(body.user_id, {
        snooze_count: body.snooze_count || 0,
        post_type: 'sms',
        post_content: body.message,
        post_url: null,
        post_id: smsResult.message_sid || null,
        status: 'posted',
        posted_at: new Date().toISOString(),
      });
    }

    return jsonResponse({
      success: smsResult.success,
      message_sid: smsResult.message_sid,
      message: smsResult.message || 'SMS sent successfully',
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return jsonResponse(
      { error: error.message },
      500
    );
  }
}

/**
 * Get user's embarrassing stats
 */
async function handleGetUserStats(request, db, url) {
  const userId = url.searchParams.get('user_id');
  const date = url.searchParams.get('date');

  if (!userId) {
    return jsonResponse(
      { error: 'Missing required parameter: user_id' },
      400
    );
  }

  try {
    const stats = await db.getEmbarrassingStats(userId, date || null);
    return jsonResponse({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    return jsonResponse(
      { error: error.message },
      500
    );
  }
}

/**
 * Get user's top excuses
 */
async function handleGetUserExcuses(request, db, url) {
  const userId = url.searchParams.get('user_id');
  const limit = parseInt(url.searchParams.get('limit') || '5');

  if (!userId) {
    return jsonResponse(
      { error: 'Missing required parameter: user_id' },
      400
    );
  }

  try {
    const excuses = await db.getTopExcuses(userId, limit);
    return jsonResponse({
      success: true,
      excuses: excuses,
    });
  } catch (error) {
    console.error('Error getting user excuses:', error);
    return jsonResponse(
      { error: error.message },
      500
    );
  }
}

/**
 * Get user's snooze history
 */
async function handleGetSnoozeHistory(request, db, url) {
  const userId = url.searchParams.get('user_id');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  if (!userId) {
    return jsonResponse(
      { error: 'Missing required parameter: user_id' },
      400
    );
  }

  try {
    const history = await db.getSnoozeHistory(userId, limit);
    return jsonResponse({
      success: true,
      history: history,
    });
  } catch (error) {
    console.error('Error getting snooze history:', error);
    return jsonResponse(
      { error: error.message },
      500
    );
  }
}

/**
 * Export all data (for debugging/backup)
 */
async function handleExportData(db) {
  try {
    const data = await db.exportData();
    return jsonResponse({
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return jsonResponse(
      { error: error.message },
      500
    );
  }
}

/**
 * Helper function to return JSON response
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

