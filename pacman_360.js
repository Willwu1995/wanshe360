const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startupScreen = document.getElementById('startupScreen');
const effectOverlay = document.getElementById('effectOverlay');
const messageText = document.getElementById('messageText');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const timeElement = document.getElementById('time');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const finalLevelElement = document.getElementById('finalLevel');

const gridSize = 20;
const tileCountX = canvas.width / gridSize;
const tileCountY = canvas.height / gridSize;

let gameRunning = false;
let gamePaused = false;
let gameLoop;
let timeLoop;
let snake = [];
let dx = 0;
let dy = 0;
let foodX = 15;
let foodY = 15;
let score = 0;
let level = 1;
let gameTime = 0;
let specialFood = null;
let specialFoodTimer = 0;

const specialCharacters = [
    { char: '佺', effect: 'lightning', message: '掌门作法', color: 'red', word: '涨' },
    { char: '渊', effect: 'storm', message: '空头降临', color: 'green', word: '跑' },
    { char: '斌', effect: 'celebration', message: '主任驾到', color: 'red', word: '發' },
    { char: '政', effect: 'trash', message: '垃圾三门', color: 'green', word: '拉' }
];

function startGame() {
    startupScreen.style.display = 'none';
    gameRunning = true;
    initializeGame();
    gameLoop = setInterval(updateGame, 100);
    timeLoop = setInterval(updateTime, 1000);
}

function initializeGame() {
    snake = [
        {x: 10, y: 10}
    ];
    dx = 0;
    dy = 0;
    score = 0;
    level = 1;
    gameTime = 0;
    specialFood = null;
    specialFoodTimer = 0;
    generateFood();
    updateUI();
    drawGame();
}

function generateFood() {
    foodX = Math.floor(Math.random() * tileCountX);
    foodY = Math.floor(Math.random() * tileCountY);
    
    for (let segment of snake) {
        if (segment.x === foodX && segment.y === foodY) {
            generateFood();
            return;
        }
    }
}

function generateSpecialFood() {
    const charData = specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
    specialFood = {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY),
        char: charData.char,
        effect: charData.effect,
        message: charData.message,
        color: charData.color,
        word: charData.word
    };
    specialFoodTimer = 150;
}

function updateGame() {
    if (!gameRunning || gamePaused) return;
    
    if (dx === 0 && dy === 0) {
        drawGame();
        return;
    }
    
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        gameOver();
        return;
    }
    
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    if (head.x === foodX && head.y === foodY) {
        score += 10;
        level = Math.floor(score / 100) + 1;
        updateUI();
        generateFood();
        
        if (Math.random() < 0.3 && !specialFood) {
            generateSpecialFood();
        }
    } else {
        snake.pop();
    }
    
    if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
        score += 50;
        level = Math.floor(score / 100) + 1;
        updateUI();
        triggerEffect(specialFood);
        specialFood = null;
    }
    
    if (specialFood) {
        specialFoodTimer--;
        if (specialFoodTimer <= 0) {
            specialFood = null;
        }
    }
    
    drawGame();
}

function drawGame() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(0, 162, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCountX; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= tileCountY; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    snake.forEach((segment, index) => {
        const gradient = ctx.createRadialGradient(
            segment.x * gridSize + gridSize/2, 
            segment.y * gridSize + gridSize/2, 
            0,
            segment.x * gridSize + gridSize/2, 
            segment.y * gridSize + gridSize/2, 
            gridSize/2
        );
        
        if (index === 0) {
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, '#00a2ff');
        } else {
            gradient.addColorStop(0, '#00a2ff');
            gradient.addColorStop(1, '#0066cc');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        
        ctx.shadowColor = index === 0 ? '#00ff88' : '#00a2ff';
        ctx.shadowBlur = 10;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0;
    });
    
    const foodGradient = ctx.createRadialGradient(
        foodX * gridSize + gridSize/2, 
        foodY * gridSize + gridSize/2, 
        0,
        foodX * gridSize + gridSize/2, 
        foodY * gridSize + gridSize/2, 
        gridSize/2
    );
    foodGradient.addColorStop(0, '#ff6b6b');
    foodGradient.addColorStop(1, '#ff0040');
    
    ctx.fillStyle = foodGradient;
    ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize - 2, gridSize - 2);
    
    if (specialFood) {
        const alpha = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.fillRect(specialFood.x * gridSize, specialFood.y * gridSize, gridSize - 2, gridSize - 2);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 5;
        ctx.fillText(specialFood.char, 
            specialFood.x * gridSize + gridSize/2, 
            specialFood.y * gridSize + gridSize/2 + 5);
        ctx.shadowBlur = 0;
    }
}

function triggerEffect(specialFood) {
    gamePaused = true;
    
    effectOverlay.className = 'effect-overlay ' + specialFood.effect;
    
    showMessageWithTyping(specialFood.message, specialFood.color, specialFood.word);
    
    createParticles(specialFood.effect);
    
    setTimeout(() => {
        gamePaused = false;
        effectOverlay.className = 'effect-overlay';
        messageText.style.display = 'none';
    }, 2000);
}

function showMessageWithTyping(message, color, finalWord) {
    messageText.style.display = 'block';
    messageText.innerHTML = '';
    
    let charIndex = 0;
    const typingInterval = setInterval(() => {
        if (charIndex < message.length) {
            const currentText = message.substring(0, charIndex + 1);
            messageText.innerHTML = currentText + '<br><span class="' + color + '-text" style="font-size: 48px; opacity: 0;">' + finalWord + '</span>';
            charIndex++;
        } else {
            clearInterval(typingInterval);
            setTimeout(() => {
                messageText.innerHTML = message + '<br><span class="' + color + '-text" style="font-size: 48px;">' + finalWord + '</span>';
            }, 200);
        }
    }, 150);
}

function createParticles(effectType) {
    const effectOverlay = document.getElementById('effectOverlay');
    
    switch(effectType) {
        case 'lightning':
            createLightningEffect();
            break;
        case 'storm':
            createStormEffect();
            break;
        case 'celebration':
            createCelebrationEffect();
            break;
        case 'trash':
            createTrashEffect();
            break;
    }
}

function createLightningEffect() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const bolt = document.createElement('div');
            bolt.className = 'lightning-bolt';
            bolt.style.left = Math.random() * window.innerWidth + 'px';
            bolt.style.height = Math.random() * 300 + 200 + 'px';
            effectOverlay.appendChild(bolt);
            
            document.body.style.animation = 'shake 0.5s';
            
            setTimeout(() => {
                bolt.remove();
                document.body.style.animation = '';
            }, 300);
        }, i * 200);
    }
}

function createStormEffect() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const rain = document.createElement('div');
            rain.className = 'rain-particle';
            rain.style.left = Math.random() * window.innerWidth + 'px';
            rain.style.height = Math.random() * 50 + 30 + 'px';
            rain.style.animationDelay = Math.random() * 2 + 's';
            effectOverlay.appendChild(rain);
            
            setTimeout(() => {
                rain.remove();
            }, 2000);
        }, i * 50);
    }
    
    let windDirection = 1;
    const windInterval = setInterval(() => {
        document.body.style.transform = `translateX(${windDirection * 10}px)`;
        windDirection *= -1;
    }, 100);
    
    setTimeout(() => {
        clearInterval(windInterval);
        document.body.style.transform = '';
    }, 2000);
}

function createCelebrationEffect() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 1 + 's';
            effectOverlay.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 100);
    }
}

function createTrashEffect() {
    const trashTypes = ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#696969'];
    
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const trash = document.createElement('div');
            trash.className = 'trash-item';
            trash.style.left = Math.random() * window.innerWidth + 'px';
            trash.style.backgroundColor = trashTypes[Math.floor(Math.random() * trashTypes.length)];
            trash.style.width = Math.random() * 15 + 5 + 'px';
            trash.style.height = Math.random() * 15 + 5 + 'px';
            trash.style.animationDelay = Math.random() * 1 + 's';
            effectOverlay.appendChild(trash);
            
            setTimeout(() => {
                trash.remove();
            }, 2000);
        }, i * 100);
    }
}

function updateUI() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
}

function updateTime() {
    if (!gameRunning || gamePaused) return;
    gameTime++;
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    clearInterval(timeLoop);
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
    gameOverElement.style.display = 'block';
}

function restartGame() {
    gameOverElement.style.display = 'none';
    gameRunning = true;
    initializeGame();
    gameLoop = setInterval(updateGame, 100);
    timeLoop = setInterval(updateTime, 1000);
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) return;
    
    switch(e.code) {
        case 'ArrowUp':
            if (dy !== 1) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
    }
});