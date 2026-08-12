import { state, setPlaceMarkers } from '../config/state.js';
import { i18n } from '../config/i18n.js';

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
                            <tr class="place-row" data-place-id="${place.place_id}">
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

    // Modal Event Delegation
    placesResultContainer.addEventListener('click', (e) => {
        const row = e.target.closest('.place-row');
        if (!row) return;

        const placeId = row.getAttribute('data-place-id');
        if (!placeId) return;

        const placesService = new google.maps.places.PlacesService(state.map);
        placesService.getDetails({
            placeId: placeId,
            fields: ['name', 'rating', 'formatted_address', 'formatted_phone_number', 'opening_hours', 'reviews']
        }, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                showModal(place);
            } else {
                alert("Could not load details for this location.");
            }
        });
    });

    // Modal Close Logic
    const backdrop = document.getElementById('modal-backdrop');
    const modal = document.getElementById('newspaper-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    
    function closeModal() {
        backdrop.classList.add('hidden');
        modal.classList.add('hidden');
    }

    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
}

function showModal(place) {
    const backdrop = document.getElementById('modal-backdrop');
    const modal = document.getElementById('newspaper-modal');
    const content = document.getElementById('modal-content');
    
    if (!backdrop || !modal || !content) return;

    const lang = window.APP_LANG || 'en';
    const dict = i18n[lang];

    let reviewsHtml = '';
    if (place.reviews && place.reviews.length > 0) {
        const topReviews = place.reviews.slice(0, 3);
        reviewsHtml = topReviews.map(r => `
            <div class="review-box">
                <strong>${r.author_name} (★ ${r.rating})</strong>
                <p style="font-size: 0.95rem; margin-top: 5px;">"${r.text}"</p>
            </div>
        `).join('');
    } else {
        reviewsHtml = `<p>${dict.no_reviews || 'No reviews available.'}</p>`;
    }

    const phone = place.formatted_phone_number || 'N/A';
    const hours = place.opening_hours && place.opening_hours.weekday_text 
        ? `<ul style="list-style:none; padding:0;">${place.opening_hours.weekday_text.map(h => `<li>${h}</li>`).join('')}</ul>`
        : 'N/A';

    content.innerHTML = `
        <h3>${place.name} <span style="font-size: 1rem; color: #555;">(★ ${place.rating || 'N/A'})</span></h3>
        <p><strong>${dict.lbl_address || 'ADDRESS'}:</strong><br/> ${place.formatted_address}</p>
        <p><strong>${dict.lbl_phone || 'PHONE'}:</strong><br/> ${phone}</p>
        <p><strong>${dict.lbl_hours || 'HOURS'}:</strong><br/> ${hours}</p>
        <div style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px;">
            <strong style="text-transform: uppercase;">${dict.lbl_recent_reviews || 'Recent Reviews'}</strong>
            ${reviewsHtml}
        </div>
    `;

    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
}
