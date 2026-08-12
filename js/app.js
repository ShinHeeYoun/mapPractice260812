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
});
