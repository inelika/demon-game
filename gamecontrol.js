class GameController {
  constructor(ctx, canvas, demon, enemies) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.demon = demon;
    this.enemies = enemies;
    this.gameOver = false;
    this.lastTime = 0;
  }

  gameLoop(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.demon.isDead) {
      this.stopGame();
      return;
    }

    this.demon.update(deltaTime);
    this.demon.draw();

    this.enemies = this.enemies.filter(enemy => {
      if (enemy.isDead) return false;
      enemy.update(deltaTime);
      enemy.draw();
      return true;
    });

    if (!this.gameOver) {
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  startGame() {
    this.lastTime = performance.now();
    this.gameOver = false;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  stopGame() {
    this.gameOver = true;

    const score = this.demon.score || 0;
    const highScore = Math.max(score, localStorage.getItem("highScore") || 0);
    localStorage.setItem("highScore", highScore);

   
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);

    this.ctx.fillStyle = "white";
    this.ctx.font = "20px Arial";
    this.ctx.fillText("Вы умерли", 20, this.canvas.height - 70);
    this.ctx.fillText(`Счёт: ${score}`, 20, this.canvas.height - 45);
    this.ctx.fillText(`Рекорд: ${highScore}`, 20, this.canvas.height - 20);

    this.showRestartButton();
  }

  showRestartButton() {
    const btn = document.createElement("button");
    btn.innerText = "Начать заново";
    btn.style.position = "absolute";
    btn.style.bottom = "20px";
    btn.style.left = "20px";
    btn.style.padding = "10px 20px";
    btn.style.fontSize = "16px";
    btn.style.zIndex = "10";

    btn.onclick = () => {
      btn.remove();
      this.resetGame(); 
    };

    document.body.appendChild(btn);
  }

  resetGame() {
    this.demon = new Demon(); 
    this.enemies = []; 

    this.startGame();
  }
}
