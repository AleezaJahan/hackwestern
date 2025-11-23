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
    
    // Escalation thresholds - Updated per requirements
    this.thresholds = {
      insults: 2,          // Snoozes 1-2: insults (handled by Person 2 backend)
      textMom: 3,          // Snooze 3: Send text to mom
      postToTwitter: 5,   // Snooze 5: Post embarrassing stats on Twitter with image
      nuclear: 10,         // Nuclear option at 10 snoozes (if needed)
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

      // Check text crush threshold (snooze 3)
      if (snoozeCount >= this.thresholds.textMom) {
        if (!user.crush_phone_number) {
          console.warn(`⚠️ Snooze ${snoozeCount} reached text crush threshold, but crush_phone_number not set for user ${userId}`);
          actions.push({
            type: 'text_crush',
            threshold: this.thresholds.textMom,
            result: {
              success: false,
              error: 'Crush\'s phone number not configured',
              message: 'Cannot send text to crush - phone number not set in settings'
            },
          });
        } else {
          console.log(`💕 Sending text to crush at snooze ${snoozeCount} for user ${userId}`);
          const crushSMSResult = await this.sendTextToCrush(user, snoozeCount, context);
          console.log(`💕 Text to crush result:`, crushSMSResult);
          actions.push({
            type: 'text_crush',
            threshold: this.thresholds.textMom,
            result: crushSMSResult,
          });
          actionTaken = true;

          // Record escalation trigger
          await this.db.recordEscalationTrigger(userId, {
            snooze_threshold: this.thresholds.textMom,
            action_type: 'text_crush',
            executed: crushSMSResult.success,
            execution_result: crushSMSResult,
          });
        }
      }

      // Check Twitter post threshold (snooze 5) - Post embarrassing stats with image
      if (snoozeCount >= this.thresholds.postToTwitter) {
        const postResult = await this.postToTwitterWithImage(user, snoozeCount, context);
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
   * Post to Twitter with image at snooze 5
   */
  async postToTwitterWithImage(user, snoozeCount, context = {}) {
    try {
      const stats = await this.db.getEmbarrassingStats(user.user_id);
      const wakeUpTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Generate embarrassing stats message
      let message;
      if (stats) {
        message = `📊 SNOOZE STATS OF THE DAY 📊\n\n${user.twitter_handle ? `@${user.twitter_handle} ` : ''}Today's wake-up performance:\n• Total snoozes: ${stats.total_snoozes}\n• Longest snooze session: ${stats.longest_snooze_session}\n• Most common excuse: "${stats.most_common_excuse || 'None recorded'}"\n\nImpressive. Very impressive. 🏆\n\n#SnoozeStats #SleepGoals #NotReally`;
      } else {
        message = this.twitter.generateThreatMessage(
          snoozeCount,
          wakeUpTime,
          user.twitter_handle || null
        );
      }

      // Get image from context (sent from frontend)
      const imageData = context.imageData || null;

      // Post to Twitter with image
      const postResult = await this.twitter.postTweetWithImage(message, imageData, user.user_id);

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
      console.error('Error posting to Twitter with image:', error);
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
   * Send text to crush at snooze 3
   */
  async sendTextToCrush(user, snoozeCount, context = {}) {
    try {
      if (!user.crush_phone_number) {
        console.error('❌ Crush\'s phone number not configured for user:', user.user_id);
        return {
          success: false,
          error: 'Crush\'s phone number not configured',
        };
      }

      // Format phone number (add +1 if not present)
      let crushPhone = user.crush_phone_number;
      if (!crushPhone.startsWith('+')) {
        // Remove any non-digit characters first
        crushPhone = crushPhone.replace(/\D/g, '');
        // Add +1 if it's a 10-digit US number
        if (crushPhone.length === 10) {
          crushPhone = `+1${crushPhone}`;
        } else if (crushPhone.length === 11 && crushPhone.startsWith('1')) {
          crushPhone = `+${crushPhone}`;
        } else {
          // Assume it's already in correct format or add +1
          crushPhone = `+1${crushPhone}`;
        }
      }

      // Romantic message for crush
      const message = `Hey babe, I was up all night thinking about how to confess my feelings for you, and now I can't wake up. Call me please.`;

      console.log(`💕 Attempting to send SMS to ${crushPhone} with message: "${message}"`);
      const smsResult = await this.twilio.sendSMS(crushPhone, message);
      console.log(`💕 SMS send result:`, smsResult);

      if (smsResult.success) {
        // Record in database
        await this.db.recordSocialMediaPost(user.user_id, {
          snooze_count: snoozeCount,
          post_type: 'sms',
          post_content: message,
          post_id: smsResult.message_sid || null,
          status: 'posted',
          posted_at: new Date().toISOString(),
        });
      }

      return smsResult;
    } catch (error) {
      console.error('Error sending text to mom:', error);
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

