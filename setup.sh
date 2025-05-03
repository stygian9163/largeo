#!/bin/bash

# Script to set up the Geospatial Search application

# Display welcome message
echo "Setting up Geospatial Search application with Solr and Leaflet.js..."

# Create necessary directories
echo "Creating directory structure..."
mkdir -p app/public/css app/public/js

# Copy files to appropriate locations
echo "Copying files to their respective locations..."

# Create the app directory if it doesn't exist
if [ ! -d "app" ]; then
  mkdir app
fi

# Move Node.js application files
cp app.js app/
cp load-sample-data.js app/
cp package.json app/

# Create public directory and subdirectories
mkdir -p app/public/css app/public/js

# Move frontend files
cp index.html app/public/
cp styles.css app/public/css/
cp map.js app/public/js/

echo "Starting the application with Docker Compose..."
docker-compose up -d

echo "------------------------------------------------"
echo "Setup completed! The application is now running."
echo "Access the application at: http://localhost:3000"
echo "------------------------------------------------"
