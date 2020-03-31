let predator = {
    chasing: false,
    lastPreyLocation: {x:0,y:0},
    alwaysVisible : true,
    positionHistory : [],
    x: 0,
    y: 0,
    start: function(){
        predator.x = maze.predatorStartPosition.x;
        predator.y = maze.predatorStartPosition.y;
        predator.positionHistory =[{x: predator.x, y: predator.y}];
    },
    contact: false,
    getPos: function() {
        return {x:predator.x, y:predator.y};
    },
    setPos: function (pos){
      predator.x = pos.x;
      predator.y = pos.y;
    },
    move: function(){
        if (maze.isVisible(prey,predator)) { // visual contact random move
            predator.lastPreyLocation = maze.copy(prey);
            predator.chasing = true;
        }
        if (predator.chasing){
            predator.moveTowards(predator.lastPreyLocation);
            if (predator.lastPreyLocation.x === predator.x && predator.lastPreyLocation.y === predator.y) {
                predator.chasing = false;
            }
        }
        else {
            predator.randomMove();
        }
        predator.positionHistory.push ({x:predator.x , y:predator.y});
        if (prey.x === predator.x && prey.y === predator.y) {
            gameStatus.gameOver();
            return false;
        }
        return true;
    },
    addMove: function(pos){
        let new_pos = {
            x:pos.x,
            y:pos.y
        };
        new_pos.x += predator.x;
        new_pos.y += predator.y;
        return new_pos;
    },
    moveTowards: function (pos){
        if(Helpers.GetRandomInt(gameStatus.predatorRandomness)===0) {
            predator.randomMove();
            return;
        }

        let min_distance = maze.distance(pos, predator);
        let selected = { x:0, y:0};
        for (let i = 0; i < moves.list.length; i++){
            if (predator.checkMove(moves.list[i])) {
                const ref = {x:pos.x - moves.list[i].x,y:pos.y - moves.list[i].y};
                if (maze.distance(predator,ref) < min_distance) selected = moves.list[i];
            }
        }
        predator.tryMove(selected);
    },
    randomMove: function (){
        while (!predator.tryMove(Helpers.GetRandomElement(moves.list)));
    },
    tryMove: function(move) {
        if (!predator.checkMove(move)) return false;
        predator.x += move.x;
        predator.y += move.y;
        return true;
    },
    checkMove: function(move){
        const candidate = predator.addMove(move);
        return maze.free(candidate);
    },
    getImage: function(){
        let img = maze.newImage(predator.spriteName);
        if (!maze.isVisible(predator,prey)) {
            if (predator.alwaysVisible) {
                img.alpha = .3;
            } else {
                img.alpha = 0;
            }
        }
        return img;
    },
};
