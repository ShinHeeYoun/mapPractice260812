import { state, setPlaceMarkers } from '../config/state.js';

export function initPlaces() {
    const placesBtn = document.getElementById('places-btn');
    const placesInput = document.getElementById('places-input');
    const placesCategory = document.getElementById('places-category');
    const placesResultContainer = document.getElementById('places-result-container');
    const mapContainer = document.getElementById('map-container');

    if (!placesBtn) return;

    placesBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            placesBtn.click();
        }
    });

    placesBtn.addEventListener('click', () => {
        const address = placesInput.value.trim();
        const type = placesCategory.value;

        if (!address) {
            alert("Please enter a base location first.");
            return;
        }

        const lastFocused = document.activeElement;

        placesBtn.textContent = 'SEARCHING...';
        placesBtn.disabled = true;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status !== 'OK' || !results[0]) {
                placesBtn.textContent = 'SEARCH DIRECTORY';
                placesBtn.disabled = false;
                if (lastFocused) lastFocused.focus();
                alert("Could not locate the specified address.");
                return;
            }

            const location = results[0].geometry.location;

            if (state.map) {
                state.map.setCenter(location);
                state.map.setZoom(15);
            }

            const request = {
                location: location,
                radius: '1000',
                type: [type]
            };

            const placesService = new google.maps.places.PlacesService(state.map);
            placesService.nearbySearch(request, (placesResults, placesStatus) => {
                placesBtn.textContent = 'SEARCH DIRECTORY';
                placesBtn.disabled = false;
                if (lastFocused) lastFocused.focus();

                state.placeMarkers.forEach(m => m.setMap(null));
                setPlaceMarkers([]);
                
                if (state.marker) state.marker.setMap(null);
                if (state.directionsRenderer) state.directionsRenderer.setDirections({routes: []});

                if (placesStatus === 'OK' && placesResults.length > 0) {
                    mapContainer.classList.remove('hidden');
                    placesResultContainer.classList.remove('hidden');
                    
                    let html = `<div class="newspaper-article-box">
                                    <h3>Local ${placesCategory.options[placesCategory.selectedIndex].text} near ${address}</h3>
                                    <div class="places-grid">`;

                    const newMarkers = [];
                    placesResults.forEach(place => {
                        const m = new google.maps.Marker({
                            map: state.map,
                            position: place.geometry.location,
                            title: place.name
                        });
                        newMarkers.push(m);

                        const rating = place.rating ? `${place.rating} / 5.0 (${place.user_ratings_total} reviews)` : 'No ratings yet';
                        const addr = place.vicinity || '';
                        
                        html += `
                            <div class="place-card">
                                <div class="place-name">${place.name}</div>
                                <div class="place-rating">⭐ ${rating}</div>
                                <div class="place-address">${addr}</div>
                            </div>
                        `;
                    });
                    
                    setPlaceMarkers(newMarkers);

                    html += `</div></div>`;
                    placesResultContainer.innerHTML = html;
                    
                } else {
                    placesResultContainer.classList.remove('hidden');
                    placesResultContainer.innerHTML = `
                        <div class="newspaper-article-box">
                            <h3>Directory Search Failed</h3>
                            <div class="result-row error-text">No results found for this category nearby.</div>
                        </div>
                    `;
                }
            });
        });
    });
}
