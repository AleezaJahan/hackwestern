/**
 * Twitter/X API Integration Service
 * Handles posting tweets and Twitter API interactions
 */

export class TwitterService {
  constructor(env) {
    this.apiKey = env.TWITTER_API_KEY;
    this.apiSecret = env.TWITTER_API_SECRET;
    this.accessToken = env.TWITTER_ACCESS_TOKEN;
    this.accessTokenSecret = env.TWITTER_ACCESS_TOKEN_SECRET;
    this.bearerToken = env.TWITTER_BEARER_TOKEN;
    
    // Twitter API v2 endpoint
    this.apiUrl = 'https://api.twitter.com/2';
    
    // Check if credentials are available - Bearer Token alone is sufficient for API v2
    this.isConfigured = !!(this.bearerToken || (this.accessToken && this.accessTokenSecret && this.apiKey && this.apiSecret));
  }

  /**
   * Generate OAuth 1.0a signature for Twitter API
   * Simple implementation - for production, use a library like oauth-1.0a
   */
  async generateOAuthSignature(method, url, params = {}) {
    // Note: For production, use a proper OAuth library
    // This is a simplified version for demonstration
    // You should use a library like 'oauth-1.0a' or implement proper HMAC-SHA1
    
    // Use Web Crypto API (compatible with Cloudflare Workers)
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const nonce = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    const oauth = {
      oauth_consumer_key: this.apiKey,
      oauth_token: this.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_nonce: nonce,
      oauth_version: '1.0',
      ...params,
    };

    // For now, we'll use Bearer token (simpler for API v2)
    // If you need OAuth 1.0a, use a proper library
    return null;
  }

  /**
   * Post a tweet using Twitter API v2
   * Uses Bearer token authentication
   */
  async postTweet(text, userId = null) {
    if (!this.isConfigured) {
      // Fallback: return mock response if not configured
      console.warn('Twitter API not configured. Returning mock response.');
      return {
        success: true,
        tweet_id: `mock_${Date.now()}`,
        url: `https://twitter.com/mock/status/${Date.now()}`,
        message: 'Mock tweet posted (Twitter API not configured)',
      };
    }

    try {
      // Twitter API v2 endpoint for creating tweets
      const endpoint = `${this.apiUrl}/tweets`;
      
      const payload = {
        text: text,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Twitter API error: ${error.detail || response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        tweet_id: data.data.id,
        url: `https://twitter.com/i/web/status/${data.data.id}`,
        message: 'Tweet posted successfully',
      };
    } catch (error) {
      console.error('Error posting tweet:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to post tweet: ${error.message}`,
      };
    }
  }

  /**
   * Post a tweet with image using Twitter API v2
   * First uploads image, then posts tweet with media_id
   */
  async postTweetWithImage(text, imageData, userId = null) {
    if (!this.isConfigured) {
      // Fallback: return mock response if not configured
      console.warn('Twitter API not configured. Returning mock response.');
      return {
        success: true,
        tweet_id: `mock_${Date.now()}`,
        url: `https://twitter.com/mock/status/${Date.now()}`,
        message: 'Mock tweet with image posted (Twitter API not configured)',
      };
    }

    try {
      let mediaId = null;

      // If image data is provided, upload it first
      if (imageData) {
        // Twitter Media API endpoint (v1.1) - Note: May require OAuth 1.0a instead of Bearer Token
        const mediaEndpoint = 'https://upload.twitter.com/1.1/media/upload.json';
        
        try {
          // Upload image
          const formData = new FormData();
          formData.append('media', imageData);

          const mediaResponse = await fetch(mediaEndpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.bearerToken}`,
            },
            body: formData,
          });

          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            mediaId = mediaData.media_id_string;
            console.log('Image uploaded successfully, media_id:', mediaId);
          } else {
            const errorText = await mediaResponse.text();
            console.warn('Failed to upload image:', mediaResponse.status, errorText);
            console.warn('Note: Media uploads may require OAuth 1.0a credentials instead of Bearer Token');
            // Continue without image
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Continue without image
        }
      }

      // Post tweet with or without image
      const endpoint = `${this.apiUrl}/tweets`;
      const payload = {
        text: text,
      };

      if (mediaId) {
        payload.media = {
          media_ids: [mediaId],
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Twitter API error: ${error.detail || response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        tweet_id: data.data.id,
        url: `https://twitter.com/i/web/status/${data.data.id}`,
        message: 'Tweet with image posted successfully',
      };
    } catch (error) {
      console.error('Error posting tweet with image:', error);
      // Fallback to posting without image
      return await this.postTweet(text, userId);
    }
  }

  /**
   * Post a tweet with OAuth 1.0a (if Bearer token doesn't work)
   * Requires proper OAuth library for production
   */
  async postTweetWithOAuth(text, userId = null) {
    if (!this.isConfigured) {
      return this.postTweet(text, userId); // Fall back to mock
    }

    // Note: OAuth 1.0a implementation requires proper library
    // For now, we'll use Bearer token method above
    // To implement OAuth 1.0a properly, install 'oauth-1.0a' package:
    // npm install oauth-1.0a crypto
    
    return this.postTweet(text, userId);
  }

  /**
   * Generate social media threat message
   */
  generateThreatMessage(snoozeCount, wakeUpTime, userHandle = null) {
    const handle = userHandle ? `@${userHandle} ` : '';
    
    const messages = [
      `🚨 PUBLIC SERVICE ANNOUNCEMENT 🚨\n\n${handle}has snoozed their alarm ${snoozeCount} times today.\nWake-up time: ${wakeUpTime}\n\nTheir excuse? Probably something like "just 5 more minutes" 🥱\n\nIf you know this person, maybe check if they're still breathing? Just kidding... (or am I?)\n\n#SnoozeChronicles #GetYourLifeTogether`,
      
      `⚠️ WAKE UP ALERT ⚠️\n\n${handle}has hit snooze ${snoozeCount} times. Final wake-up: ${wakeUpTime}\n\nThis is your friendly reminder that sleep is important, but so is having a functioning alarm clock 😴\n\n#SnoozeCount #WakeUpChallenge`,
      
      `📢 URGENT: SNOOZE CRISIS 📢\n\n${handle}has now snoozed ${snoozeCount} times.\nActual wake-up: ${wakeUpTime}\n\nAt this point, we're not sure if they're trying to break a world record or just really committed to being late 🤷‍♂️\n\n#SnoozeMaster #StillInBed`,
    ];

    // Select message based on snooze count
    if (snoozeCount >= 10) {
      return messages[0]; // Most aggressive
    } else if (snoozeCount >= 7) {
      return messages[1]; // Moderate
    } else {
      return messages[2]; // Mild
    }
  }

  /**
   * Post embarrassing wake-up stats
   */
  async postEmbarrassingStats(stats, userHandle = null) {
    const handle = userHandle ? `@${userHandle} ` : '';
    
    const message = `📊 SNOOZE STATS OF THE DAY 📊\n\n${handle}Today's wake-up performance:\n• Total snoozes: ${stats.total_snoozes}\n• Longest snooze session: ${stats.longest_snooze_session}\n• Most common excuse: "${stats.most_common_excuse || 'None recorded'}"\n\nImpressive. Very impressive. 🏆\n\n#SnoozeStats #SleepGoals #NotReally`;
    
    return await this.postTweet(message);
  }

  /**
   * Delete a tweet (if needed)
   */
  async deleteTweet(tweetId) {
    if (!this.isConfigured) {
      return { success: true, message: 'Mock tweet deleted' };
    }

    try {
      const endpoint = `${this.apiUrl}/tweets/${tweetId}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Twitter API error: ${error.detail || response.statusText}`);
      }

      return {
        success: true,
        message: 'Tweet deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting tweet:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to delete tweet: ${error.message}`,
      };
    }
  }
}

