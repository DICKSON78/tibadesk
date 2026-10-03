// Debug script to test navigation
console.log('Debug Navigation Script Loaded');

// Test if React Router is working
window.testNavigation = () => {
  console.log('Testing navigation...');
  
  // Check if we're in a React Router context
  const currentPath = window.location.pathname;
  console.log('Current path:', currentPath);
  
  // Try to navigate programmatically
  if (window.history && window.history.pushState) {
    console.log('History API available');
    // Test navigation
    window.history.pushState({}, '', '/dashboard');
    console.log('Navigation test completed');
  } else {
    console.log('History API not available');
  }
};

// Add click listener to test navigation
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-test-navigation]')) {
    console.log('Navigation test button clicked');
    window.testNavigation();
  }
});

console.log('Debug navigation script ready');
