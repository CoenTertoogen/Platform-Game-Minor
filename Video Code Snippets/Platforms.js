function generatePlatform(lastX) {
    const jumpHeight = (calculatedJumpStrength * calculatedJumpStrength) / (2 * calculatedGravity);
    const jumpWidth = jumpHeight * (playerSpeed / calculatedGravity);
    const minGapX = jumpWidth * 1.05;
    const maxGapX = jumpWidth * 1.18;
    const minGapY = jumpHeight * 1.15;
    const maxGapY = jumpHeight * 1.85;
    let nextPlatformX = lastX + random(minGapX, maxGapX);
    let nextPlatformY = random(height - maxGapY, height - minGapY - playerHeight);
    let platformWidth = random(150, 175);
    let platformHeight = 20;
    let coin = { x: nextPlatformX + platformWidth / 2, y: nextPlatformY - 20, collected: false };
    platforms.push({
      x: nextPlatformX, y: nextPlatformY, width: platformWidth, height: platformHeight, coin: coin, 
      moving: moving, moveSpeed: moveSpeed, moveRange: moveRange, moveDirection: 1, 
      originalX: nextPlatformX, color: currentPlatformColor
    });
  }
  