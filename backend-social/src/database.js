/**
 * Database service using Supabase
 * Handles snooze history, excuse patterns, and embarrassing stats
 */

import { createClient } from '@supabase/supabase-js';

export class DatabaseService {
  constructor(env) {
    this.supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY
    );
  }

  /**
   * Get or create a user
   */
  async getOrCreateUser(userId, userData = {}) {
    const { data: existingUser, error: fetchError } = await this.supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const { data: newUser, error: createError } = await this.supabase
      .from('users')
      .insert({
        user_id: userId,
        email: userData.email || null,
        phone_number: userData.phone_number || null,
        twitter_handle: userData.twitter_handle || null,
        settings: userData.settings || {}
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    return newUser;
  }

  /**
   * Record a snooze event
   */
  async recordSnooze(userId, snoozeData) {
    const user = await this.getOrCreateUser(userId);

    const { data, error } = await this.supabase
      .from('snooze_history')
      .insert({
        user_id: user.id,
        user_external_id: userId,
        alarm_time: snoozeData.alarm_time || new Date().toISOString(),
        snooze_count: snoozeData.snooze_count || 0,
        excuse: snoozeData.excuse || null,
        transcribed_excuse: snoozeData.transcribed_excuse || null,
        wake_up_time: snoozeData.wake_up_time || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record snooze: ${error.message}`);
    }

    // Update excuse patterns
    if (snoozeData.excuse) {
      await this.updateExcusePattern(userId, snoozeData.excuse, snoozeData.legitimacy_score, snoozeData.sentiment);
    }

    // Update embarrassing stats
    await this.updateEmbarrassingStats(userId, snoozeData);

    return data;
  }

  /**
   * Update excuse patterns
   */
  async updateExcusePattern(userId, excuseText, legitimacyScore = null, sentiment = null) {
    const user = await this.getOrCreateUser(userId);

    // Check if excuse pattern exists
    const { data: existing } = await this.supabase
      .from('excuse_patterns')
      .select('*')
      .eq('user_id', user.id)
      .eq('excuse_text', excuseText)
      .single();

    if (existing) {
      // Update frequency and last used
      const { data, error } = await this.supabase
        .from('excuse_patterns')
        .update({
          frequency: existing.frequency + 1,
          legitimacy_score: legitimacyScore || existing.legitimacy_score,
          sentiment: sentiment || existing.sentiment,
          last_used_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new pattern
      const { data, error } = await this.supabase
        .from('excuse_patterns')
        .insert({
          user_id: user.id,
          excuse_text: excuseText,
          frequency: 1,
          legitimacy_score: legitimacyScore,
          sentiment: sentiment
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Update embarrassing stats
   */
  async updateEmbarrassingStats(userId, snoozeData) {
    const user = await this.getOrCreateUser(userId);
    const today = new Date().toISOString().split('T')[0];

    // Get existing stats for today
    const { data: existing } = await this.supabase
      .from('embarrassing_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('stat_date', today)
      .single();

    const stats = {
      user_id: user.id,
      stat_date: today,
      total_snoozes: (existing?.total_snoozes || 0) + 1,
      longest_snooze_session: Math.max(existing?.longest_snooze_session || 0, snoozeData.snooze_count || 0),
      most_common_excuse: snoozeData.excuse || existing?.most_common_excuse || null,
      excuse_count: snoozeData.excuse ? (existing?.excuse_count || 0) + 1 : (existing?.excuse_count || 0)
    };

    if (existing) {
      // Update existing stats
      const { data, error } = await this.supabase
        .from('embarrassing_stats')
        .update(stats)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new stats
      const { data, error } = await this.supabase
        .from('embarrassing_stats')
        .insert(stats)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Get user's embarrassing stats
   */
  async getEmbarrassingStats(userId, date = null) {
    const user = await this.getOrCreateUser(userId);
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('embarrassing_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('stat_date', targetDate)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    return data || null;
  }

  /**
   * Get snooze history for a user
   */
  async getSnoozeHistory(userId, limit = 10) {
    const user = await this.getOrCreateUser(userId);

    const { data, error } = await this.supabase
      .from('snooze_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Record a social media post
   */
  async recordSocialMediaPost(userId, postData) {
    const user = await this.getOrCreateUser(userId);

    const { data, error } = await this.supabase
      .from('social_media_posts')
      .insert({
        user_id: user.id,
        snooze_count: postData.snooze_count,
        post_type: postData.post_type,
        post_content: postData.post_content,
        post_url: postData.post_url || null,
        post_id: postData.post_id || null,
        status: postData.status || 'posted',
        posted_at: postData.posted_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Record an escalation trigger
   */
  async recordEscalationTrigger(userId, triggerData) {
    const user = await this.getOrCreateUser(userId);

    const { data, error } = await this.supabase
      .from('escalation_triggers')
      .insert({
        user_id: user.id,
        snooze_threshold: triggerData.snooze_threshold,
        action_type: triggerData.action_type,
        executed: triggerData.executed || false,
        execution_result: triggerData.execution_result || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user's most common excuses
   */
  async getTopExcuses(userId, limit = 5) {
    const user = await this.getOrCreateUser(userId);

    const { data, error } = await this.supabase
      .from('excuse_patterns')
      .select('*')
      .eq('user_id', user.id)
      .order('frequency', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

