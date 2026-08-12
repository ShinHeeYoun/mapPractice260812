import { state, setPlaceMarkers } from '../config/state.js';
import { i18n } from '../config/i18n.js';

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
        const lang = window.APP_LANG || 'en';

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

            // Call our Java Backend for places
            fetch('service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'places',
                    data: {
                        lat: baseLat,
                        lng: baseLng,
                        type: type,
                        sortBy: sortBy,
                        lang: lang
                    }
                })
            })
            .then(res => res.json())
            .then(root => {
                placesBtn.textContent = 'SEARCH DIRECTORY';
                placesBtn.disabled = false;
                if (lastFocused) lastFocused.focus();

                state.placeMarkers.forEach(m => m.setMap(null));
                setPlaceMarkers([]);
                
                if (state.marker) state.marker.setMap(null);
                if (state.directionsRenderer) state.directionsRenderer.setDirections({routes: []});

                const placesResults = root.results || [];
                const placesStatus = root.status || 'ERROR';

                if (placesStatus === 'OK' && placesResults.length > 0) {
                    mapContainer.classList.remove('hidden');
                    placesResultContainer.classList.remove('hidden');

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
                        const mLat = place.geometry.location.lat;
                        const mLng = place.geometry.location.lng;
                        const pos = { lat: mLat, lng: mLng };

                        const m = new google.maps.Marker({
                            map: state.map,
                            position: pos,
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
            })
            .catch(err => {
                placesBtn.textContent = 'SEARCH DIRECTORY';
                placesBtn.disabled = false;
                alert("Error communicating with server.");
            });
        });
    });

    // Modal Event Delegation
    placesResultContainer.addEventListener('click', (e) => {
        const row = e.target.closest('.place-row');
        if (!row) return;

        const placeId = row.getAttribute('data-place-id');
        if (!placeId) return;

        const lang = window.APP_LANG || 'en';

        // Call our Java Backend for details
        fetch('service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'placeDetails',
                data: { placeId: placeId, lang: lang }
            })
        })
        .then(res => res.json())
        .then(root => {
            if (root.status === 'OK' && root.result) {
                showModal(root.result);
            } else {
                alert("Could not load details for this location.");
            }
        })
        .catch(err => {
            alert("Error communicating with server.");
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
