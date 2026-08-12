import { switchToNextTab } from './tabs.js';

export function initPageTurnEffect() {
    const fold = document.getElementById('page-fold');
    if (!fold) return;

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    const threshold = 150; // pixels to drag before triggering page turn

    function startDrag(e) {
        isDragging = true;
        startX = e.clientX || (e.touches && e.touches[0].clientX);
        fold.classList.add('dragging');
        e.preventDefault();
    }

    function doDrag(e) {
        if (!isDragging) return;
        
        currentX = e.clientX || (e.touches && e.touches[0].clientX);
        const diffX = startX - currentX;
        
        // Only allow dragging to the left
        if (diffX > 0) {
            // Calculate a visual size based on drag distance
            const newSize = Math.min(50 + diffX * 0.5, 200); 
            fold.style.borderBottomWidth = `${newSize}px`;
            fold.style.borderLeftWidth = `${newSize}px`;
        }
    }

    function stopDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        fold.classList.remove('dragging');
        
        const diffX = startX - currentX;
        
        // Reset visual styles
        fold.style.borderBottomWidth = '';
        fold.style.borderLeftWidth = '';

        if (diffX > threshold) {
            // Add a brief animation or transition effect here if desired
            document.body.style.opacity = '0.7';
            setTimeout(() => {
                switchToNextTab();
                document.body.style.opacity = '1';
            }, 100);
        }
    }

    fold.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);

    // Touch support for mobile
    fold.addEventListener('touchstart', startDrag, {passive: false});
    document.addEventListener('touchmove', doDrag, {passive: false});
    document.addEventListener('touchend', stopDrag);
}
