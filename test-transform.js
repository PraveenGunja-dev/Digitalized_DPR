// Test the transform function
const fs = require('fs');

// Read the mock data
const mockData = JSON.parse(fs.readFileSync('./mock-api/db.json', 'utf8'));

// Import the transform function
const { transformDpQtyData } = require('./src/modules/supervisor/services/mockDataService');

// Test the transform function
const transformedData = transformDpQtyData([mockData.dpQty[0]]);
console.log('Transformed DP Qty data:');
console.log(JSON.stringify(transformedData, null, 2));