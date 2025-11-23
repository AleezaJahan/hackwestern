/**
 * Simple JSON File Storage
 * Hackathon-friendly storage using JSON files (or Workers KV in production)
 * No external database required!
 */

export class SimpleStorage {
  constructor(env) {
    this.env = env;
    // Use Workers KV if available, otherwise in-memory storage
    this.kv = env.DB_KV || null; // Optional: Workers KV namespace
    this.useKV = !!this.kv;
    
    // In-memory storage (resets on restart - fine for hackathon demo)
    this.memoryStore = {
      users: {},
      snooze_history: [],
      excuse_patterns: [],
      embarrassing_stats: {},
      social_media_posts: [],
      escalation_triggers: [],
    };
  }

  /**
   * Get data from storage (KV or memory)
   */
  async _getStore() {
    if (this.useKV && this.kv) {
      const data = await this.kv.get('store', 'json');
      return data || this.memoryStore;
    }
    return this.memoryStore;
  }

  /**
   * Save data to storage (KV or memory)
   */
  async _saveStore(data) {
    if (this.useKV && this.kv) {
      await this.kv.put('store', JSON.stringify(data));
    }
    this.memoryStore = data;
  }

  /**
   * Generate UUID
   */
  _generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or create a user
   */
  async getOrCreateUser(userId, userData = {}) {
    const store = await this._getStore();
    
    if (store.users[userId]) {
      return store.users[userId];
    }

    // Create new user
    const newUser = {
      id: this._generateId(),
      user_id: userId,
      email: userData.email || null,
      phone_number: userData.phone_number || null,
      mom_phone_number: userData.mom_phone_number || null,
      crush_phone_number: userData.crush_phone_number || null,
      twitter_handle: userData.twitter_handle || null,
      settings: userData.settings || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.users[userId] = newUser;
    await this._saveStore(store);
    
    return newUser;
  }

  /**
   * Record a snooze event
   */
  async recordSnooze(userId, snoozeData) {
    const user = await this.getOrCreateUser(userId);
    const store = await this._getStore();

    const snoozeRecord = {
      id: this._generateId(),
      user_id: user.id,
      user_external_id: userId,
      alarm_time: snoozeData.alarm_time || new Date().toISOString(),
      snooze_count: snoozeData.snooze_count || 0,
      excuse: snoozeData.excuse || null,
      transcribed_excuse: snoozeData.transcribed_excuse || null,
      wake_up_time: snoozeData.wake_up_time || new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    store.snooze_history.push(snoozeRecord);

    // Update excuse patterns
    if (snoozeData.excuse) {
      await this.updateExcusePattern(userId, snoozeData.excuse, snoozeData.legitimacy_score, snoozeData.sentiment);
    }

    // Update embarrassing stats
    await this.updateEmbarrassingStats(userId, snoozeData);

    await this._saveStore(store);
    return snoozeRecord;
  }

  /**
   * Update excuse patterns
   */
  async updateExcusePattern(userId, excuseText, legitimacyScore = null, sentiment = null) {
    const user = await this.getOrCreateUser(userId);
    const store = await this._getStore();

    // Find existing pattern
    const existing = store.excuse_patterns.find(
      (p) => p.user_id === user.id && p.excuse_text === excuseText
    );

    if (existing) {
      existing.frequency = (existing.frequency || 1) + 1;
      existing.legitimacy_score = legitimacyScore || existing.legitimacy_score;
      existing.sentiment = sentiment || existing.sentiment;
      existing.last_used_at = new Date().toISOString();
    } else {
      store.excuse_patterns.push({
        id: this._generateId(),
        user_id: user.id,
        excuse_text: excuseText,
        frequency: 1,
        legitimacy_score: legitimacyScore,
        sentiment: sentiment,
        first_used_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      });
    }

    await this._saveStore(store);
    return existing || store.excuse_patterns[store.excuse_patterns.length - 1];
  }

  /**
   * Update embarrassing stats
   */
  async updateEmbarrassingStats(userId, snoozeData) {
    const user = await this.getOrCreateUser(userId);
    const store = await this._getStore();
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `${user.id}-${today}`;

    const existing = store.embarrassing_stats[statsKey];

    const stats = {
      id: existing?.id || this._generateId(),
      user_id: user.id,
      stat_date: today,
      total_snoozes: (existing?.total_snoozes || 0) + 1,
      longest_snooze_session: Math.max(
        existing?.longest_snooze_session || 0,
        snoozeData.snooze_count || 0
      ),
      most_common_excuse: snoozeData.excuse || existing?.most_common_excuse || null,
      excuse_count: snoozeData.excuse
        ? (existing?.excuse_count || 0) + 1
        : (existing?.excuse_count || 0),
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.embarrassing_stats[statsKey] = stats;
    await this._saveStore(store);
    
    return stats;
  }

  /**
   * Get user's embarrassing stats
   */
  async getEmbarrassingStats(userId, date = null) {
    const user = await this.getOrCreateUser(userId);
    const store = await this._getStore();
    const targetDate = date || new Date().toISOString().split('T')[0];
    const statsKey = `${user.id}-${targetDate}`;

    return store.embarrassing_stats[statsKey] || null;
  }

  /**
   * Get snooze history for a user
   */
  async getSnoozeHistory(userId, limit = 10) {
    const user = await this.getOrCreateUser(userId);
    const store = await this._getStore();

    const history = store.snooze_history
      .filter((s) => s.user_id === user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);

    return history;
  }

  /**
   * Record a social media post
   */
  async recordSocialMediaPost(userId, postData) {
    const user = await this.getOrCreateUser(userId);
    const store = await this._getStore();

    const post = {
      id: this._generateId(),
      user_id: user.id,
      snooze_count: postData.snooze_count,
      post_type: postData.post_type,
      post_content: postData.post_content,
      post_url: postData.post_url || null,
      post_id: postData.post_id || null,
      status: postData.status || 'posted',
      posted_at: postData.posted_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    store.social_media_posts.push(post);
    await this._saveStore(store);
    
    return post;
  }

  /**
   * Record an escalation trigger
   */
  async recordEscalationTrigger(userId, triggerData) {
    const user = await this.getOrCreateUser(userId);
    const store = await this._getStore();

    const trigger = {
      id: this._generateId(),
      user_id: user.id,
      snooze_threshold: triggerData.snooze_threshold,
      action_type: triggerData.action_type,
      triggered_at: new Date().toISOString(),
      executed: triggerData.executed || false,
      execution_result: triggerData.execution_result || null,
    };

    store.escalation_triggers.push(trigger);
    await this._saveStore(store);
    
    return trigger;
  }

  /**
   * Get user's top excuses
   */
  async getTopExcuses(userId, limit = 5) {
    const user = await this.getOrCreateUser(userId);
    const store = await this._getStore();

    const excuses = store.excuse_patterns
      .filter((e) => e.user_id === user.id)
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, limit);

    return excuses;
  }

  /**
   * Export all data (for backup/debugging)
   */
  async exportData() {
    return await this._getStore();
  }

  /**
   * Import data (for restoring)
   */
  async importData(data) {
    await this._saveStore(data);
  }
}

