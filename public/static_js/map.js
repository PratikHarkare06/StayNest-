// Map initialization - runs immediately when script loads
console.log("Map script loaded");

// Check if map container exists
const mapContainer = document.getElementById('map');
if (!mapContainer) {
    console.error("Map container #map not found!");
} else {
    console.log("Map container found");

    // Check if listing data exists
    if (typeof listing === 'undefined' || !listing) {
        console.error("Listing data not found! Showing error message.");
        mapContainer.innerHTML = '<div class="d-flex align-items-center justify-content-center h-100 bg-light"><div class="text-center p-4"><i class="fa-solid fa-map-location-dot fa-3x text-muted mb-3"></i><p class="text-muted mb-0">Map location unavailable</p></div></div>';
    } else {
        console.log("Listing data found:", listing);

        // Check if coordinates exist and are valid
        const validCoordinates = listing.geometry &&
            listing.geometry.coordinates &&
            listing.geometry.coordinates.length === 2 &&
            !isNaN(listing.geometry.coordinates[0]) &&
            !isNaN(listing.geometry.coordinates[1]);

        if (validCoordinates) {
            const coordinates = listing.geometry.coordinates; // [lng, lat] from GeoJSON
            const [lng, lat] = coordinates;

            console.log("Initializing map with coordinates:", lat, lng);

            try {
                // Leaflet expects [lat, lng]
                var map = L.map('map').setView([lat, lng], 13);

                // Use standard OpenStreetMap tiles (no API key required)
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                }).addTo(map);

                // Add Marker
                L.marker([lat, lng]).addTo(map)
                    .bindPopup(`<h4>${listing.location || "Exact Location"}</h4><p>Exact location will be provided after booking</p>`)
                    .openPopup();

                console.log("Map initialized successfully");

                // Force map to resize after a short delay (fixes rendering issues)
                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            } catch (error) {
                console.error("Error initializing map:", error);
                mapContainer.innerHTML = '<div class="d-flex align-items-center justify-content-center h-100 bg-light"><div class="text-center p-4"><i class="fa-solid fa-triangle-exclamation fa-3x text-danger mb-3"></i><p class="text-danger mb-0">Error loading map: ' + error.message + '</p></div></div>';
            }
        } else {
            // Fallback View if coordinates are missing
            console.warn("Invalid or missing coordinates. Showing default location.");

            try {
                var map = L.map('map').setView([20.5937, 78.9629], 5); // Center of India

                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                }).addTo(map);

                // Add a marker
                L.marker([20.5937, 78.9629]).addTo(map)
                    .bindPopup("<h5>Location not available</h5><p>Showing default map view.</p>");

                console.log("Map initialized with default location");

                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            } catch (error) {
                console.error("Error initializing fallback map:", error);
                mapContainer.innerHTML = '<div class="d-flex align-items-center justify-content-center h-100 bg-light"><div class="text-center p-4"><i class="fa-solid fa-triangle-exclamation fa-3x text-danger mb-3"></i><p class="text-danger mb-0">Error loading map: ' + error.message + '</p></div></div>';
            }
        }
    }
}
