//AIに渡す要約生成

import { 
    calcCenterUsage,
    calcClogging
} from "./metrics.js";

export function buildSummary(playLog) {
    const centerUsage = calcCenterUsage(playLog.boardSnapshots);
    const cloggingScore = calcClogging(playLog.boardSnapshots);

    let cloggingRisk = "low";
    if (cloggingScore > 0.7) cloggingRisk = "high";
    else if (cloggingScore > 0.4) cloggingRisk = "medium";

    return {
        centerUsage,
        earlyStability: "...",
        verticalBlockScore: "low",
        cloggingRisk,               
        moveCount: playLog.moves.length
    };
}