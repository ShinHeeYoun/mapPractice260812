import { state } from '../config/state.js';

let customPolyline = null;

export function initDirections() {
    const directionsBtn = document.getElementById('directions-btn');
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    const dirResultContainer = document.getElementById('directions-result-container');
    const mapContainer = document.getElementById('map-container');
    const itineraryContainer = document.getElementById('itinerary-container');

    if (!directionsBtn) return;

    directionsBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            directionsBtn.click();
        }
    });

    directionsBtn.addEventListener('click', () => {
        const origin = originInput.value.trim();
        const destination = destinationInput.value.trim();
        const lang = window.APP_LANG || 'en';

        if (!origin || !destination) {
            alert("Please enter both origin and destination.");
            return;
        }

        const lastFocused = document.activeElement;

        directionsBtn.textContent = 'CALCULATING...';
        directionsBtn.disabled = true;

        fetch('service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'directions',
                data: { origin, destination, lang }
            })
        })
        .then(res => res.json())
        .then(result => {
            directionsBtn.textContent = 'CALCULATE ROUTE';
            directionsBtn.disabled = false;
            if (lastFocused) lastFocused.focus();
            
            dirResultContainer.classList.remove('hidden');
            
            if (result.status === 'OK' && result.routes && result.routes.length > 0) {
                if (state.marker) state.marker.setMap(null);
                state.placeMarkers.forEach(m => m.setMap(null));
                
                // We no longer use DirectionsRenderer, clear it
                if (state.directionsRenderer) state.directionsRenderer.setDirections({routes: []});
                if (customPolyline) customPolyline.setMap(null);
                
                mapContainer.classList.remove('hidden');

                const route = result.routes[0];
                const leg = route.legs[0];
                
                // Draw manual polyline
                const encodedPath = route.overview_polyline.points;
                const path = google.maps.geometry.encoding.decodePath(encodedPath);
                
                customPolyline = new google.maps.Polyline({
                    path: path,
                    strokeColor: "#0000FF",
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                    map: state.map
                });

                // Auto fit bounds
                const bounds = new google.maps.LatLngBounds();
                path.forEach(p => bounds.extend(p));
                state.map.fitBounds(bounds);

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

                // Generate Step-by-Step Itinerary
                if (itineraryContainer && leg.steps && leg.steps.length > 0) {
                    let stepsHtml = `<div class="newspaper-article-box" style="margin-top:0;">`;
                    stepsHtml += `<h3>Step-by-step Itinerary</h3>`;
                    stepsHtml += `<div class="itinerary-inline" style="font-size:1.15rem; line-height:2.0; word-break: keep-all;">`;
                    
                    const stepItems = leg.steps.map((step) => {
                        if (step.travel_mode === 'TRANSIT' && step.transit_details) {
                            const t = step.transit_details;
                            const lineColor = t.line.color || '#333';
                            const textColor = t.line.text_color || '#fff';
                            const shortName = t.line.short_name || t.line.name;
                            const vehicle = t.line.vehicle ? t.line.vehicle.name : 'Transit';
                            
                            return `<span style="font-weight:bold; white-space:nowrap;">[${vehicle}]</span> <span class="transit-line-badge" style="background-color:${lineColor}; color:${textColor};">${shortName}</span> <span style="white-space:nowrap;">(${t.departure_stop.name} - ${t.arrival_stop.name})</span>`;
                        } else {
                            const tempDiv = document.createElement("div");
                            tempDiv.innerHTML = step.html_instructions || "Walk";
                            return `<span style="font-weight:bold; white-space:nowrap;">[WALK]</span> <span style="white-space:nowrap;">${step.distance.text}</span>`;
                        }
                    });
                    
                    stepsHtml += stepItems.join(' <strong style="font-size:1.3rem; margin:0 8px; vertical-align:-2px;">&rarr;</strong> ');
                    stepsHtml += `</div></div>`;
                    
                    itineraryContainer.innerHTML = stepsHtml;
                    itineraryContainer.classList.remove('hidden');
                }

            } else if (result.status === 'ZERO_RESULTS') {
                dirResultContainer.innerHTML = `
                    <div class="newspaper-article-box">
                        <h3>Routing Failed</h3>
                        <div class="result-row error-text">No transit route found between these locations. Try specifying more detail.</div>
                    </div>
                `;
                if (itineraryContainer) itineraryContainer.classList.add('hidden');
            } else {
                dirResultContainer.innerHTML = `
                    <div class="newspaper-article-box">
                        <h3>Routing Failed</h3>
                        <div class="result-row error-text">Directions request failed due to ${result.status}.</div>
                    </div>
                `;
                if (itineraryContainer) itineraryContainer.classList.add('hidden');
            }
        })
        .catch(err => {
            directionsBtn.textContent = 'CALCULATE ROUTE';
            directionsBtn.disabled = false;
            alert("Error communicating with server.");
        });
    });
}
