let game;
window.onload = function () {
     document.body.style.backgroundColor = "#a0a0a0";
     setTimeout(start,500);
};

function start () {
     let body = document.body;
     let w = window.innerWidth;
     let h = window.innerHeight;
     let size = Math.min (1000,w*.9,h);

     let container = document.getElementById("game-div");
     container.style.width = size + "px";
     container.style.marginLeft = ((w - size) / 2) + "px";

     const minSize = 250;
     if (h > size + minSize && h > w) {
          const jw = Math.min(h-size,w);
          let joystick = document.getElementById("joystick-div");
          joystick.style.width = jw + "px";
          joystick.style.height = jw + "px";
          joystick.style.marginLeft = ((w - jw) / 2) + "px";
          let control = Helpers.getUrlVars()["control"];

          if (typeof control == "undefined") control = "gamepad";
          virtualGamePad.start(control, joystick, jw);
          container.style.marginTop = ((h - (size+jw))/2) + "px";
     } else {
          container.style.marginTop = ((h - size)/2) + "px";
          virtualGamePad.start(size * .05);
     }
     loadMaps( function (maps, images){
          gameStatus.maps = maps;
          gameStatus.images = images;
          game = new Phaser.Game(size, size, Phaser.AUTO, "game-div");
          game.state.add("PlayGame", playGame);
          game.state.start("PlayGame");
     });
}

let playGame = function(game){};

let groups = {
     maze:null,
     status:null,
     agents:null,
     tiles:null
}

playGame.prototype = {
     preload: function(){
          for (let i=0;i<gameStatus.images.length;i++){
               game.load.image(gameStatus.images[i].name, gameStatus.images[i].url + "?r=" + Math.random());
          }
          game.load.bitmapFont('8bit', 'fonts/8bit.png', 'fonts/8bit.xml');
          game.load.script('spinner', 'js/spinner.js?r=' + Math.random());
          game.load.script('maze', 'js/maze.js?r=' + Math.random());
          game.load.script('prey', 'js/prey.js?r=' + Math.random());
          game.load.script('predator', 'js/predator.js?r=' + Math.random());
     },
     create: function(){
          groups.agents = game.add.group()
          groups.status = game.add.group();
          groups.maze = game.add.group();
          groups.tiles = game.add.group();
          gameStatus.menu();

          prey.keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
          prey.keyRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
          prey.keyUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
          prey.keyDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);

          prey.keyLeft.onDown.add(prey.onLeftKeyDown);
          prey.keyRight.onDown.add(prey.onRightKeyDown);
          prey.keyUp.onDown.add(prey.onUpKeyDown);
          prey.keyDown.onDown.add(prey.onDownKeyDown);

          prey.keyLeft.onUp.add(prey.onLeftKeyUp);
          prey.keyRight.onUp.add(prey.onRightKeyUp);
          prey.keyUp.onUp.add(prey.onUpKeyUp);
          prey.keyDown.onUp.add(prey.onDownKeyUp);

          virtualGamePad.addEventListener("leftdown", prey.onLeftKeyDown);
          virtualGamePad.addEventListener("rightdown", prey.onRightKeyDown);
          virtualGamePad.addEventListener("updown", prey.onUpKeyDown);
          virtualGamePad.addEventListener("downdown", prey.onDownKeyDown);

          virtualGamePad.addEventListener("leftup", prey.onLeftKeyUp);
          virtualGamePad.addEventListener("rightup", prey.onRightKeyUp);
          virtualGamePad.addEventListener("upup", prey.onUpKeyUp);
          virtualGamePad.addEventListener("downup", prey.onDownKeyUp);
     },
     update: function(){
          this.visited = [];
          this.visited.length = 0;
          if (gameStatus.code===4) {
               maze.draw();
          }
     },
}

var Helpers = {
    GetRandom: function (low, high) {
        return~~ (Math.random() * (high - low)) + low;
    },
    /**
     * @return {number}
     */
    GetRandomInt: function (ceiling) {
         return Math.floor(Helpers.GetRandom(0,ceiling));
    },
    GetRandomElement: function (arr) {
         return arr[Helpers.GetRandomInt(arr.length)];
    },
    getUrlVars: function() {
          var vars = {};
          var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
               vars[key] = value;
          });
          return vars;
    }
};

function loadStats (callback) {
     let request = new XMLHttpRequest();
     request.overrideMimeType("application/json");
     request.open('GET', 'https://ebyfm58hmk.execute-api.ca-central-1.amazonaws.com/default/plan_game_counter?r=g&p=' + Math.random(), true);
     request.onreadystatechange = function () {
          if (request.readyState === 4 && request.status === 200) {
               callback(JSON.parse(request.responseText));
          }
     };
     request.send(null);
}

function saveResult (res) {
     let request = new XMLHttpRequest();
     request.overrideMimeType("application/json");
     request.open('POST', 'https://ebyfm58hmk.execute-api.ca-central-1.amazonaws.com/default/plan_game_counter?r=' + res + '&p=' + Math.random(), true);
     let p = {
          world: maze.worldName,
          version: maze.version,
          prey: { interval: gameStatus.updatePreyInterval, positionHistory: prey.positionHistory },
          predator: { interval: gameStatus.updatePredatorInterval, positionHistory:predator.positionHistory }
     };
     // added body
     request.send(JSON.stringify(p));
}

function loadMaps (callback) {
     let request = new XMLHttpRequest();
     request.overrideMimeType("application/json");
     request.open('GET', 'maps/maps.json?r=' + Math.random(), true);
     request.onreadystatechange = function () {
          if (request.readyState === 4 && request.status === 200) {
               loadImages(callback, JSON.parse(request.responseText));
          }
     };
     request.send(null);
}

function loadImages (callback, maps) {
     let request = new XMLHttpRequest();
     request.overrideMimeType("application/json");
     request.open('GET', 'img/images.json?r=' + Math.random(), true);
     request.onreadystatechange = function () {
          if (request.readyState === 4 && request.status === 200) {
               callback (maps, JSON.parse(request.responseText));
          }
     };
     request.send(null);
}
