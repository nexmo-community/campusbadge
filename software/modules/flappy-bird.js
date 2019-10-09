module.exports.run = function () { 
  Badge.reset();
  var SPEED = 0.5;
  var BIRDIMG = Graphics.createImage(`

 ####
#    #
# ### #
# #  #
#    #
 ####

`);
  BIRDIMG.transparent = 0;
  var birdy, birdvy;
  var wasPressed = false;
  var running = false;
  var barriers;
  var score;

  function newBarrier(x) {
    barriers.push({
      x1: x - 5,
      x2: x + 5,
      y: 10 + Math.random() * (g.getHeight() - 20),
      gap: 8
    });
  }

  function gameStart() {
    running = true;
    birdy = g.getHeight() / 2;
    birdvy = 0;
    barriers = [];
    newBarrier(g.getWidth() / 2);
    newBarrier(g.getWidth());
    score = 0;
    wasPressed = false;
    setInterval(onFrame, 50);
  }

  function gameStop() {
    running = false;
    clearInterval();
    setTimeout(() => setWatch(gameStart, BTN3), 1000);
    setTimeout(onFrame, 10);
  }

  function onFrame() {
    var buttonState = BTN2.read() || BTN3.read();

    g.clear();
    if (!running) {
      g.drawString("Game Over!", 25, 10);
      g.drawString("Score", 10, 20);
      g.drawString(score, 10, 26);
      g.flip();
      return;
    }

    if (buttonState && !wasPressed) {
      birdvy -= 2;
    }
    wasPressed = buttonState;

    score++;
    birdvy += 0.2;
    birdvy *= 0.8;
    birdy += birdvy;
    if (birdy > g.getHeight()) return gameStop();
    // draw bird
    g.drawImage(BIRDIMG, 0, birdy - 4);
    // draw barriers
    barriers.forEach(b => {
      b.x1 -= SPEED;
      b.x2 -= SPEED;
      var btop = b.y - b.gap;
      var bbot = b.y + b.gap;
      g.drawRect(b.x1 + 1, -1, b.x2 - 2, btop - 5);
      g.drawRect(b.x1, btop - 5, b.x2, btop);
      g.drawRect(b.x1, bbot, b.x2, bbot + 5);
      g.drawRect(b.x1 + 1, bbot + 5, b.x2 - 1, g.getHeight());
      if (b.x1 < 6 && (birdy - 3 < btop || birdy + 3 > bbot)) return gameStop();
    });
    while (barriers.length && barriers[0].x2 <= 0) {
      barriers.shift();
      newBarrier(g.getWidth());
    }

    g.flip();
  }
  gameStart();
  setWatch(Badge.menu, BTN1);
};
