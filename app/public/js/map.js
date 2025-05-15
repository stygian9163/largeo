// map.js - Frontend JavaScript for Geospatial Search Application

// Global variables
let map;               // Leaflet map instance
let searchCircle;      // Circle showing search radius
let markers = [];      // Array to hold restaurant markers
const DEFAULT_ZOOM = 13;
const API_URL = '/api/search';
// Remove all restaurant markers from the map and reset the markers array
function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// When the user clicks on a result in the sidebar, find the matching marker and open its popup
function handleResultClick(e) {
    // assume each <li> in #resultsList has data-id="{{restaurant.id}}"
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    const id = li.getAttribute('data-id');
    const marker = markers.find(m => m._id === id);
    if (marker) {
        marker.openPopup();
        map.setView(marker.getLatLng(), DEFAULT_ZOOM);
    }
}

// Update the sidebar list with the new search results
function updateResultsList(results) {
    const resultsList = document.getElementById('resultsList');
    const resultsCount = document.getElementById('resultsCount');

    // Clear out any old results
    resultsList.innerHTML = '';

    // Show count
    const count = results.docs.length;
    resultsCount.textContent = count
        ? `${count} restaurant${count>1?'s':''} found`
        : 'No restaurants found';

    // Build a <li> for each restaurant
    results.docs.forEach(rest => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        // IMPORTANT: data-id must match marker._id
        li.setAttribute('data-id', rest.id);
        li.innerHTML = `
      <strong>${rest.name}</strong><br>
      <small>${rest.address}</small>
    `;
        resultsList.appendChild(li);
    });
}


// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setupEventListeners();
});

// Initialize Leaflet map
function initMap() {
    // Create the map centered on New York City
    map = L.map('map').setView([40.7128, -74.0060], DEFAULT_ZOOM);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add a scale control to the map
    L.control.scale().addTo(map);
}

// Set up event listeners
function setupEventListeners() {
    // Form submission event
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', handleSearch);
    
    // Use current location button
    const currentLocationBtn = document.getElementById('useCurrentLocationBtn');
    currentLocationBtn.addEventListener('click', useCurrentLocation);
    
    // Handle clicking on a result in the list
    const resultsList = document.getElementById('resultsList');
    resultsList.addEventListener('click', handleResultClick);
}

// Handle form submission
async function handleSearch(event) {
    event.preventDefault();
    
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const radius = parseFloat(document.getElementById('radius').value);
    
    // Validate inputs
    if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
        alert('Please enter valid numbers for latitude, longitude, and radius');
        return;
    }

    // Perform the search
    try {
        const results = await performSearch(latitude, longitude, radius);
        console.log('>>> search returned:', results);
        updateMap(latitude, longitude, radius, results);
        updateResultsList(results);
    } catch (error) {
        console.error('Error during search:', error);
        alert('Error performing search. Please try again.');
    }
}

// Get user's current location
function useCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Update the form fields
            document.getElementById('latitude').value = lat.toFixed(6);
            document.getElementById('longitude').value = lon.toFixed(6);
            
            // Center the map on the current location
            map.setView([lat, lon], DEFAULT_ZOOM);
            
            // Add a marker for the current location
            L.marker([lat, lon], {
                icon: L.divIcon({
                    className: 'current-location-marker',
                    html: '<div style="background-color: #3388ff; border: 2px solid white; border-radius: 50%; width: 12px; height: 12px;"></div>',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                })
            }).addTo(map).bindPopup('Your Current Location');
        },
        error => {
            console.error('Error getting location:', error);
            alert('Unable to retrieve your location. Please enter coordinates manually.');
        }
    );
}

// Make API request to perform the search
async function performSearch(lat, lon, radius) {
    const queryParams = new URLSearchParams({
        lat,
        lon,
        radius
    });
    
    const response = await fetch(`${API_URL}?${queryParams}`);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error performing search');
    }
    
    return await response.json();
}

// Update map with search results
function updateMap(lat, lon, radius, results) {
    // Clear previous markers
    clearMarkers();
    
    // Update search circle
    updateSearchCircle(lat, lon, radius);
    
    // Center the map on the search location
    map.setView([lat, lon], calculateZoomLevel(radius));
    
    // Add markers for each restaurant
    results.docs.forEach(restaurant => {
        const marker = L.marker([restaurant.lat, restaurant.lng])
            .addTo(map)
            .bindPopup(`
                <div class="marker-popup">
                    <h5>${restaurant.name}</h5>
                    <p>${restaurant.address}</p>
                    <span class="badge bg-secondary">${restaurant.type}</span>
                </div>
            `);
        
        // Add a data attribute to link the marker with the result list item
        marker._id = restaurant.id;
        markers.push(marker);
    });
}

// Update the circle showing the search radius
function updateSearchCircle(lat, lon, radius) {
    // Remove previous circle if it exists
    if (searchCircle) {
        map.removeLayer(searchCircle);
    }
    
    // Convert radius from kilometers to meters for Leaflet
    const radiusInMeters = radius * 1000;
    
    // Add a new circle
    searchCircle = L.circle([lat, lon], {
        radius: radiusInMeters,
        color: '#0d6efd',
        fillColor: '#0d6efd',
        fillOpacity: 0.1,
        weight: 2
    }).addTo(map);
}

// Calculate appropriate zoom level based on radius
function calculateZoomLevel(radius) {
    // Simple calculation: smaller radius = higher zoom
    if (radius <= 1) return 15;
    if (radius <= 3) return 14;
    if (radius <= 7) return 13;
    if (radius <= 15) return 12;
    if (radius <= 30) return 11;
    return 10;
}