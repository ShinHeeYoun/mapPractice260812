document.addEventListener('DOMContentLoaded', () => {
    // 1. Set Header Date
    const dateSpan = document.getElementById('current-date');
    if (dateSpan) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateSpan.textContent = new Date().toLocaleDateString('en-US', options).toUpperCase();
    }

    // 2. Tab Navigation Logic (SPA)
    const tabs = document.querySelectorAll('#nav-tabs a');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active to clicked tab
            tab.classList.add('active');

            // Show target content
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 3. Whac-A-Mole Logic
    let score = 0;
    let gameInterval = null;
    let activeMoleKey = null;
    let isPlaying = false;

    const scoreDisplay = document.getElementById('score');
    const startBtn = document.getElementById('start-game-btn');
    const cells = document.querySelectorAll('.grid-cell');

    // Numpad to KeyCode mapping
    const validKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    startBtn.addEventListener('click', () => {
        if (isPlaying) return;
        
        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = score;
        startBtn.textContent = 'PLAYING...';
        
        if (gameInterval) clearInterval(gameInterval);

        gameInterval = setInterval(popUpMole, 800);

        setTimeout(() => {
            clearInterval(gameInterval);
            isPlaying = false;
            removeMole();
            startBtn.textContent = 'START GAME';
            alert(`Game Over! The Times reports your final score: ${score}`);
        }, 30000); // 30 seconds
    });

    function popUpMole() {
        removeMole();
        
        const randomIdx = Math.floor(Math.random() * validKeys.length);
        activeMoleKey = validKeys[randomIdx];

        const targetCell = document.querySelector(`.grid-cell[data-key="${activeMoleKey}"]`);
        if (targetCell) {
            targetCell.classList.add('mole');
        }
    }

    function removeMole() {
        cells.forEach(cell => cell.classList.remove('mole', 'hit'));
        activeMoleKey = null;
    }

    document.addEventListener('keydown', (e) => {
        if (!isPlaying) return;

        const pressedKey = e.key; 

        if (validKeys.includes(pressedKey)) {
            if (pressedKey === activeMoleKey) {
                // Hit!
                score++;
                scoreDisplay.textContent = score;
                const hitCell = document.querySelector(`.grid-cell[data-key="${pressedKey}"]`);
                hitCell.classList.remove('mole');
                hitCell.classList.add('hit');
                activeMoleKey = null; // Prevent double scoring
            }
        }
    });

    // 4. Map API Logic
    const geocodeBtn = document.getElementById('geocode-btn');
    const addressInput = document.getElementById('address-input');
    const resultContainer = document.getElementById('map-result-container');

    if (geocodeBtn) {
        geocodeBtn.addEventListener('click', () => {
            const address = addressInput.value.trim();
            if (!address) {
                alert("Please enter a location first.");
                return;
            }

            geocodeBtn.textContent = 'DISPATCHING...';
            geocodeBtn.disabled = true;

            const payload = {
                action: "geocode",
                data: {
                    address: address
                }
            };

            fetch('service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                geocodeBtn.textContent = 'DISPATCH TELEGRAM';
                geocodeBtn.disabled = false;
                resultContainer.classList.remove('hidden');

                if (data.status === 'OK' && data.results && data.results.length > 0) {
                    const result = data.results[0];
                    const lat = result.geometry.location.lat;
                    const lng = result.geometry.location.lng;
                    const formattedAddress = result.formatted_address;

                    resultContainer.innerHTML = `
                        <div class="newspaper-article-box">
                            <h3>Telegraph Received</h3>
                            <div class="result-row"><span class="result-label">Location Found:</span> ${formattedAddress}</div>
                            <div class="result-row"><span class="result-label">Latitude:</span> ${lat}</div>
                            <div class="result-row"><span class="result-label">Longitude:</span> ${lng}</div>
                            <p class="article-text" style="margin-top: 15px;">The coordinates for the requested location have been successfully retrieved via the Telegraphic Mapping Service.</p>
                        </div>
                    `;
                } else if (data.status === 'error') {
                    resultContainer.innerHTML = `
                        <div class="newspaper-article-box">
                            <h3>Communication Error</h3>
                            <div class="result-row error-text">System Error: ${data.message}</div>
                        </div>
                    `;
                } else {
                    const statusReason = data.error_message || data.status;
                    resultContainer.innerHTML = `
                        <div class="newspaper-article-box">
                            <h3>Telegram Failed</h3>
                            <div class="result-row error-text">Could not resolve location. Reason: ${statusReason}</div>
                        </div>
                    `;
                }
            })
            .catch(err => {
                geocodeBtn.textContent = 'DISPATCH TELEGRAM';
                geocodeBtn.disabled = false;
                resultContainer.classList.remove('hidden');
                resultContainer.innerHTML = `
                    <div class="newspaper-article-box">
                        <h3>Critical System Failure</h3>
                        <div class="result-row error-text">Failed to connect to the telegraph office.</div>
                        <div class="result-row">${err.message}</div>
                    </div>
                `;
            });
        });
    }
});
