import { state, setMap, setDirectionsRenderer } from './config/state.js';
import { initTabs } from './ui/tabs.js';
import { initSpatialNavigation } from './ui/spatialNav.js';
import { setupCustomAutocomplete } from './api/autocomplete.js';
import { initGeocode } from './features/geocode.js';
import { initDirections } from './features/directions.js';
import { initPlaces } from './features/places.js';
import { applyI18n } from './ui/i18n_apply.js';

// Expose initMap to the global window object so Google Maps API callback can find it
window.initMap = function() {
    const mapOptions = {
        center: { lat: 37.5665, lng: 126.9780 }, // Seoul
        zoom: 12,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
            {
                stylers: [
                    { saturation: -100 },
                    { lightness: 15 }
                ]
            }
        ]
    };
    
    setMap(new google.maps.Map(document.getElementById("map"), mapOptions));
    
    setDirectionsRenderer(new google.maps.DirectionsRenderer({
        map: state.map,
        suppressMarkers: false
    }));

    // Setup Custom Autocomplete for inputs
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    const addressInput = document.getElementById('address-input');
    const placesInput = document.getElementById('places-input');
    
    if (originInput) setupCustomAutocomplete(originInput);
    if (destinationInput) setupCustomAutocomplete(destinationInput);
    if (addressInput) setupCustomAutocomplete(addressInput);
    if (placesInput) setupCustomAutocomplete(placesInput);
};

// Initialize Application UI and Features
document.addEventListener('DOMContentLoaded', () => {
    // 1. Set Header Date
    const dateSpan = document.getElementById('current-date');
    if (dateSpan) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateSpan.textContent = new Date().toLocaleDateString('en-US', options).toUpperCase();
    }
    
    // 1. Check Auth (Simple Simulation)
    if (!localStorage.getItem('news_auth_token')) {
        console.log("No auth token found. Running as guest.");
    }

    // 1.5 Apply i18n translations
    applyI18n();

    // 2. Initialize UI Components
    initTabs();
    initSpatialNavigation();

    // 3. Initialize Feature Modules
    initGeocode();
    initDirections();
    initPlaces();
});
