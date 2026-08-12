let map;
let marker;
let directionsService;
let directionsRenderer;
let autocompleteService;

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

    // Custom Autocomplete Setup
    autocompleteService = new google.maps.places.AutocompleteService();
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    const addressInput = document.getElementById('address-input');
    
    if (originInput) setupCustomAutocomplete(originInput);
    if (destinationInput) setupCustomAutocomplete(destinationInput);
    if (addressInput) setupCustomAutocomplete(addressInput);
}

function setupCustomAutocomplete(inputEl) {
    let dropdownContainer = null;
    let predictions = [];
    let selectedIndex = -1;

    const closeDropdown = () => {
        if (dropdownContainer) {
            dropdownContainer.remove();
            dropdownContainer = null;
        }
        selectedIndex = -1;
    };

    const renderDropdown = () => {
        closeDropdown();
        if (predictions.length === 0) return;

        dropdownContainer = document.createElement('ul');
        dropdownContainer.className = 'custom-ac-container';
        
        const rect = inputEl.getBoundingClientRect();
        dropdownContainer.style.top = (rect.bottom + window.scrollY) + 'px';
        dropdownContainer.style.left = (rect.left + window.scrollX) + 'px';
        dropdownContainer.style.width = rect.width + 'px';

        predictions.forEach((pred, index) => {
            const li = document.createElement('li');
            li.className = 'custom-ac-item';
            
            const mainText = pred.structured_formatting ? pred.structured_formatting.main_text : pred.description;
            const subText = pred.structured_formatting ? pred.structured_formatting.secondary_text : '';
            
            li.innerHTML = `<span class="custom-ac-query">${mainText}</span> ${subText}`;

            li.addEventListener('click', () => {
                inputEl.value = pred.description;
                closeDropdown();
                inputEl.focus();
            });
            dropdownContainer.appendChild(li);
        });

        document.body.appendChild(dropdownContainer);
    };

    const updateSelection = () => {
        if (!dropdownContainer) return;
        const items = dropdownContainer.querySelectorAll('.custom-ac-item');
        items.forEach((item, idx) => {
            if (idx === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    };

    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDropdown();
            e.stopPropagation();
            return;
        }
        
        if (e.key === 'Enter' && !e.isComposing) {
            e.preventDefault();
            e.stopPropagation(); // Block other enter listeners
            
            if (dropdownContainer && selectedIndex >= 0 && selectedIndex < predictions.length) {
                inputEl.value = predictions[selectedIndex].description;
                closeDropdown();
            } else {
                const val = inputEl.value.trim();
                if (!val) return;
                
                autocompleteService.getPlacePredictions({ input: val }, (results, status) => {
                    if (status === 'OK' && results && results.length > 0) {
                        predictions = results;
                    } else {
                        // Fallback mock prediction if Google API returns ZERO_RESULTS for a highly specific query
                        predictions = [{
                            description: val,
                            structured_formatting: { main_text: val, secondary_text: "Selected Location" }
                        }];
                    }
                    renderDropdown();
                });
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            if (dropdownContainer) {
                e.preventDefault();
                e.stopPropagation();
                selectedIndex = (selectedIndex + 1) % predictions.length;
                updateSelection();
            }
            return;
        }

        if (e.key === 'ArrowUp') {
            if (dropdownContainer) {
                e.preventDefault();
                e.stopPropagation();
                selectedIndex = (selectedIndex - 1 + predictions.length) % predictions.length;
                updateSelection();
            }
            return;
        }
    }, true); // use capture phase to intercept early if needed

    document.addEventListener('click', (e) => {
        if (inputEl !== e.target && dropdownContainer && !dropdownContainer.contains(e.target)) {
            closeDropdown();
        }
    });
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
        // Removed Enter key auto-submit for geocode to prevent conflict with custom autocomplete
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
                        if(directionsRenderer) directionsRenderer.setDirections({routes: []});
                        marker.setMap(map);
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
                travelMode: 'TRANSIT',
            };

            directionsService.route(request, (result, status) => {
                directionsBtn.textContent = 'CALCULATE ROUTE';
                directionsBtn.disabled = false;
                
                dirResultContainer.classList.remove('hidden');
                
                if (status === 'OK') {
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

    // 5. Global 2D Spatial Navigation
    document.addEventListener('keydown', (e) => {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (!keys.includes(e.key)) return;

        // Exception 1: If Custom Autocomplete dropdown is open, let it handle ArrowUp/Down
        const isDropdownOpen = Array.from(document.querySelectorAll('.custom-ac-container')).some(el => el.offsetParent !== null);
        if (isDropdownOpen && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) return;

        const currentEl = document.activeElement;
        
        // Exception 2: If inside a text input, allow Left/Right for text cursor editing UNLESS at boundaries
        if (currentEl && currentEl.tagName === 'INPUT') {
            if (e.key === 'ArrowLeft' && currentEl.selectionStart > 0) return;
            if (e.key === 'ArrowRight' && currentEl.selectionEnd < currentEl.value.length) return;
        }

        // Gather all focusable candidates (a, input, button) that are visible
        const candidates = Array.from(document.querySelectorAll('a, input, button')).filter(el => {
            return el.offsetParent !== null && !el.disabled;
        });

        if (candidates.length === 0) return;

        if (!currentEl || !candidates.includes(currentEl)) {
            return;
        }

        const currentRect = currentEl.getBoundingClientRect();
        let bestCandidate = null;
        let minDistance = Infinity;

        candidates.forEach(candidate => {
            if (candidate === currentEl) return;
            const rect = candidate.getBoundingClientRect();
            
            const curCx = currentRect.left + currentRect.width / 2;
            const curCy = currentRect.top + currentRect.height / 2;
            const candCx = rect.left + rect.width / 2;
            const candCy = rect.top + rect.height / 2;

            let isDirectionMatch = false;
            if (e.key === 'ArrowUp' && candCy < curCy - 10) isDirectionMatch = true;
            if (e.key === 'ArrowDown' && candCy > curCy + 10) isDirectionMatch = true;
            if (e.key === 'ArrowLeft' && candCx < curCx - 10) isDirectionMatch = true;
            if (e.key === 'ArrowRight' && candCx > curCx + 10) isDirectionMatch = true;

            if (isDirectionMatch) {
                const dist = Math.sqrt(Math.pow(curCx - candCx, 2) + Math.pow(curCy - candCy, 2));
                
                let penalty = 0;
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    penalty = Math.abs(curCx - candCx) * 3;
                } else {
                    penalty = Math.abs(curCy - candCy) * 3;
                }
                
                const weightedDist = dist + penalty;

                if (weightedDist < minDistance) {
                    minDistance = weightedDist;
                    bestCandidate = candidate;
                }
            }
        });

        if (bestCandidate) {
            e.preventDefault();
            bestCandidate.focus();
        }
    });

    document.querySelectorAll('#nav-tabs a').forEach(tab => {
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                tab.click();
            }
        });
    });
});
