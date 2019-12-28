var ROOT_COMPONENT = document.getElementById("root");
var MARGIN_BOTTOM_PERCENT = 10;

init();

function init() {
  const myShip = document.createElement("div");
  myShip.id = "myShip";
  myShip.style.bottom = percent(MARGIN_BOTTOM_PERCENT);
  root.appendChild(myShip);
}

/**
 * Utils
 */

function pix(nb) {
  return `${nb}px`;
}

function percent(nb) {
  return `${nb}%`;
}
