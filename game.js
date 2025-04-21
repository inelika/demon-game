const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverMessage = document.getElementById("gameOverMessage");

import { Demon } from './demon.js';
import { Skeleton } from './skeleton.js';
import { Ripper } from './ripper.js';
import { Stgom } from './stgom.js';
import { Ghost } from './ghost.js';

let loadedSprites = {};
let lastTime = 0;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameOver = false; 

fetch('assets.json')
  .then(response => response.json())
  .then(data => loadSprites(data))
  .catch(error => console.error('Ошибка при загрузке JSON:', error));

function loadSprites(data) {
  const image = new Image();
  image.src = data.meta.image;
  image.onload = () => {
    Object.keys(data.frames).forEach((key) => {
      const frame = data.frames[key].frame;
      loadedSprites[key] = {
        image: image,
        x: frame.x,
        y: frame.y,
        w: frame.w,
        h: frame.h
      };
    });
  };
}

export function drawSprite(spriteName, dx, dy, dw, dh) {
  const sprite = loadedSprites[spriteName];
  if (!sprite) return;
  ctx.drawImage(
    sprite.image,
    sprite.x,
    sprite.y,
    sprite.w,
    sprite.h,
    dx,
    dy,
    dw || sprite.w,
    dh || sprite.h
  );
}

let demon, enemies = [];
let gameSpeed = 7;
let gameInterval = false;
let spawnInterval = null;
let difficulty = 'easy';

const backgroundImg = new Image();
backgroundImg.src = 'images/hell-game-bg.avif';
let bgX1 = 0;
let bgX2 = canvas.width;
const backgroundSpeed = 2;

function startGame() {
  enemies = [];
  gameOverMessage.style.display = "none";
  difficulty = document.getElementById("difficulty").value;
  gameSpeed = getGameSpeed(difficulty);
  demon = new Demon(ctx, canvas.height - 110);
  score = 0;
  bgX1 = 0;
  bgX2 = canvas.width;
  gameOver = false; 

  if (spawnInterval) clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnEnemy, 2000);

  lastTime = 0;
  gameInterval = true;
  requestAnimationFrame(gameLoop);
}

function getGameSpeed(diff) {
  return {
    easy: 6,
    medium: 11,
    hard: 15
  }[diff];
}

function spawnEnemy() {
  if (gameOver) return; 
  
  const types = ['skeleton', 'ripper', 'stgom'];

  if (difficulty !== 'easy' && Math.random() > 0.6) {
    enemies.push(new Ghost(ctx, canvas.width, difficulty));
  } else {
    const type = types[Math.floor(Math.random() * types.length)];
    switch (type) {
      case 'skeleton': enemies.push(new Skeleton(ctx, canvas.width)); break;
      case 'ripper': enemies.push(new Ripper(ctx, canvas.width)); break;
      case 'stgom': enemies.push(new Stgom(ctx, canvas.width)); break;
    }
  }
}

function gameLoop(timestamp) {
  if (!gameInterval || gameOver) return; 

  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  
  if (!gameOver) {
    updateBackground();
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  ctx.fillStyle = '#333';
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

  if (!gameOver) {
    score += deltaTime / 1000;
  }
  
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.font = "18px Arial";
  ctx.fillText(`Счёт: ${Math.floor(score)}`, canvas.width - 120, 30);
  ctx.fillText(`Рекорд: ${Math.floor(highScore)}`, canvas.width - 120, 55);

  demon.update(deltaTime);
  demon.draw();

  enemies.forEach((enemy) => {
    if (!gameOver) {
      enemy.update(gameSpeed);
    }
    enemy.draw();

    if (!gameOver && !enemy.isDead && demon.state === 'attack' && checkCollision(demon, enemy, 20)) {
      enemy.die();
    }

    if (!gameOver && !enemy.isDead && demon.state !== 'dead' && checkCollision(demon, enemy, 10)) {
      demon.die();
      endGame(); 
    }
  });

  enemies = enemies.filter(enemy => !enemy.isDead || !enemy.deathAnimationFinished());

  if (gameInterval && !gameOver && demon.state !== 'dead') {
    requestAnimationFrame(gameLoop);
  }
}

function updateBackground() {
  if (gameOver) return; 
  
  bgX1 -= backgroundSpeed;
  bgX2 -= backgroundSpeed;

  if (bgX1 <= -canvas.width) {
    bgX1 = bgX2 + canvas.width;
  }
  if (bgX2 <= -canvas.width) {
    bgX2 = bgX1 + canvas.width;
  }
}

function drawBackground() {
  ctx.drawImage(backgroundImg, bgX1, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, bgX2, 0, canvas.width, canvas.height);
}

function checkCollision(obj1, obj2, offset = 0) {
  return (
    obj1.x + obj1.width > obj2.x + offset &&
    obj1.x + offset < obj2.x + obj2.width &&
    obj1.y + obj1.height > obj2.y + offset &&
    obj1.y + offset < obj2.y + obj2.height
  );
}

function endGame() {
  gameOver = true; 
  gameInterval = false;
  clearInterval(spawnInterval);

  const finalScore = Math.floor(score);
  if (finalScore > highScore) {
    highScore = finalScore;
    localStorage.setItem("highScore", highScore);
  }

  gameOverMessage.innerHTML = `
    <div style="padding: 10px; background: #000; color: white; border-top: 2px solid white;">
      <p>Вы умерли</p>
      <p>Ваш Счёт: ${finalScore}</p>
      <button id="restartBtn" style="margin-top: 10px; padding: 5px 10px;">Начать заново</button>
    </div>
  `;
  gameOverMessage.style.display = "block";
  startBtn.disabled = false;

 
  document.getElementById('restartBtn').addEventListener('click', () => {
    startGame();
    startBtn.disabled = true;
  });
}

startBtn.addEventListener("click", () => {
  if (gameInterval) return;
  startGame();
  startBtn.disabled = true;
});

restartBtn.addEventListener("click", () => {
  startGame();
  startBtn.disabled = true;
});

document.addEventListener("keydown", (e) => {
  if (!gameInterval || gameOver) return; 
  if (demon.state === 'dead') return;

  switch (e.key.toLowerCase()) {
    case 'w':
    case 'arrowup':
      demon.jump();
      break;
    case 's':
    case 'arrowdown':
      demon.slide();
      break;
    case 'a':
    case ' ':
      demon.attack();
      break;
  }
});
