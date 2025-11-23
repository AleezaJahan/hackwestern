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
    
    // Check if credentials are available
    // For posting tweets, we need OAuth 1.0a (API Key, Secret, Access Token, Access Token Secret)
    // Bearer Token alone is NOT sufficient for posting (read-only)
    this.hasOAuth1 = !!(this.apiKey && this.apiSecret && this.accessToken && this.accessTokenSecret);
    this.isConfigured = !!(this.hasOAuth1 || this.bearerToken);
    
    // Debug logging
    console.log('🐦 TwitterService initialized:');
    console.log('🐦 OAuth 1.0a credentials present:', this.hasOAuth1);
    console.log('🐦 Bearer Token present:', !!this.bearerToken);
    console.log('🐦 Can post tweets:', this.hasOAuth1);
    console.log('🐦 Is configured:', this.isConfigured);
  }

  /**
   * Generate OAuth 1.0a signature for Twitter API
   * Uses Web Crypto API (compatible with Cloudflare Workers)
   */
  async generateOAuthSignature(method, url, params = {}) {
    if (!this.apiKey || !this.apiSecret || !this.accessToken || !this.accessTokenSecret) {
      return null;
    }

    // Generate nonce
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const nonce = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Build parameter string
    const oauthParams = {
      oauth_consumer_key: this.apiKey,
      oauth_token: this.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_version: '1.0',
      ...params,
    };

    // Sort and encode parameters
    const sortedParams = Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');

    // Create signature base string
    const signatureBaseString = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(sortedParams)
    ].join('&');

    // Create signing key
    const signingKey = `${encodeURIComponent(this.apiSecret)}&${encodeURIComponent(this.accessTokenSecret)}`;

    // Generate HMAC-SHA1 signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(signingKey);
    const messageData = encoder.encode(signatureBaseString);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

    // Build OAuth header
    const oauthHeader = [
      `oauth_consumer_key="${encodeURIComponent(this.apiKey)}"`,
      `oauth_token="${encodeURIComponent(this.accessToken)}"`,
      `oauth_signature_method="HMAC-SHA1"`,
      `oauth_timestamp="${timestamp}"`,
      `oauth_nonce="${nonce}"`,
      `oauth_version="1.0"`,
      `oauth_signature="${encodeURIComponent(signatureBase64)}"`
    ].join(', ');

    return `OAuth ${oauthHeader}`;
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
      console.log('🐦 Attempting to post tweet:', text);
      
      // Twitter API v2 endpoint for creating tweets
      const endpoint = `${this.apiUrl}/tweets`;
      
      const payload = {
        text: text,
      };

      console.log('🐦 Posting to:', endpoint);
      console.log('🐦 Payload:', JSON.stringify(payload));

      // Try OAuth 1.0a first (required for posting)
      let authHeader = null;
      console.log('🐦 Checking credentials:');
      console.log('🐦 API Key:', this.apiKey ? 'PRESENT' : 'MISSING');
      console.log('🐦 API Secret:', this.apiSecret ? 'PRESENT' : 'MISSING');
      console.log('🐦 Access Token:', this.accessToken ? 'PRESENT' : 'MISSING');
      console.log('🐦 Access Token Secret:', this.accessTokenSecret ? 'PRESENT' : 'MISSING');
      
      if (this.apiKey && this.apiSecret && this.accessToken && this.accessTokenSecret) {
        console.log('🐦 Using OAuth 1.0a authentication');
        // For Twitter API v2 with JSON body, OAuth signature should NOT include body params
        // The signature is based on the URL and OAuth params only
        authHeader = await this.generateOAuthSignature('POST', endpoint, {});
        console.log('🐦 OAuth header generated:', authHeader ? 'YES' : 'NO');
        if (authHeader) {
          console.log('🐦 OAuth header preview:', authHeader.substring(0, 80) + '...');
        }
      } else {
        console.log('🐦 OAuth 1.0a credentials incomplete, falling back to Bearer Token');
        if (this.bearerToken) {
          console.log('🐦 Using Bearer Token (will NOT work for posting)');
          authHeader = `Bearer ${this.bearerToken}`;
        } else {
          throw new Error('No Twitter credentials configured. Need OAuth 1.0a credentials to post tweets.');
        }
      }

      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      console.log('🐦 Response status:', response.status);
      console.log('🐦 Response ok:', response.ok);
      
      // Check rate limit headers
      const rateLimitRemaining = response.headers.get('x-rate-limit-remaining');
      const rateLimitReset = response.headers.get('x-rate-limit-reset');
      if (rateLimitRemaining !== null) {
        console.log('🐦 Rate limit remaining:', rateLimitRemaining);
      }
      if (rateLimitReset !== null) {
        const resetTime = new Date(parseInt(rateLimitReset) * 1000);
        console.log('🐦 Rate limit resets at:', resetTime.toISOString());
        const minutesUntilReset = Math.ceil((parseInt(rateLimitReset) * 1000 - Date.now()) / 60000);
        console.log('🐦 Minutes until reset:', minutesUntilReset);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🐦 Twitter API error response:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { detail: errorText };
        }
        
        // Provide more helpful error message for rate limits
        if (response.status === 429) {
          let rateLimitMessage = 'Twitter API rate limit exceeded.';
          if (rateLimitReset) {
            const resetTime = new Date(parseInt(rateLimitReset) * 1000);
            const minutesUntilReset = Math.ceil((parseInt(rateLimitReset) * 1000 - Date.now()) / 60000);
            rateLimitMessage += ` Rate limit resets in ${minutesUntilReset} minutes (at ${resetTime.toLocaleTimeString()}).`;
          }
          throw new Error(rateLimitMessage);
        }
        
        throw new Error(`Twitter API error: ${error.detail || error.title || response.statusText}`);
      }

      const data = await response.json();
      console.log('🐦 Tweet posted successfully:', data);

      return {
        success: true,
        tweet_id: data.data.id,
        url: `https://twitter.com/i/web/status/${data.data.id}`,
        message: 'Tweet posted successfully',
      };
    } catch (error) {
      console.error('🐦 Error posting tweet:', error);
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
        console.log('🐦 Posting tweet with media_id:', mediaId);
      } else {
        console.log('🐦 Posting tweet without image (image upload may have failed)');
      }

      console.log('🐦 Posting to:', endpoint);
      console.log('🐦 Payload:', JSON.stringify(payload));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('🐦 Response status:', response.status);
      console.log('🐦 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🐦 Twitter API error response:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { detail: errorText };
        }
        throw new Error(`Twitter API error: ${error.detail || error.title || response.statusText}`);
      }

      const data = await response.json();
      console.log('🐦 Tweet with image posted successfully:', data);

      return {
        success: true,
        tweet_id: data.data.id,
        url: `https://twitter.com/i/web/status/${data.data.id}`,
        message: 'Tweet with image posted successfully',
      };
    } catch (error) {
      console.error('🐦 Error posting tweet with image:', error);
      console.log('🐦 Falling back to posting without image...');
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
    // Add timestamp to make each tweet unique (Twitter doesn't allow duplicates)
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timestamp = `${dateStr} at ${timeStr}`;
    
    // Simple message: "eat, sleep, repeat" with timestamp
    return `eat, sleep, repeat\n\n${timestamp}`;
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

