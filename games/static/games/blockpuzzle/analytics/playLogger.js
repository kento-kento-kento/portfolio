//プレイログ収集用コード
//観察者

export const playLog = {
    moves: [],
    boardSnapshots:[],
    startTime: null
};

export function initPlayLog(){
    playLog.moves = [];
    playLog.startTime = Date.now();
}

export function logMove(data){
    playLog.moves.push(data);
    if(data.board){
        playLog.boardSnapshots.push(data.board);
    }
}