let moves = {
    stay: function () {return {x:0,y:0};},
    left: function () {return {x:-1,y:0};},
    right: function () {return {x:1,y:0};},
    up: function () {return {x:0,y:-1};},
    down: function () {return {x:0,y:1};},
    list: [],
    isMove :function (a,b){
        return a.x === b.x && a.y === b.y;
    },
    isRight(a){
        return moves.isMove(a,moves.right());
    },
    isLeft(a){
        return moves.isMove(a,moves.left());
    },
    isUp(a){
        return moves.isMove(a,moves.up());
    },
    isDown(a){
        return moves.isMove(a,moves.down());
    },
    isStay(a){
        return moves.isMove(a,moves.stay());
    },
    copy(a){
        return {x:a.x,y:a.y};
    }
}

moves.list = [moves.left(), moves.right(), moves.down(), moves.up()];
