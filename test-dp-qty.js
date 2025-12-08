const { fetchDpQtyData } = require('./src/modules/supervisor/services/mockDataService');

async function test() {
  try {
    const data = await fetchDpQtyData();
    console.log('DP Qty Data:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching DP Qty data:', error);
  }
}

test();