// ── Cluster Map — Lazy initialized (only when map panel is visible) ──
let mapInstance = null;     // Leaflet map instance
let markersLayer = null;    // MarkerClusterGroup
let mapReady    = false;    // Has the map been fully initialised?

/**
 * Initialise Leaflet map inside #cluster-map.
 * Safe to call multiple times — skips if already initialised.
 */
function initClusterMap() {
    if (mapReady) return;

    const container = document.getElementById('cluster-map');
    if (!container) return;

    // Centre of India, zoom 4
    mapInstance = L.map('cluster-map').setView([20.5937, 78.9629], 4);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    markersLayer = L.markerClusterGroup();
    mapReady = true;

    // Render markers from page data
    if (typeof allListingsMap !== 'undefined' && allListingsMap.length > 0) {
        renderMarkers(allListingsMap);
    }

    // Sync sidebar when panning/zooming (only while map is open)
    mapInstance.on('moveend', () => {
        const section = document.getElementById('map-section');
        if (section && section.style.display !== 'none') {
            syncListingsWithMap();
        }
    });

    // IMPORTANT: tell Leaflet to recalculate layout after the div becomes visible
    setTimeout(() => mapInstance.invalidateSize(), 100);
}

/** Render markers from a list of listing objects */
function renderMarkers(listings) {
    if (!markersLayer) return;
    markersLayer.clearLayers();

    listings.forEach(listing => {
        if (listing.geometry?.coordinates?.length === 2) {
            const [lng, lat] = listing.geometry.coordinates;
            const popupContent = `
                <div class="map-popup-card">
                  <div class="map-popup-img-wrap mb-2">
                    <img src="${listing.image?.url || '/images/placeholder.jpg'}" class="w-100 rounded" style="height:100px; object-fit:cover">
                  </div>
                  <h6 class="mb-1 fw-bold"><a href="/listings/${listing._id}" class="text-decoration-none text-dark">${listing.title}</a></h6>
                  <p class="mb-0 fw-bold small">&#8377; ${listing.price.toLocaleString('en-IN')}</p>
                </div>
            `;
            const marker = L.marker([lat, lng]);
            marker.bindPopup(popupContent);
            markersLayer.addLayer(marker);
        }
    });

    mapInstance.addLayer(markersLayer);
}

/** Fetch listings within the current map viewport and update the sidebar */
async function syncListingsWithMap() {
    if (!mapInstance) return;

    const bounds = mapInstance.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const urlParams = new URLSearchParams(window.location.search);
    const category  = urlParams.get('category') || 'All';

    try {
        const res      = await fetch(`/listings/api/map-bounds?sw=${sw.lat},${sw.lng}&ne=${ne.lat},${ne.lng}&category=${category}`);
        const listings = await res.json();
        renderMarkers(listings);
    } catch (err) {
        console.error('Map Sync Failed:', err);
    }
}

/** Toggle the map panel open / closed. Called by the button in index.ejs */
window.toggleMapView = function() {
    const section = document.getElementById('map-section');
    const btn     = document.getElementById('mapToggleBtn');
    if (!section) return;

    const isHidden = section.style.display === 'none' || section.style.display === '';

    if (isHidden) {
        section.style.display = 'block';
        if (btn) btn.innerHTML = '<i class="fa-solid fa-xmark me-1"></i> Hide map';
        // Lazy init on first open, or just recalculate size on subsequent opens
        if (!mapReady) {
            initClusterMap();
        } else {
            setTimeout(() => mapInstance.invalidateSize(), 100);
        }
        // Scroll into view smoothly
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        section.style.display = 'none';
        if (btn) btn.innerHTML = '<i class="fa-solid fa-map me-1"></i> Show map';
    }
};
