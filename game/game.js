// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let fox; // Declare as a global variable
let audioContext; // Declare audioContext globally

// Game settings
const WIDTH = 600;
const HEIGHT = 600;

const BACKGROUND_COLORS = [
    'rgb(255, 255, 255)', // White
    'rgb(240, 248, 255)', // AliceBlue
    'rgb(245, 245, 220)', // Beige
    'rgb(230, 230, 250)', // Lavender
    'rgb(255, 228, 225)', // MistyRose
    'rgb(255, 250, 205)', // LemonChiffon
    'rgb(240, 255, 240)', // Honeydew
    'rgb(255, 240, 245)', // LavenderBlush
    'rgb(245, 255, 250)', // MintCream
    'rgb(250, 240, 230)', // Linen
];

const FPS = 60;
const FOX_SIZE = 40;
const GEM_SIZE = 30;
const OBSTACLE_SIZE = 30;
const EXTRA_LIFE_SIZE = 30;
const START_NUM_OBSTACLES = 5;
const INVINCIBILITY_DURATION = 2; // in seconds

let startTime;
let elapsedTime = 0;
let recordTime = null;
let MAX_LEVEL = 10; // Default maximum level

// Function to get the number of levels from the URL parameter
function getLevelsFromURL() {
    const params = new URLSearchParams(window.location.search);
    const levels = params.get('xlvlx');
    return levels ? parseInt(levels) : MAX_LEVEL; // If no parameter is set, use default MAX_LEVEL
}

// Set the maximum levels based on URL parameter
MAX_LEVEL = getLevelsFromURL();

// Load images
let foxImage = new Image();
foxImage.src = 'fox.png';

let gemImage = new Image();
gemImage.src = 'diamond.png';

let obstacleImage = new Image();
obstacleImage.src = 'block.png';

let extraLifeImage = new Image();
extraLifeImage.src = 'heart.png';

// Ensure images are loaded before starting
let imagesLoaded = 0;
const totalImages = 4;

foxImage.onload = imageLoaded;
gemImage.onload = imageLoaded;
obstacleImage.onload = imageLoaded;
extraLifeImage.onload = imageLoaded;

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        document.getElementById('menuOverlay').style.display = 'flex';
    }
}

// Game entities
class Fox {
    constructor() {
        this.width = FOX_SIZE;
        this.height = FOX_SIZE;
        this.x = 0;
        this.y = 0;
        this.vel = 5;
        this.score = 0;
        this.lives = 3;
        this.invincible = false;
        this.invincibleStartTime = 0;
    }

    resetPosition(obstacles) {
        let distanceThreshold = 100;
        while (true) {
            this.x = Math.floor(Math.random() * (WIDTH - this.width));
            this.y = Math.floor(Math.random() * (HEIGHT - this.height));
            if (isPositionSafe(this.x, this.y, obstacles, distanceThreshold)) {
                break;
            }
        }
    }

    draw(ctx) {
        if (this.invincible) {
            if (Math.floor(Date.now() / 250) % 2 === 0) {
                ctx.drawImage(foxImage, this.x, this.y, this.width, this.height);
            }
        } else {
            ctx.drawImage(foxImage, this.x, this.y, this.width, this.height);
        }
    }

    moveKeyboard(keysPressed) {
        if (keysPressed['ArrowLeft'] && this.x - this.vel > 0) {
            this.x -= this.vel;
        }
        if (keysPressed['ArrowRight'] && this.x + this.vel + this.width < WIDTH) {
            this.x += this.vel;
        }
        if (keysPressed['ArrowUp'] && this.y - this.vel > 0) {
            this.y -= this.vel;
        }
        if (keysPressed['ArrowDown'] && this.y + this.vel + this.height < HEIGHT) {
            this.y += this.vel;
        }
    }

    moveMouse(mousePos) {
        this.x = mousePos.x - this.width / 2;
        this.y = mousePos.y - this.height / 2;
        this.x = Math.max(0, Math.min(this.x, WIDTH - this.width));
        this.y = Math.max(0, Math.min(this.y, HEIGHT - this.height));
    }

    movePhone(touchPos) {
        // You can customize this method for phone-specific controls
        // For simplicity, we'll use the same logic as mouse
        this.moveMouse(touchPos);
    }

    checkInvincibility() {
        if (this.invincible) {
            let currentTime = Date.now();
            if (currentTime - this.invincibleStartTime >= INVINCIBILITY_DURATION * 1000) {
                this.invincible = false;
            }
        }
    }
}

class Gem {
    constructor() {
        this.size = GEM_SIZE;
        this.placeGem();
    }

    placeGem() {
        this.x = Math.floor(Math.random() * (WIDTH - this.size));
        this.y = Math.floor(Math.random() * (HEIGHT - this.size - 50));
    }

    draw(ctx) {
        ctx.drawImage(gemImage, this.x, this.y, this.size, this.size);
    }
}

class ExtraLife {
    constructor() {
        this.size = EXTRA_LIFE_SIZE;
        this.x = Math.floor(Math.random() * (WIDTH - this.size));
        this.y = Math.floor(Math.random() * (HEIGHT - this.size - 50));
    }

    draw(ctx) {
        ctx.drawImage(extraLifeImage, this.x, this.y, this.size, this.size);
    }
}

class Obstacle {
    constructor(speed) {
        this.size = OBSTACLE_SIZE;
        this.x = Math.floor(Math.random() * (WIDTH - this.size));
        this.y = Math.floor(Math.random() * (HEIGHT - this.size - 100) + 50);
        this.speed = speed;
        this.dirX = Math.random() < 0.5 ? -1 : 1;
        this.dirY = Math.random() < 0.5 ? -1 : 1;
    }

    move() {
        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;

        if (this.x <= 0 || this.x + this.size >= WIDTH) {
            this.dirX *= -1;
        }
        if (this.y <= 50 || this.y + this.size >= HEIGHT) {
            this.dirY *= -1;
        }
    }

    draw(ctx) {
        ctx.drawImage(obstacleImage, this.x, this.y, this.size, this.size);
    }
}

// Utility functions
function isPositionSafe(x, y, obstacles, distanceThreshold) {
    for (let obstacle of obstacles) {
        if (Math.abs(x - obstacle.x) < distanceThreshold &&
            Math.abs(y - obstacle.y) < distanceThreshold) {
            return false;
        }
    }
    return true;
}

function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x1 + w1 < x2 || x1 > x2 + w2 ||
             y1 + h1 < y2 || y1 > y2 + h2);
}

// Control method selection
let controlMethod = null;

// Existing Keyboard Button Listener
document.getElementById('keyboardButton').addEventListener('click', () => {
    initializeAudioContext();
    controlMethod = 'keyboard';
    document.getElementById('menuOverlay').style.display = 'none';
    startGame();
});

// Existing Mouse Button Listener
document.getElementById('mouseButton').addEventListener('click', () => {
    initializeAudioContext();
    controlMethod = 'mouse';
    document.getElementById('menuOverlay').style.display = 'none';
    startGame();
});

// **New Phone Button Listener**
document.getElementById('phoneButton').addEventListener('click', () => {
    initializeAudioContext();
    controlMethod = 'phone';
    document.getElementById('menuOverlay').style.display = 'none';
    startGame();
});

// Function to initialize or resume AudioContext
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Create AudioContext on user interaction
    } else if (audioContext.state === 'suspended') {
        audioContext.resume(); // Resume AudioContext if suspended
    }
}

// Sound functions
function playTone(frequency, duration) {
    if (!audioContext) return; // Ensure AudioContext exists
    let oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    let gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

// Game functions
function startGame() {
    fox = new Fox();
    let gem = new Gem();
    let level = 1;
    let obstacles = [];
    for (let i = 0; i < START_NUM_OBSTACLES + level; i++) {
        obstacles.push(new Obstacle(level * 0.5));
    }
    fox.resetPosition(obstacles);

    let extraLife = null;
    let nextExtraLifeTime = Date.now() + 10000;

    let keysPressed = {};
    let mousePos = { x: WIDTH / 2, y: HEIGHT / 2 };
    let touchPos = { x: WIDTH / 2, y: HEIGHT / 2 }; // For phone controls

    startTime = Date.now();

    // Add event listeners based on control method
    if (controlMethod === 'keyboard') {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    } else if (controlMethod === 'mouse') {
        canvas.addEventListener('mousemove', handleMouseMove);
        // If you want to retain existing touch controls for mouse, uncomment the following lines:
        // canvas.addEventListener('touchstart', handleTouch, { passive: false });
        // canvas.addEventListener('touchmove', handleTouch, { passive: false });
    } else if (controlMethod === 'phone') {
        // **Phone Touch Event Listeners**
        canvas.addEventListener('touchstart', handlePhoneTouch, { passive: false });
        canvas.addEventListener('touchmove', handlePhoneTouch, { passive: false });
    }

    // Define event handler functions
    function handleKeyDown(e) {
        keysPressed[e.key] = true;
    }

    function handleKeyUp(e) {
        keysPressed[e.key] = false;
    }

    function handleMouseMove(e) {
        let rect = canvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    }

    // **Function to handle phone touch inputs**
    function handlePhoneTouch(event) {
        event.preventDefault();
        let touch = event.touches[0];
        let rect = canvas.getBoundingClientRect();
        touchPos.x = touch.clientX - rect.left;
        touchPos.y = touch.clientY - rect.top;
    }

    // Remove event listeners when the game ends
    function cleanupEventListeners() {
        if (controlMethod === 'keyboard') {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        } else if (controlMethod === 'mouse') {
            canvas.removeEventListener('mousemove', handleMouseMove);
            // If you added touch events for mouse, remove them here
            // canvas.removeEventListener('touchstart', handleTouch);
            // canvas.removeEventListener('touchmove', handleTouch);
        } else if (controlMethod === 'phone') {
            canvas.removeEventListener('touchstart', handlePhoneTouch);
            canvas.removeEventListener('touchmove', handlePhoneTouch);
        }
    }

    let lastTime = 0;

    function gameLoop(timestamp) {
        let deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        fox.checkInvincibility();

        let currentTime = Date.now();
        elapsedTime = currentTime - startTime;

        // Handle extra life spawning
        if (extraLife === null && currentTime >= nextExtraLifeTime) {
            extraLife = new ExtraLife();
        }

        // Move fox based on control method
        if (controlMethod === 'keyboard') {
            fox.moveKeyboard(keysPressed);
        } else if (controlMethod === 'mouse') {
            fox.moveMouse(mousePos);
        } else if (controlMethod === 'phone') {
            fox.movePhone(touchPos);
        }

        // Move obstacles
        for (let obstacle of obstacles) {
            obstacle.move();
        }

        // Check collision with gem
        if (rectsOverlap(fox.x, fox.y, fox.width, fox.height,
                         gem.x, gem.y, gem.size, gem.size)) {
            fox.score += 1;
            playTone(250.56, 0.2);
            gem.placeGem();

            if (fox.score % 5 === 0) {
                level += 1;
                if (level > MAX_LEVEL) {
                    cleanupEventListeners();
                    winScreen();
                    return;
                }
                for (let i = 0; i < 2; i++) {
                    obstacles.push(new Obstacle(level * 0.5));
                }
                for (let obstacle of obstacles) {
                    obstacle.speed = level * 0.5;
                }
            }
        }

        // Check collision with extra life
        if (extraLife !== null) {
            if (rectsOverlap(fox.x, fox.y, fox.width, fox.height,
                             extraLife.x, extraLife.y, extraLife.size, extraLife.size)) {
                fox.lives += 1;
                playTone(501.12, 0.2);
                extraLife = null;
                nextExtraLifeTime = currentTime + 10000;
            }
        }

        // Check collision with obstacles
        if (!fox.invincible) {
            let collision = false;
            for (let obstacle of obstacles) {
                if (rectsOverlap(fox.x, fox.y, fox.width, fox.height,
                                 obstacle.x, obstacle.y, obstacle.size, obstacle.size)) {
                    collision = true;
                    break;
                }
            }

            if (collision) {
                fox.lives -= 1;
                playTone(125.28, 0.5);
                if (fox.lives <= 0) {
                    cleanupEventListeners();
                    gameOverScreen();
                    return;
                } else {
                    fox.resetPosition(obstacles);
                    fox.invincible = true;
                    fox.invincibleStartTime = Date.now();
                }
            }
        }

        drawWindow(fox, gem, obstacles, level, extraLife);

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

// Handle touch input for mouse control (existing functionality)
function handleTouch(event) {
    event.preventDefault();
    let touch = event.touches[0];
    let rect = canvas.getBoundingClientRect();
    let mousePos = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
    fox.moveMouse(mousePos);
}

// Draw the game window
function drawWindow(fox, gem, obstacles, level, extraLife) {
    let bgColor = BACKGROUND_COLORS[(level - 1) % BACKGROUND_COLORS.length];
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    fox.draw(ctx);
    gem.draw(ctx);
    if (extraLife !== null) {
        extraLife.draw(ctx);
    }
    for (let obstacle of obstacles) {
        obstacle.draw(ctx);
    }

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${fox.score}`, 10, 20);
    ctx.fillText(`Level: ${level}`, WIDTH - 100, 20);
    ctx.fillText(`Lives: ${fox.lives}`, 10, 50);

    // Show elapsed time
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    ctx.fillText(`Time: ${minutes}m ${seconds}s`, WIDTH / 2 - 50, 20);
}

function gameOverScreen() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.font = '50px Arial';
    let text = 'GAME OVER';
    let textWidth = ctx.measureText(text).width;
    ctx.fillText(text, WIDTH / 2 - textWidth / 2, HEIGHT / 2);
}

function winScreen() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'rgb(0, 200, 0)';
    ctx.font = '50px Arial';
    let text = 'YOU WIN!';
    let textWidth = ctx.measureText(text).width;
    ctx.fillText(text, WIDTH / 2 - textWidth / 2, HEIGHT / 2);

    // Show time and score
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    let timeText = `Time: ${minutes}m ${seconds}s`;
    ctx.fillText(timeText, WIDTH / 2 - ctx.measureText(timeText).width / 2, HEIGHT / 2 + 60);

    let scoreText = `Score: ${fox.score}`;
    ctx.fillText(scoreText, WIDTH / 2 - ctx.measureText(scoreText).width / 2, HEIGHT / 2 + 100);

    // Send the time to the server for recording
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'record_time.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
        console.log('Response from PHP:', xhr.responseText); // Debugging log
        if (xhr.responseText.includes('New Record')) {
            ctx.fillText('New Record!', WIDTH / 2 - ctx.measureText('New Record!').width / 2, HEIGHT / 2 + 140);
        } else if (xhr.responseText.includes('Record Time')) {
            const recordTimeText = xhr.responseText.split('Record Time:')[1].trim(); // Extract the formatted time
            ctx.fillText(`Record Time: ${recordTimeText}`, WIDTH / 2 - ctx.measureText(`Record Time: ${recordTimeText}`).width / 2, HEIGHT / 2 + 140);
        }
    };
    xhr.send(`time=${elapsedTime}`);
}

// Start the game if images are already loaded (from cache)
if (imagesLoaded === totalImages) {
    document.getElementById('menuOverlay').style.display = 'flex';
}
