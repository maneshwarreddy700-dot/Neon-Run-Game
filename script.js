// =========================================================
// NEON RUN
// SIMPLE CYBERPUNK RUNNER GAME
// =========================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const coinsElement = document.getElementById("coins");
const livesElement = document.getElementById("lives");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScore = document.getElementById("finalScore");


// =========================================================
// GAME VARIABLES
// =========================================================

let gameRunning = false;

let score = 0;
let coins = 0;
let lives = 3;

let gameSpeed = 5;

let lastTime = 0;

let obstacleTimer = 0;
let coinTimer = 0;

let animationId;


// =========================================================
// PLAYER
// =========================================================

const player = {

    x: 120,

    y: 350,

    width: 42,

    height: 55,

    velocityY: 0,

    speed: 6,

    jumpPower: -13,

    gravity: 0.6,

    grounded: true

};


// =========================================================
// GROUND
// =========================================================

const ground = {

    y: 420,

    height: 80

};


// =========================================================
// OBJECT ARRAYS
// =========================================================

let obstacles = [];
let coinsArray = [];


// =========================================================
// BACKGROUND PARTICLES
// =========================================================

let stars = [];

for (let i = 0; i < 80; i++) {

    stars.push({

        x: Math.random() * canvas.width,

        y: Math.random() * 350,

        size: Math.random() * 2 + 1,

        speed: Math.random() * 1.5 + 0.3

    });

}


// =========================================================
// KEYBOARD
// =========================================================

const keys = {

    left: false,

    right: false

};


document.addEventListener("keydown", (event) => {

    if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
    ) {

        keys.left = true;

    }

    if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {

        keys.right = true;

    }

    if (
        event.code === "Space" ||
        event.key === "ArrowUp" ||
        event.key.toLowerCase() === "w"
    ) {

        jump();

    }

});


document.addEventListener("keyup", (event) => {

    if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
    ) {

        keys.left = false;

    }

    if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {

        keys.right = false;

    }

});


// =========================================================
// JUMP
// =========================================================

function jump() {

    if (!gameRunning) return;

    if (player.grounded) {

        player.velocityY =
            player.jumpPower;

        player.grounded = false;

    }

}


// =========================================================
// MOBILE BUTTONS
// =========================================================

const leftBtn =
    document.getElementById("leftBtn");

const rightBtn =
    document.getElementById("rightBtn");

const jumpBtn =
    document.getElementById("jumpBtn");


function buttonHold(button, key) {

    button.addEventListener(
        "touchstart",
        (event) => {

            event.preventDefault();

            keys[key] = true;

        },
        { passive: false }
    );


    button.addEventListener(
        "touchend",
        (event) => {

            event.preventDefault();

            keys[key] = false;

        },
        { passive: false }
    );


    button.addEventListener(
        "mousedown",
        () => {

            keys[key] = true;

        }
    );


    button.addEventListener(
        "mouseup",
        () => {

            keys[key] = false;

        }
    );


    button.addEventListener(
        "mouseleave",
        () => {

            keys[key] = false;

        }
    );

}


buttonHold(leftBtn, "left");

buttonHold(rightBtn, "right");


jumpBtn.addEventListener(
    "touchstart",
    (event) => {

        event.preventDefault();

        jump();

    },
    { passive: false }
);


jumpBtn.addEventListener(
    "mousedown",
    jump
);


// =========================================================
// RESET GAME
// =========================================================

function resetGame() {

    score = 0;

    coins = 0;

    lives = 3;

    gameSpeed = 5;

    obstacleTimer = 0;

    coinTimer = 0;

    obstacles = [];

    coinsArray = [];

    player.x = 120;

    player.y =
        ground.y - player.height;

    player.velocityY = 0;

    player.grounded = true;

    updateStats();

}


// =========================================================
// START GAME
// =========================================================

function startGame() {

    resetGame();

    gameRunning = true;

    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    cancelAnimationFrame(animationId);

    lastTime = performance.now();

    animationId =
        requestAnimationFrame(gameLoop);

}


// =========================================================
// GAME OVER
// =========================================================

function endGame() {

    gameRunning = false;

    finalScore.textContent =
        Math.floor(score);

    gameOverScreen.classList.remove("hidden");

}


// =========================================================
// SPAWN OBSTACLE
// =========================================================

function spawnObstacle() {

    const height =
        35 + Math.random() * 35;

    const width =
        25 + Math.random() * 25;

    obstacles.push({

        x: canvas.width + 50,

        y:
            ground.y - height,

        width: width,

        height: height

    });

}


// =========================================================
// SPAWN COIN
// =========================================================

function spawnCoin() {

    coinsArray.push({

        x: canvas.width + 30,

        y:
            250 + Math.random() * 100,

        radius: 9

    });

}


// =========================================================
// COLLISION
// =========================================================

function collision(a, b) {

    return (

        a.x < b.x + b.width &&

        a.x + a.width > b.x &&

        a.y < b.y + b.height &&

        a.y + a.height > b.y

    );

}


// =========================================================
// UPDATE PLAYER
// =========================================================

function updatePlayer() {

    if (keys.left) {

        player.x -=
            player.speed;

    }

    if (keys.right) {

        player.x +=
            player.speed;

    }


    player.x =
        Math.max(
            0,
            Math.min(
                canvas.width - player.width,
                player.x
            )
        );


    player.velocityY +=
        player.gravity;

    player.y +=
        player.velocityY;


    if (
        player.y + player.height >=
        ground.y
    ) {

        player.y =
            ground.y - player.height;

        player.velocityY = 0;

        player.grounded = true;

    }

}


// =========================================================
// UPDATE OBJECTS
// =========================================================

function updateObjects(delta) {

    const movement =
        gameSpeed * delta;


    obstacles.forEach((obstacle) => {

        obstacle.x -= movement;

    });


    coinsArray.forEach((coin) => {

        coin.x -= movement;

    });


    obstacles =
        obstacles.filter(
            obstacle =>
                obstacle.x +
                obstacle.width > 0
        );


    coinsArray =
        coinsArray.filter(
            coin =>
                coin.x +
                coin.radius > 0
        );

}


// =========================================================
// CHECK COLLISIONS
// =========================================================

function checkCollisions() {

    // Obstacles

    obstacles.forEach(
        (obstacle, index) => {

            if (
                collision(
                    player,
                    obstacle
                )
            ) {

                obstacles.splice(index, 1);

                lives--;

                updateStats();


                if (lives <= 0) {

                    endGame();

                }

            }

        }
    );


    // Coins

    coinsArray.forEach(
        (coin, index) => {

            const dx =
                player.x +
                player.width / 2 -
                coin.x;

            const dy =
                player.y +
                player.height / 2 -
                coin.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (distance < 35) {

                coinsArray.splice(index, 1);

                coins++;

                score += 100;

                updateStats();

            }

        }
    );

}


// =========================================================
// UPDATE SCORE
// =========================================================

function updateScore(delta) {

    score +=
        delta * 10;

    gameSpeed +=
        delta * 0.03;

    updateStats();

}


// =========================================================
// UI
// =========================================================

function updateStats() {

    scoreElement.textContent =
        Math.floor(score);

    coinsElement.textContent =
        coins;

    livesElement.textContent =
        lives;

}


// =========================================================
// DRAW BACKGROUND
// =========================================================

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradient.addColorStop(
        0,
        "#08051b"
    );

    gradient.addColorStop(
        1,
        "#10051c"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Stars

    stars.forEach((star) => {

        star.x -=
            star.speed;


        if (star.x < 0) {

            star.x =
                canvas.width;

        }


        ctx.fillStyle =
            "#00ffff";

        ctx.globalAlpha =
            0.5;

        ctx.fillRect(
            star.x,
            star.y,
            star.size,
            star.size
        );

    });


    ctx.globalAlpha = 1;


    // Neon city

    for (
        let x = 0;
        x < canvas.width;
        x += 70
    ) {

        const height =
            50 +
            ((x * 17) % 90);

        ctx.fillStyle =
            "rgba(20, 15, 55, 0.9)";

        ctx.fillRect(
            x,
            ground.y - height,
            50,
            height
        );


        for (
            let y =
                ground.y - height + 12;
            y < ground.y - 10;
            y += 18
        ) {

            ctx.fillStyle =
                "#ff00ff";

            ctx.globalAlpha =
                0.45;

            ctx.fillRect(
                x + 8,
                y,
                5,
                3
            );

            ctx.fillStyle =
                "#00ffff";

            ctx.fillRect(
                x + 25,
                y,
                5,
                3
            );

        }

    }

    ctx.globalAlpha = 1;


    // Ground

    ctx.fillStyle =
        "#07071a";

    ctx.fillRect(
        0,
        ground.y,
        canvas.width,
        ground.height
    );


    ctx.strokeStyle =
        "#00ffff";

    ctx.lineWidth = 3;

    ctx.shadowBlur = 12;

    ctx.shadowColor =
        "#00ffff";

    ctx.beginPath();

    ctx.moveTo(
        0,
        ground.y
    );

    ctx.lineTo(
        canvas.width,
        ground.y
    );

    ctx.stroke();

    ctx.shadowBlur = 0;


    // Ground grid

    ctx.strokeStyle =
        "rgba(255, 0, 255, 0.25)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < canvas.width;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            ground.y
        );

        ctx.lineTo(
            x - 70,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        let y = ground.y + 20;
        y < canvas.height;
        y += 20
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }

}


// =========================================================
// DRAW PLAYER
// =========================================================

function drawPlayer() {

    ctx.save();

    ctx.shadowColor =
        "#00ffff";

    ctx.shadowBlur = 18;


    // Body

    ctx.fillStyle =
        "#00ffff";

    ctx.fillRect(
        player.x,
        player.y + 15,
        player.width,
        player.height - 15
    );


    // Head

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        player.x + 7,
        player.y,
        28,
        25
    );


    // Visor

    ctx.fillStyle =
        "#ff00ff";

    ctx.fillRect(
        player.x + 12,
        player.y + 7,
        20,
        7
    );


    // Legs

    ctx.fillStyle =
        "#ff00ff";

    ctx.fillRect(
        player.x + 5,
        player.y + player.height - 5,
        10,
        12
    );

    ctx.fillRect(
        player.x + 27,
        player.y + player.height - 5,
        10,
        12
    );


    ctx.restore();

}


// =========================================================
// DRAW OBSTACLES
// =========================================================

function drawObstacles() {

    obstacles.forEach(
        (obstacle) => {

            ctx.save();

            ctx.fillStyle =
                "#ff00ff";

            ctx.shadowColor =
                "#ff00ff";

            ctx.shadowBlur = 20;


            ctx.fillRect(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
            );


            ctx.fillStyle =
                "#00ffff";

            ctx.fillRect(
                obstacle.x + 5,
                obstacle.y + 5,
                obstacle.width - 10,
                5
            );


            ctx.restore();

        }
    );

}


// =========================================================
// DRAW COINS
// =========================================================

function drawCoins() {

    coinsArray.forEach(
        (coin) => {

            ctx.save();

            ctx.beginPath();

            ctx.arc(
                coin.x,
                coin.y,
                coin.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#ffe600";

            ctx.shadowColor =
                "#ffe600";

            ctx.shadowBlur = 18;

            ctx.fill();


            ctx.beginPath();

            ctx.arc(
                coin.x,
                coin.y,
                coin.radius - 3,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle =
                "#ffffff";

            ctx.lineWidth = 2;

            ctx.stroke();

            ctx.restore();

        }
    );

}


// =========================================================
// GAME LOOP
// =========================================================

function gameLoop(timestamp) {

    if (!gameRunning) return;


    const delta =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.05
        );

    lastTime = timestamp;


    obstacleTimer +=
        delta;

    coinTimer +=
        delta;


    if (obstacleTimer > 1.2) {

        spawnObstacle();

        obstacleTimer = 0;

    }


    if (coinTimer > 0.8) {

        spawnCoin();

        coinTimer = 0;

    }


    updatePlayer();

    updateObjects(delta);

    checkCollisions();

    updateScore(delta);


    drawBackground();

    drawCoins();

    drawObstacles();

    drawPlayer();


    animationId =
        requestAnimationFrame(
            gameLoop
        );

}


// =========================================================
// BUTTONS
// =========================================================

startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    startGame
);


// =========================================================
// INITIAL STATE
// =========================================================

updateStats();

drawBackground();

drawPlayer();
