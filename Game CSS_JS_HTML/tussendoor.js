let playerX, playerY;
let prevPlayerX = 0, prevPlayerY = 0;
let playerWidth = 30, playerHeight = 30;
let playerSpeed = 6;
let gravity = 3.0;
let cameraOffset = 0;
let isJumping = false;
let jumpStrength = 27;
let platforms = [];
let jumpVelocity = 0; // Declare this variable at the top of your script with other global variables
const keys = {};

function setup() {
  createCanvas(1200, 600);
  platforms = [];
  generatePlatform(0); // Initially generate the first platform
  // Position the player on the first platform
  playerX = platforms[0].x + (platforms[0].width - playerWidth) / 2;
  playerY = platforms[0].y - playerHeight;
  prevPlayerX = playerX;
  prevPlayerY = playerY;
}

function draw() {
    background(220);
  
    // Calculate camera offset based on player's position
    if (playerX > width / 2) {
      cameraOffset = playerX - width / 2;
    }
  
    // Manage platforms (generate new ones and remove old ones)
    managePlatforms();
  
    // Draw the platforms with camera offset
    fill('#009900');
    platforms.forEach(platform => {
      let platformX = platform.x - cameraOffset;
      rect(platformX, platform.y, platform.width, platform.height);
    });
  
    // Draw the player with camera offset
    fill('#0000FF');
    rect(playerX - cameraOffset, playerY, playerWidth, playerHeight);
  
    // Handle player movement, gravity, and jumping
    handleMovement();
    handleGravity();
    handleJump(); // This will check and execute jumping
}
  

function managePlatforms() {
    // Remove platforms that have left the screen on the left
    platforms = platforms.filter(platform => platform.x - cameraOffset > -platform.width);
  
    // Add new platforms if there aren't enough ahead
    let lastPlatform = platforms[platforms.length - 1];
    if (lastPlatform.x - cameraOffset < width) {
      generatePlatform(lastPlatform.x);
    }
  }
  
  

  function generatePlatform(lastX) {
    // Calculate the x position of the new platform to be off the right edge of the canvas
    let x = lastX + random(200, 350); // Increase the minimum space to ensure platforms are reachable
    let y = random(height / 2, height - 100); // The y position should allow for the player to jump up to the platform
    let platformWidth = random(50, 150); // You can randomize the width for variety
    let platformHeight = 20; // Keep a standard height for all platforms
  
    platforms.push({ x: x, y: y, width: platformWidth, height: platformHeight });
  }
  
  

function handleMovement() {
  if (keys['ArrowLeft']) {
    playerX -= playerSpeed;
  }
  if (keys['ArrowRight']) {
    playerX += playerSpeed;
  }
}

function keyPressed() {
  keys[key] = true;
}

function keyReleased() {
  keys[key] = false;
}

function handleGravity() {
    if (isJumping) {
      playerY -= jumpVelocity;
      jumpVelocity -= gravity;
      if (jumpVelocity <= 0) {
        isJumping = false; // Start falling
      }
    } else if (!playerIsGrounded()) {
      playerY += gravity; // Apply gravity
    }
  
    let platformCollision = checkPlatformCollision();
    if (platformCollision.collision === 'top' && playerY >= platformCollision.y - playerHeight) {
      playerY = platformCollision.y - playerHeight; // Land on the platform
      isJumping = false;
      jumpVelocity = 0; // Reset the jump velocity
    } else if (playerY >= height - playerHeight) {
      playerY = height - playerHeight; // Land on the ground
      isJumping = false;
      jumpVelocity = 0; // Reset the jump velocity
    }
  }
  
  
  function handleJump() {
    // Start the jump if the player is grounded and the jump key is pressed
    if (keys['ArrowUp'] && !isJumping && playerIsGrounded()) {
      isJumping = true;
      jumpVelocity = jumpStrength; // Set the initial velocity of the jump
    }
  }
  function endJump() {
    // End the jumping state and reset jump-related variables
    isJumping = false;
    jumpVelocity = 0;
  }

  function playerIsGrounded() {
    if (playerY >= height - playerHeight) {
      return true; // The player is on the ground.
    } else {
      for (let platform of platforms) {
        if (
          playerX < platform.x + platform.width &&
          playerX + playerWidth > platform.x &&
          playerY >= platform.y - playerHeight &&
          playerY <= platform.y - playerHeight + gravity
        ) {
          return true; // The player is on a platform if within the platform's bounds and close to its y value.
        }
      }
    }
    return false; // The player is not grounded.
  }
  
  
  

  function checkPlatformCollision() {
    for (let platform of platforms) {
      if (playerX < platform.x + platform.width &&
          playerX + playerWidth > platform.x &&
          playerY < platform.y + platform.height &&
          playerY + playerHeight > platform.y) {
        if (playerY + playerHeight <= platform.y + gravity) {
          // Player is coming from above the platform
          return {collision: 'top', y: platform.y};
        }
      }
    }
    return {collision: false}; // No collision
  }
