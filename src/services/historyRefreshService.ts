/**
 * Global History Refresh Service
 * 
 * This service provides a mechanism to refresh the post history from anywhere in the app
 * when new posts are published. It maintains a list of refresh callbacks that can be
 * triggered globally.
 */

type HistoryRefreshCallback = () => Promise<void> | void;

class HistoryRefreshService {
  private refreshCallbacks: HistoryRefreshCallback[] = [];

  /**
   * Register a callback to be called when history needs to be refreshed
   */
  registerRefreshCallback(callback: HistoryRefreshCallback): () => void {
    this.refreshCallbacks.push(callback);
    
    // Return unregister function
    return () => {
      const index = this.refreshCallbacks.indexOf(callback);
      if (index > -1) {
        this.refreshCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Trigger all registered refresh callbacks
   * This should be called whenever posts are published successfully
   */
  async refreshHistory(): Promise<void> {
    console.log('🔄 Triggering global post history refresh...');
    
    const refreshPromises = this.refreshCallbacks.map(callback => {
      try {
        const result = callback();
        return Promise.resolve(result);
      } catch (error) {
        console.error('Error in history refresh callback:', error);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(refreshPromises);
  }

  /**
   * Get the number of registered callbacks (for debugging)
   */
  getCallbackCount(): number {
    return this.refreshCallbacks.length;
  }
}

// Export singleton instance
export const historyRefreshService = new HistoryRefreshService();
