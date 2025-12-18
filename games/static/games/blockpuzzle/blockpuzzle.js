//AI生成のため
import { logMove, initPlayLog, playLog } from "./analytics/playLogger.js";
import { requestAIAnalysis } from "../ai/aiClient.js";
import { buildSummary } from "./analytics/summary.js";

//===============基本設計================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

window.canvas = canvas;
window.ctx = ctx;


const GRID_SIZE = 10;
const CELL_SIZE = 40;

const BOARD_SIZE = GRID_SIZE * CELL_SIZE;//400
const HAND_AREA_HEIGHT = 150;//手持ち盤面の高さ

const HAND_X = BOARD_SIZE + 20;//手もちブロックの配置位置の固定

let selectedBlock = null;//選択中のブロック
let cursorX = 0;
let cursorY = 0;

let score = 0;
let bonusTexts = [];//ボーナス用配列

let hue = 0;//色相

let aiRequested = false; //AI分析の二重実行防止

//=================ゲーム状態============================

const GameState = {//画面の状態
    TITLE: "title",
    COUNTDOWN: "countdown",
    PLAYING: "playing",
    GAMEOVER: "gameover"
};

let gameState = GameState.TITLE;

//=================タイマー============================

let countdown = 3;
let timeLimit =181;//////////////////////////////////////////////////
let timeLeft = 0;


//=================ブロック===========================
//ブロックの色
const COLORS = [
    "#4A90E2",
    "#50E3C2",
    "#F5A623",
    "#D0021B",
    "#9013FE",
]
//ブロックの形状定義
const BLOCK_SHAPES = [
    [[1, 1]],
    [[1,1,1]],
    [[1,1,1,1]],
    [
        [1,1,1],
        [1,1,1]
    ],
    [
        [1,1,1],
        [0,1,0]
    ],
    [
        [1,1],
        [1,1]
    ],
    [
        [1,0,0],
        [1,1,1]
    ],
    [
        [0,0,1],
        [1,1,1]
    ],
    [
        [1,0],
        [1,1]
    ],
    [
        [0,1,0],
        [1,1,1],
        [0,1,0]
    ],
    [
        [1,0],
        [0,1]
    ],
    [
        [1,1,0],
        [0,1,1]
    ],
    [
        [0,1,1],
        [1,1,0]
    ],
];

//変則ブロック
const ADVANCED_BLOCKS = [
    [
        [1,0,0],
        [1,1,1],
        [0,0,1]
    ],
    [
        [1,1,0],
        [0,1,1],
        [0,1,0]
    ],
    [
        [1,1,1,1,1]
    ],
    [
        [0,0,0,0,1],
        [0,0,0,0,1],
        [0,0,0,0,1],
        [0,0,0,0,1],
        [1,1,1,1,1]
    ]
];

let handBlocks = [];

////=================盤面========================
let board = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null)
);

//初期化
function initBoard(){
    board = Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill(null)
    );
}

//ブロックを描画
function createHandBlocks(){
    handBlocks = [];

    for (let i = 0; i < 3; i++){
        handBlocks.push({
            shape:BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            x: HAND_X,
            y:30 + i * 120,
            size: CELL_SIZE,
            placed: false
        });
    }
}



//================描画=====================

function drawGrid(){
    ctx.strokeStyle = "#CCC";
    for (let i = 0; i <= GRID_SIZE; i++){
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, BOARD_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(BOARD_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }

}

function drawBlocks(){
    for (let y = 0; y < GRID_SIZE; y++){
        for (let x = 0; x < GRID_SIZE; x++){
            if (board[y][x]){
                ctx.fillStyle = board[y][x];
                ctx.fillRect(
                    x * CELL_SIZE + 2,
                    y * CELL_SIZE + 2,
                    CELL_SIZE - 4,
                    CELL_SIZE - 4
                );
            }
        }

    }
}


ctx.clearRect(0, 0, canvas.width, canvas.height);
drawGrid();
drawBlocks();

//マウスクリックで一マスにブロックを置けるようにする



//ブロックが揃った行や列を消す
//board[y][x]が全部nullでない場合、その行は揃っている
//見つけたらnullに置き換える

function clearFullLinesAndColumns(){
    const rowsToClear = new Set();
    const colsToClear = new Set();

    //行をチェック
    for (let y = 0; y < GRID_SIZE; y++){
        if (board[y].every(cell => cell !== null)){
            rowsToClear.add(y);
        }
    }

    //列をチェック
    for (let x = 0; x < GRID_SIZE; x++){
        let isFull = true;
        for (let y = 0; y < GRID_SIZE; y++){
            if (!board[y][x]){
                isFull = false;
                break;
            }
        }
        if (isFull){
            colsToClear.add(x);
        }
    }

    //消した行，列に応じてスコア加算
    const totalCleared = rowsToClear.size + colsToClear.size;
    if(totalCleared > 0){
        let points = 0;
        switch(totalCleared){
            case 1: points += 1000; break;
            case 2: points += 3000; break;
            case 3: points += 5000; break;
            case 4: points += 7000; break;
            default: points = 10000; break;//5列・行以上になると1万加算固定
        }

        score += points;

        bonusTexts.push({
            text: totalCleared >= 5 ? `EXCELLENT! +${points}!` : `+${points}`,
            x:BOARD_SIZE + 600,
            y:350,
            alpha: 1
        });
    }


    //行をクリア
    rowsToClear.forEach(y => {
        board[y] = Array(GRID_SIZE).fill(null);
    });

    //列をクリア
    colsToClear.forEach(x => {
        for (let y = 0; y < GRID_SIZE; y++){
            board[y][x] = null;
        }
    });
}



//手持ちブロックを描画
function drawHandBlocks(){
    handBlocks.forEach((block,index) => {

        ctx.fillStyle = "#333";
        ctx.font = "16px sans-serif";
        ctx.fillText(
            `${index + 1}`,
            block.x - 18,
            block.y + 20
        );

        block.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell){
                    ctx.fillStyle = block.color;
                    ctx.fillRect(
                        block.x + x * block.size,
                        block.y + y * block.size,
                        block.size - 4,
                        block.size - 4
                    );
                }
            });
        });
    });
}

//盤面に置けるか
function canPlace(shape, boardX, boardY){
    for (let y = 0; y < shape.length; y++){
        for (let x = 0; x < shape[y].length; x++){
            if (shape[y][x]){
                const bx = boardX + x;
                const by = boardY + y;
                if (
                    bx < 0 || bx >= GRID_SIZE ||
                    by < 0 || by >= GRID_SIZE ||
                    board[by][bx]
                ){
                    return false;
                }
            }
        }
    }
    return true;
}

document.addEventListener("keydown",(e) => {

    if(gameState !== GameState.PLAYING) return;

    if(e.key === " "){
        e.preventDefault();
    }//SPACEボタンに反応しないようにする

    const key = e.key.toLowerCase();

    //ブロック選択
    if(["1","2","3"].includes(key)){
        const index = Number(key) - 1;

        if(handBlocks[index]){
            selectedBlock = handBlocks[index];
            cursorX = 0;
            cursorY = 0;
        }
        return;
    }

    if(!selectedBlock)return;

    //移動
    if(key === "w") cursorY--;
    if(key === "s") cursorY++;
    if(key === "a")cursorX--;
    if(key === "d")cursorX++;

    //回転
    if(key === " "){
        selectedBlock.shape = rotateClockwise(selectedBlock.shape);
    }

    //設置
    if(key === "enter"){
        if(canPlace(
            selectedBlock.shape,
            cursorX,
            cursorY
        )){
            placeBlock(selectedBlock,cursorX,cursorY);
            
            //手持ちから削除
            handBlocks = handBlocks.filter(b => b !== selectedBlock);
            selectedBlock = null;

            //三つ全て置いたら新しく生成
            if(handBlocks.length === 0){
                createHandBlocks();
            }
        }
    }

    //カーソル範囲制限
    if(selectedBlock){
        const w = selectedBlock.shape[0].length;
        const h = selectedBlock.shape.length;

        cursorX = Math.max(0,Math.min(GRID_SIZE - w, cursorX));
        cursorY = Math.max(0,Math.min(GRID_SIZE - h, cursorY));
    }

    draw();
});





function rotateClockwise(shape){
    return shape[0].map((_, i) =>
    shape.map(row => row[i]).reverse()
    );
}

//置けたら盤面に反映
function placeBlock(block, boardX, boardY){
    //盤面に配置
    block.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell){
                board[boardY + y][boardX + x] = block.color;
            }
        });
    });

    //ブロックを置いた時点で200加算
    score += 200;

    clearFullLinesAndColumns();

    logMove({
        type:"place",
        board:JSON.parse(JSON.stringify(board)), //スナップショット
        blockShape: block.shape,
        position: {x: boardX, y:boardY },
        time: timeLeft
    });
}

//手持ちエリアのガイド
function drawHandArea(){
    ctx.strokeStyle = "#F5F5F5";
    ctx.strokeRect(BOARD_SIZE,0,canvas.width - BOARD_SIZE, canvas.height);
}

function drawBlockAt(shape,boardX,boardY,color){
    shape.forEach((row,y) => {
        row.forEach((cell,x) => {
            if(cell){
                ctx.fillStyle = color;
                ctx.fillRect(
                    (boardX + x) * CELL_SIZE + 2,
                    (boardY + y) * CELL_SIZE + 2,
                    CELL_SIZE -4,
                    CELL_SIZE -4
                );
            }
        });
    });
}

//スコア条件でブロック追加
function getRandomBlockShape(){
    let shape;

    if(score >= 15000 && Math.random() < 1.0){//スコア1.5万をこえたら70％の確率で変則ブロック追加
        shape = ADVANCED_BLOCKS[Math.floor(Math.random() * ADVANCED_BLOCKS.length)];
    }else{
        shape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
    }

    return shape;
}

function drawInstructions(){
    const x = BOARD_SIZE + 320;
    let y = 40;

    ctx.fillStyle = "#000";
    ctx.font = "30px sans-serif";
    ctx.fillText("操作方法", x, y);

    ctx.font = "20px sans-serif";
    y += 32;

    ctx.fillText("・1 / 2 / 3 : ブロック選択", x, y);
    y += 25;
    ctx.fillText("・W A S D : 移動", x, y);
    y += 25;
    ctx.fillText("・Space : 回転（時計回り）", x, y);
    y += 25;
    ctx.fillText("・Enter : 設置", x, y);
    y += 25;
    ctx.fillText("・行・列が揃うと消える", x, y);
    y += 25;
    ctx.fillText("・ブロックが重なると置けない", x, y);
    y += 25;
    ctx.fillText("・同時に消した列が多ければ多いほど加算UP", x, y);
    y += 25;
    ctx.fillText("・制限時間は3分", x, y);
}

function drawInstructionDivider(){
    const x = BOARD_SIZE + 300;
    ctx.strokeStyle = "#CCC";
    ctx.beginPath();
    ctx.moveTo(x,0);
    ctx.lineTo(x,canvas.height);
    ctx.stroke();
}

function drawScore(){
    const x = BOARD_SIZE + 350;
    let y = 350;

    hue += 1;
    if(hue > 360) hue = 0;

    ctx.fillStyle = `hsl(${hue}, 80%, 50%)`; // 彩度80%、明度50%
    ctx.font = "45px sans-serif";
    ctx.fillText(`SCORE: ${score}`, x, y);
}

function drawTimer(){
    ctx.fillStyle = "green";
    ctx.font = "40px sans-serif";
    ctx.fillText(`TIME: ${timeLeft}`, BOARD_SIZE+350, 300);
}

function drawBonusTexts(){
    for(let i = bonusTexts.length - 1; i>= 0; i--){
        const b = bonusTexts[i];

        ctx.fillStyle = `rgba(0, 120, 255, ${b.alpha})`;
        ctx.font = "30px sans-serif";
        ctx.fillText(b.text, b.x, b.y);

        //少し上に移動してフェードアウト
        b.y += -1;
        b.alpha -= 0.02;

        //完全に透明になったら削除
        if(b.alpha <= 0){
            bonusTexts.splice(i,1);
        }
    }
}

function drawCountdown(){
    ctx.fillStyle = "red";
    ctx.font = "120px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(countdown > 0 ? countdown:"GO!!",
                    canvas.width * 3 / 16,
                    canvas.height / 2
                );
    ctx.textAlign = "left";
}

function drawGameOver(){
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="white";
    ctx.font="50px sans-serif";
    ctx.fillText("TIME UP!お疲れ様でした!",300,250);
    ctx.font="30px sans-serif";
    ctx.fillText(`SCORE: ${score}`,300,300);
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawInstructions();

    if(gameState === GameState.TITLE) return;

    //drawHandArea();
    drawGrid();
    drawBlocks();
    drawHandBlocks();
    drawScore();
    drawTimer();
    drawInstructionDivider();
    drawBonusTexts();

    if (selectedBlock) {
        const can = canPlace(selectedBlock.shape,cursorX,cursorY);

        drawBlockAt(selectedBlock.shape,cursorX,cursorY,can ? "rgba(0,255,0,0.5)" : "rgba(255,0,0,0.5)");
    }
    
}

function gameLoop(){
    draw();
    if(gameState === GameState.COUNTDOWN) drawCountdown();
    if(gameState === GameState.GAMEOVER) drawGameOver();

    requestAnimationFrame(gameLoop);
}

document.getElementById("startBtn").onclick = () =>{
    document.getElementById("startBtn").blur();//STARTボタンを押したらフォーカスを外す
    gameState = GameState.COUNTDOWN;
    countdown = 3;
};

setInterval(() => {
    if(gameState === GameState.COUNTDOWN){
        countdown--;
        if(countdown < 0){
            gameState = GameState.PLAYING;
            timeLeft = timeLimit;
            score = 0;
            bonusTexts = [];

            initBoard();
            createHandBlocks();
            initPlayLog();
        }
    }

    if(gameState === GameState.PLAYING){
        timeLeft--;
        if(timeLeft <= 0){
            gameState = GameState.GAMEOVER;
            showGameOverUI();
            onGameEnd();
        }
    }
},1000);

function showGameOverUI(){
    const ui = document.getElementById("gameOverUI");
    ui.style.display = "block";
    document.getElementById("scoreText").textContent = `SCORE: ${score}`;

    // ★ GameOverUI へ 1 秒後に自動スクロール
    setTimeout(() => {
        ui.scrollIntoView({behavior: "smooth"});
    },1000);
}

function saveScore(){
    const input = document.getElementById("playerName");
    const name = input.value.trim();

    if(!name){
        alert("名前を入力してください！");
        return;
    }

    const record = {
        name:name,
        score: score,
        date:new Date().toLocaleString()
    };

    const history = JSON.parse(localStorage.getItem("scores") || "[]");
    history.push(record);
    localStorage.setItem("scores",JSON.stringify(history));

    alert("成績を保存しました");

    //保存後に入力欄クリア
    input.value = "";

    //保存ボタン無効化(連打防止)
    const btn = document.querySelector("#gameOverUI button[onclick='saveScore()']");
    btn.disabled = true;
    btn.textContent = "保存済です";

}

function restartGame(){
    aiRequested = false;
    document.getElementById("gameOverUI").style.display = "none";

    //名前入力欄をクリア
    const nameInput = document.querySelector("#playerName");
    if(nameInput){
        nameInput.value ="";
    }

    //保存ボタンを再び有効化
    const saveBtn = document.querySelector("#saveScoreBtn");
    if(saveBtn){
        saveBtn.disabled = false;
        saveBtn.textContent = "名前を登録する";
    }

    // ゲームの初期化
    gameState = GameState.COUNTDOWN;
    countdown = 3;

    score = 0;
    timeLeft = timeLimit;

    bonusTexts = [];
    selectedBlock = null;
    
    initBoard();
    createHandBlocks();
    
}

gameLoop();

function onGameEnd() {
    if(aiRequested)return;
    aiRequested = true;
    const summary = buildSummary(playLog);

    requestAIAnalysis(summary)
        .then(analysis => {
            document.getElementById("ai-analysis-text").textContent = analysis;
        })
        .catch(err => {
            document.getElementById("ai-analysis-text").textContent =
                "AI分析の取得に失敗しました";
            console.error(err);
        });
}

window.draw = draw;
window.gameLoop = gameLoop;