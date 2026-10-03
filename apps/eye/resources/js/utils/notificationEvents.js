// Global notification refresh events
class NotificationEvents {
  constructor() {
    this.listeners = [];
  }

  // Subscribe to notification refresh events
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Trigger notification refresh
  refresh() {
    console.log('Notification refresh triggered, listeners:', this.listeners.length);
    this.listeners.forEach(callback => callback());
  }
}

// Create singleton instance
const notificationEvents = new NotificationEvents();

export default notificationEvents;
