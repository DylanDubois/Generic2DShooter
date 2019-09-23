
let player;
let basicEnemies = [];
let bossEnemies = [];

let settings = {
  maxBasicEnemies: 5,
  maxBossEnemies: 1,
  paused: false,
  gameOver: false,
  enemySpawnCoords: []
}

function setup() {
  createCanvas(600, 600);
  settings.enemySpawnCoords = [
    { x: -50, y: -50 },
    { x: width + 50, y: -50 },
    { x: width / 2, y: -50 },
    { x: width / 2, y: height + 50 },
    { x: -50 + 50, y: height / 2 },
    { x: width + 50, y: height / 2 },
    { x: -50, y: height + 50 },
    { x: width + 50, y: height + 50 }]
  player = new Player(width / 2, height / 2);
  //basicEnemies.push(new BasicEnemy(-50, -50));
  //bossEnemies.push(new BossEnemy(100, 100));
}

function draw() {
  background(48);
  if (!settings.paused && !settings.gameOver) {
    // RENDERING
    player.drawPlayer();
    this.drawBasicShots();
    this.drawPortals();
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
  //Shots
  // fill(255);
  // textSize(22);
  // text(player.playerShotsMax - player.playerShots.length + '/' + player.playerShotsMax, 20, 60, 200, 200);

  for (let i = 0; i < player.playerShotsMax - player.playerShots.length; i++) {
    fill(255, 0, 255);
    circle((i * 20) + 30, 60, 10);
  }

  // Health
  fill(255, 0, 0);
  rect(20, 20, (player.health / player.maxHealth) * 100, 20);

  // Progress Bar
  fill(0, 200, 100);
  rect(160, 20, (player.xpLevel / player.xpLevelNext) * 100, 20);
  textSize(22);
  text(player.playerLevel, 270, 20, 200, 200);
}

drawEnemies = () => {
  basicEnemies.forEach((en, index) => {
    en.drawEnemy();
    en.updateEnemy();
  });

  bossEnemies.forEach((en, index) => {
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

  while (player.playerLevel >= 5 && bossEnemies.length < settings.maxBossEnemies) {
    randomEnemyCoord = settings.enemySpawnCoords[Math.floor(Math.random() * settings.enemySpawnCoords.length)]
    bossEnemies.push(new BossEnemy(randomEnemyCoord.x, randomEnemyCoord.y));
  }
}

function keyPressed() {
  //console.log("PRESSED");
  if (keyCode === 87) player.movePlayerY(-1);
  if (keyCode === 65) player.movePlayerX(-1);
  if (keyCode === 68) player.movePlayerX(1);
  if (keyCode === 83) player.movePlayerY(1);
  if (keyCode === 32) player.spaceHeld = true;
  if (keyCode === 80) settings.paused = !settings.paused;
}

function keyReleased() {
  //console.log("Released");
  if (keyCode === 87) player.movePlayerY(-1);
  if (keyCode === 65) player.movePlayerX(-1);
  if (keyCode === 68) player.movePlayerX(1);
  if (keyCode === 83) player.movePlayerY(1);
  if (keyCode === 32) player.spaceHeld = false;
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

    bossEnemies.forEach((en, i) => {
      if (collideCircleCircle(shot.xPos, shot.yPos, shot.shotWidth, en.xPos, en.yPos, en.enemyDiameter)) {
        player.playerShots.splice(index, 1);
        if (en.detectHit(player.damage)) {
          bossEnemies.splice(i, 1);
          player.updatePlayerLevel(en.xpPoints);
        }
      }
    });
    fill(255, 0, 255);
    circle(shot.xPos, shot.yPos, shot.shotWidth);
  })
}

drawPortals = () => {
  //console.log(player.portals);
  player.portals.forEach((shot, index) => {
    if (index === 0) fill(255, 140, 0);
    else fill(30, 144, 255);
    if (!shot.moving) {
      if (collideCircleCircle(shot.xPos, shot.yPos, shot.shotWidth, player.xPos, player.yPos, player.playerDiameter) && player.portals.length == 2) {
        console.log("entered portal");
        player.enterPortal(index);
      }
      circle(shot.xPos, shot.yPos, shot.shotWidth);
      return;
    }
    shot.xPos += shot.xVel;
    shot.yPos += shot.yVel;
    if (shot.xPos > width || shot.xPos < 0 || shot.yPos > height || shot.yPos < 0) {
      shot.moving = false;
    }
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
  spaceHeld = false;
  maxHealth = 100;
  xpLevel = 0;
  playerLevel = 1;
  xpLevelNext = 100;
  playerShots = [];
  portals = [];
  playerShotsMax = 5;
  playerSpeed = 5;
  playerDiameter = 30;
  xDirections = [];
  yDirections = [];

  constructor(x, y) {
    this.xPos = x + this.playerDiameter / 2;
    this.yPos = y + this.playerDiameter / 2;
    this.health = this.maxHealth;
  }

  drawPlayer = () => {
    fill(0, 191, 255);
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
    this.yDirections.forEach(dir => this.yPos += dir * this.playerSpeed);
    this.xDirections.forEach(dir => this.xPos += dir * this.playerSpeed);
    if (this.yPos > height) this.yPos = height;
    else if (this.yPos < 0) this.yPos = 0;
    if (this.xPos > width) this.xPos = width;
    else if (this.xPos < 0) this.xPos = 0;
  }

  shoot = (x, y) => {
    if (this.spaceHeld) {
      this.shootPortal(x, y);
      return;
    }
    if (this.playerShots.length >= this.playerShotsMax) return;
    this.playerShots.push(new BasicShot(this.xPos, this.yPos, x, y));
  }

  enterPortal = (index) => {
    console.log("entered portal", index);
    let enteredPortal;
    enteredPortal = index === 0 ? this.portals[1] : this.portals[0];
    this.portals = [];
    this.xPos = enteredPortal.xPos;
    this.yPos = enteredPortal.yPos;
  }

  shootPortal = (x, y) => {
    //console.log("Portal Shot", this.portals.length);
    if (this.portals.length > 1) return;
    this.portals.push(new PortalShot(this.xPos, this.yPos, x, y));
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
      if (this.playerLevel % 10 === 0) {
        settings.maxBossEnemies += 1;
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
  enemySpeed = 2.5;
  enemyDamage = 1;
  enemyDiameter = 30;

  constructor(x, y) {
    this.xPos = x;
    this.yPos = y;
    this.health = 100;
  }

  drawEnemy = () => {
    fill((this.health / this.maxHealth) * 200, 0, 0);
    circle(this.xPos, this.yPos, this.enemyDiameter);
  }


  updateEnemy = () => {
    if (collideCircleCircle(player.xPos, player.yPos, player.playerDiameter, this.xPos, this.yPos, this.enemyDiameter)) {
      console.log("ATTACK");
      player.health -= this.enemyDamage;
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

class BossEnemy extends BasicEnemy {
  constructor(x, y) {
    super(x, y);
    this.health = 1000;
    this.maxHealth = 1000;
    this.enemyDiameter = 70;
    this.enemyDamage = 2;
    this.xpPoints = 50;
    this.enemySpeed = 3;
  }

  drawEnemy = () => {
    fill((this.health / this.maxHealth) * 200, 200, 0);
    circle(this.xPos, this.yPos, this.enemyDiameter);
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

class PortalShot {
  moving = true;
  xPos;
  yPos;
  xVel;
  yVel;
  shotSpeed = 5;
  shotWidth = 40;
  constructor(pX, pY, sX, sY) {
    console.log(pX, pY, sX, sY);
    this.xPos = pX;
    this.yPos = pY;
    const radians = Math.atan2(sY - pY, sX - pX);
    // we now have our velX and velY we can just refer to
    this.xVel = Math.cos(radians) * this.shotSpeed;
    this.yVel = Math.sin(radians) * this.shotSpeed;
  }
}