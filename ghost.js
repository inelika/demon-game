export class Ghost {
    constructor(ctx, x, difficulty) {
        this.ctx = ctx;
        this.x = x;
        this.width = 70;
        this.height = 70;
        this.speed = 1;
        this.isDead = false;
        this.difficulty = difficulty;
        this.state = 'stand';

        if (difficulty === 'medium') {
            this.y = 150;
        } else if (difficulty === 'hard') {
            this.y = 150;
            this.floatDirection = -1;
        } else {
            this.y = -999;
        }

        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameInterval = 100;

        this.frameCount = {
            stand: 18,
            death: 15
        };

        this.sprites = {
            stand: { img: new Image(), loaded: false, src: 'images/ghostfly.png' },
            death: { img: new Image(), loaded: false, src: 'images/ghostdeath.png' }
        };

        this.loadImages();
    }

    loadImages() {
        Object.keys(this.sprites).forEach(key => {
            const sprite = this.sprites[key];
            sprite.img.onload = () => sprite.loaded = true;
            sprite.img.onerror = () => console.error(`Ошибка загрузки изображения: ${sprite.src}`);
            sprite.img.src = sprite.src;
        });
    }

    update(speed) {
        if (this.isDead) return;

        if (this.difficulty === 'hard') {
            this.y += this.floatDirection * 0.7;
            if (this.y <= 100 || this.y >= 200) {
                this.floatDirection *= -1;
            }
        } else if (this.difficulty === 'medium') {
            this.y = 150;
        }

        this.x -= speed + this.speed;

        if (this.state === 'stand') {
            this.frameTimer++;
            if (this.frameTimer >= this.frameInterval) {
                this.frameTimer = 0;
                this.frameIndex = (this.frameIndex + 1) % this.frameCount.stand;
            }
        }
    }

    draw() {
        const sprite = this.sprites[this.state];
        if (sprite.loaded) {
            const frameWidth = sprite.img.width / this.frameCount[this.state];
            this.ctx.drawImage(
                sprite.img,
                this.frameIndex * frameWidth, 0,
                frameWidth, sprite.img.height,
                this.x, this.y,
                this.width, this.height
            );
        } else {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    die() {
        this.isDead = true;
        this.state = 'death';
    }
}
