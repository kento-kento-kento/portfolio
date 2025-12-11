const titleCanvas = document.getElementById("titleCanvas");
const titleCtx = titleCanvas.getContext("2d");

function drawTitle(){
    const title = "BLOCK PUZZLE";
    const colors = [
        "#FF0000","#FF7F00","#FFFF00",
        "#00FF00","#00FFFF","#8B00FF",
        "#FF1493","#FFA500","#00CED1",
        "#ADFF2F"
    ];

    let shuffleColors = colors.sort(() => 0.5 - Math.random());
    const charColors = title.split("").map((c,i) => {
        if(c === " ") return "#8f2a2aff";
        return shuffleColors[i % shuffleColors.length];
    }); 

    titleCtx.clearRect(0,0,titleCanvas.width, titleCanvas.height);
    titleCtx.font = "bold 65px sans-serif";
    titleCtx.textBaseline = "top";

    const totalWidth = titleCtx.measureText(title).width;
    let startX = (titleCanvas.width - totalWidth) / 2;
    const y = 20;

    for (let i = 0; i < title.length; i++){
        const char = title[i];
        const charWidth = titleCtx.measureText(char).width;
        titleCtx.fillStyle = charColors[i];
        titleCtx.fillText(char, startX, y);
        startX += charWidth;
    }
}
drawTitle();