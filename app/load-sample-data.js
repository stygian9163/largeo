// load-sample-data.js

const axios = require('axios');

// --- CONFIGURATION ---
const SOLR_HOST = process.env.SOLR_HOST || 'solr';
const SOLR_PORT = process.env.SOLR_PORT || 8983;
const SOLR_CORE = 'restaurants';
const CORE_URL  = `http://${SOLR_HOST}:${SOLR_PORT}/solr/${SOLR_CORE}`;

// Sample restaurants data around New York City
const sampleRestaurants = [
  { id: "rest1",  name: "The Italian Kitchen",      address: "123 Main St, New York, NY",      type: "Italian",       description: "Authentic Italian cuisine",    lat: 40.7128, lng: -74.0060 },
  { id: "rest2",  name: "Sushi Paradise",           address: "456 Broadway, New York, NY",      type: "Japanese",      description: "Fresh sushi and Japanese specialties", lat: 40.7228, lng: -74.0160 },
  { id: "rest3",  name: "Taco Fiesta",              address: "789 Park Ave, New York, NY",      type: "Mexican",       description: "Authentic Mexican street food", lat: 40.7028, lng: -73.9960 },
  { id: "rest4",  name: "Burger Joint",             address: "321 Hudson St, New York, NY",     type: "American",      description: "Classic American burgers and fries", lat: 40.7178, lng: -74.0160 },
  { id: "rest5",  name: "Golden Dragon",            address: "555 Canal St, New York, NY",      type: "Chinese",       description: "Traditional Chinese cuisine",   lat: 40.7078, lng: -73.9960 },
  { id: "rest6",  name: "Paris Bistro",             address: "888 Fifth Ave, New York, NY",     type: "French",        description: "Elegant French dining experience", lat: 40.7328, lng: -74.0060 },
  { id: "rest7",  name: "Mediterranean Delight",    address: "777 Lexington Ave, New York, NY", type: "Mediterranean", description: "Fresh Mediterranean dishes",   lat: 40.7128, lng: -73.9860 },
  { id: "rest8",  name: "Spice of India",           address: "999 Madison Ave, New York, NY",   type: "Indian",        description: "Authentic Indian curries",     lat: 40.7028, lng: -74.0260 },
  { id: "rest9",  name: "Bangkok Kitchen",          address: "444 West St, New York, NY",       type: "Thai",          description: "Spicy Thai cuisine",           lat: 40.7228, lng: -74.0260 },
  { id: "rest10", name: "Brazilian Grill",          address: "222 East St, New York, NY",       type: "Brazilian",     description: "Authentic Brazilian barbecue", lat: 40.6928, lng: -74.0060 },
  { id: "rest11", name: "Greek Islands",            address: "333 South St, New York, NY",      type: "Greek",         description: "Traditional Greek mezze",      lat: 40.7128, lng: -74.0260 },
  { id: "rest12", name: "Seoul BBQ",                address: "666 North St, New York, NY",      type: "Korean",        description: "Korean BBQ and authentic dishes", lat: 40.7328, lng: -73.9960 }
];

// Helper to POST update commands
async function postUpdate(body) {
  return axios.post(
      `${CORE_URL}/update?commit=true`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
  );
}

// Poll /admin/ping until the core is ready
async function waitForCore() {
  console.log(`Waiting for Solr core "${SOLR_CORE}" to come online…`);
  while (true) {
    try {
      let { data, status } = await axios.get(`${CORE_URL}/admin/ping`);
      if (status === 200 && data.status === 'OK') {
        console.log('✅ Core is online');
        return;
      }
    } catch (_) {
      // ignore and retry
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

// Retry-on-503 wrapper
async function withRetries(fn, desc, retries = 5) {
  for (let i = 1; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.response?.status === 503 && i < retries) {
        console.log(`Core not ready (${desc}), retry ${i}/${retries}…`);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        throw err;
      }
    }
  }
}

// Clear all documents
async function clearAll() {
  console.log('Clearing existing data…');
  await withRetries(
      () => postUpdate({ delete: { query: '*:*' } }),
      'delete *:*'
  );
  console.log('✅ All documents cleared');
}

// Add a single restaurant
async function addOne(r) {
  const doc = {
    id:          r.id,
    name:        r.name,
    address:     r.address,
    type:        r.type,
    description: r.description,
    lat:         r.lat,
    lng:         r.lng,
    // <-- send location as "lat,lon" string
    location:    `${r.lat},${r.lng}`
  };
  await withRetries(
      () => postUpdate({ add: { doc } }),
      `add ${r.id}`
  );
  console.log(`✅ Added ${r.name}`);
}

// Main
(async function loadSampleData() {
  try {
    await waitForCore();
    await clearAll();
    console.log('Loading sample restaurants…');
    for (const r of sampleRestaurants) {
      await addOne(r);
    }
    console.log('🎉 Sample data loaded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal error loading sample data:', err.response?.data || err.message);
    process.exit(1);
  }
})();
