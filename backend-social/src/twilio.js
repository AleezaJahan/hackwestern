/**
 * Twilio SMS Integration Service
 * Handles sending SMS threat messages via Twilio
 */

export class TwilioService {
  constructor(env) {
    this.accountSid = env.TWILIO_ACCOUNT_SID;
    this.authToken = env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = env.TWILIO_PHONE_NUMBER;
    
    // Twilio API endpoint
    this.apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    
    // Check if credentials are available
    this.isConfigured = !!(this.accountSid && this.authToken && this.phoneNumber);
  }

  /**
   * Send SMS via Twilio
   */
  async sendSMS(to, message) {
    if (!this.isConfigured) {
      // Fallback: return mock response if not configured
      console.warn('Twilio not configured. Returning mock response.');
      return {
        success: true,
        message_sid: `mock_${Date.now()}`,
        message: `Mock SMS sent to ${to}: ${message}`,
      };
    }

    try {
      // Create Basic Auth header
      // Use base64 encoding compatible with Cloudflare Workers
      const credentials = btoa(`${this.accountSid}:${this.authToken}`);
      
      // Prepare form data
      const formData = new URLSearchParams();
      formData.append('From', this.phoneNumber);
      formData.append('To', to);
      formData.append('Body', message);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Twilio API error: ${error || response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        message_sid: data.sid,
        status: data.status,
        message: 'SMS sent successfully',
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to send SMS: ${error.message}`,
      };
    }
  }

  /**
   * Generate SMS threat message
   */
  generateThreatMessage(snoozeCount, wakeUpTime, userName = null) {
    const name = userName ? `${userName}, ` : '';
    
    const messages = [
      `🚨 ${name}You've snoozed ${snoozeCount} times. Wake-up: ${wakeUpTime}. This is getting embarrassing. If you snooze again, I'm posting this to Twitter. You've been warned! 😤`,
      
      `⚠️ SNOOZE ALERT: ${snoozeCount} snoozes detected. Final wake-up: ${wakeUpTime}. ${name}This is your last chance before I go nuclear and tweet your stats. GET UP NOW! 📱`,
      
      `📢 FINAL WARNING: ${snoozeCount} snoozes. Wake-up: ${wakeUpTime}. ${name}I'm about to post your embarrassing wake-up time to social media. You have 60 seconds to prove you're alive. ⏰`,
      
      `🔥 NUCLEAR OPTION: ${snoozeCount} snoozes. ${name}I warned you. I'm posting your wake-up stats RIGHT NOW. Check Twitter. This is what you get for not listening. 💀`,
    ];

    // Select message based on snooze count
    if (snoozeCount >= 10) {
      return messages[3]; // Nuclear
    } else if (snoozeCount >= 7) {
      return messages[2]; // Final warning
    } else if (snoozeCount >= 5) {
      return messages[1]; // Warning
    } else {
      return messages[0]; // Initial threat
    }
  }

  /**
   * Send escalating threat messages
   * Sends progressively more aggressive messages based on snooze count
   */
  async sendEscalatingThreat(phoneNumber, snoozeCount, wakeUpTime, userName = null) {
    const message = this.generateThreatMessage(snoozeCount, wakeUpTime, userName);
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send final nuclear SMS (after posting to Twitter)
   */
  async sendNuclearSMS(phoneNumber, snoozeCount, tweetUrl = null, userName = null) {
    const name = userName ? `${userName}, ` : '';
    const url = tweetUrl ? ` Check it out: ${tweetUrl}` : '';
    
    const message = `💀 IT'S DONE. ${name}I've posted your ${snoozeCount} snooze count to Twitter.${url} This is what happens when you don't wake up. Hope your crush doesn't see this. 😈`;
    
    return await this.sendSMS(phoneNumber, message);
  }
}

