/*
@title: better dino
@tags: ['endless', 'better dino']
@addedOn: 2024-08-26
@author: shaileshsaravanan
*/

const GAME_WIDTH = 20;
const GAME_HEIGHT = 10;
const JUMP_HEIGHT = 3;
const INITIAL_SPEED = 80;
const SPEED_UP_INTERVAL = 10;
const MAX_SPEED = 30;
const BIRD_SPEED = 1;
const CLOUD_SPAWN_CHANCE = 0.14;
const OBSTACLE_SPAWN_CHANCE = 0.066;
const POWERUP_SPAWN_CHANCE = 0.1;

let running = true;
let score = 0;
let highScore = 0;
let gameSpeed = INITIAL_SPEED;

const player = "p";
const player2 = "P";
const cactus = "c";
const cactus2 = "C";
const bird = "b";
const cloud = "d";
const floor = "f";
const powerUp = "u";

setLegend(
  [
    player,
    bitmap`
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
..1LL..1LL......`,
  ],
  [
    player2,
    bitmap`
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
................`,
  ],
  [
    cactus,
    bitmap`
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
................`,
  ],
  [
    cactus2,
    bitmap`
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
................`,
  ],
  [
    bird,
    bitmap`
................
................
................
................
................
.......1111111..
.....111........
.....1..........
.11111111111111.
.....1..........
.....111........
.......1111111..
................
................
................
................`,
  ],
  [
    cloud,
    bitmap`
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
................`,
  ],
  [
    floor,
    bitmap`
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
0000000000000000`,
  ],
  [
    powerUp,
    bitmap`
.......1........
......111.......
.....11111......
....111.111.....
...111...111....
..111..1..111...
.111..111..111..
111..11111..111.
.111..111..111..
..111..1..111...
...111...111....
....111.111.....
.....11111......
......111.......
.......1........
................`,
  ],
);

const ground = () => floor.repeat(GAME_WIDTH);
const air = () => ".".repeat(GAME_WIDTH);

const airWithClouds = () => {
  return Array.from({ length: GAME_WIDTH }, () =>
    Math.random() < CLOUD_SPAWN_CHANCE ? cloud : ".",
  ).join("");
};

const initializeLayers = () => {
  const layers = [];
  for (let i = 0; i < 3; i++) layers.push(airWithClouds());
  for (let i = 0; i < 4; i++) layers.push(air());
  layers.push(mainLayer());
  layers.push(ground());
  layers.push(ground());
  return layers;
};

const mainLayer = () => {
  return `.${player}` + ".".repeat(GAME_WIDTH - 2);
};

let layers = initializeLayers();
setMap(layers.join("\n"));

let jumping = false;
let jumpCount = 0;
let jumpDirection = 1;

const playerSprite = () => getFirst(player) || getFirst(player2);

onInput("w", () => {
  if (!jumping) jumping = true;
});

onInput("s", () => {
  if (!running) {
    running = true;
    score = 0;
    gameSpeed = INITIAL_SPEED;
    layers = initializeLayers();
    setMap(layers.join("\n"));
  }
});

setInterval(() => {
  if (running) {
    clearText();
    addText(`Score: ${score}`, { x: 1, y: 4, color: color`0` });
    addText(`High Score: ${highScore}`, { x: 1, y: 5, color: color`0` });
    score++;

    if (score % SPEED_UP_INTERVAL === 0 && gameSpeed > MAX_SPEED) {
      gameSpeed -= 5;
    }

    layers = layers.map((layer, i) => {
      if (i < 3) {
        let newLayer =
          layer.substring(1) +
          (Math.random() < CLOUD_SPAWN_CHANCE ? cloud : ".");
        return newLayer;
      }
      return layer;
    });

    layers[7] = layers[7].substring(1);
    if (Math.random() < OBSTACLE_SPAWN_CHANCE) {
      layers[7] +=
        Math.random() < 0.25 ? bird : Math.random() < 0.5 ? cactus : cactus2;
    } else if (Math.random() < POWERUP_SPAWN_CHANCE) {
      layers[7] += powerUp;
    } else {
      layers[7] += ".";
    }

    if (detectCollisions()) {
      endGame();
    }

    if (jumping) {
      jumpCount += jumpDirection;
      if (jumpCount >= JUMP_HEIGHT) jumpDirection = -1;
      if (jumpCount < 0) {
        jumping = false;
        jumpCount = 0;
        jumpDirection = 1;
      }
    }

    for (let i = 4; i < 7; i++) layers[i] = air();
    layers[7] = layers[7].replace(player, ".").replace(player2, ".");
    layers[7 - jumpCount] =
      layers[7 - jumpCount].substring(0, 1) +
      (score % 2 === 0 ? player : player2) +
      layers[7 - jumpCount].substring(2);
    setMap(layers.join("\n"));
  }
}, gameSpeed);

const detectCollisions = () => {
  for (let obstacle of [
    ...getAll(cactus),
    ...getAll(cactus2),
    ...getAll(bird),
  ]) {
    if (obstacle.x === 2 && playerSprite().y === (obstacle === bird ? 5 : 7)) {
      return true;
    }
  }
  return false;
};

const endGame = () => {
  running = false;
  highScore = Math.max(highScore, score);

  clearText();
  addText("Game Over!", { x: 5, y: 4, color: color`0` });
  addText(`Final Score: ${score}`, { x: 2, y: 5, color: color`0` });
  addText("Press S to Restart", { x: 1, y: 6, color: color`0` });
};
