// Ella Tokoni (TE18) & Emil Gustafsson (NATE18) 2020
// Programmering 1
// Spel projekt
// Ett spel som startades från scratch då Emil tyckte det var svårt att börja med det existerande ramverket.
// Spelet heter "square massacre"

var canvas = document.getElementById('canvas'); // Här hämtar vi canvas id från html
var ctx = canvas.getContext('2d'); // Här säger vi att spelet ska vara i 2d

// Här bestämmer vi storleken på canvas, kan också göras i html, men bättre att ha det i js för då kan vi manipulera det lättare
canvas.width = 700;
canvas.height = 700;

// Tangenter
var keyState = []; // Deklarerad array som det ska finnas tangenter i
keyState.length = 256; // Alla tangenter

// Lyssnar efter tangenter så att den vet när vi trycker ned(1) och upp(2)
canvas.addEventListener('keydown', onKeyDown); // 1
canvas.addEventListener('keyup', onKeyUp); // 2

// Kontroller
var keyUp = 87; // Fram är W
var keyDown = 83; // Bakåt är S
var keyLeft = 65; // Vänster är A
var keyRight = 68; // Höger är D
var keyShoot = 32; // Skjutkanppen är space
var keyStart = 13; // Startknapp är Enter
/*
Kollade upp numrena på tangenterna här:
https://docstore.mik.ua/orelly/webprog/DHTML_javascript/0596004672_jvdhtmlckbk-app-b.html
*/

var FPS = 30; //Fps, hur många frames som det ska vara per sekund
var start = false; // Starta spelet? vi behöver den här variablen för att berätta för spelet om att spelet antinge är igång eller ej
var score = 0; // Poäng
var player = new Player(); // Skapa spelareobjekt
var pBullets = []; // En array p skotten (player)
var enemies = []; // En array för alla fiender

// Variabler som används i start menyn, strings
// p står för "player"
// C står för "controls"
// g står för "game"
var pEnter = "Press Enter to Start";
var pCmove = "WASD - move";
var pCshoot = "Space - shoot";
var gOver = "Game over!";
var pressF5 = "Press F5 to restart"

var w_delay = 0; // weapon delay
var hit_delay = 0; // player hit delay
let particleArray;

//Loggar de tangenter som trycks ned
function onKeyDown(event) {
  keyState[event.keyCode] = true; // Om tangenten är nere, så loggas den
  console.log(event.keyCode);
}
function onKeyUp(event) {
  keyState[event.keyCode] = false; // Om tangenten är uppe, så loggas den inte, om vi logga den då så skulle den loggas hela tiden
}
/*
function Particle(x, y, xSpeed, ySpeed, size, color){
  this.x = x;
  this.y = y;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
  this.size = size;
  this.color = color;
}

Particle.prototype.draw = function () {
  ctx.beginpath();
  ctx.arc(this.x, this.y, 0, Math.PI * 2, false)
  ctx.fillStyle = this.color;
  ctx.fill();
};

Particle.prototype.draw = function () {
  if (this.x + this.size > canvas.width || this.x - this.size < 0) {
    this.xSpeed = -this.xSpeed;
  }
  if(this.y + this.size || this.y - this.size < 0) {
  this.ySpeed = -this.ySpeed;
}
this.draw();
};

function init() {
particleArray = [];
for (var i = 0; i < 100; i++) {
  let size = Math.random() * 20;
  let x = Math.random() * (innerWidth - size * 2)
  let y = Math.random() * (innerHeight - size * 2)
  let xSpeed = Math.random() * (innerWidth size * 2)
}
}
*/
// Spelarens klass
function Player() {
  var HP = 150; // Hälsa
  var damage = 1; // Hur mycket skada spelaren gör
  var w_type = 1;
  var cd_factor = 10;


  this.getHP = function() {
    return HP;
  };
  this.getHit = function() {
    HP -= 50;        // Om man blir träffad så förlorar man 50 hp
    hit_delay = 100; //
  };
  /*
  this.getWtype = function() {
    return w_type;
  };
  */
  this.getCD = function() {
    return cd_factor;
  };


  this.active = true;
  this.color = "white"; // Färg på spelaren
  this.width = 35; // Bredden på spelarne (i pixlar)
  this.height = 35; // Höjden på spelaren (i pixlar)
  this.x = canvas.width/2 - this.width/2; // Gör så att spelaren starta på i mitten
  this.y = canvas.height - this.height; // Gör så spelaren startar på botten
}

Player.prototype.draw = function() {
  if (hit_delay > 0) {
    if (Math.sin(hit_delay) > 0) {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = this.color;
    }
  } else {
    ctx.fillStyle = this.color;
  }
  ctx.fillRect(this.x, this.y, this.width, this.height);// Fyller rektangeln med den färg som det blev
};

Player.prototype.shoot = function() {
  if(w_delay === 0) {
    pBullets.push(new Bullet({
      vel: 10, // Hastighet på skottet
      x: this.x + this.width/2,
      y: this.y
    }));
    w_delay = 100; // Måste har en delay på skotten annars så blir spelet för enkelt
  }
};

function Bullet(bullet) { // Skott klass
  this.active = true;
  this.color = "red"; // Färg på skottet
  this.yVel = -bullet.vel;
  this.width = 5; // Bredden på skottet i pixlar
  this.height = 4; // Höjden på skottet i pixlar
                   // Vi skjuter en liten rektangel
  this.x = bullet.x;
  this.y = bullet.y;
}

Bullet.prototype.inBounds = function() { // Kollar så att skottet inte tar sig ur canvasens parametrar
  return this.x >= 0 && this.x <= canvas.width &&
         this.y >= 0 && this.y <= canvas.height;
};

Bullet.prototype.draw = function() {
  ctx.fillStyle = this.color; // Den tidigare färgn vi valt vilket är röd
  ctx.fillRect(this.x, this.y, this.width, this.height); // De tidigare variabler vi valt och kan ändra på ovanför
};

Bullet.prototype.update = function() {
  this.y += this.yVel;
  this.active = this.inBounds() && this.active;
};

Bullet.prototype.die = function() {
  this.active = false;
};

function Enemy() { // Fiende klass
  this.active = true;
  this.color = "red"; // Färg på fiende
  this.x = canvas.width * Math.random();
  /*
  Jag pratade med dig om hur jag skulle kunna göra en random "spawn" och
  det här var resultatet. Den tar canvas bredden gånger Math.random som går
  mellan ett och noll så att den går från vänster till höger etc.
  */
  this.y = 0;
  this.xVel = 0;
  this.yVel = 4;
  this.width = 30; // Bredd på fienden
  this.height = 30; // Höjd på fienden
}

Enemy.prototype.inBounds = function() { // Den här funktionen kollar så att fiende objektet är inom canvas ramen
  return this.x >= 0 && this.x <= canvas.width &&
         this.y >= 0 && this.y <= canvas.height;
};

Enemy.prototype.draw = function() {
  ctx.fillStyle = this.color; // Den tidigare färg vi vat vilket är röd
  ctx.fillRect(this.x, this.y, this.width, this.height); // De tidigare variabler vi har valt som vi kan ändra på om vi går upp lite
};

Enemy.prototype.update = function() {
  if (Math.abs(player.y - this.y) < 200) {
    if ((player.x - this.x) > 0) {
      this.xVel = 2;
    } else if ((player.x - this.x) < 0) {
      this.xVel = -2;
    } else {
      this.xVel = 0;
    }
  }
  this.x += this.xVel;
  this.y += this.yVel;
  this.active = this.active && this.inBounds();
};

Enemy.prototype.die = function() {
  this.active = false;
  score += 10;
};


function collisionCheck(a, b) {
  /* Kollar om någons x och y värden överlappar
     det här har vi prata mycket om på lektionerna
     och det blev såhär och det funkar väl.
  */
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function collisionOccurs() {
  /*
  Om dessa värden överlappar och sådant
  så "dör" skottet och fienden.
  */
  pBullets.forEach(function(bullet) {
    enemies.forEach(function(enemy) {
      if (collisionCheck(bullet, enemy)) {
        bullet.die();
        enemy.die();
      }
    });
  });

  enemies.forEach(function(enemy) {
    if (collisionCheck(enemy, player)) {
      if (hit_delay === 0) {
        enemy.die();
        player.getHit();
      }
    }
  });
}

setInterval(function() {
  canvas.focus(); // Detta + tabindex="0" gör att om man råkar trycka utanför canvas så funkar tangenteran fortfarande
  startGame(); // Startar spelet
  if (start) {
    if (player.getHP() > 0)
      update();
    draw();
  }
},1000/FPS);

function explosion(){

}

function startGame() {
  if (!start) {
    ctx.font = "20px Serif"; // Storlek och font
    ctx.fillStyle = "white"; // Färg på texten
    ctx.fillText(pEnter, 47, 180); // Text och koordinater
    // Behöver ingen font eller fillstyle eftersom att det redan är bestämt
    ctx.fillText(pCmove, 47, 210); // Text och koordinater
    ctx.fillText(pCshoot, 47, 240); // Text och koordinater
  }
    if(keyState[keyStart])
      start = true;
}

function update() {
  // movements
  if(keyState[keyUp] && player.y > 0)
    player.y -= 4;
  if(keyState[keyDown] && player.y < canvas.height - player.height)
    player.y += 4;
  if(keyState[keyLeft] && player.x > 0)
    player.x -= 4;
  if(keyState[keyRight] && player.x < canvas.width - player.width)
    player.x += 4;

  if(keyState[keyShoot]) // Gör att man space skjuter
    player.shoot();

  pBullets.forEach(function(bullet) { // Uppdatera pBullets efter varjegång funktionen bullets kör
    bullet.update();
  });

  pBullets = pBullets.filter(function(bullet) {
    return bullet.active;
  });

  if(w_delay > 0)
    w_delay -= player.getCD();

  // enemies
  if(Math.random() <= 0.14) // Om det slumpmässiga numret är mindre eller lika med 0,14, spawna en ny fiende (pusha in den i enemy arrayen)
    enemies.push(new Enemy());

  enemies.forEach(function(enemy) {
    enemy.update();
  });

  enemies = enemies.filter(function(enemy) {
    return enemy.active;
  });

  collisionOccurs();

  if (hit_delay > 0)
    hit_delay -= 1;

}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw(); // Ritar ut spelaren
  pBullets.forEach(function(bullet) {
    bullet.draw(); // Ritar ut skottet
  });

  enemies.forEach(function(enemy) {
    enemy.draw(); // Rita en fiende för varje fiende som skapas
  });

  if (player.getHP() <= 0) { // Game over skärmen, om spelarens uppdaterade hp är lika med eller under 0 så förlorar man
    ctx.font = "30px Serif"; // Storlek och font
    ctx.fillStyle = "white"; // Färg på texten
    ctx.fillText(gOver, 47, 180); // Vad det ska stå och koordinater för texten
    // Behöver ingen font eller fillstyle här, de har valts på linje 292 och linje 293
    ctx.fillText(pressF5, 47, 210); //
  } // https://www.w3schools.com/tags/canvas_textalign.asp

  ctx.font = "15px Serif"; // Storlek och font
  ctx.fillStyle = "white"; // Färg på texten
  ctx.fillText(score, 5, 15); // Utskrivna "poäng" med koordinater, vi har tidigare deklarerat variabeln score
};
