import { state, setPlaceMarkers } from '../config/state.js';

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
}

export function initPlaces() {
    const placesBtn = document.getElementById('places-btn');
    const placesInput = document.getElementById('places-input');
    const placesCategory = document.getElementById('places-category');
    const placesSort = document.getElementById('places-sort');
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
        const sortBy = placesSort.value;

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
            const baseLat = location.lat();
            const baseLng = location.lng();

            if (state.map) {
                state.map.setCenter(location);
                state.map.setZoom(15);
            }

            const request = {
                location: location,
                radius: 1000,
                type: type
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
                    
                    // Sort Results
                    placesResults.sort((a, b) => {
                        if (sortBy === 'distance') {
                            const distA = getDistance(baseLat, baseLng, a.geometry.location.lat(), a.geometry.location.lng());
                            const distB = getDistance(baseLat, baseLng, b.geometry.location.lat(), b.geometry.location.lng());
                            return distA - distB;
                        } else if (sortBy === 'rating') {
                            const ratingA = a.rating || 0;
                            const reviewsA = a.user_ratings_total || 0;
                            const penaltyA = reviewsA === 0 ? 5 : (10 / (reviewsA + 1));
                            const scoreA = ratingA - penaltyA;

                            const ratingB = b.rating || 0;
                            const reviewsB = b.user_ratings_total || 0;
                            const penaltyB = reviewsB === 0 ? 5 : (10 / (reviewsB + 1));
                            const scoreB = ratingB - penaltyB;

                            return scoreB - scoreA; // descending
                        }
                        return 0;
                    });

                    let html = `<div class="newspaper-article-box">
                                    <h3>Local ${placesCategory.options[placesCategory.selectedIndex].text} near ${address}</h3>
                                    <table class="newspaper-table">
                                        <thead>
                                            <tr>
                                                <th style="width: 30%;">Name</th>
                                                <th style="width: 50%;">Address</th>
                                                <th style="width: 20%;">Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody>`;

                    const newMarkers = [];
                    placesResults.forEach(place => {
                        const m = new google.maps.Marker({
                            map: state.map,
                            position: place.geometry.location,
                            title: place.name
                        });
                        newMarkers.push(m);

                        const rating = place.rating ? `${place.rating} (${place.user_ratings_total})` : 'N/A';
                        const addr = place.vicinity || 'Address N/A';
                        
                        html += `
                            <tr>
                                <td><strong>${place.name}</strong></td>
                                <td>${addr}</td>
                                <td>★ ${rating}</td>
                            </tr>
                        `;
                    });
                    
                    setPlaceMarkers(newMarkers);

                    html += `</tbody></table></div>`;
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
