let gameStatus = {
    speeds: [3,4,6], //moves per second
    predatorPreySpeedRatio: 1.5,
    randomness: [2,4,5], // 50% random, 25% random, 20% random
    anchor:{x:0,y:0},
    updatePreyInterval: null,
    updatePredatorInterval: null,
    titleTimeOut : 1000,
    preyUpdateRate: 3,
    predatorUpdateRate: 4.5,
    spinnersValues: [0, 1],
    code: 0,
    maps: [],
    circleSprite: null,
    predatorRandomness: 4, //%25 percent random
    showMessage:function(message, size, tint = 0xFFFFFF, location = {x:  .5, y: .5}, anchor = {x:.5,y:.5}){
        let sprite = game.add.bitmapText(game.width * location.x,game.height * location.y, '8bit',message,34);
        sprite.anchor.x = anchor.x;
        sprite.anchor.y = anchor.y;
        sprite.tint = tint;
        let scaleX = game.width * size.w / sprite.width;
        let scaleY = game.width * size.h / sprite.height;
        sprite.scale.setTo(scaleX<scaleY?scaleX:scaleY,scaleX<scaleY?scaleX:scaleY);
        groups.status.add(sprite);
        game.world.bringToTop(groups.status);
        return sprite;
    },
    menu: function (){
        loadStats( function (a) {
            gameStatus.showMenu(a.Items[0].played);
        });
    },
    showMenu: function (p){
        groups.status.removeAll();
        groups.maze.removeAll();
        groups.agents.removeAll();
        let back = game.add.image(0, 0, 'background');
        back.scale.setTo(game.width / back.width,game.height / back.height);
        groups.status.add(back);

        gameStatus.code = 0;
        //gameStatus.showMessage("SURVIVAL",{w:.95,h:.1},0xFFFFFF,{x:.51,y:.10});
        gameStatus.showMessage("HABITAT: ",{w:.8,h:.03},0xFFFFFF,{x:.06,y:.45}, {x:0,y:.5});
        gameStatus.showMessage("DIFFICULTY: ",{w:.8,h:.03},0xFFFFFF,{x:.06,y:.61}, {x:0,y:.5});
        gameStatus.showMessage("Played " + p + " times",{w:.8,h:.025},0xFFFFFF,{x:.25,y:.925}, {x:0,y:.5});
        let options = [];
        for (let i = 0;i < gameStatus.maps.length ;i++) options.push(gameStatus.maps[i].name);
        gameStatus.mapSpinner = new Spinner(game.width * .215,game.height * .495,game.width *.55,game.height *.075,options,"8bit", groups.status);
        gameStatus.mapSpinner.selected = gameStatus.spinnersValues[0];
        gameStatus.mapSpinner.update();
        gameStatus.modSpinner = new Spinner(game.width * .215,game.height * .655,game.width *.55,game.height *.075,["easy","natural", "hard"],"8bit", groups.status);
        gameStatus.modSpinner.selected = gameStatus.spinnersValues[1];
        gameStatus.modSpinner.update();
        let playButton = gameStatus.showMessage("PLAY",{w:.8,h:.1},0xD34F1D,{x:.51,y:.85});
        playButton.anchor.x = .5;
        playButton.anchor.y = .5;
        groups.status.add(playButton);
        playButton.inputEnabled = true;
        playButton.events.onInputDown.add(gameStatus.ready, this);
    },
    ready: function(){
        gameStatus.spinnersValues[0] = gameStatus.mapSpinner.selected;
        gameStatus.spinnersValues[1] = gameStatus.modSpinner.selected;
        gameStatus.preyUpdateRate = gameStatus.speeds[gameStatus.modSpinner.selected];
        gameStatus.predatorUpdateRate = gameStatus.preyUpdateRate * gameStatus.predatorPreySpeedRatio;
        gameStatus.predatorRandomness = gameStatus.randomness[gameStatus.modSpinner.selected];
        groups.status.removeAll(true);
        gameStatus.code = 1;
        gameStatus.showMessage("ready",{w:.5,h:1}, 0xFF0000);
        setTimeout(gameStatus.set,gameStatus.titleTimeOut);
        maze.mode = gameStatus.modSpinner.selected;
        maze.worldName = gameStatus.maps[gameStatus.mapSpinner.selected].name;
        maze.loadWorld(gameStatus.maps[gameStatus.mapSpinner.selected].file,0);
        gameStatus.mapSpinner.destroy();
        gameStatus.modSpinner.destroy();
    },
    set: function(){
        gameStatus.code = 2;
        groups.status.removeAll();
        gameStatus.showMessage("set",{w:.6,h:1}, 0xFFFF00);
        setTimeout(gameStatus.go,gameStatus.titleTimeOut);
    },
    go: function (){
        gameStatus.code = 3;
        groups.status.removeAll();
        gameStatus.showMessage("GET TO",{w:.40,h:1},0x00FF00, {x:.5, y:.4});
        gameStatus.showMessage("THE GOAL",{w:.90,h:2},0x00FF00, {x:.5, y:.6});
        gameStatus.circleSprite = maze.drawTile(maze.world.goalPosition,"white_circle",1, {w:game.width,h:game.height});
        gameStatus.circleSprite.x += maze.tileSizeX / 2;
        gameStatus.circleSprite.y += maze.tileSizeY / 2;
        gameStatus.circleSprite.anchor.setTo(.5,.5);
        let tween = game.add.tween(gameStatus.circleSprite).to( { width: maze.tileSizeX, height: maze.tileSizeY }, gameStatus.titleTimeOut * .9, "Linear", true);
        setTimeout(gameStatus.gameOn,gameStatus.titleTimeOut);
    },
    gameOn:function (){
        setTimeout(function (){
            gameStatus.circleSprite.destroy();
        },gameStatus.titleTimeOut);

        groups.status.removeAll();
        gameStatus.code = 4;
        maze.start();
        gameStatus.updatePreyInterval = 1000 / gameStatus.preyUpdateRate;
        gameStatus.updatePredatorInterval = 1000 / gameStatus.predatorUpdateRate;
        gameStatus.preyDaemon = setInterval(maze.updatePrey,gameStatus.updatePreyInterval);
        gameStatus.predatorDaemon = setInterval(maze.updatePredator,gameStatus.updatePredatorInterval);
    },
    gameOver:function(){
        clearInterval(gameStatus.preyDaemon);
        clearInterval(gameStatus.predatorDaemon);
        gameStatus.code = 5;
        maze.draw();
        gameStatus.showMessage("game over",{w:.9,h:2}, 0xFF0000);
        saveResult("l");
        setTimeout(gameStatus.menu,gameStatus.titleTimeOut * 3);
    },
    youWin:function(){
        clearInterval(gameStatus.preyDaemon);
        clearInterval(gameStatus.predatorDaemon);
        gameStatus.code = 6;
        maze.draw();
        gameStatus.showMessage("you win",{w:.9,h:2}, 0x00FF00);
        saveResult("w");
        setTimeout(gameStatus.menu,gameStatus.titleTimeOut * 3);
    },
    updatePrey:function(){
        if (gameStatus.code === 4) prey.move();
    },
    updatePredator:function(){
        if (gameStatus.code === 4) predator.move();
    }
}
