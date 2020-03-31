let virtualGamePad = {
    game: null,
    _anchor: {x:0, y:0},
    _isDown: false,
    _radius: 15,
    _lastEvent: "",
    _dispatch: function (a){
        virtualGamePad._lastEvent = a;
        for (let i=0;i<virtualGamePad._callbacks[a].length;i++)
            virtualGamePad._callbacks[a][i]();
    },
    _getPos: function(a){
        if ("touches" in a ) {
            return {x: a.touches[0].screenX, y: a.touches[0].screenY};
        } else {
            return {x: a.screenX, y: a.screenY};
        }
    },
    _down: function(a) {
        virtualGamePad._isDown = true;
        virtualGamePad._anchor = virtualGamePad._getPos(a);
    },
    _up: function(a) {
        virtualGamePad._isDown = false;
        if (virtualGamePad._lastEvent.endsWith("down")){
            const up = virtualGamePad._lastEvent.substring(0,virtualGamePad._lastEvent.length - 4);
            virtualGamePad._dispatch(up + "up");
        }
        virtualGamePad._offset =  {x:0,y:0};
    },
    _offset: {x:0,y:0},
    _move: function(a) {
        if (virtualGamePad._isDown) {
            const c = virtualGamePad._getPos(a);
            virtualGamePad._offset = {x:c.x - virtualGamePad._anchor.x, y:c.y - virtualGamePad._anchor.y};
            let l = virtualGamePad._offset;
            const d = Math.sqrt(l.x * l.x + l.y * l.y );
            let event = "";
            if (d > virtualGamePad._radius) {
                if (Math.abs(l.x) > Math.abs(l.y)){
                    if (l.x>0) {
                        event = "right";
                    }else{
                        event = "left";
                    }
                }else{
                    if (l.y>0) {
                        event = "down";
                    }else{
                        event = "up";
                    }
                }
                if (virtualGamePad._lastEvent !== event + "down"){
                    if (virtualGamePad._lastEvent.endsWith("down")){
                        const up = virtualGamePad._lastEvent.substring(0,virtualGamePad._lastEvent.length - 4);
                        virtualGamePad._dispatch(up + "up");
                    }
                    virtualGamePad._dispatch(event + "down");
                }
            }else {
                if (virtualGamePad._lastEvent !== event + "down"){
                    if (virtualGamePad._lastEvent.endsWith("down")){
                        const up = virtualGamePad._lastEvent.substring(0,virtualGamePad._lastEvent.length - 4);
                        virtualGamePad._dispatch(up + "up");
                    }
                }
            }
        }
    },
    _callbacks: {
        leftup: [],
        leftdown:[],
        rightup: [],
        rightdown: [],
        upup: [],
        updown: [],
        downup: [],
        downdown: []
    },
    addEventListener: function(event, callback){
        virtualGamePad._callbacks[event].push(callback);
    },
    start: function(type, div, size) {
        let defaultPrevent = function(e){e.preventDefault();}
        if (type === "joystick"){
            window.addEventListener("touchstart", defaultPrevent);
            window.addEventListener("touchmove" , defaultPrevent);

            virtualGamePad._radius = 15;
            window.addEventListener("touchstart", virtualGamePad._down);
            window.addEventListener("mousedown", virtualGamePad._down);
            window.addEventListener("mouseup", virtualGamePad._up);
            window.addEventListener("touchend", virtualGamePad._up);
            window.addEventListener("mousemove", virtualGamePad._move);
            window.addEventListener("touchmove", virtualGamePad._move);

            if (typeof div !== "undefined") {
                let w = div.clientWidth;
                let h = div.clientHeight;
                virtualGamePad.game = new Phaser.Game(w, h, Phaser.AUTO, div.id);
                virtualGamePad.game.state.add("virtualGamePad.runJoystick", virtualGamePad.runJoystick);
                virtualGamePad.game.state.start("virtualGamePad.runJoystick");
            }
        } else {
            if (typeof div !== "undefined") {
                let w = div.clientWidth;
                let h = div.clientHeight;
                virtualGamePad.game = new Phaser.Game(w, h, Phaser.AUTO, div.id);
                virtualGamePad.game.state.add("virtualGamePad.runGamepad", virtualGamePad.runGamepad);
                virtualGamePad.game.state.start("virtualGamePad.runGamepad");
            }
        }
    },
    resizeTo: function(sprite, size){
        const scaleX = size.w / sprite.width;
        const scaleY = size.h / sprite.height;
        sprite.scale.setTo(scaleX,scaleY);
    },
    runJoystick: function(game){},
    runGamepad: function(game){},
    drawSprite: function (screenPos, img, size){
        let cache = virtualGamePad.game.cache.getImage(img);
        let sprite = virtualGamePad.game.add.sprite(screenPos.x, screenPos.y, img);
        const scaleX = size / cache.width;
        const scaleY = size / cache.height;
        sprite.scale.setTo(scaleX, scaleY);
        return sprite;
    }
};

virtualGamePad.runJoystick.prototype = {
    preload: function () {
        virtualGamePad.game.load.image("circle", "img/grey_circle.png");
        virtualGamePad.game.load.image("ball", "img/red_ball.png");
    },
    create: function() {
        virtualGamePad.game.stage.backgroundColor = "#a0a0a0";
        virtualGamePad.circle = virtualGamePad.drawSprite({x:virtualGamePad.game.width/2,y:virtualGamePad.game.height/2},"circle", virtualGamePad.game.width);
        virtualGamePad.circle.z = 1;
        virtualGamePad.circle.anchor.setTo(.5,.5);
        virtualGamePad.ball = virtualGamePad.drawSprite({x:virtualGamePad.game.width/2,y:virtualGamePad.game.height/2},"ball", virtualGamePad.game.width * .5);
        virtualGamePad.ball.z = 2;
        virtualGamePad.ball.anchor.setTo(.5,.5);
    },
    update: function() {
        const d = Math.sqrt(Math.pow(virtualGamePad._offset.x,2) + Math.pow(virtualGamePad._offset.y,2));
        const p = {x:0,y:0};
        if (d>0) {
            p.x = virtualGamePad._offset.x * 50 / d;
            p.y = virtualGamePad._offset.y * 50 / d;
        }
        virtualGamePad.ball.x = virtualGamePad.game.width/2 + p.x;
        virtualGamePad.ball.y = virtualGamePad.game.height/2 + p.y;
        virtualGamePad.ball.z = 2;
    }
}

virtualGamePad.runGamepad.prototype = {
    preload: function () {
        virtualGamePad.game.load.image("left_button", "img/left_button.png?r=" + Math.random());
        virtualGamePad.game.load.image("right_button", "img/right_button.png?r=" + Math.random());
        virtualGamePad.game.load.image("up_button", "img/up_button.png?r=" + Math.random());
        virtualGamePad.game.load.image("down_button", "img/down_button.png?r=" + Math.random());
        virtualGamePad.game.load.image("left_button_down", "img/left_button_down.png?r=" + Math.random());
        virtualGamePad.game.load.spritesheet("right_button_down", "img/right_button_down.png?r=" + Math.random(), {frameWidth: 256, frameHeight: 256});
        virtualGamePad.game.load.image("up_button_down", "img/up_button_down.png?r=" + Math.random());
        virtualGamePad.game.load.image("down_button_down", "img/down_button_down.png?r=" + Math.random());
    },
    create: function() {
        virtualGamePad.game.stage.backgroundColor = "#a0a0a0";
        const buttonSize = {w:virtualGamePad.game.height * .40,h:virtualGamePad.game.height * .40};
        virtualGamePad.leftButton = virtualGamePad.drawSprite({x:virtualGamePad.game.width/2,y:virtualGamePad.game.height/2},"left_button", virtualGamePad.game.height * .40);
        virtualGamePad.leftButton.anchor.setTo(1.15,.5);
        virtualGamePad.leftButton.inputEnabled = true;
        virtualGamePad.leftButton.events.onInputDown.add(function()
        {
            virtualGamePad._dispatch("leftdown");
        });
        virtualGamePad.leftButton.events.onInputUp.add(function()
        {
            virtualGamePad._dispatch("leftup");
        });
        virtualGamePad.rightButton = virtualGamePad.drawSprite({x:virtualGamePad.game.width/2,y:virtualGamePad.game.height/2},"right_button", virtualGamePad.game.height * .40);
        virtualGamePad.rightButton.anchor.setTo(-0.15,.5);
        virtualGamePad.rightButton.inputEnabled = true;
        virtualGamePad.rightButton.events.onInputDown.add(function()
        {
            virtualGamePad._dispatch("rightdown");
        });
        virtualGamePad.rightButton.events.onInputUp.add(function()
        {
            virtualGamePad._dispatch("rightup");
        });
        virtualGamePad.upButton = virtualGamePad.drawSprite({x:virtualGamePad.game.width/2,y:virtualGamePad.game.height/2},"up_button", virtualGamePad.game.height * .4);
        virtualGamePad.upButton.anchor.setTo(.5,1.15);
        virtualGamePad.upButton.inputEnabled = true;
        virtualGamePad.upButton.events.onInputDown.add(function()
        {
            virtualGamePad._dispatch("updown");
        });
        virtualGamePad.upButton.events.onInputUp.add(function()
        {
            virtualGamePad._dispatch("upup");
        });
        virtualGamePad.downButton = virtualGamePad.drawSprite({x:virtualGamePad.game.width/2,y:virtualGamePad.game.height/2},"down_button", virtualGamePad.game.height * .4);
        virtualGamePad.downButton.anchor.setTo(.5,-0.15);
        virtualGamePad.downButton.inputEnabled = true;
        virtualGamePad.downButton.events.onInputDown.add(function()
        {
            virtualGamePad._dispatch("downdown");
        });
        virtualGamePad.downButton.events.onInputUp.add(function()
        {
            virtualGamePad._dispatch("downup");
        });
    },
    update: function() {
    }
}
