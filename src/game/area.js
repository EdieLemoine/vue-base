const Area = function(name, multiplierBuff, initialBuff, baseColor, grownColor, machineColor, unlockPrice, message, value, machineName, hmm) {

  this.baseColor = baseColor;
  this.grownColor = grownColor;
  this.message = message;
  this.whyDoIDoThis = hmm;
  this.upgrades = [
    new Upgrade('machineSpeed', speedBasePrice * initialBuff, mowerRateMultiplier + multiplierBuff, function() {
      activeField.machineSpeed++;
    }, '%tpt% tiles/tick', '%name% Speed', function() {
      return activeField.machineSpeed < 20;
    }),
    new Upgrade('machineSize', sizeBasePrice * initialBuff, mowerSizeMultiplier + multiplierBuff, function() {
      if (activeField.machineWidth == activeField.machineHeight) {
        activeField.machineWidth++;
      } else {
        activeField.machineHeight++;
      }
      activeField.machineX = 0;
      activeField.machineY = 0;
    }, '%w%x%h%', '%name% Size', function() {
      console.log(`${activeField.machineHeight} ${tileSizes[activeField.tileSize]}`);
      return activeField.machineHeight < height / tileSizes[activeField.tileSize];
    }),
    new Upgrade('tileSize', tileBasePrice * initialBuff, tileSizeMultiplier + multiplierBuff, function() {
      activeField.tileSize = Math.min(activeField.tileSize + 1, tileSizes.length - 1);
      activeField.regenerate();
    }, '%sz%x%sz%', 'Tile Size', function() {
      return activeField.tileSize < tileSizes.length - 1;
    }),
    new Upgrade('growthRate', growthBasePrice * initialBuff, growthRateMultiplier + multiplierBuff, function() {
      activeField.growthAmount += 2;
    }, '%gr% growth/tick', 'Growth Rate', function() {
      return activeField.growthAmount < 60;
    }),
    new Upgrade('tickRate', tickBasePrice * initialBuff, tickBaseMultiplier + multiplierBuff, function() {
      activeField.tickRate = Math.max(1, Math.floor(activeField.tickRate * 0.9));
    }, '%ms% ms', 'Tick Rate', function() {
      return activeField.tickRate > 4;
    }),
  ];

  this.machineName = machineName;
  this.superExtra = 0;
  this.superTicks = 0;
  this.name = name;
  this.lastTick;
  this.growthAmount = 4;
  this.machineX = 0;
  this.machineY = 0;
  this.value = value;
  this.machineWidth = 1;
  this.machineHeight = 1;
  this.machineSpeed = 1;
  this.machineGoingUp = false;
  this.machineColor = machineColor;
  this.totalMowed = 0;
  this.field = [];
  this.tileSize = 0;
  this.tickRate = 1000;
  this.unlockPrice = unlockPrice;
  this.generateField = function() {
    for (let i = 0; i < width / tileSizes[this.tileSize]; i++) {
      this.field.push(new Array());
      for (let j = 0; j < height / tileSizes[this.tileSize]; j++) {
        this.field[i].push(Math.floor(Math.random() * maxGrowth));
        updateTile(this, i, j);
      }
    }
    this.lastTick = +new Date();
  };
  this.unlockField = function() {
    if (money >= this.unlockPrice) {
      money -= this.unlockPrice;
      unlockedFields++;
      currentPosition = unlockedFields - 1;
      activeField = this;
      this.generateField();
      tick(this);
    }
  };

  this.getUpgradeText = function(upgrade) {
    return upgrade.displayText.replace('%tpt%', this.machineSpeed).replace('%w%', this.machineWidth).replace('%h%', this.machineHeight).replace(/%sz%/g, width / tileSizes[this.tileSize]).replace('%ms%', this.tickRate).replace('%gr%', this.growthAmount);
  };

  this.regenerate = function() {
    this.field = [];
    this.generateField();
  };

  this.machineTick = function() {
    const currentTime = +new Date();
    const timeDifference = currentTime - this.lastTick;
    this.lastTick = currentTime;
    this.superExtra += timeDifference - this.tickRate;
    if (this.superExtra > this.tickRate * 5) {
      this.superTicks += Math.floor(this.superExtra / 5 / this.tickRate);
      this.superExtra %= this.tickRate * 5;
    }
    for (let i = 0; i < this.machineSpeed; i++) {
      const cX = this.machineX;
      const cY = this.machineY;
      for (let x = 0; x < this.machineWidth; x++) {
        for (let y = 0; y < this.machineHeight; y++) {
          const tX = x + cX;
          const tY = y + cY;
          if (this.field[tX][tY] >= 5) {
            this.field[tX][tY] = 0;
            money += this.value * (this.superTicks > 0 ? 5 : 1) * (1 + mulch / 100);
            totalMoney += this.value * (this.superTicks > 0 ? 5 : 1) * (1 + mulch / 100);
            this.superTicks = Math.max(0, this.superTicks - 1);
            this.totalMowed++;

          }
          if (activeField == this) {
            updateTile(this, tX, tY);
          }
        }
      }
      if (activeField == this) {
        document.getElementById('totalMowed').innerHTML = this.message + this.totalMowed;
      }
      updateMoney();
      if (this.goingUp) {
        if (this.machineY > 0) {
          this.machineY--;
        } else if (this.machineX >= width / tileSizes[this.tileSize] - this.machineWidth) {
          this.goingUp = false;
          this.machineX = 0;
          this.machineY = 0;
        } else {
          this.machineX = Math.min(this.machineX + this.machineWidth, width / tileSizes[this.tileSize] - this.machineWidth);
          this.goingUp = false;
        }
      } else if (this.machineY < height / tileSizes[this.tileSize] - this.machineHeight) {
        this.machineY++;
      } else if (this.machineX >= width / tileSizes[this.tileSize] - this.machineWidth) {
        this.goingUp = false;
        this.machineX = 0;
        this.machineY = 0;
      } else {
        this.machineX = Math.min(this.machineX + this.machineWidth, width / tileSizes[this.tileSize] - this.machineWidth);
        this.goingUp = true;
      }
      if (activeField == this) {
        ctx.fillStyle = this.machineColor;
        ctx.fillRect(this.machineX * tileSizes[this.tileSize], this.machineY * tileSizes[this.tileSize], tileSizes[this.tileSize] * this.machineWidth, tileSizes[this.tileSize] * this.machineHeight);
      }

    }
  };

  this.growthTick = function() {

    const x = Math.floor(Math.random() * width / tileSizes[this.tileSize]);
    const y = Math.floor(Math.random() * height / tileSizes[this.tileSize]);
    if (this.field[x][y] < maxGrowth) {

      this.field[x][y] = Math.min(maxGrowth, this.field[x][y] + 1 + growthBonus);
    }
    if (activeField == this) {
      updateTile(this, x, y);
    }
  };
};

export default Area;
