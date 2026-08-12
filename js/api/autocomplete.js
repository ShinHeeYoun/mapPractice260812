let autocompleteService;
let sessionToken;

export function setupCustomAutocomplete(inputEl) {
    if (!autocompleteService) {
        autocompleteService = new google.maps.places.AutocompleteService();
        sessionToken = new google.maps.places.AutocompleteSessionToken();
    }

    // Create dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'custom-ac-container hidden';
    document.body.appendChild(dropdownContainer);

    let predictions = [];
    let selectedIndex = -1;

    function renderDropdown() {
        dropdownContainer.innerHTML = '';
        if (predictions.length === 0) {
            closeDropdown();
            return;
        }

        predictions.forEach((pred, index) => {
            const item = document.createElement('div');
            item.className = 'custom-ac-item';
            
            // Format to highlight matched text (newspaper style)
            const mainText = pred.structured_formatting.main_text;
            const secondaryText = pred.structured_formatting.secondary_text || '';
            
            item.innerHTML = `<strong>${mainText}</strong> <span style="font-size: 0.85em; color: #555;">${secondaryText}</span>`;
            
            if (index === selectedIndex) {
                item.classList.add('selected');
            }

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                selectPrediction(index);
            });

            dropdownContainer.appendChild(item);
        });

        // Position the dropdown right below the input
        const rect = inputEl.getBoundingClientRect();
        dropdownContainer.style.top = `${rect.bottom + window.scrollY}px`;
        dropdownContainer.style.left = `${rect.left + window.scrollX}px`;
        dropdownContainer.style.width = `${rect.width}px`;
        
        dropdownContainer.classList.remove('hidden');
        window.customDropdownActive = true;
    }

    function updateSelection() {
        const items = dropdownContainer.querySelectorAll('.custom-ac-item');
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
                // Auto-fill input text as user navigates
                inputEl.value = predictions[index].description;
            } else {
                item.classList.remove('selected');
            }
        });
    }

    function selectPrediction(index) {
        if (index >= 0 && index < predictions.length) {
            inputEl.value = predictions[index].description;
            
            // Fire a custom event to notify others (e.g., to generate a new session token if needed)
            inputEl.dispatchEvent(new Event('place_changed'));
        }
        closeDropdown();
    }

    function closeDropdown() {
        dropdownContainer.classList.add('hidden');
        window.customDropdownActive = false;
        selectedIndex = -1;
        // Do not empty predictions here, otherwise Enter won't be able to select if it was open
    }

    function fetchPredictions() {
        const val = inputEl.value.trim();
        if (!val) {
            predictions = [];
            closeDropdown();
            return;
        }

        const request = {
            input: val,
            sessionToken: sessionToken,
            types: ['geocode', 'establishment']
        };

        autocompleteService.getPlacePredictions(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                predictions = results;
                selectedIndex = -1;
                renderDropdown();
            } else {
                predictions = [];
                closeDropdown();
            }
        });
    }

    // Event Listeners for input
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation(); // prevent form submit or geocode trigger
            
            if (window.customDropdownActive) {
                if (selectedIndex >= 0) {
                    selectPrediction(selectedIndex);
                } else if (predictions.length > 0) {
                    selectPrediction(0);
                } else {
                    closeDropdown();
                }
            } else {
                // Fetch and open if not open
                fetchPredictions();
            }
            return;
        }

        if (window.customDropdownActive) {
            if (e.key === 'Escape') {
                closeDropdown();
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                selectedIndex = (selectedIndex + 1) % predictions.length;
                updateSelection();
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                e.stopPropagation();
                selectedIndex = (selectedIndex - 1 + predictions.length) % predictions.length;
                updateSelection();
                return;
            }
        }
    }, true); // use capture phase to intercept early if needed

    document.addEventListener('click', (e) => {
        if (inputEl !== e.target && dropdownContainer && !dropdownContainer.contains(e.target)) {
            closeDropdown();
        }
    });
}
