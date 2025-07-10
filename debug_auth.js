// Debug script to check authentication data
// Run this in your browser console

console.log('=== AUTHENTICATION DEBUG ===');
console.log('userId:', localStorage.getItem('userId'));
console.log('userEmail:', localStorage.getItem('userEmail'));
console.log('authToken:', localStorage.getItem('authToken'));
console.log('userData:', localStorage.getItem('userData'));

// Parse and display userData if it exists
const userData = localStorage.getItem('userData');
if (userData) {
  try {
    const parsedData = JSON.parse(userData);
    console.log('Parsed userData:', parsedData);
  } catch (e) {
    console.error('Error parsing userData:', e);
  }
} else {
  console.log('❌ No userData found in localStorage');
}

// Show all localStorage keys
console.log('All localStorage keys:', Object.keys(localStorage));
