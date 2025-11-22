/**
 * Integration Service
 * Handles communication with Person 1 and Person 2 backends
 * Coordinates with other services in the system
 */

export class IntegrationService {
  constructor(env) {
    this.env = env;
    
    // Backend URLs from environment
    this.person1BackendUrl = env.PERSON1_BACKEND_URL || 'http://localhost:3000'; // Frontend
    this.person2BackendUrl = env.PERSON2_BACKEND_URL || 'http://localhost:8000'; // Person 2: AI & Voice Backend
    this.openRouterApiKey = env.OPENROUTER_API_KEY;
    
    // OpenRouter fallback API
    this.openRouterUrl = 'https://openrouter.ai/api/v1';
  }

  /**
   * Notify Person 1 backend about snooze event
   * This is called when we receive a snooze event and need to sync with Person 1
   */
  async notifyPerson1(eventData) {
    try {
      const url = `${this.person1BackendUrl}/snooze/confirmed`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`Person 1 backend error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error notifying Person 1:', error);
      // Don't throw - this is a background sync, not critical
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify Person 2 backend about roast intensity escalation
   * This coordinates when to escalate roast intensity based on snooze count
   */
  async notifyPerson2(escalationData) {
    try {
      // Person 2 endpoint for roast intensity coordination
      const url = `${this.person2BackendUrl}/roast/intensity`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: escalationData.user_id,
          snooze_count: escalationData.snooze_count,
          current_roast_intensity: escalationData.current_roast_intensity,
          recommended_intensity: this.getRecommendedIntensity(escalationData.snooze_count),
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        // If Person 2 backend is not available, that's okay - continue
        console.warn('Person 2 backend not available, continuing anyway');
        return { success: false, error: 'Person 2 backend not available' };
      }

      return await response.json();
    } catch (error) {
      console.error('Error notifying Person 2:', error);
      // Don't throw - this is coordination, not critical
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recommended roast intensity based on snooze count
   */
  getRecommendedIntensity(snoozeCount) {
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
   * Use OpenRouter API as fallback for AI-generated content
   * This can be used if Gemini API is not available
   */
  async generateContentWithOpenRouter(prompt, model = 'google/gemini-pro') {
    if (!this.openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const url = `${this.openRouterUrl}/chat/completions`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://passive-aggressive-alarm.com',
          'X-Title': 'Passive-Aggressive Alarm Clock',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a passive-aggressive alarm clock AI. Generate snarky, sarcastic responses.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error using OpenRouter API:', error);
      throw error;
    }
  }

  /**
   * Generate social media threat message using OpenRouter (fallback)
   */
  async generateThreatWithOpenRouter(snoozeCount, wakeUpTime, userHandle = null) {
    const handle = userHandle ? `@${userHandle} ` : '';
    
    const prompt = `Generate a snarky, passive-aggressive Twitter post about someone who has snoozed their alarm ${snoozeCount} times. 
    Wake-up time: ${wakeUpTime}
    User handle: ${handle}
    Make it funny, sarcastic, and mildly embarrassing. Use emojis. Keep it under 280 characters.`;

    try {
      const content = await this.generateContentWithOpenRouter(prompt);
      return content.trim();
    } catch (error) {
      // Fallback to default message
      return `🚨 ${handle}has snoozed ${snoozeCount} times. Wake-up: ${wakeUpTime}. #SnoozeChronicles`;
    }
  }

  /**
   * Health check - verify all backend connections
   */
  async healthCheck() {
    const status = {
      person1_backend: { available: false, url: this.person1BackendUrl },
      person2_backend: { available: false, url: this.person2BackendUrl },
      openrouter: { available: !!this.openRouterApiKey },
    };

    // Check Person 1 backend
    try {
      const response = await fetch(`${this.person1BackendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      status.person1_backend.available = response.ok;
    } catch (error) {
      status.person1_backend.error = error.message;
    }

    // Check Person 2 backend
    try {
      const response = await fetch(`${this.person2BackendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      status.person2_backend.available = response.ok;
    } catch (error) {
      status.person2_backend.error = error.message;
    }

    return status;
  }
}

