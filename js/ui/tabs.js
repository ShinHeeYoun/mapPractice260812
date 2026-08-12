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

            // Hide all shared containers first
            mapContainer.classList.add('hidden');
            if (itineraryContainer) itineraryContainer.classList.add('hidden');
            if (placesResultContainer) placesResultContainer.classList.add('hidden');

            // Selectively restore based on target tab and content presence
            if (targetId === 'section-map-geocode') {
                if (resultContainer && resultContainer.innerHTML.trim() !== '') {
                    mapContainer.classList.remove('hidden');
                }
            } else if (targetId === 'section-map-directions') {
                if (dirResultContainer && dirResultContainer.innerHTML.trim() !== '') {
                    mapContainer.classList.remove('hidden');
                    if (itineraryContainer && itineraryContainer.innerHTML.trim() !== '') {
                        itineraryContainer.classList.remove('hidden');
                    }
                }
            } else if (targetId === 'section-map-places') {
                if (placesResultContainer && placesResultContainer.innerHTML.trim() !== '') {
                    mapContainer.classList.remove('hidden');
                    placesResultContainer.classList.remove('hidden');
                }
            }
        });
    });
}

export function switchToNextTab() {
    const tabs = Array.from(document.querySelectorAll('#nav-tabs a'));
    const activeIndex = tabs.findIndex(tab => tab.classList.contains('active'));
    
    if (activeIndex >= 0) {
        const nextIndex = (activeIndex + 1) % tabs.length;
        tabs[nextIndex].click(); // Simulate a user click to trigger the full logic
    }
}
