from .rules import GAME_RULES
from .guide import ANALYSIS_GUIDE
from .llm_client import call_llm

# ChatGPTなどに投げる処理

def analyze_blockpuzzle(summary):
    
    early = summary.get("earlyStability", "unknown")
    center = summary.get("centerUsage", "unknown")
    vertical = summary.get("verticalBlockScore", "unknown")
    clogging = summary.get("clocggingRisk","unknown")

    prompt = f"""
【最優先ルール定義】
{GAME_RULES}     

{ANALYSIS_GUIDE}
      
【今回のプレイ分析データ】
・序盤安定度: {early}
・中央使用率: {center}%
・縦長ブロック評価: {vertical}
"""
    return call_llm(prompt)
