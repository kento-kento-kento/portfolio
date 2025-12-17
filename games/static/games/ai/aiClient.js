export async function requestAIAnalysis(summary) {
    const response = await fetch("/games/blockpuzzle/analyze/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(summary)
    });

    if (!response.ok) {
        throw new Error("AI分析の取得に失敗しました");
    }

    // ★ ここが一番重要
    const data = await response.json();

    return data.analysis;
}
