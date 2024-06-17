function checkForCoinCollection() {
    platforms.forEach(platform => {
      if (!platform.coin.collected &&
        playerX < platform.coin.x + 5 &&
        playerX + playerWidth > platform.coin.x - 5 &&
        playerY < platform.coin.y + 5 &&
        playerY + playerHeight > platform.coin.y - 5) {
        platform.coin.collected = true;
        score++;
        coinCount++;
        if (coinCount % 15 === 0) {
          changePlatformColors();
        }
      }
    });
  }
  