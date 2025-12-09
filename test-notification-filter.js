// Test script to verify notification filtering
const now = new Date();
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

console.log('Current time:', now);
console.log('Two days ago:', twoDaysAgo);

// Test notifications
const testNotifications = [
  { id: 1, title: 'Recent', timestamp: new Date(), read: false },
  { id: 2, title: 'One day ago', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), read: false },
  { id: 3, title: 'Three days ago', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), read: false },
];

console.log('\nTest notifications:');
testNotifications.forEach(notification => {
  const isRecent = new Date(notification.timestamp) >= twoDaysAgo;
  console.log(`${notification.title} (${notification.timestamp}) - Recent: ${isRecent}`);
});