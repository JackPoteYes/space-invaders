var ROOT_COMPONENT = document.getElementById("root");
var MARGIN_BOTTOM_PERCENT = 10;
var MOVE_SPEED = 1;

var CURRENTLY_MOVING = false;

var MY_SHIP = null;
var ANIMATION_INTERVAL = null;
var ANIMATION_PERIOD = 20;

/**
 * INITIALISATION
 */

var CANVAS_WIDTH = null;
var SHIP_WIDTH = null;
var SHIP_WIDTH_PERCENTAGE = null;

window.onload = init;

function init() {
  MY_SHIP = document.createElement("div");
  MY_SHIP.id = "myShip";
  MY_SHIP.style.bottom = percent(MARGIN_BOTTOM_PERCENT);
  MY_SHIP.style.left = percent(0);
  ROOT_COMPONENT.appendChild(MY_SHIP);
  CANVAS_WIDTH = ROOT_COMPONENT.offsetWidth;
  SHIP_WIDTH = MY_SHIP.offsetWidth;
  SHIP_WIDTH_PERCENTAGE = (SHIP_WIDTH * 100) / CANVAS_WIDTH;
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
