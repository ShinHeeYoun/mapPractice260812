export function initSpatialNavigation() {
    document.addEventListener('keydown', (e) => {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (!keys.includes(e.key)) return;

        // Skip spatial nav if autocomplete dropdown is active
        if (window.customDropdownActive) return;

        const currentElement = document.activeElement;
        if (!currentElement) return;

        // Form inputs: only trigger spatial nav if cursor is at the boundary
        if (currentElement.tagName === 'INPUT' && (currentElement.type === 'text' || currentElement.type === '')) {
            const isAtStart = currentElement.selectionStart === 0 && currentElement.selectionEnd === 0;
            const isAtEnd = currentElement.selectionStart === currentElement.value.length && currentElement.selectionEnd === currentElement.value.length;
            
            if (e.key === 'ArrowLeft' && !isAtStart) return;
            if (e.key === 'ArrowRight' && !isAtEnd) return;
        }

        const focusableSelectors = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const elements = Array.from(document.querySelectorAll(focusableSelectors))
                             .filter(el => {
                                 const rect = el.getBoundingClientRect();
                                 // Check if element is visible
                                 return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
                             });

        if (elements.length === 0) return;
        if (!elements.includes(currentElement)) return;

        const currentRect = currentElement.getBoundingClientRect();
        
        // Find best candidate based on direction
        let bestElement = null;
        let minDistance = Infinity;

        elements.forEach(el => {
            if (el === currentElement) return;
            const rect = el.getBoundingClientRect();
            let distance = Infinity;
            let isValid = false;

            // Simplified spatial algorithm
            switch (e.key) {
                case 'ArrowUp':
                    if (rect.bottom <= currentRect.top + 1) {
                        const dx = (rect.left + rect.width / 2) - (currentRect.left + currentRect.width / 2);
                        const dy = currentRect.top - rect.bottom;
                        distance = Math.sqrt(dx*dx + dy*dy);
                        isValid = true;
                    }
                    break;
                case 'ArrowDown':
                    if (rect.top >= currentRect.bottom - 1) {
                        const dx = (rect.left + rect.width / 2) - (currentRect.left + currentRect.width / 2);
                        const dy = rect.top - currentRect.bottom;
                        distance = Math.sqrt(dx*dx + dy*dy);
                        isValid = true;
                    }
                    break;
                case 'ArrowLeft':
                    if (rect.right <= currentRect.left + 1) {
                        const dx = currentRect.left - rect.right;
                        const dy = (rect.top + rect.height / 2) - (currentRect.top + currentRect.height / 2);
                        distance = Math.sqrt(dx*dx + dy*dy);
                        isValid = true;
                    }
                    break;
                case 'ArrowRight':
                    if (rect.left >= currentRect.right - 1) {
                        const dx = rect.left - currentRect.right;
                        const dy = (rect.top + rect.height / 2) - (currentRect.top + currentRect.height / 2);
                        distance = Math.sqrt(dx*dx + dy*dy);
                        isValid = true;
                    }
                    break;
            }

            if (isValid && distance < minDistance) {
                minDistance = distance;
                bestElement = el;
            }
        });

        if (bestElement) {
            e.preventDefault();
            bestElement.focus();
        }
    });
}
