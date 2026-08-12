// Shared application state
export const state = {
    map: null,
    marker: null,
    directionsRenderer: null,
    placeMarkers: []
};

// Setters to allow updating the state
export function setMap(newMap) {
    state.map = newMap;
}

export function setMarker(newMarker) {
    state.marker = newMarker;
}

export function setDirectionsRenderer(newRenderer) {
    state.directionsRenderer = newRenderer;
}

export function setPlaceMarkers(newMarkers) {
    state.placeMarkers = newMarkers;
}
