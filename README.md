# Geospatial Search with Solr and Leaflet.js

This application demonstrates geospatial search functionality using Apache Solr as the backend and Leaflet.js for map visualization. It allows users to search for restaurants within a specific radius of a location and displays the results on an interactive map.

## Features

- Geospatial indexing and searching using Apache Solr
- Interactive map visualization with Leaflet.js
- Search for restaurants within a specified radius
- Visualization of search radius and restaurant locations on the map
- Ability to use current location for search
- Responsive UI with Bootstrap

## Prerequisites

- Docker and Docker Compose
- Git

## Project Structure

```
geospatial-search-app/
├── docker-compose.yml          # Docker configuration
├── solr_data/                  # Solr data directory (created by Docker)
├── app/                        # Node.js application
│   ├── app.js                  # Main backend application
│   ├── load-sample-data.js     # Script to load sample restaurant data
│   ├── package.json            # Node.js dependencies
│   ├── public/                 # Frontend files
│       ├── index.html          # Main HTML file
│       ├── css/
│       │   └── styles.css      # CSS styles
│       └── js/
│           └── map.js          # Frontend JavaScript
```

## Installation and Setup

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd geospatial-search-app
   ```

2. Create the necessary directories and files:
   ```bash
   mkdir -p app/public/css app/public/js
   ```

3. Copy the provided files to their respective locations:
   - Place `docker-compose.yml` in the root directory
   - Place `app.js`, `load-sample-data.js`, and `package.json` in the `app` directory
   - Place `index.html` in the `app/public` directory
   - Place `styles.css` in the `app/public/css` directory 
   - Place `map.js` in the `app/public/js` directory

4. Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```

5. The application will be available at: http://localhost:3000

## How It Works

### Backend (Solr)

- A Solr instance is configured with a custom schema (`managed-schema.xml`) that includes a geospatial field type (`location_rpt`) for spatial searches.
- Sample restaurant data is loaded into Solr using the `load-sample-data.js` script.
- Each restaurant document contains location information (latitude and longitude), as well as metadata like name, address, and type.
- Solr processes geospatial queries using its spatial features.

### API (Node.js)

- An Express.js server acts as a proxy between the frontend and Solr.
- The `/api/search` endpoint accepts query parameters for latitude, longitude, and radius.
- The API constructs a geospatial query using Solr's `{!geofilt}` query parser.
- Results are returned as JSON to the frontend.

### Frontend (HTML/JS/Leaflet)

- The user interface allows inputting search coordinates and radius.
- Leaflet.js is used to create an interactive map.
- Search results are displayed both on the map (as markers) and in a list.
- The search radius is visualized as a circle on the map.
- Clicking on a restaurant in the list highlights it on the map.

## Geospatial Query Details

The geospatial search uses Solr's `{!geofilt}` query parser with the following parameters:
- `sfield`: The field containing the location data (in this case, `location`)
- `pt`: The center point for the search (latitude and longitude)
- `d`: The distance in kilometers (the search radius)

Example query:
```
{!geofilt sfield=location pt=40.7128,-74.0060 d=5}
```

This finds all documents within 5 kilometers of the coordinates 40.7128° N, 74.0060° W (New York City).

## Customization

### Adding More Restaurant Data

Edit the `load-sample-data.js` file to add more restaurants or modify existing ones. Each restaurant should have:
- `id`: A unique identifier
- `name`: The restaurant name
- `address`: The restaurant address
- `type`: The type of cuisine
- `description`: A short description
- `location`: The geospatial point as a string in the format "lat,lng"
- `lat`: The latitude as a number
- `lng`: The longitude as a number

## License

This project is licensed under the MIT License.
