
let player;
let basicEnemies = [];

let settings = {
  maxBasicEnemies: 5,
  paused: false,
  gameOver: false,
  enemySpawnCoords: []
}

function setup() {
  createCanvas(600, 600);
  settings.enemySpawnCoords = [
    { x: -50, y: -50 },
    { x: width + 50, y: -50 },
    { x: -50, y: height + 50 },
    { x: width + 50, y: height + 50 }]
  player = new Player(width / 2, height / 2);
  basicEnemies.push(new BasicEnemy(-50, -50));
}

function draw() {
  background(48);
  if (!settings.paused && !settings.gameOver) {
    // RENDERING
    player.drawPlayer();
    this.drawBasicShots();
    this.drawEnemies();

    this.drawUI();

    // UPDATING
    player.updatePlayer();
    updateEnemies();
  }
  else if (settings.paused) {
    background(48);
    textSize(100);
    fill(255);
    text("PAUSED", 50, height / 2);
  }
  else {
    background(48);
    textSize(100);
    fill(255, 0, 0);
    text("YOU LOSE", 50, height / 2);
    textSize(30);
    fill(255, 0, 0);
    text("You survived until round " + player.playerLevel, 70, height / 2 + 100);
  }
}

drawUI = () => {
  // Shots
  fill(255);
  textSize(22);
  text(player.playerShotsMax - player.playerShots.length + '/' + player.playerShotsMax, 20, 20, 200, 200);

  // Health
  fill(255, 0, 0);
  rect(90, 20, (player.health / player.maxHealth) * 100, 20);

  // Progress Bar
  fill(0, 200, 100);
  rect(230, 20, (player.xpLevel / player.xpLevelNext) * 100, 20);
  textSize(22);
  text(player.playerLevel, 340, 20, 200, 200);
}

drawEnemies = () => {
  basicEnemies.forEach((en, index) => {
    en.drawEnemy();
    en.updateEnemy();
  })
}

function updateEnemies() {
  let randomEnemyCoord;
  while (basicEnemies.length < settings.maxBasicEnemies) {
    randomEnemyCoord = settings.enemySpawnCoords[Math.floor(Math.random() * settings.enemySpawnCoords.length)]
    basicEnemies.push(new BasicEnemy(randomEnemyCoord.x, randomEnemyCoord.y));
  }
}

function keyPressed() {
  //console.log("PRESSED");
  if (keyCode === 87) player.movePlayerY(-1);
  if (keyCode === 65) player.movePlayerX(-1);
  if (keyCode === 68) player.movePlayerX(1);
  if (keyCode === 83) player.movePlayerY(1);
  if (keyCode === 80) settings.paused = !settings.paused;
}

function keyReleased() {
  //console.log("Released");
  if (keyCode === 87) player.movePlayerY(-1);
  if (keyCode === 65) player.movePlayerX(-1);
  if (keyCode === 68) player.movePlayerX(1);
  if (keyCode === 83) player.movePlayerY(1);
}

function mouseClicked() {
  //console.log("MOUSE CLICKED", mouseX, mouseY);
  player.shoot(mouseX, mouseY);
  // prevent default
  return false;
}

drawBasicShots = () => {
  player.playerShots.forEach((shot, index) => {
    shot.xPos += shot.xVel;
    shot.yPos += shot.yVel;
    if (shot.xPos > width || shot.xPos < 0 || shot.yPos > height || shot.yPos < 0) {
      player.playerShots.splice(index, 1);
    }

    basicEnemies.forEach((en, i) => {
      if (collideCircleCircle(shot.xPos, shot.yPos, shot.shotWidth, en.xPos, en.yPos, en.enemyDiameter)) {
        player.playerShots.splice(index, 1);
        if (en.detectHit(player.damage)) {
          basicEnemies.splice(i, 1);
          player.updatePlayerLevel(en.xpPoints);
        }
      }
    });
    fill(255);
    circle(shot.xPos, shot.yPos, shot.shotWidth);
  })
}

function triggerGameOver() {
  console.log("YOU LOSE");
  settings.gameOver = true;
}


class Player {
  xPos;
  yPos;
  health;
  damage = 50;
  maxHealth = 100;
  xpLevel = 0;
  playerLevel = 1;
  xpLevelNext = 100;
  playerShots = [];
  playerShotsMax = 5;
  enemySpeed = 6;
  playerDiameter = 30;
  xDirections = [];
  yDirections = [];

  constructor(x, y) {
    this.xPos = x + this.playerDiameter / 2;
    this.yPos = y + this.playerDiameter / 2;
    this.health = this.maxHealth;
  }

  drawPlayer = () => {
    fill(212, 234, 121);
    circle(this.xPos, this.yPos, this.playerDiameter);
  }

  movePlayerY = (direction) => {
    if (!this.yDirections.includes(direction)) this.yDirections.push(direction);
    else {
      let index = this.yDirections.indexOf(direction);
      this.yDirections.splice(index, 1);
    }
  }

  movePlayerX = (direction) => {
    if (!this.xDirections.includes(direction)) this.xDirections.push(direction);
    else {
      let index = this.xDirections.indexOf(direction);
      this.xDirections.splice(index, 1);
    }
  }

  updatePlayer = () => {
    this.yDirections.forEach(dir => this.yPos += dir * this.enemySpeed);
    this.xDirections.forEach(dir => this.xPos += dir * this.enemySpeed);
    if (this.yPos > height) this.yPos = height;
    else if (this.yPos < 0) this.yPos = 0;
    if (this.xPos > width) this.xPos = width;
    else if (this.xPos < 0) this.xPos = 0;
  }

  shoot = (x, y) => {
    if (this.playerShots.length >= this.playerShotsMax) return;
    this.playerShots.push(new BasicShot(this.xPos, this.yPos, x, y));
  }

  updatePlayerLevel = (xpUpgrade) => {
    this.xpLevel += xpUpgrade;

    if (this.xpLevel >= this.xpLevelNext) {
      this.playerLevel += 1;
      this.maxHealth += 10;
      this.health = this.maxHealth;
      if (this.playerLevel % 5 === 0) {
        this.playerShotsMax += 1;
        if (this.damage > 10) {
          this.damage -= 10;
        }
      }
      settings.maxBasicEnemies += 1;
      this.xpLevel = 0;
      this.xpLevelNext *= 1.1;
    }
  }
}


class BasicEnemy {
  xPos;
  yPos;
  xVel;
  yVel;
  health = 100;
  maxHealth = 100;
  xpPoints = 10;
  enemySpeed = 2;
  enemyDiameter = 30;

  constructor(x, y) {
    this.xPos = x;
    this.yPos = y;
    this.health = 100;
  }

  drawEnemy = () => {
    fill((this.health / this.maxHealth) * 255, 0, 0);
    circle(this.xPos, this.yPos, this.enemyDiameter);
  }


  updateEnemy = () => {
    if (collideCircleCircle(player.xPos, player.yPos, player.playerDiameter, this.xPos, this.yPos, this.enemyDiameter)) {
      console.log("ATTACK");
      player.health -= 1;
      if (player.health <= 0) {
        triggerGameOver();
      }
    }
    this.xPos += Math.sign(player.xPos - this.xPos) * this.enemySpeed;
    this.yPos += Math.sign(player.yPos - this.yPos) * this.enemySpeed;
    if (this.yPos > height) this.yPos = height;
    else if (this.yPos < 0) this.yPos = 0;
    if (this.xPos > width) this.xPos = width;
    else if (this.xPos < 0) this.xPos = 0;
  }

  detectHit(damage) {
    console.log(damage);
    this.health -= damage;
    return this.health <= 0;
  }

}

class BasicShot {
  xPos;
  yPos;
  xVel;
  yVel;
  shotSpeed = 5;
  shotWidth = 10;

  constructor(pX, pY, sX, sY) {
    this.xPos = pX;
    this.yPos = pY;
    const radians = Math.atan2(sY - pY, sX - pX);
    // we now have our velX and velY we can just refer to
    this.xVel = Math.cos(radians) * this.shotSpeed;
    this.yVel = Math.sin(radians) * this.shotSpeed;
  }

}