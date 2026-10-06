/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Example Object
const ball = {
    x: 100,
    y: 100,
    radius: 20,
    dx: 4,
    dy: 4
};

// Animation Loop
function animate() {
    // 1. Clear the canvas before the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw elements
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00ffcc';
    ctx.fill();
    ctx.closePath();

    // 3. Update physics/positions
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Bounce off walls
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx *= -1;
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) ball.dy *= -1;

    // 4. Request next frame
    requestAnimationFrame(animate);
}

// Start the animation
animate();
