// load-sample-data.js
const axios = require('axios');

// Sample restaurants data around a central location
// Using New York City coordinates as center point (40.7128, -74.0060)
const sampleRestaurants = [
  {
    id: "rest1",
    name: "The Italian Kitchen",
    address: "123 Main St, New York, NY",
    type: "Italian",
    description: "Authentic Italian cuisine in the heart of the city",
    location: "40.7128,-74.0060", // Center point
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: "rest2",
    name: "Sushi Paradise",
    address: "456 Broadway, New York, NY",
    type: "Japanese",
    description: "Fresh sushi and Japanese specialties",
    location: "40.7228,-74.0160", // ~1.5km north-east
    lat: 40.7228,
    lng: -74.0160
  },
  {
    id: "rest3",
    name: "Taco Fiesta",
    address: "789 Park Ave, New York, NY",
    type: "Mexican",
    description: "Authentic Mexican street food",
    location: "40.7028,-73.9960", // ~1km south-east
    lat: 40.7028,
    lng: -73.9960
  },
  {
    id: "rest4",
    name: "Burger Joint",
    address: "321 Hudson St, New York, NY",
    type: "American",
    description: "Classic American burgers and fries",
    location: "40.7178,-74.0160", // ~1km east
    lat: 40.7178,
    lng: -74.0160
  },
  {
    id: "rest5",
    name: "Golden Dragon",
    address: "555 Canal St, New York, NY",
    type: "Chinese",
    description: "Traditional Chinese cuisine",
    location: "40.7078,-73.9960", // ~1km south
    lat: 40.7078,
    lng: -73.9960
  },
  {
    id: "rest6",
    name: "Paris Bistro",
    address: "888 Fifth Ave, New York, NY",
    type: "French",
    description: "Elegant French dining experience",
    location: "40.7328,-74.0060", // ~2km north
    lat: 40.7328,
    lng: -74.0060
  },
  {
    id: "rest7",
    name: "Mediterranean Delight",
    address: "777 Lexington Ave, New York, NY",
    type: "Mediterranean",
    description: "Fresh Mediterranean dishes with a modern twist",
    location: "40.7128,-73.9860", // ~2km east
    lat: 40.7128,
    lng: -73.9860
  },
  {
    id: "rest8",
    name: "Spice of India",
    address: "999 Madison Ave, New York, NY",
    type: "Indian",
    description: "Authentic Indian curries and tandoori dishes",
    location: "40.7028,-74.0260", // ~2km southwest
    lat: 40.7028,
    lng: -74.0260
  },
  {
    id: "rest9",
    name: "Bangkok Kitchen",
    address: "444 West St, New York, NY",
    type: "Thai",
    description: "Spicy and flavorful Thai cuisine",
    location: "40.7228,-74.0260", // ~2.5km northwest
    lat: 40.7228,
    lng: -74.0260
  },
  {
    id: "rest10",
    name: "Brazilian Grill",
    address: "222 East St, New York, NY",
    type: "Brazilian",
    description: "Authentic Brazilian barbecue experience",
    location: "40.6928,-74.0060", // ~2km south
    lat: 40.6928,
    lng: -74.0060
  },
  {
    id: "rest11",
    name: "Greek Islands",
    address: "333 South St, New York, NY",
    type: "Greek",
    description: "Traditional Greek mezze and seafood",
    location: "40.7128,-74.0260", // ~2km west
    lat: 40.7128,
    lng: -74.0260
  },
  {
    id: "rest12",
    name: "Seoul BBQ",
    address: "666 North St, New York, NY",
    type: "Korean",
    description: "Korean BBQ and authentic dishes",
    location: "40.7328,-73.9960", // ~2.5km northeast
    lat: 40.7328,
    lng: -73.9960
  }
];

// Function to add a restaurant to Solr
async function addRestaurant(restaurant) {
  try {
    const response = await axios.post(
      'http://solr:8983/solr/restaurants/update?commit=true',
      [restaurant],
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`Added restaurant: ${restaurant.name}`);
    return response.data;
  } catch (error) {
    console.error(`Error adding restaurant ${restaurant.name}:`, error.message);
    throw error;
  }
}

// Function to check if Solr is ready
async function waitForSolr() {
  let isReady = false;
  while (!isReady) {
    try {
      const response = await axios.get('http://solr:8983/solr/admin/cores?action=STATUS');
      if (response.status === 200) {
        console.log('Solr is ready!');
        isReady = true;
      }
    } catch (error) {
      console.log('Waiting for Solr to be ready...');
      // Wait for 2 seconds before trying again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Main function to load all sample restaurants
async function loadSampleData() {
  try {
    // Wait for Solr to be ready
    await waitForSolr();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await axios.post(
      'http://solr:8983/solr/restaurants/update?commit=true',
      { delete: { query: "*:*" } },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Add each restaurant
    console.log('Adding sample restaurants...');
    for (const restaurant of sampleRestaurants) {
      await addRestaurant(restaurant);
    }
    
    console.log('Sample data loaded successfully!');
  } catch (error) {
    console.error('Error loading sample data:', error.message);
  }
}

// Execute the data loading function
loadSampleData();