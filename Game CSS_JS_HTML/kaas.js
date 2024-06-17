let playerX, playerY;
let prevPlayerX = 0, prevPlayerY = 0;
let playAgainButton = { x: 550, y: 350, width: 100, height: 50 };
let playerWidth = 35, playerHeight = 30;
let playerOffsetX = 20
let playerSpeed = 6;
let gravity = 3.0;
let highScore = 0
let backgroundImage;
let cameraOffset = 0;
let currentPlatformColor = '#009900';
let coinCount = 0;
let isJumping = false;
let characterSprite;
let score = 0
let furthestPlatformX = 0;
let jumpStrength = 27;
let isGameOver = false;
let platforms = [];
let floorImage;
let jumpVelocity = 0; // Declare this variable at the top of your script with other global variables
const keys = {};
const lavaHeight = 85; // Height of the lava image

function preload() {
  // Load the water texture
  floorImage = loadImage('lava3.png'); // Ensure the correct path
  backgroundImage = loadImage('gamebackground2.png');
  characterSprite = loadImage('avatar.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    platforms = [];
    generatePlatform(0); // Initially generate the first platform with index 0
    // Position the player on the first platform
    playerX = platforms[0].x + (platforms[0].width - playerWidth) / 2;
    playerY = platforms[0].y - playerHeight;
    prevPlayerX = playerX;
    prevPlayerY = playerY;
  }

function draw() {
  // Draw the scrolling background
  drawScrollingBackground();


    if (isGameOver) {
      background(0); // Black background for the game over screen
      fill(255); // White text
      textSize(48);
      textAlign(CENTER, CENTER);
      text("Game Over", width / 2, height / 2);
      fill('#FFFFFF'); // Set fill color for button
    rect(playAgainButton.x, playAgainButton.y, playAgainButton.width, playAgainButton.height); // Draw button

    fill(0); // Set fill color for text
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Play Again", playAgainButton.x + playAgainButton.width / 2, playAgainButton.y + playAgainButton.height / 2); // Draw text on button

      return; // Skip drawing the rest of the game
    }
    checkForCoinCollection();


  
    // Calculate camera offset based on player's position
    if (playerX > width / 2) {
      cameraOffset = playerX - width / 2;
    }
  
    // Manage platforms (generate new ones and remove old ones)
    managePlatforms();

    updatePlatforms();

    // Display the score
  fill(255); // Black text
  noStroke();
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 10, 10); // Position the score in the top-left corner
    
  platforms.forEach(platform => {
    fill(platform.color); // Use the platform's color, or default to green
    let platformX = platform.x - cameraOffset;
    rect(platformX, platform.y, platform.width, platform.height);

    // Draw coin
    if (!platform.coin.collected) {
        fill('#FFD700'); // Gold color for the coin
        // Apply a sine wave to the coin's y position for a hovering effect
        let hoverY = platform.coin.y + sin(frameCount * 0.1) * 5; // Oscillates the y position
        ellipse(platform.coin.x - cameraOffset, hoverY, 20, 20);
    }

    // Draw the hitbox outline
    noFill();
    stroke(0); // Black color
    rect(platformX, platform.y, platform.width, platform.height);
    noStroke();
});


  drawCharacter();

    // Display the high score
  fill(255); // Black text
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
drawScrollingFloor();  // This will draw the scrolling floor
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }

  function drawCharacter() {
    let spriteWidth = characterSprite.width;
    let spriteHeight = characterSprite.height;
    let scale = (playerHeight / spriteHeight) * 2.5; // Adjust the factor to make the sprite bigger
    let scaledWidth = spriteWidth * scale;
    let scaledHeight = spriteHeight * scale;

    // Draw the character sprite
    image(characterSprite, playerX - cameraOffset, playerY - (scaledHeight - playerHeight), scaledWidth, scaledHeight);

    // Draw the hitbox outline
    noFill();
    stroke(0); // Black color
    rect(playerX - cameraOffset + playerOffsetX, playerY, playerWidth, playerHeight);
    noStroke();
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


  function updatePlatforms() {
    platforms.forEach(platform => {
      if (platform.moving) {
        // Calculate the previous position before updating
        let prevX = platform.x;
  
        // Update the platform's position
        platform.x += platform.moveSpeed * platform.moveDirection;
        
        // Turn around if the platform reaches the end of its range
        if (platform.x > platform.originalX + platform.moveRange || platform.x < platform.originalX - platform.moveRange) {
          platform.moveDirection *= -1;
        }
  
        // Update the coin's position to remain centered on the platform
        // Calculate the shift amount
        let shiftX = platform.x - prevX;
        platform.coin.x += shiftX;
      }
    });
  }
  

  function mousePressed() {
    // Check if we're on the game over screen and the mouse is over the button
    if (isGameOver &&
        mouseX >= playAgainButton.x &&
        mouseX <= playAgainButton.x + playAgainButton.width &&
        mouseY >= playAgainButton.y &&
        mouseY <= playAgainButton.y + playAgainButton.height) {
        resetGame(); // Call the reset game function
    }
  }
  
  

  function generatePlatform(lastX) {
    const jumpHeight = (jumpStrength * jumpStrength) / (2 * gravity);
    const jumpWidth = jumpHeight * (playerSpeed / gravity);
  
    // Set minimum and maximum distances to 135% and 155% of the calculated jumpWidth and jumpHeight respectively
    const minGapX = jumpWidth * 1.35;
    const maxGapX = jumpWidth * 1.55;
    const minGapY = jumpHeight * 1.35;
    const maxGapY = jumpHeight * 1.55;
  
    // Generate next platform within reachable distance
    let nextPlatformX = lastX + random(minGapX, maxGapX);
    let nextPlatformY = random(height - maxGapY, height - minGapY - playerHeight);
  
    let platformWidth = random(150, 175);
    let platformHeight = 20;
    let coin = { 
      x: nextPlatformX + platformWidth / 2, // Center the coin on the platform
      y: nextPlatformY - 20, 
      collected: false 
    };
  
  
    // Add properties for movement, conditionally for non-first platforms
    let moving = platforms.length > 0 && random() < 0.5; // 50% chance for a platform to move, but not the first one
    let moveSpeed = moving ? random(1, 2) : 0; // Random speed for moving platforms
    let moveRange = moving ? random(50, 100) : 0; // Random range for moving platforms
  
  
    platforms.push({
      x: nextPlatformX,
      y: nextPlatformY,
      width: platformWidth,
      height: platformHeight,
      coin: coin,
      moving: moving,
      moveSpeed: moveSpeed,
      moveRange: moveRange,
      moveDirection: 1, // 1 for right, -1 for left
      originalX: nextPlatformX, // Remember the original X position for movement calculations
      color: currentPlatformColor // Set platform color
    });
    
  }
 
  function resetGame() {
    isGameOver = false;
    score = 0; // Reset score to 0
    coinCount = 0; // Reset coin count to 0
    currentPlatformColor = '#009900'; // Reset to original platform color

    // Reset all platforms to the original color
    platforms.forEach(platform => {
      platform.color = currentPlatformColor;
    });

    platforms = [];
    generatePlatform(0); // Reinitialize platforms starting from the beginning
    playerX = platforms[0].x + (platforms[0].width - playerWidth) / 2;
    playerY = platforms[0].y - playerHeight;
    prevPlayerX = playerX;
    prevPlayerY = playerY;
    cameraOffset = 0;
    isJumping = false;
    jumpVelocity = 0;
}

function drawScrollingBackground() {
  let backgroundWidth = backgroundImage.width;
  let backgroundHeight = backgroundImage.height;
  let scale = height / backgroundHeight;
  let scaledWidth = backgroundWidth * scale;

  let xOffset = -(cameraOffset * 0.5) % scaledWidth;

  for (let x = xOffset; x < width; x += scaledWidth) {
      image(backgroundImage, x, 0, scaledWidth, height);
  }
}

function drawScrollingFloor() {
  let floorWidth = floorImage.width;
  let floorHeight = floorImage.height;
  let scale = lavaHeight / floorHeight;
  let scaledWidth = floorWidth * scale;

  let xOffset = -(cameraOffset * 0.5) % scaledWidth;

  for (let x = xOffset; x < width; x += scaledWidth) {
      image(floorImage, x, height - lavaHeight, scaledWidth, lavaHeight);
  }
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
      jumpVelocity -= gravity; // Apply gravity, reducing the upward velocity, then increasing downward velocity
      if (jumpVelocity >= 0) {
          isJumping = false; // Start falling
      }
  } else if (!playerIsGrounded()) {
      playerY -= jumpVelocity; // Apply gravity
      jumpVelocity -= gravity; // Increase downward velocity
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
  if (playerY >= height - lavaHeight - playerHeight) {
      // Update high score before resetting the game
      if (score > highScore) {
          highScore = score;
      }
      if (playerY >= height - lavaHeight - playerHeight) {
          if (score > highScore) {
              highScore = score; // Update high score if current score is greater
          }
          playerY = height - lavaHeight - playerHeight; // Place the player on the ground
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
    if (playerY >= height - lavaHeight - playerHeight) {
        return true; // The player is on the ground.
    } else {
        for (let platform of platforms) {
            if (
                playerX + playerOffsetX < platform.x + platform.width &&
                playerX + playerWidth + playerOffsetX > platform.x &&
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
      if (playerX + playerOffsetX < platform.x + platform.width &&
          playerX + playerWidth + playerOffsetX > platform.x &&
          playerY < platform.y + platform.height &&
          playerY + playerHeight > platform.y) {

          // Top collision
          if (prevPlayerY + playerHeight <= platform.y) {
              return { collision: 'top', y: platform.y };
          }
          // Bottom collision
          else if (prevPlayerY >= platform.y + platform.height) {
              return { collision: 'bottom', y: platform.y + platform.height };
          }
          // Side collisions
          else if (playerX + playerOffsetX < platform.x + platform.width && prevPlayerX + playerWidth + playerOffsetX <= platform.x) {
              return { collision: 'left', x: platform.x };
          }
          else if (playerX + playerWidth + playerOffsetX > platform.x && prevPlayerX >= platform.x + platform.width) {
              return { collision: 'right', x: platform.x + platform.width };
          }
      }
  }
  return { collision: false }; // No collision
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
        coinCount++; // Increment the coin count

        // Check if coin count is a multiple of 15
        if (coinCount % 15 === 0) {
            changePlatformColors(); // Change colors of all platforms
        }
      }
    });
}
function changePlatformColors() {
  currentPlatformColor = randomColor(); // Update the global color
  platforms.forEach(platform => {
    platform.color = currentPlatformColor; // Apply new global color to each platform
  });
}


function randomColor() {
  // Returns a random color in hexadecimal format
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}
