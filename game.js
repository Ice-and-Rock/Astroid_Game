const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
let gameOver = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// stretch goals
// - have the ateroids break into smaller circles
// - add event listener for the down button to go backwards
// - + go backwards at half speed
// - look at making asteroids move diagonally
// - Render gameover when function 'circleTriangleCollision' runs

class Player {
  constructor({ position, velocity }) {
    this.position = position; // {x, y}
    this.velocity = velocity;
    this.rotation = 0;
  }

  draw() {
    c.save();

    c.translate(this.position.x, this.position.y);
    c.rotate(this.rotation);
    c.translate(-this.position.x, -this.position.y);

    c.beginPath();
    c.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false);
    c.fillStyle = "red";
    c.fill();
    c.closePath();

    // c.fillStyle = 'red'
    // c.fillRect(this.position.x, this.position.y, 100, 100)
    c.beginPath();
    c.moveTo(this.position.x + 30, this.position.y);
    c.lineTo(this.position.x - 10, this.position.y - 10);
    c.lineTo(this.position.x - 10, this.position.y + 10);
    c.closePath();

    c.strokeStyle = "white";
    c.stroke();
    c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  getVertices() {
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);

    return [
      {
        x: this.position.x + cos * 30 - sin * 0,
        y: this.position.y + sin * 30 + cos * 0,
      },
      {
        x: this.position.x + cos * -10 - sin * 10,
        y: this.position.y + sin * -10 + cos * 10,
      },
      {
        x: this.position.x + cos * -10 - sin * -10,
        y: this.position.y + sin * -10 + cos * -10,
      },
    ];
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    c.closePath();
    c.fillStyle = "white";
    c.fill();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Asteroid {
  constructor({ position, velocity, radius }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    c.closePath();
    c.strokeStyle = "white";
    c.stroke();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

const player = new Player({
  position: { x: canvas.width / 2, y: canvas.height / 2 },
  velocity: { x: 0, y: 0 },
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const SPEED = 4;
const ROTATIONAL_SPEED = 0.15;
const FRICTION = 0.97;
const PROJECTILE_SPEED = 10;

const projectiles = [];
const asteroids = [];

const intervalId = window.setInterval(() => {
  const index = Math.floor(Math.random() * 4);
  let x, y;
  let vx, vy;
  let radius = 50 * Math.random() + 10;

  switch (index) {
    case 0: // left side of the screen without margin
      x = 0 - radius;
      y = Math.random() * canvas.height;
      vx = 3;
      vy = 0;
      break;
    case 1: // bottom side of the screen without margin
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
      vx = 0;
      vy = -4;
      break;
    case 2: // right side of the screen without margin
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
      vx = -2;
      vy = 0;
      break;
    case 3: // top side of the screen without margin
      x = Math.random() * canvas.width;
      y = 0 - radius;
      vx = 0;
      vy = 3;
      break;
  }

  // add asteroids to the array
  asteroids.push(
    new Asteroid({
      position: {
        x: x,
        y: y,
      },
      velocity: {
        x: vx,
        y: vy,
      },
      radius,
    })
  );

  console.log('Test Asteroid' + asteroids);
}, 3000);

// a function to determain whther asteroid and projective are touching
function circleCollision(circle1, circle2) {
  const xDifference = circle2.position.x - circle1.position.x;
  const yDifference = circle2.position.y - circle1.position.y;

  const distance = Math.sqrt(
    xDifference * xDifference + yDifference * yDifference
  );

  //using pythagorous this is the distance from center to diameter
  if (distance <= circle1.radius + circle2.radius) {
    return true;
  }

  return false;
}

// this will eventually render GAMEOVER**
function circleTriangleCollision(circle, triangle) {
  // Check if the circle is colliding with any of the triangle's edges
  // initiates freezing the game
  for (let i = 0; i < 3; i++) {
    let start = triangle[i];
    let end = triangle[(i + 1) % 3];

    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let length = Math.sqrt(dx * dx + dy * dy);

    let dot =
      ((circle.position.x - start.x) * dx +
        (circle.position.y - start.y) * dy) /
      Math.pow(length, 2);

    let closestX = start.x + dot * dx;
    let closestY = start.y + dot * dy;

    if (!isPointOnLineSegment(closestX, closestY, start, end)) {
      closestX = closestX < start.x ? start.x : end.x;
      closestY = closestY < start.y ? start.y : end.y;
    }

    dx = closestX - circle.position.x;
    dy = closestY - circle.position.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= circle.radius) {
      // Gameover function runs
      gameOver = true;
      return true;
      // Stretch goal
      // + have the message GAMEOVER render and options to start again??
    }
  }

  // No collision with circle
  return false;
}

function isPointOnLineSegment(x, y, start, end) {
  return (
    x >= Math.min(start.x, end.x) &&
    x <= Math.max(start.x, end.x) &&
    y >= Math.min(start.y, end.y) &&
    y <= Math.max(start.y, end.y)
  );
}

function animate() {
  const animationId = window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  console.log('animate running')



  player.update();

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    projectile.update();

    // garbage collection for projectiles
    if (
      projectile.position.x + projectile.radius < 0 ||
      projectile.position.x - projectile.radius > canvas.width ||
      projectile.position.y - projectile.radius > canvas.height ||
      projectile.position.y + projectile.radius < 0
    ) {
      projectiles.splice(i, 1);
    }
  }

  // asteroid management
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    asteroid.update();

    // Collision checker
    // - renders gameOver variable to true 
    if (circleTriangleCollision(asteroid, player.getVertices())) {
      console.log("GAME OVER");
      gameOver = true;
      console.log(gameOver)
      window.cancelAnimationFrame(animationId);
      clearInterval(intervalId);
    }

    // garbage collection for projectiles
    // removes the projectiles on contact with circle1
    if (
      asteroid.position.x + asteroid.radius < 0 ||
      asteroid.position.x - asteroid.radius > canvas.width ||
      asteroid.position.y - asteroid.radius > canvas.height ||
      asteroid.position.y + asteroid.radius < 0
    ) {
      asteroids.splice(i, 1);
    }

    // projectiles
    // producting them and setting rotational speed
    for (let j = projectiles.length - 1; j >= 0; j--) {
      const projectile = projectiles[j];

      if (circleCollision(asteroid, projectile)) {
        asteroids.splice(i, 1);
        projectiles.splice(j, 1);
      }
    }
  }

    // GAMEOVER message
    // - moved to outside of the collision checker 
    if (gameOver) {
      console.log('Test 1' + typeof(gameOver))
      // Render "gameover" message
      c.fillStyle = "white";
      c.font = "bold 100px Arial";
      c.textAlign = "center";
      c.fillText("GameOver", canvas.width / 2, canvas.height / 2);
      
    // UPDATE 31/07/23
    // Draw restart button
    c.fillStyle = "gray";
    c.fillRect(
      canvas.width / 2 - 100,
      canvas.height / 2 + 50,
      200,
      60
    );

    c.fillStyle = "white";
    c.font = "bold 32px Arial";
    c.textAlign = "center";
    c.fillText("Restart...", canvas.width / 2, canvas.height / 2 + 90);
    
      // below stops rendering game elements
       // Stop rendering game elements and animations
       window.cancelAnimationFrame(animationId);
      return;
    }

  if (keys.w.pressed) {
    player.velocity.x = Math.cos(player.rotation) * SPEED;
    player.velocity.y = Math.sin(player.rotation) * SPEED;
  } else if (!keys.w.pressed) {
    player.velocity.x *= FRICTION;
    player.velocity.y *= FRICTION;
  }

  if (keys.d.pressed) player.rotation += ROTATIONAL_SPEED;
  else if (keys.a.pressed) player.rotation -= ROTATIONAL_SPEED;
}

animate();

window.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "KeyW":
      keys.w.pressed = true;
      break;
    case "KeyA":
      keys.a.pressed = true;
      break;
    case "KeyD":
      keys.d.pressed = true;
      break;
    case "Space":
      // produce projectile when space pressed
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + Math.cos(player.rotation) * 30,
            y: player.position.y + Math.sin(player.rotation) * 30,
          },
          velocity: {
            x: Math.cos(player.rotation) * PROJECTILE_SPEED,
            y: Math.sin(player.rotation) * PROJECTILE_SPEED,
          },
        })
      );

      break;
  }
});

// event listeners for the hot keys
// no backwards - stretch goal?
window.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "KeyW":
      keys.w.pressed = false;
      break;
    case "KeyA":
      keys.a.pressed = false;
      break;
    case "KeyD":
      keys.d.pressed = false;
      break;
  }
});



// UPDATE 31/07/23
// Handling click event on canvas
canvas.addEventListener("click", (event) => {
  // Check if the click was inside the button area
  const buttonWidth = 200;
  const buttonHeight = 60;
  const buttonX = canvas.width / 2 - buttonWidth / 2;
  const buttonY = canvas.height / 2 + 50;

  const mouseX = event.clientX - canvas.offsetLeft;
  const mouseY = event.clientY - canvas.offsetTop;

  if (
    mouseX >= buttonX &&
    mouseX <= buttonX + buttonWidth &&
    mouseY >= buttonY &&
    mouseY <= buttonY + buttonHeight
  ) {
    // Reload the webpage when the button is clicked
    location.reload();
  }
});

