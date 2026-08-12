export function initTabs() {
    const tabs = document.querySelectorAll('#nav-tabs a');
    const contents = document.querySelectorAll('.tab-content');
    const mapContainer = document.getElementById('map-container');
    const dirResultContainer = document.getElementById('directions-result-container');
    const resultContainer = document.getElementById('map-result-container');
    const itineraryContainer = document.getElementById('itinerary-container');
    const placesResultContainer = document.getElementById('places-result-container');

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
                if (itineraryContainer) itineraryContainer.classList.add('hidden');
                if (placesResultContainer) placesResultContainer.classList.add('hidden');
            } else if (targetId === 'section-map-geocode' && !resultContainer.classList.contains('hidden')) {
                mapContainer.classList.remove('hidden');
                if (itineraryContainer) itineraryContainer.classList.add('hidden');
                if (placesResultContainer) placesResultContainer.classList.add('hidden');
            } else if (targetId === 'section-map-directions' && !dirResultContainer.classList.contains('hidden')) {
                mapContainer.classList.remove('hidden');
                if (itineraryContainer && itineraryContainer.innerHTML.trim() !== '') itineraryContainer.classList.remove('hidden');
                if (placesResultContainer) placesResultContainer.classList.add('hidden');
            } else if (targetId === 'section-map-places' && !placesResultContainer.classList.contains('hidden')) {
                mapContainer.classList.remove('hidden');
                if (itineraryContainer) itineraryContainer.classList.add('hidden');
            } else {
                mapContainer.classList.add('hidden');
                if (itineraryContainer) itineraryContainer.classList.add('hidden');
                if (placesResultContainer) placesResultContainer.classList.add('hidden');
            }
        });
    });
}
