import { state, setMarker } from '../config/state.js';

export function initGeocode() {
    const geocodeBtn = document.getElementById('geocode-btn');
    const addressInput = document.getElementById('address-input');
    const resultContainer = document.getElementById('map-result-container');
    const mapContainer = document.getElementById('map-container');

    if (!geocodeBtn || !addressInput) return;

    geocodeBtn.addEventListener('click', () => {
        const address = addressInput.value.trim();
        if (!address) {
            alert("Please enter a location first.");
            return;
        }

        const lastFocused = document.activeElement;

        geocodeBtn.textContent = 'DISPATCHING...';
        geocodeBtn.disabled = true;

        const payload = {
            action: "geocode",
            data: { address: address }
        };

        fetch('service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            geocodeBtn.textContent = 'DISPATCH TELEGRAM';
            geocodeBtn.disabled = false;
            if (lastFocused) lastFocused.focus();
            
            resultContainer.classList.remove('hidden');

            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                const formattedAddress = data.results[0].formatted_address;
                
                resultContainer.innerHTML = `
                    <div class="newspaper-article-box">
                        <h3>Geocoding Success</h3>
                        <div class="result-row"><span class="result-label">Address:</span> ${formattedAddress}</div>
                        <div class="result-row"><span class="result-label">Latitude:</span> ${location.lat}</div>
                        <div class="result-row"><span class="result-label">Longitude:</span> ${location.lng}</div>
                    </div>
                `;

                if (state.map) {
                    mapContainer.classList.remove('hidden');
                    state.map.setCenter(location);
                    state.map.setZoom(15);
                    
                    if (state.marker) {
                        state.marker.setPosition(location);
                    } else {
                        setMarker(new google.maps.Marker({
                            map: state.map,
                            position: location
                        }));
                    }
                    if (state.directionsRenderer) {
                        state.directionsRenderer.setDirections({routes: []});
                    }
                    state.placeMarkers.forEach(m => m.setMap(null));
                }
            } else {
                resultContainer.innerHTML = `
                    <div class="newspaper-article-box">
                        <h3>Geocoding Failed</h3>
                        <div class="result-row error-text">Could not resolve the address. Please try another term.</div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            geocodeBtn.textContent = 'DISPATCH TELEGRAM';
            geocodeBtn.disabled = false;
            if (lastFocused) lastFocused.focus();
            
            resultContainer.classList.remove('hidden');
            resultContainer.innerHTML = `
                <div class="newspaper-article-box">
                    <h3>Connection Error</h3>
                    <div class="result-row error-text">Failed to communicate with the telegraph office (Server Error).</div>
                </div>
            `;
        });
    });
}
