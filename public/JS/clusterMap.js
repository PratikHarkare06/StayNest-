// Initialize map (Center of India, zoom 4 as default)
const map = window.map = L.map('cluster-map').setView([20.5937, 78.9629], 4);

// OSM Tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = L.markerClusterGroup();
let mapProcessing = false;

// Function to render markers from a list of listings
function renderMarkers(listings) {
    markers.clearLayers();
    if (!listings || listings.length === 0) return;

    listings.forEach(listing => {
        if (listing.geometry?.coordinates?.length === 2) {
            const [lng, lat] = listing.geometry.coordinates;
            const popupContent = `
                <div class="map-popup-card">
                  <div class="map-popup-img-wrap mb-2">
                    <img src="${listing.image?.url || '/images/placeholder.jpg'}" class="w-100 rounded" style="height:100px; object-fit:cover">
                  </div>
                  <h6 class="mb-1 fw-bold"><a href="/listings/${listing._id}" class="text-decoration-none text-dark">${listing.title}</a></h6>
                  <p class="mb-0 fw-bold small">&#8377; ${listing.price.toLocaleString("en-IN")}</p>
                </div>
            `;
            const marker = L.marker([lat, lng]);
            marker.bindPopup(popupContent);
            markers.addLayer(marker);
        }
    });
    map.addLayer(markers);
}

// Function to sync listings in the sidebar with the current map viewport
async function syncListingsWithMap() {
    if (mapProcessing) return;
    
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    // Get current category from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'All';
    
    mapProcessing = true;
    
    try {
        const res = await fetch(`/listings/api/map-bounds?sw=${sw.lat},${sw.lng}&ne=${ne.lat},${ne.lng}&category=${category}`);
        const listings = await res.json();
        
        // Update Markers
        renderMarkers(listings);
        
        // Optional: Update sidebar if split view is active
        const listingsSide = document.getElementById('listings-side');
        if (listingsSide && !listingsSide.classList.contains('col-12')) {
            updateSidebarList(listings);
        }
    } catch (err) {
        console.error("Map Sync Failed:", err);
    } finally {
        mapProcessing = false;
    }
}

// Update the listing grid dynamically
function updateSidebarList(listings) {
    const listContainer = document.getElementById('listings-container');
    if (!listContainer) return;
    
    if (listings.length === 0) {
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa-solid fa-map-location-dot fa-3x text-muted opacity-25 mb-3"></i>
                <h5 class="fw-bold text-muted">No homes in this area</h5>
                <p class="text-muted small">Try zooming out or moving the map</p>
            </div>
        `;
        return;
    }

    const html = listings.map(l => `
        <div class="col mb-4 listing-fade-in shadow-hover">
          <div class="card h-100 listing-card border-0 position-relative">
            <div class="position-relative overflow-hidden rounded-4">
              <img src="${l.image?.url || '/images/placeholder.jpg'}" class="card-img-top" alt="${l.title}" style="height: 18rem; object-fit: cover" />
            </div>
            <div class="card-body px-1 pt-3">
              <a href="/listings/${l._id}" class="text-decoration-none text-dark stretched-link">
                <h6 class="fw-bold mb-0 text-truncate" style="max-width: 80%;">${l.title}</h6>
                <p class="text-muted small mb-1">${l.location}</p>
                <p class="card-text mb-0">
                  <span class="fw-bold text-dark fs-6">&#8377; ${l.price.toLocaleString("en-IN")}</span>
                  <span class="text-muted fw-normal">night</span>
                </p>
              </a>
            </div>
          </div>
        </div>
    `).join('');
    
    listContainer.innerHTML = html;
}

// Initial Render
if (typeof allListingsMap !== 'undefined' && allListingsMap.length > 0) {
    renderMarkers(allListingsMap);
}

// Listen for Map Changes
map.on('moveend', () => {
    // Only sync if map split view is open
    const mapToggle = document.getElementById("flexSwitchCheckDefaultMap");
    if (mapToggle && mapToggle.checked) {
        syncListingsWithMap();
    }
});
