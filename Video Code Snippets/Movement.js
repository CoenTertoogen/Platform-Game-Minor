function handleMovement() {
    if (keys['ArrowLeft']) {
      playerX -= playerSpeed;
    }
    if (keys['ArrowRight']) {
      playerX += playerSpeed;
    }
  }
  
  function handleGravity() {
    if (isJumping) {
      playerY -= jumpVelocity;
      jumpVelocity -= gravity;
      if (jumpVelocity <= 0) {
        isJumping = false;
      }
    } else if (!playerIsGrounded()) {
      playerY -= jumpVelocity;
      jumpVelocity -= gravity;
    }
    let platformCollision = checkPlatformCollision();
    if (platformCollision.collision === 'top' && playerY >= platformCollision.y - playerHeight) {
      playerY = platformCollision.y - playerHeight;
      isJumping = false;
      jumpVelocity = 0;
    } else if (platformCollision.collision === 'bottom') {
      jumpVelocity = 0;
    } else if (platformCollision.collision === 'left' || platformCollision.collision === 'right') {
      playerX = prevPlayerX;
    }
    if (playerY >= height - lavaHeight - playerHeight) {
      if (score > highScore) {
        highScore = score;
      }
      isGameOver = true;
    }
  }
  