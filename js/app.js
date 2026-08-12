let map;
let marker;

// Callback for Google Maps JS API
function initMap() {
    // Default location (Seoul)
    const initialLocation = { lat: 37.5665, lng: 126.9780 };
    
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialLocation,
        zoom: 13,
        // Using a greyscale style to match the newspaper theme
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

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');

            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 3. Map API Logic
    const geocodeBtn = document.getElementById('geocode-btn');
    const addressInput = document.getElementById('address-input');
    const resultContainer = document.getElementById('map-result-container');
    const mapContainer = document.getElementById('map-container');

    if (geocodeBtn && addressInput) {
        
        // Support Enter key
        addressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
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

                    // Update visual map
                    if (map && marker) {
                        const newPos = { lat: lat, lng: lng };
                        map.setCenter(newPos);
                        map.setZoom(15);
                        marker.setPosition(newPos);
                        mapContainer.classList.remove('hidden');
                    }
                    
                } else if (data.status === 'error') {
                    resultContainer.innerHTML = `
                        <div class="newspaper-article-box">
                            <h3>Communication Error</h3>
                            <div class="result-row error-text">System Error: ${data.message}</div>
                        </div>
                    `;
                } else {
                    const statusReason = data.error_message || data.status;
                    resultContainer.innerHTML = `
                        <div class="newspaper-article-box">
                            <h3>Telegram Failed</h3>
                            <div class="result-row error-text">Could not resolve location. Reason: ${statusReason}</div>
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
                        <div class="result-row error-text">Failed to connect to the telegraph office.</div>
                        <div class="result-row">${err.message}</div>
                    </div>
                `;
            });
        });
    }
});
