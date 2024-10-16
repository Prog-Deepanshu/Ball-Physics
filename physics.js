const canvas = document.getElementById('physicsCanvas');
const ctx = canvas.getContext('2d');

const gravity = 0.5;
const friction = 0.99;
const bounceFactor = 0.9;
const numBalls = 10; // Initial number of balls
const MAX_BALLS = 50; // Maximum number of balls

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Ball {
  constructor(x, y, radius, color, velocityX, velocityY) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.velocityY += gravity;

    this.x += this.velocityX;
    this.y += this.velocityY;

    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.velocityY = -this.velocityY * bounceFactor;
    }

    this.velocityX *= friction;
    this.velocityY *= friction;
  }

  static resolveCollision(ballA, ballB) {
    const dx = ballB.x - ballA.x;
    const dy = ballB.y - ballA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = ballA.radius + ballB.radius;

    if (distance < minDistance) {
      const angle = Math.atan2(dy, dx);
      const overlap = minDistance - distance;
      const pushX = (overlap / 2) * Math.cos(angle);
      const pushY = (overlap / 2) * Math.sin(angle);

      ballA.x -= pushX;
      ballA.y -= pushY;
      ballB.x += pushX;
      ballB.y += pushY;

      const tempVelocityX = ballA.velocityX;
      const tempVelocityY = ballA.velocityY;

      ballA.velocityX = ballB.velocityX;
      ballA.velocityY = ballB.velocityY;

      ballB.velocityX = tempVelocityX;
      ballB.velocityY = tempVelocityY;
    }
  }
}

function getRandomBall(x, y) {
  const radius = Math.random() * 20 + 10;
  const velocityX = (Math.random() * 5 - 2.5);
  const velocityY = (Math.random() * 5 - 2.5);
  const color = `hsl(${Math.random() * 360}, 100%, 50%)`;

  return new Ball(x, y, radius, color, velocityX, velocityY);
}

let balls = [];

for (let i = 0; i < numBalls; i++) {
  const x = Math.random() * (canvas.width - 40) + 20;
  const y = Math.random() * (canvas.height - 40) + 20;
  balls.push(getRandomBall(x, y));
}

canvas.addEventListener('click', (event) => {
  if (balls.length < MAX_BALLS) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    balls.push(getRandomBall(x, y));
  }
});

let lastTime = 0;
const FRAME_RATE = 60;

function update(currentTime) {
  if (currentTime - lastTime >= 1000 / FRAME_RATE) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastTime = currentTime;

    balls.forEach((ball, index) => {
      ball.draw();
      ball.update();

      if (ball.y > canvas.height + ball.radius) {
        balls.splice(index, 1);
      }
    });

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        Ball.resolveCollision(balls[i], balls[j]);
      }
    }
  }
  requestAnimationFrame(update);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
update();
