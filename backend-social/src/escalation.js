/**
 * Escalation Logic Service
 * Handles snooze thresholds → action triggers
 * Coordinates escalation levels and social media posting
 */

export class EscalationService {
  constructor(env, db, twitter, twilio) {
    this.env = env;
    this.db = db;
    this.twitter = twitter;
    this.twilio = twilio;
    
    // Escalation thresholds
    this.thresholds = {
      threatSMS: 3,        // Send SMS threat at 3 snoozes
      socialMediaThreat: 5, // Generate social media threat at 5 snoozes
      postToTwitter: 7,     // Actually post to Twitter at 7 snoozes
      nuclear: 10,          // Nuclear option at 10 snoozes
    };
  }

  /**
   * Get roast intensity level based on snooze count
   */
  getRoastIntensity(snoozeCount) {
    if (snoozeCount <= 2) {
      return 'mild';
    } else if (snoozeCount <= 4) {
      return 'moderate';
    } else if (snoozeCount <= 6) {
      return 'aggressive';
    } else {
      return 'nuclear';
    }
  }

  /**
   * Check snooze count against thresholds and trigger appropriate actions
   */
  async checkAndTrigger(userId, snoozeCount, context = {}) {
    const actions = [];
    let actionTaken = false;
    let result = {
      action_taken: false,
      actions: [],
      next_threshold: null,
      snooze_count: snoozeCount,
    };

    try {
      // Get user info
      const user = await this.db.getOrCreateUser(userId);

      // Check SMS threat threshold
      if (snoozeCount >= this.thresholds.threatSMS && user.phone_number) {
        const smsResult = await this.sendThreatSMS(user, snoozeCount, context);
        actions.push({
          type: 'sms_threat',
          threshold: this.thresholds.threatSMS,
          result: smsResult,
        });
        actionTaken = true;

        // Record escalation trigger
        await this.db.recordEscalationTrigger(userId, {
          snooze_threshold: this.thresholds.threatSMS,
          action_type: 'sms_threat',
          executed: smsResult.success,
          execution_result: smsResult,
        });
      }

      // Check social media threat threshold
      if (snoozeCount >= this.thresholds.socialMediaThreat) {
        const threatResult = await this.generateSocialMediaThreat(
          userId,
          snoozeCount,
          new Date().toISOString()
        );
        actions.push({
          type: 'social_media_threat',
          threshold: this.thresholds.socialMediaThreat,
          result: threatResult,
        });
        actionTaken = true;

        // Record escalation trigger
        await this.db.recordEscalationTrigger(userId, {
          snooze_threshold: this.thresholds.socialMediaThreat,
          action_type: 'social_media_threat',
          executed: threatResult.generated,
          execution_result: threatResult,
        });
      }

      // Check Twitter post threshold (actually post)
      if (snoozeCount >= this.thresholds.postToTwitter) {
        const postResult = await this.postToTwitter(user, snoozeCount, context);
        actions.push({
          type: 'twitter_post',
          threshold: this.thresholds.postToTwitter,
          result: postResult,
        });
        actionTaken = true;

        // Record escalation trigger
        await this.db.recordEscalationTrigger(userId, {
          snooze_threshold: this.thresholds.postToTwitter,
          action_type: 'twitter_post',
          executed: postResult.success,
          execution_result: postResult,
        });

        // Send nuclear SMS after posting
        if (user.phone_number && postResult.success) {
          await this.twilio.sendNuclearSMS(
            user.phone_number,
            snoozeCount,
            postResult.url,
            user.email || null
          );
        }
      }

      // Check nuclear threshold (post embarrassing stats)
      if (snoozeCount >= this.thresholds.nuclear) {
        const statsResult = await this.nuclearOption(user, snoozeCount);
        actions.push({
          type: 'nuclear',
          threshold: this.thresholds.nuclear,
          result: statsResult,
        });
        actionTaken = true;

        // Record escalation trigger
        await this.db.recordEscalationTrigger(userId, {
          snooze_threshold: this.thresholds.nuclear,
          action_type: 'nuclear',
          executed: statsResult.success,
          execution_result: statsResult,
        });
      }

      // Determine next threshold
      const nextThreshold = this.getNextThreshold(snoozeCount);

      result = {
        action_taken: actionTaken,
        actions: actions,
        next_threshold: nextThreshold,
        snooze_count: snoozeCount,
        roast_intensity: this.getRoastIntensity(snoozeCount),
      };

      return result;
    } catch (error) {
      console.error('Error in checkAndTrigger:', error);
      result.error = error.message;
      return result;
    }
  }

  /**
   * Generate social media threat message (but don't post yet)
   */
  async generateSocialMediaThreat(userId, snoozeCount, wakeUpTime) {
    try {
      const user = await this.db.getOrCreateUser(userId);
      const stats = await this.db.getEmbarrassingStats(userId);
      
      // Format wake-up time
      const wakeUpFormatted = wakeUpTime 
        ? new Date(wakeUpTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Generate threat message
      const message = this.twitter.generateThreatMessage(
        snoozeCount,
        wakeUpFormatted,
        user.twitter_handle || null
      );

      return {
        generated: true,
        message: message,
        snooze_count: snoozeCount,
        wake_up_time: wakeUpFormatted,
        user_handle: user.twitter_handle || null,
      };
    } catch (error) {
      console.error('Error generating social media threat:', error);
      return {
        generated: false,
        error: error.message,
      };
    }
  }

  /**
   * Actually post to Twitter
   */
  async postToTwitter(user, snoozeCount, context = {}) {
    try {
      const stats = await this.db.getEmbarrassingStats(user.user_id);
      const wakeUpTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Generate post message
      const message = this.twitter.generateThreatMessage(
        snoozeCount,
        wakeUpTime,
        user.twitter_handle || null
      );

      // Post to Twitter
      const postResult = await this.twitter.postTweet(message, user.user_id);

      if (postResult.success) {
        // Record in database
        await this.db.recordSocialMediaPost(user.user_id, {
          snooze_count: snoozeCount,
          post_type: 'twitter',
          post_content: message,
          post_url: postResult.url || null,
          post_id: postResult.tweet_id || null,
          status: 'posted',
          posted_at: new Date().toISOString(),
        });
      }

      return postResult;
    } catch (error) {
      console.error('Error posting to Twitter:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send threat SMS
   */
  async sendThreatSMS(user, snoozeCount, context = {}) {
    try {
      if (!user.phone_number) {
        return {
          success: false,
          error: 'User has no phone number configured',
        };
      }

      const wakeUpTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const message = this.twilio.generateThreatMessage(
        snoozeCount,
        wakeUpTime,
        user.email || null
      );

      const smsResult = await this.twilio.sendSMS(user.phone_number, message);

      return smsResult;
    } catch (error) {
      console.error('Error sending threat SMS:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Nuclear option: Post embarrassing stats to Twitter
   */
  async nuclearOption(user, snoozeCount) {
    try {
      const stats = await this.db.getEmbarrassingStats(user.user_id);

      if (!stats) {
        // Generate basic stats message
        const message = this.twitter.generateThreatMessage(
          snoozeCount,
          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          user.twitter_handle || null
        );
        
        const postResult = await this.twitter.postTweet(message, user.user_id);
        return postResult;
      }

      // Post embarrassing stats
      const postResult = await this.twitter.postEmbarrassingStats(
        stats,
        user.twitter_handle || null
      );

      if (postResult.success) {
        // Record in database
        await this.db.recordSocialMediaPost(user.user_id, {
          snooze_count: snoozeCount,
          post_type: 'twitter',
          post_content: `Embarrassing stats posted (nuclear option)`,
          post_url: postResult.url || null,
          post_id: postResult.tweet_id || null,
          status: 'posted',
          posted_at: new Date().toISOString(),
        });
      }

      return postResult;
    } catch (error) {
      console.error('Error in nuclear option:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Force escalation (manual trigger)
   */
  async forceEscalation(userId, snoozeCount, actionType = 'auto') {
    const user = await this.db.getOrCreateUser(userId);
    const context = {};

    switch (actionType) {
      case 'sms':
        return await this.sendThreatSMS(user, snoozeCount, context);
      
      case 'twitter_threat':
        return await this.generateSocialMediaThreat(userId, snoozeCount, new Date().toISOString());
      
      case 'twitter_post':
        return await this.postToTwitter(user, snoozeCount, context);
      
      case 'nuclear':
        return await this.nuclearOption(user, snoozeCount);
      
      case 'auto':
      default:
        return await this.checkAndTrigger(userId, snoozeCount, context);
    }
  }

  /**
   * Get next threshold
   */
  getNextThreshold(currentSnoozeCount) {
    const thresholds = Object.values(this.thresholds).sort((a, b) => a - b);
    
    for (const threshold of thresholds) {
      if (currentSnoozeCount < threshold) {
        return {
          threshold: threshold,
          snoozes_until: threshold - currentSnoozeCount,
        };
      }
    }

    return {
      threshold: null,
      snoozes_until: 0,
      message: 'All thresholds exceeded. Nuclear option engaged.',
    };
  }

  /**
   * Update thresholds (if needed)
   */
  updateThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
}

