let playerX, playerY;
let prevPlayerX = 0, prevPlayerY = 0;
let playerWidth = 30, playerHeight = 30;
let playerSpeed = 6;
let gravity = 3.0;
let highScore = 0
let cameraOffset = 0;
let isJumping = false;
let score = 0
let furthestPlatformX = 0;
let jumpStrength = 27;
let isGameOver = false;
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
    if (isGameOver) {
      background(0); // Black background for the game over screen
      fill(255); // White text
      textSize(48);
      textAlign(CENTER, CENTER);
      text("Game Over", width / 2, height / 2);
      return; // Skip drawing the rest of the game
    }
    checkForCoinCollection();

  
    // Calculate camera offset based on player's position
    if (playerX > width / 2) {
      cameraOffset = playerX - width / 2;
    }
  
    // Manage platforms (generate new ones and remove old ones)
    managePlatforms();

    // Display the score
  fill(0); // Black text
  noStroke();
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 10, 10); // Position the score in the top-left corner

  
    // Draw the platforms with camera offset
    platforms.forEach(platform => {
      fill('#009900');
      let platformX = platform.x - cameraOffset;
      rect(platformX, platform.y, platform.width, platform.height);
    
      // Draw coin
      if (!platform.coin.collected) {
        fill('#FFD700'); // Gold color for the coin
        // Apply a sine wave to the coin's y position for a hovering effect
        let hoverY = platform.coin.y + sin(frameCount * 0.1) * 5; // Oscillates the y position
        ellipse(platform.coin.x - cameraOffset, hoverY, 20, 20);
      }
    });
  
    // Draw the player with camera offset
    fill('#0000FF');
    rect(playerX - cameraOffset, playerY, playerWidth, playerHeight);

    // Display the high score
  fill(0); // Black text
  noStroke();
  textSize(24);
  textAlign(RIGHT, TOP);
  text(`High Score: ${highScore}`, width - 10, 10); // Position the high score in the top-right corner

  
    // Handle player movement, gravity, and jumping
    handleMovement();
    handleGravity();
    handleJump(); // This will check and execute jumping
    prevPlayerX = playerX;
    prevPlayerY = playerY;
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
    let x = lastX + random(200, 350);
    let y = random(height / 2, height - 100);
    let platformWidth = random(50, 150);
    let platformHeight = 20;
    let coin = { x: x + platformWidth / 2, y: y - 20, collected: false }; // Position coin in the middle of the platform, slightly above
  
    platforms.push({ x: x, y: y, width: platformWidth, height: platformHeight, coin: coin });
  }
  
  function resetGame() {
    isGameOver = false;
    score = 0; // Reset score to 0
    platforms = [];
    generatePlatform(0);
    playerX = platforms[0].x + (platforms[0].width - playerWidth) / 2;
    playerY = platforms[0].y - playerHeight;
    prevPlayerX = playerX;
    prevPlayerY = playerY;
    cameraOffset = 0;
    isJumping = false;
    jumpVelocity = 0;
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

  // Restart the game when 'R' is pressed
  if (key === 'R' || key === 'r') {
    if (isGameOver) {
      resetGame();
    }
  }
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
    } else if (platformCollision.collision === 'bottom') {
      jumpVelocity = 0; // Stop upward movement
    } else if (platformCollision.collision === 'left' || platformCollision.collision === 'right') {
      playerX = prevPlayerX; // Prevent further movement into the platform
    }
    if (playerY >= height - playerHeight) {
      // Update high score before resetting the game
      if (score > highScore) {
        highScore = score;
      }
      if (playerY >= height - playerHeight) {
        if (score > highScore) {
            highScore = score; // Update high score if current score is greater
        }
        playerY = height - playerHeight; // Place the player on the ground
        isJumping = false;
        jumpVelocity = 0;
        isGameOver = true; // Set game over state
    }
    if (platformCollision.x > furthestPlatformX) {
      furthestPlatformX = platformCollision.x;
      score++;
    }
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
            
        // Top collision
        if (prevPlayerY + playerHeight <= platform.y) {
          return {collision: 'top', y: platform.y};
        }
        // Bottom collision
        else if (prevPlayerY >= platform.y + platform.height) {
          return {collision: 'bottom', y: platform.y + platform.height};
        }
        // Side collisions
        else if (playerX < platform.x + platform.width && prevPlayerX + playerWidth <= platform.x) {
          return {collision: 'left', x: platform.x};
        }
        else if (playerX + playerWidth > platform.x && prevPlayerX >= platform.x + platform.width) {
          return {collision: 'right', x: platform.x + platform.width};
        }
      }
    }
    return {collision: false}; // No collision
  }
 
function checkForCoinCollection() {
    platforms.forEach(platform => {
      if (!platform.coin.collected &&
          playerX < platform.coin.x + 5 && 
          playerX + playerWidth > platform.coin.x - 5 &&
          playerY < platform.coin.y + 5 &&
          playerY + playerHeight > platform.coin.y - 5) {
        platform.coin.collected = true; // Mark the coin as collected
score++; // Increment score when a coin is collected

      }
    });
  }


  
  
