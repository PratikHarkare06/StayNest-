// Initialize map
// Center of India, zoom 4
const map = window.map = L.map('cluster-map').setView([20.5937, 78.9629], 4);

// Use standard OpenStreetMap tiles (no API key required)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Initialize MarkerClusterGroup
const markers = L.markerClusterGroup();

// Add markers
if (allListingsMap && allListingsMap.length > 0) {
    allListingsMap.forEach(listing => {
        if (listing.geometry && listing.geometry.coordinates && listing.geometry.coordinates.length === 2) {
            // GeoJSON coordinates are [lng, lat], Leaflet uses [lat, lng]
            const [lng, lat] = listing.geometry.coordinates;

            // Create custom popup content
            const popupContent = `
                <div class="p-2">
                    <h6 class="mb-1"><a href="/listings/${listing._id}" class="text-decoration-none text-dark fw-bold">${listing.title}</a></h6>
                    <p class="mb-1 text-muted small">${listing.location}</p>
                    <p class="mb-0 fw-bold">&#8377; ${listing.price.toLocaleString("en-IN")}</p>
                </div>
            `;

            const marker = L.marker([lat, lng]);
            marker.bindPopup(popupContent);
            markers.addLayer(marker);
        }
    });

    map.addLayer(markers);
}
