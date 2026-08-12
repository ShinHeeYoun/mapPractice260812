let map;
let marker;
let directionsService;
let directionsRenderer;

// Callback for Google Maps JS API
function initMap() {
    const initialLocation = { lat: 37.5665, lng: 126.9780 };
    
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialLocation,
        zoom: 13,
        styles: [
            {
                featureType: "all",
                elementType: "all",
                stylers: [{ saturation: -100 }]
            }
        ]
    });

    marker = new google.maps.Marker({
        map: map,
        position: initialLocation,
    });

    // Directions Setup
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false
    });

    // Autocomplete Setup
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    
    function attachPreserveInputLogic(inputEl) {
        let typedValue = '';
        
        // Save the actual user typing
        inputEl.addEventListener('input', (e) => {
            typedValue = e.target.value;
        });

        // Prevent Google Autocomplete from changing the input text when using arrow keys
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                setTimeout(() => {
                    inputEl.value = typedValue;
                }, 10);
            }
        });
    }

    if (originInput && destinationInput) {
        new google.maps.places.Autocomplete(originInput);
        new google.maps.places.Autocomplete(destinationInput);
        attachPreserveInputLogic(originInput);
        attachPreserveInputLogic(destinationInput);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Set Header Date
    const dateSpan = document.getElementById('current-date');
    if (dateSpan) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateSpan.textContent = new Date().toLocaleDateString('en-US', options).toUpperCase();
    }

    // 2. Tab Navigation Logic (SPA)
    const tabs = document.querySelectorAll('#nav-tabs a');
    const contents = document.querySelectorAll('.tab-content');
    const mapContainer = document.getElementById('map-container');
    const dirResultContainer = document.getElementById('directions-result-container');
    const resultContainer = document.getElementById('map-result-container');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');

            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Hide map container when switching tabs (unless results exist)
            if (targetId === 'section-intro') {
                mapContainer.classList.add('hidden');
            } else if (targetId === 'section-map-geocode' && !resultContainer.classList.contains('hidden')) {
                mapContainer.classList.remove('hidden');
            } else if (targetId === 'section-map-directions' && !dirResultContainer.classList.contains('hidden')) {
                mapContainer.classList.remove('hidden');
            } else {
                mapContainer.classList.add('hidden');
            }
        });
    });

    // 3. Geocoding API Logic
    const geocodeBtn = document.getElementById('geocode-btn');
    const addressInput = document.getElementById('address-input');

    if (geocodeBtn && addressInput) {
        
        addressInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.isComposing) {
                e.preventDefault(); 
                geocodeBtn.click();
            }
        });

        geocodeBtn.addEventListener('click', () => {
            const address = addressInput.value.trim();
            if (!address) {
                alert("Please enter a location first.");
                return;
            }

            geocodeBtn.textContent = 'DISPATCHING...';
            geocodeBtn.disabled = true;

            const payload = {
                action: "geocode",
                data: {
                    address: address
                }
            };

            fetch('service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                geocodeBtn.textContent = 'DISPATCH TELEGRAM';
                geocodeBtn.disabled = false;
                resultContainer.classList.remove('hidden');

                if (data.status === 'OK' && data.results && data.results.length > 0) {
                    const result = data.results[0];
                    const lat = result.geometry.location.lat;
                    const lng = result.geometry.location.lng;
                    const formattedAddress = result.formatted_address;

                    resultContainer.innerHTML = `
                        <div class="newspaper-article-box">
                            <h3>Telegraph Received</h3>
                            <div class="result-row"><span class="result-label">Location Found:</span> ${formattedAddress}</div>
                            <div class="result-row"><span class="result-label">Latitude:</span> ${lat}</div>
                            <div class="result-row"><span class="result-label">Longitude:</span> ${lng}</div>
                        </div>
                    `;

                    if (map && marker) {
                        // Clear directions if any
                        if(directionsRenderer) directionsRenderer.setDirections({routes: []});
                        
                        marker.setMap(map); // Ensure marker is visible
                        const newPos = { lat: lat, lng: lng };
                        map.setCenter(newPos);
                        map.setZoom(15);
                        marker.setPosition(newPos);
                        mapContainer.classList.remove('hidden');
                    }
                    
                } else {
                    const statusReason = data.error_message || data.message || data.status;
                    resultContainer.innerHTML = `
                        <div class="newspaper-article-box">
                            <h3>Telegram Failed</h3>
                            <div class="result-row error-text">Reason: ${statusReason}</div>
                        </div>
                    `;
                }
            })
            .catch(err => {
                geocodeBtn.textContent = 'DISPATCH TELEGRAM';
                geocodeBtn.disabled = false;
                resultContainer.classList.remove('hidden');
                resultContainer.innerHTML = `
                    <div class="newspaper-article-box">
                        <h3>Critical System Failure</h3>
                        <div class="result-row">${err.message}</div>
                    </div>
                `;
            });
        });
    }

    // 4. Directions Logic
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    const directionsBtn = document.getElementById('directions-btn');

    if (directionsBtn) {
        
        // Custom ArrowDown navigation (only if dropdown is not open)
        const isDropdownOpen = () => {
            return Array.from(document.querySelectorAll('.pac-container')).some(el => el.offsetParent !== null);
        };
        
        originInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' && !isDropdownOpen()) {
                e.preventDefault();
                destinationInput.focus();
            }
        });
        
        destinationInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' && !isDropdownOpen()) {
                e.preventDefault();
                directionsBtn.focus();
            }
        });

        // Button execution on Enter (when focused)
        directionsBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                directionsBtn.click();
            }
        });

        directionsBtn.addEventListener('click', () => {
            const origin = originInput.value.trim();
            const destination = destinationInput.value.trim();

            if (!origin || !destination) {
                alert("Please provide both origin and destination.");
                return;
            }

            directionsBtn.textContent = 'CALCULATING...';
            directionsBtn.disabled = true;

            const request = {
                origin: origin,
                destination: destination,
                travelMode: 'TRANSIT', // Prefer transit for costs
            };

            directionsService.route(request, (result, status) => {
                directionsBtn.textContent = 'CALCULATE ROUTE';
                directionsBtn.disabled = false;
                
                dirResultContainer.classList.remove('hidden');
                
                if (status === 'OK') {
                    // Hide geocode marker
                    if (marker) marker.setMap(null);
                    
                    directionsRenderer.setDirections(result);
                    mapContainer.classList.remove('hidden');

                    const route = result.routes[0];
                    const leg = route.legs[0];
                    
                    const distance = leg.distance.text;
                    const duration = leg.duration.text;
                    
                    let costText = "Not Available / Included";
                    if (route.fare && route.fare.text) {
                        costText = route.fare.text;
                    }

                    dirResultContainer.innerHTML = `
                        <div class="newspaper-article-box">
                            <h3>Journey Summary</h3>
                            <div class="result-row"><span class="result-label">From:</span> ${leg.start_address}</div>
                            <div class="result-row"><span class="result-label">To:</span> ${leg.end_address}</div>
                            <div class="result-row"><span class="result-label">Distance:</span> ${distance}</div>
                            <div class="result-row"><span class="result-label">Est. Time (Transit):</span> ${duration}</div>
                            <div class="result-row"><span class="result-label">Est. Cost:</span> ${costText}</div>
                        </div>
                    `;
                } else if (status === 'ZERO_RESULTS') {
                    dirResultContainer.innerHTML = `
                        <div class="newspaper-article-box">
                            <h3>Routing Failed</h3>
                            <div class="result-row error-text">No transit route found between these locations. Try specifying more detail.</div>
                        </div>
                    `;
                } else {
                    dirResultContainer.innerHTML = `
                        <div class="newspaper-article-box">
                            <h3>Routing Failed</h3>
                            <div class="result-row error-text">Reason: ${status}</div>
                        </div>
                    `;
                }
            });
        });
    }
});
