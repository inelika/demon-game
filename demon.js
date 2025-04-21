export class Demon {
    constructor(ctx, groundY) {
      this.ctx = ctx;
      this.x = 100;
      this.y = groundY;
      this.groundY = groundY;
      this.width = 70;
      this.height = 70;
  
      this.speed = 5;
      this.jumpPower = 15;
      this.velocityY = 0;
      this.gravity = 0.5;
  
      this.state = 'run';
      this.frameIndex = 0;
      this.frameTimer = 0;
      this.frameInterval = 100;
  
      this.frameCount = {
        run: 6,
        jump: 12,
        attack: 12,
        slide: 6,
        death: 15
      };
  
      this.sprites = {
        run: { img: new Image(), loaded: false, src: 'images/demrun.png' },
        jump: { img: new Image(), loaded: false, src: 'images/demjump.png' },
        attack: { img: new Image(), loaded: false, src: 'images/demattack.png' },
        slide: { img: new Image(), loaded: false, src: 'images/demslip.png' },
        death: { img: new Image(), loaded: false, src: 'images/demdeath.png' }
      };
  
      this.loadImages();
    }
  
    loadImages() {
      Object.keys(this.sprites).forEach(key => {
        const sprite = this.sprites[key];
        sprite.img.onload = () => {
          sprite.loaded = true;
        };
        sprite.img.src = sprite.src;
      });
    }
  
    get isJumping() {
      return this.state === 'jump';
    }
  
    get isSliding() {
      return this.state === 'slide';
    }
  
    get isAttacking() {
      return this.state === 'attack';
    }
  
    get isDead() {
      return this.state === 'death';
    }
  
    update(deltaTime) {
      if (this.isDead) {
        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameInterval) {
          this.frameTimer = 0;
          const maxFrames = this.frameCount.death;
          if (this.frameIndex < maxFrames - 1) {
            this.frameIndex++;
          }
        }
        return;
      }
  
      if (this.isJumping) {
        this.velocityY += this.gravity;
        this.y += this.velocityY;
  
        if (this.y >= this.groundY) {
          this.y = this.groundY;
          this.velocityY = 0;
          this.changeState('run');
        }
      }
  
      this.frameTimer += deltaTime;
      if (this.frameTimer >= this.frameInterval) {
        this.frameTimer = 0;
        const maxFrames = this.frameCount[this.state] || 1;
        this.frameIndex = (this.frameIndex + 1) % maxFrames;
      }
    }
  
    draw() {
      const sprite = this.sprites[this.state];
      const maxFrames = this.frameCount[this.state] || 1;
  
      if (sprite.loaded) {
        const frameWidth = sprite.img.width / maxFrames;
        const drawY = this.state === 'slide' ? this.y + 20 : this.y;
        const drawHeight = this.state === 'slide' ? this.height - 20 : this.height;
  
        this.ctx.drawImage(
          sprite.img,
          this.frameIndex * frameWidth,
          0,
          frameWidth,
          sprite.img.height,
          this.x,
          drawY,
          this.width,
          drawHeight
        );
      } else {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
  
    changeState(newState) {
      if (!this.sprites[newState]) return;
      if (this.state === newState) return;
      if (this.isDead && newState !== 'death') return;
  
      this.state = newState;
      this.frameIndex = 0;
      this.frameTimer = 0;
    }
  
    jump() {
      if (this.y === this.groundY && !this.isSliding && !this.isDead) {
        this.velocityY = -this.jumpPower;
        this.changeState('jump');
      }
    }
  
    slide() {
      if (this.y === this.groundY && !this.isSliding && !this.isJumping && !this.isDead) {
        this.changeState('slide');
        setTimeout(() => {
          if (this.isSliding) this.changeState('run');
        }, 800);
      }
    }
  
    attack() {
      if (!this.isAttacking && !this.isJumping && !this.isDead) {
        this.changeState('attack');
        setTimeout(() => {
          if (this.isAttacking) this.changeState('run');
        }, 500);
      }
    }
  
    die() {
      if (!this.isDead) {
        this.changeState('death');
      }
    }
  
    deathAnimationFinished() {
      return this.isDead && this.frameIndex === this.frameCount.death - 1;
    }
  }
  
