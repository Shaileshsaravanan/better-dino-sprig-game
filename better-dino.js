/*
@title: better dino
@tags: ['endless', 'better dino']
@addedOn: 2024-08-26
@author: shaileshsaravanan
*/

const h = 10;
const w = 20;
let running = true;
let score = 0;
let highScore = 0;

const player = "p";
const player2 = "P";
const cactus = "c";
const cactus2 = "C";
const bird = "b";
const cloud = "d";
const floor = "f";
const powerUp = "u";

setLegend(
  [player, bitmap`
........11111...
........1LLLL111
........1L.LLLL1
........1LLLLLL1
1.......1LLLLLL1
L1.....1LLL1111.
LL1...1LLLLLL...
LLL111LLLL111...
LLLLLLLLLLLL1...
1LLLLLLLL11L1...
.LLLLLLLL1......
.1LLLLLLL1......
..1LL111L1......
..1L1..1L1......
..1L1..1L1......
..1LL..1LL......`],
  [player2, bitmap`
.........111111.
.........LLLLLL1
.........L.LLLL1
.........LLLLLL1
1.......1LLLLLL1
L1.....1LLL1111.
LL1..1LLLLLLL...
LLL11LLLLL11....
LLLLLLLLLLLL1...
1LLLLLLLL11L1...
.LLLLLLLL1......
.1LLLLLLL1......
..1LL111L11.....
..1L1..1LLL.....
...LLL..111.....
................`],
  [cactus, bitmap`
................
................
................
................
......0DDD......
......DD0D......
......DDDD......
......DDDD......
......D0D0......
......DDDD......
......0DDD......
......DDD0.D0...
......DDDD.0D...
......0DD0.D0...
......DDDD.DD...
................`],
  [cactus2, bitmap`
................
................
................
................
......0DDD......
......DD0D......
......DDDD......
......DDDD......
......D0D0......
......DDDD......
......0DDD......
......DDD0.D0...
......DDDD.0D...
......0DD0.D0...
......DDDD.DD...
................`],
  [bird, bitmap`
................
......11111.....
.....1.....1....
.....1.1.1.1....
......1.1.1.....
.......1.1......
......11111.....
................
................
................
................
................
................
................
................
................`],
  [cloud, bitmap`
................
................
................
......1111......
...1111..11.....
.111......111...
.1.........11...
1...........111.
1....1111111111.
................
................
................
................
................
................
................`],
  [floor, bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000`],
  [powerUp, bitmap`
................
................
................
................
...........11...
.......1.L.L1...
.......1.L.L1...
...........11...
................
................
................
................
................
................
................
................`]
);

const ground = () => {
  return floor.repeat(w);
};

const air = () => {
  return ".".repeat(w);
};

const airWithClouds = () => {
  let layer = "";
  for (let i = 0; i < w; i++) {
    if (Math.floor(Math.random() * 7) == 1) {
      layer += cloud;
    } else {
      layer += ".";
    }
  }
  return layer;
};

const main = () => {
  let layer = "." + player;
  for (let i = layer.length; i < w; i++) {
    layer += ".";
  }
  return layer;
};

let layers = [];

for (let i = 0; i < 3; i++) {
  layers.push(airWithClouds());
}
for (let i = 0; i < 4; i++) {
  layers.push(air());
}
layers.push(main());
layers.push(ground());
layers.push(ground());

setMap(layers.join("\n"));

let jumping = false;
let jumpCount = 0;
let jumpDirection = 1;
let birdSpeed = 1; // Bird's speed

const playerSprite = () => {
  return getFirst(player) ? getFirst(player) : getFirst(player2);
};

onInput("w", () => {
  if (!jumping) {
    jumping = true;
  }
});

onInput("s", () => {
  if (!running) {
    running = true;
    score = 0;
    layers = [];
    for (let i = 0; i < 3; i++) {
      layers.push(airWithClouds());
    }
    for (let i = 0; i < 4; i++) {
      layers.push(air());
    }
    layers.push(main());
    layers.push(ground());
    layers.push(ground());
    setMap(layers.join("\n"));
  }
});

setInterval(() => {
  if (running) {
    clearText();
    addText(`Score: ${score}`, { x: 1, y: 4, color: color`0` });
    addText(`High Score: ${highScore}`, { x: 1, y: 5, color: color`0` });
    score++;

    for (let i = 0; i < 3; i++) {
      let l = layers[i].substring(1);
      if (Math.floor(Math.random() * 7) == 1) {
        l += cloud;
      } else {
        l += ".";
      }
      layers[i] = l;
    }

    layers[7] = layers[7].substring(1);
    if (Math.floor(Math.random() * 15) == 1) { 
      layers[7] += (Math.floor(Math.random() * 4) == 0 ? bird : (Math.floor(Math.random() * 3) == 0 ? cactus : (Math.floor(Math.random() * 2) == 0 ? cactus2 : powerUp)));
    } else {
      layers[7] += ".";
    }

    for (let currentCactus of getAll(cactus)) {
      if (currentCactus.x == 2 && playerSprite().y == 7) {
        endGame();
      }
    }

    for (let currentCactus2 of getAll(cactus2)) {
      if (currentCactus2.x == 2 && playerSprite().y == 7) {
        endGame();
      }
    }

    for (let currentBird of getAll(bird)) {
      currentBird.x -= birdSpeed; // Move bird left

      // Detect collision with player
      if (currentBird.x == 1 && playerSprite().y == 5) {
        endGame();
      }
    }

    for (let currentPowerUp of getAll(powerUp)) {
      if (currentPowerUp.x == 2 && playerSprite().y == 7) {
        score += 5; // Grant bonus score for power-ups
        currentPowerUp.remove();
      }
    }

    if (jumping) {
      jumpCount += jumpDirection;
      if (jumpCount == 3) {
        jumpDirection = -1;
      }
      if (jumpCount == -1) {
        jumping = false;
        jumpCount = 0;
        jumpDirection = 1;
      }
    }

    for (let i = 4; i < 7; i++) {
      layers[i] = air();
    }

    layers[7] = layers[7].replace(player, ".").replace(player2, ".");
    layers[7 - jumpCount] = layers[7 - jumpCount].substring(0, 1) + (score % 2 == 0 ? player : player2) + layers[7 - jumpCount].substring(2);
    setMap(layers.join("\n"));
  }
}, 80);

const endGame = () => {
  running = false;
  highScore = Math.max(highScore, score);
  
  clearText();
  addText("Game Over!", { x: 6, y: 4, color: color`0` });
  addText(`Final Score: ${score}`, { x: 5, y: 5, color: color`0` });
  addText("Press S to Restart", { x: 5, y: 6, color: color`0` });
};
