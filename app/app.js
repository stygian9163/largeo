// app.js - Main Express application file
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Load sample data when the server starts
const loadSampleData = require('./load-sample-data');

// API endpoint for geospatial search
app.get('/api/search', async (req, res) => {
  try {
    const { lat, lon, radius = 5 } = req.query;
    
    // Validate required parameters
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon' 
      });
    }
    
    // Format the Solr spatial query
    // Using Solr's {!geofilt} query parser for distance filtering
    const spatialQuery = `{!geofilt sfield=location pt=${lat},${lon} d=${radius}}`;
    
    // Prepare Solr query parameters
    const solrParams = {
      q: '*:*',
      fq: spatialQuery,
      sort: `geodist(location,${lat},${lon}) asc`,
      fl: 'id,name,address,type,description,lat,lng,location,[explain],score',
      wt: 'json'
    };
    
    // Convert params object to URL query string
    const queryString = Object.entries(solrParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    // Make request to Solr
    const solrResponse = await axios.get(
      `http://solr:8983/solr/restaurants/select?${queryString}`
    );
    
    // Extract and return the results
    const results = solrResponse.data.response;
    res.json(results);
  } catch (error) {
    console.error('Error during search:', error.message);
    res.status(500).json({ 
      error: 'Error performing search', 
      details: error.message 
    });
  }
});

// Default route serves the index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint for debugging
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});