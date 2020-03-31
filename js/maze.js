let maze = {
    version: 0,
    tileSizeX: 0,
    tileSizeY: 0,
    worldName: "",
    world: null,
    map: null,
    visibility: null,
    ready : false,
    tiles: [],
    predator : null,
    prey : null,
    preyTween : null,
    predatorTween : null,
    predatorStartPosition : {x:7,y:7},
    start: function (){
        groups.agents.removeAll(true);
        prey.start();
        predator.start();
        maze.prey = maze.drawTile(prey,maze.world.preySprite);
        maze.predator = maze.drawTile(predator,maze.world.predatorSprite, maze.isVisible(prey,predator)?1:maze.mode==0?.3:0);
        groups.agents.add(maze.prey);
        groups.agents.add(maze.predator);
        game.world.bringToTop(groups.agents);
        maze.updatePrey();
        maze.updatePredator();
    },
    updatePrey: function(){
        const c = gameStatus.code === 4 && prey.move();
        const pos = maze.screenLocation(prey);
        maze.preyTween = game.add.tween(maze.prey).to( { x: pos.x, y: pos.y}, gameStatus.updatePreyInterval, "Linear", true);
    },
    updatePredator: function(){
        const c = gameStatus.code === 4 && predator.move();
        const pos = maze.screenLocation(predator);
        maze.predatorTween = game.add.tween(maze.predator).to( { x: pos.x, y: pos.y}, gameStatus.updatePredatorInterval, "Linear", true);
    },
    draw: function () {
        if (maze.ready) {
            maze.setAlpha(maze.predator, maze.isVisible(prey,predator)?1:maze.mode === 0?.3:0, true);
            for (let x = 0; x < maze.world.dimensions.w; x++){
                for (let y = 0; y < maze.world.dimensions.h; y++){
                    let sprite = maze.tiles[x][y];
                    const pos = {x:x,y:y};
                    if (maze.isVisible(prey, pos)) {
                        maze.setAlpha(sprite, 1-.8 * maze.distance(prey, pos)/maze.world.visualRange, true);
                    } else {
                        maze.setAlpha(sprite,.15, true);
                    }
                }
            }
            game.world.sendToBack(groups.tiles);
            game.world.bringToTop(groups.maze);
        }
    },
    setAlpha: function (sprite, value, animation = false){
        if (sprite.alpha !== value){
            if (animation) {
                game.add.tween(sprite).to( {alpha : value}, gameStatus.updatePreyInterval / 2 , "Linear", true);
            } else {
                sprite.alpha = value;
            }
        }
    },
    computeVisibility: function() {
        maze.visibility = maze.newMap();
        for (let x = 0; x < maze.world.dimensions.h; x++) {
            for (let y = 0; y < maze.world.dimensions.w; y++) {
                maze.visibility[x][y]=maze.newMap();
                for (let i=0; i< maze.world.dimensions.h;i++) {
                    for (let j = 0; j < maze.world.dimensions.w; j++) {
                        maze.visibility[x][y][i][j] = maze.existsViewLine({x:x,y:y},{x:i,y:j});
                    }
                }
            }
        }
    },
    loadWorld: function (worldFile) {
        let request = new XMLHttpRequest();
        request.overrideMimeType("application/json");
        request.open('GET', 'maps/' + worldFile + '?r=' + Math.random(), true);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                maze.world = JSON.parse(request.responseText);
                maze.version = Helpers.GetRandomInt(maze.world.occlusions.length);
                maze.predatorStartPosition = Helpers.GetRandomElement(maze.world.predatorStartPositions[maze.version]);
                maze.tileSizeX = game.width/maze.world.dimensions.w;
                maze.tileSizeY = game.height/maze.world.dimensions.h;
                groups.maze.removeAll(true);
                groups.tiles.removeAll(true);
                maze.map = maze.newMap();
                for(let i=0;i<maze.world.occlusions[maze.version].length;i++) {
                    const y = maze.world.occlusions[maze.version][i].y;
                    const x = maze.world.occlusions[maze.version][i].x;
                    maze.map[x][y] = 1;
                }
                maze.tiles = maze.newMap();
                for (let x = 0; x < maze.world.dimensions.w; x++){
                    for (let y = 0; y < maze.world.dimensions.h; y++){
                        maze.tiles[x][y] = maze.drawTile({x: x,y: y}, maze.world.tileSprite, 0);
                        groups.tiles.add(maze.tiles[x][y]);
                        if (maze.map[x][y] === 1) {
                            groups.maze.add(maze.drawTile({x: x,y: y}, maze.world.wallSprite, 1));
                        }
                    }
                }
                groups.maze.add(maze.drawTile(maze.world.goalPosition,maze.world.goalSprite));
                maze.ready = true;
                maze.computeVisibility();
            }
        };
        request.send(null);
    },
    free: function(pos){
        return maze.ready && pos.x>=0 && pos.y>=0 && pos.x < maze.world.dimensions.w && pos.y< maze.world.dimensions.h && maze.map[pos.x][pos.y]===0;
    },
    equal: function (pos0,pos1){
        return pos0.x === pos1.x && pos0.y === pos1.y;
    },
    distance: function(pos0, pos1){
        let pos = { x: pos0.x - pos1.x, y: pos0.y - pos1.y};
        return Math.sqrt(pos.x*pos.x+pos.y*pos.y);
    },
    isVisible: function (pos0, pos1){
        return maze.visibility[pos0.x][pos0.y][pos1.x][pos1.y];
    },
    addPos: function(pos0,pos1){
        return {x:pos0.x+pos1.x , y:pos0.y+pos1.y};
    },
    newMap: function (){
        let map = [];
        for (let x = 0; x < maze.world.dimensions.h; x++) {
            map[x] = [];
            for (let y = 0; y < maze.world.dimensions.w; y++) {
                map[x][y] = 0;
            }
        }
        return map;
    },
    copy: function(pos){
      return {x:pos.x, y:pos.y};
    },
    existsViewLine: function(pos0, pos1){
        if (maze.distance(pos0,pos1)>maze.world.visualRange) return false;
        let a = maze.copy(pos0);
        let b = maze.copy(pos1);
        let dx = Math.abs(b.x - a.x);
        let sx = a.x < b.x ? 1 : -1;
        let dy = Math.abs(b.y - a.y);
        let sy = a.y < b.y ? 1 : -1;
        let err = dx > dy ?  dx / 2 : -dy / 2;
        while((a.x !== b.x || a.y !== b.y)){
            if (!maze.free(a)) return false;
            let e2 = err;
            if(e2 > -dx){
                err -= dy;
                a.x += sx;
            }
            if(e2 < dy){
                err += dx;
                a.y += sy;
            }
        }
        return true;
    },
    screenLocation: function (pos){
        return {x:pos.x * maze.tileSizeX, y:pos.y * maze.tileSizeY};
    },
    drawTile: function (pos, img, alpha, size){
        if (typeof size === "undefined") size = {w: maze.tileSizeX, h: maze.tileSizeY};
        const screenPos = maze.screenLocation(pos);
        let cache = game.cache.getImage(img);
        let sprite = game.add.sprite(screenPos.x, screenPos.y, img);
        const scaleX = size.w / cache.width;
        const scaleY = size.h / cache.height;
        sprite.scale.setTo(scaleX, scaleY);
        if (!(typeof alpha === "undefined")) sprite.alpha = alpha;
        return sprite;
    },
}