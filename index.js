var ROOT_COMPONENT = document.getElementById("game-root");

/**
 * DIMENSIONS
 */

var SHIP_DIMENSIONS = {
  height: pix((ROOT_COMPONENT.offsetWidth * 2) / 100),
  width: pix((ROOT_COMPONENT.offsetWidth * 2) / 100),
};

var INVADER_MARGIN = pix((ROOT_COMPONENT.offsetWidth * 0.9) / 100);

var MISSILE_DIMENSIONS = {
  height: SHIP_DIMENSIONS.height,
  width: pix((ROOT_COMPONENT.offsetWidth * 0.2) / 100),
};

var INVADERS_CONTAINER_TOP = pix((ROOT_COMPONENT.offsetHeight * 2) / 100);

/**
 * OTHER
 */

var MARGIN_BOTTOM_PERCENT = 10;
var MOVE_SPEED = 1;

var CURRENTLY_MOVING = false;

var MY_SHIP = null;
var ANIMATION_INTERVAL = null;
var ANIMATION_PERIOD = 20;

var MISSILE_HEIGHT = 30;

var MY_MISSILES = [];

var INVADERS = [];
var NB_INVADERS_COLUMNS = 11;
var NB_INVADERS_ROWS = 5;

var VULNERABLE_INVADERS = [];

var MISSILE_SPEED = 2.5;
var MISSILE_LIFE_SPAN = 30;

var NB_STARS = 200;

var STAR_SHINING_LEVELS = ["warm", "bright", "cold"];
var STAR_SIZES = ["small", "medium", "big"];
var STAR_BLINKING_SPEEDS = ["slow", "medium", "fast"];

/**
 * INITIALISATION
 */

var CANVAS_WIDTH = null;
var SHIP_WIDTH = null;
var SHIP_WIDTH_PERCENTAGE = null;

window.onload = init;

function init() {
  createMyShip();
  createInvaders();
  createStars();
}

function createStars() {
  let [coordX, coordY] = [-1, -1];
  for (let i = 0; i < NB_STARS; i++) {
    coordX = Math.floor(Math.random() * 100);
    coordY = Math.floor(Math.random() * 100);

    const star = document.createElement("div");
    star.className = `star ${getRandomItemFromArray(
      STAR_BLINKING_SPEEDS,
    )} ${getRandomItemFromArray(STAR_SIZES)} ${getRandomItemFromArray(
      STAR_SHINING_LEVELS,
    )}`;
    star.style.left = percent(coordX);
    star.style.top = percent(coordY);
    ROOT_COMPONENT.appendChild(star);
  }
}

function createMyShip() {
  MY_SHIP = document.createElement("div");
  MY_SHIP.id = "myShip";
  MY_SHIP.style.bottom = percent(MARGIN_BOTTOM_PERCENT);
  MY_SHIP.style.left = percent(0);
  MY_SHIP.style.height = SHIP_DIMENSIONS.width;
  MY_SHIP.style.width = SHIP_DIMENSIONS.height;
  ROOT_COMPONENT.appendChild(MY_SHIP);
  CANVAS_WIDTH = ROOT_COMPONENT.offsetWidth;
  SHIP_WIDTH = MY_SHIP.offsetWidth;
  SHIP_WIDTH_PERCENTAGE = (SHIP_WIDTH * 100) / CANVAS_WIDTH;
}

function createInvaders() {
  const invadersContainer = document.createElement("div");
  invadersContainer.id = "invadersContainer";
  invadersContainer.style.top = INVADERS_CONTAINER_TOP;
  ROOT_COMPONENT.appendChild(invadersContainer);
  for (let col = 0; col < NB_INVADERS_COLUMNS; col++) {
    const invadersColumn = document.createElement("div");
    invadersColumn.className = "invadersColumn";
    invadersContainer.appendChild(invadersColumn);
    INVADERS.push([]);
    for (let row = 0; row < NB_INVADERS_ROWS; row++) {
      const invader = document.createElement("div");
      invader.className = "invader";
      invader.style.width = SHIP_DIMENSIONS.width;
      invader.style.height = SHIP_DIMENSIONS.height;
      invader.style.margin = INVADER_MARGIN;
      INVADERS[col].push(invader);
      invadersColumn.appendChild(invader);
    }
  }
  refreshVulnerableInvaders();

  invadersContainer.style.left = pix(
    ROOT_COMPONENT.offsetWidth / 2 - invadersContainer.offsetWidth / 2,
  );

  setInvadersMovement();

  function setInvadersMovement() {
    let move = 1; // | -1
    setInterval(() => {
      if (mustTurnLeft()) move = -1;
      if (mustTurnRight()) move = 1;
      invadersContainer.style.left = pix(
        parseFloat(invadersContainer.style.left, 10) + move,
      );
    }, ANIMATION_PERIOD * 2);

    function mustTurnLeft() {
      const invadersContainerLeft = parseFloat(
        invadersContainer.style.left,
        10,
      );
      return (
        invadersContainerLeft + invadersContainer.offsetWidth >
        (ROOT_COMPONENT.offsetWidth * 5) / 6
      );
    }

    function mustTurnRight() {
      const invadersContainerLeft = parseFloat(
        invadersContainer.style.left,
        10,
      );
      return invadersContainerLeft < ROOT_COMPONENT.offsetWidth / 6;
    }
  }
}

/**
 * Controls
 */

function startMove(direction) {
  CURRENTLY_MOVING = direction;
  ANIMATION_INTERVAL = setInterval(() => {
    const currentLeftPercentage = parseFloat(MY_SHIP.style.left, 10);
    const addedValue =
      direction === "left"
        ? currentLeftPercentage <= 0
          ? 0
          : -MOVE_SPEED
        : currentLeftPercentage >= 100.0 - SHIP_WIDTH_PERCENTAGE
        ? 0
        : MOVE_SPEED;
    MY_SHIP.style.left = percent(currentLeftPercentage + addedValue);
  }, ANIMATION_PERIOD);
}

function stopMove() {
  CURRENTLY_MOVING = false;
  clearInterval(ANIMATION_INTERVAL);
}

function createMyMissile() {
  const missile = document.createElement("div");
  ROOT_COMPONENT.appendChild(missile);
  MY_MISSILES.push(missile);
  missile.className = "missile myMissile";
  missile.style.left = percent(
    parseFloat(MY_SHIP.style.left, 10) + SHIP_WIDTH_PERCENTAGE / 2,
  );
  missile.style.width = MISSILE_DIMENSIONS.width;
  missile.style.height = MISSILE_DIMENSIONS.height;
  missile.style.bottom = percent(MARGIN_BOTTOM_PERCENT + SHIP_WIDTH_PERCENTAGE);
  return missile;
}

function shootMyMissile() {
  const missile = createMyMissile();
  let count = 0;
  var animShoot = setInterval(() => {
    if (count++ > MISSILE_LIFE_SPAN) {
      return stopAnimationAndRemoveMissile(animShoot, missile);
    }
    if (killInvaderIfHit(missile)) {
      return stopAnimationAndRemoveMissile(animShoot, missile);
    }
    moveMissile(missile);
  }, ANIMATION_PERIOD);

  function stopAnimationAndRemoveMissile(interval, missile) {
    clearInterval(interval);
    missile.parentElement.removeChild(missile);
    MY_MISSILES.splice(MY_MISSILES.indexOf(missile), 1);
  }

  function moveMissile(missile) {
    missile.style.bottom = percent(
      parseFloat(missile.style.bottom, 10) + MISSILE_SPEED,
    );
  }
}

function killInvaderIfHit(missile) {
  const targetedInvader = getTargetedInvader(missile);
  if (targetedInvader.length <= 0 || !isHighEnough(missile, targetedInvader[0]))
    return;
  const targetedInvaderBoundaries = targetedInvader[0].getBoundingClientRect();
  explodeTargetedInvader(targetedInvader[0]);
  killInvader(targetedInvader[0]);
  return true;

  function explodeTargetedInvader(targetedInvader) {
    const targetedInvaderBoundaries = targetedInvader.getBoundingClientRect();
    const explosionLocation = {
      x: targetedInvaderBoundaries.left + targetedInvader.offsetWidth / 2,
      y: targetedInvaderBoundaries.bottom + targetedInvader.offsetHeight / 2,
    };
    explode(explosionLocation.x, explosionLocation.y);
  }

  function isHighEnough(missile, targetedInvader) {
    return (
      missile.getBoundingClientRect().bottom <
      targetedInvader.getBoundingClientRect().bottom +
        VULNERABLE_INVADERS[0].offsetHeight
    );
  }

  function killInvader(invader) {
    INVADERS = INVADERS.map(invaderColumn =>
      invaderColumn.filter(_invader => _invader !== invader),
    ).filter(invaderColumn => invaderColumn.length > 0);
    invader.parentElement.removeChild(invader);
    refreshVulnerableInvaders();
  }
}

function getTargetedInvader(missile) {
  const missileLeft = missile.getBoundingClientRect().left;
  return VULNERABLE_INVADERS.filter(invader => {
    const invaderLeft = invader.getBoundingClientRect().left;
    return (
      missileLeft >= invaderLeft &&
      missileLeft <= invaderLeft + invader.offsetWidth
    );
  });
}

/**
 * EVENTS
 */

document.addEventListener("keydown", event => {
  switch (event.keyCode) {
    // Right
    case 39:
      if (CURRENTLY_MOVING === "right") break;
      stopMove();
      startMove("right");
      break;
    // Left
    case 37:
      if (CURRENTLY_MOVING === "left") break;
      stopMove();
      startMove("left");
      break;
    // Space
    case 32:
      shootMyMissile();
      break;
  }
});

document.addEventListener("keyup", event => {
  const keyCode = event.keyCode;
  switch (keyCode) {
    // Right
    case 39:
      if (CURRENTLY_MOVING === "right") stopMove();
      break;
    // Left
    case 37:
      if (CURRENTLY_MOVING === "left") stopMove();
      break;
  }
  if (!CURRENTLY_MOVING && (keyCode === 39 || keyCode === 37)) {
    stopMove();
  }
});

/**
 * Utils
 */

function pix(nb) {
  return `${nb}px`;
}

function percent(nb) {
  return `${nb}%`;
}

function getRandomItemFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function refreshVulnerableInvaders() {
  VULNERABLE_INVADERS = INVADERS.map(
    invadersColumn => invadersColumn[invadersColumn.length - 1],
  );
}
