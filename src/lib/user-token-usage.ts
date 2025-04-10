// Use fetch API to call our proxied endpoints instead of Supabase directly

/**
 * Track token usage for a user (without balance deduction)
 */
export async function trackTokenUsage(promptTokens: number, completionTokens: number) {
  try {
    const response = await fetch('/api/usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ promptTokens, completionTokens }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error tracking token usage:', error);
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.tokens.total : null;
  } catch (error) {
    console.error('Failed to track token usage:', error);
    return null;
  }
}

/**
 * Get the current user's balance from Supabase
 */
export async function getUserBalance() {
  try {
    const response = await fetch('/api/usage?type=balance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error getting user balance:', error);
      return null;
    }
    
    const data = await response.json();
    return data.balance;
  } catch (error) {
    console.error('Failed to get user balance:', error);
    return null;
  }
}

// Function removed - no longer needed for balance management

/**
 * Get the user's token usage history
 */
export async function getUserTokenUsage(limit = 10) {
  try {
    const response = await fetch(`/api/usage?type=history&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error getting user token usage:', error);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get user token usage:', error);
    return null;
  }
}

/**
 * Get token usage summary for a specific time period
 */
export async function getTokenUsageSummary(days = 30) {
  try {
    const response = await fetch(`/api/usage?type=summary&days=${days}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error getting token usage summary:', error);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get token usage summary:', error);
    return null;
  }
}