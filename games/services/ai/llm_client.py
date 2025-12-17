# from openai import OpenAI
# from openai import RateLimitError, OpenAIError  # 必要な例外だけインポート

# from .rules import GAME_RULES

# client = OpenAI()

# def call_llm(prompt: str) -> str:
#     try:
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[
#                 {
#                     "role": "system",
#                     "content": f"""
#                     あなたはブロックパズルのコーチです。
#                     以下はこのゲームの絶対的ルールです。
#                     {GAME_RULES}
#                     """
#                     },
#                 {"role": "user", "content": prompt}
#             ]
#         )
    
#         return response.choices[0].message.content

#     except openai_error.RateLimitError:
#         # クォータ切れの場合
#         return generate_fallback_comment()
#     except Exception as e:
#         # その他のエラー
#         print("LLM error:", e)
#         return generate_fallback_comment()


# def generate_fallback_comment() -> str:
#     """
#     定型コメントを返す関数
#     ゲームの状況をざっくり評価する
#     """
#     comment = (
#         "今回のプレイもお疲れ様でした！🎮\n"
#         "ブロックの配置はバランスよくできていました。\n"
#         "特に中央付近をうまく使えていて、効率的に得点できています。\n"
#         "次回はもう少し角のスペースも意識すると、さらに高得点を狙えます！\n"
#         "引き続き楽しくプレイしてみてくださいね！"
#     )
#     return comment


from openai import OpenAI, RateLimitError, OpenAIError
from .rules import GAME_RULES

client = OpenAI()

def call_llm(prompt: str) -> str:
    """
    ブロックパズルのAI分析を呼び出す関数。
    クォータ超過やその他エラー時は定型コメントを返す。
    """
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": f"""
                    あなたはブロックパズルのコーチです。
                    以下はこのゲームの絶対的ルールです。
                    {GAME_RULES}
                    """
                },
                {"role": "user", "content": prompt}
            ]
        )
        # 安全に結果を取得
        return response.choices[0].message.content

    except RateLimitError:
        # クォータ超過の場合
        print("LLM RateLimitError: クォータ超過、定型コメントを返します")
        return generate_fallback_comment()

    except OpenAIError as e:
        # OpenAI 由来のその他のエラー
        print("LLM OpenAIError:", e)
        return generate_fallback_comment()

    except Exception as e:
        # その他予期せぬエラー
        print("LLM error:", e)
        return generate_fallback_comment()


def generate_fallback_comment() -> str:
    """
    定型コメントを返す関数
    ゲームの状況をざっくり評価する
    """
    comment = (
        "今回のプレイもお疲れ様でした！🎮\n"
        "ブロックの配置はバランスよくできていました。\n"
        "特に中央付近をうまく使えていて、効率的に得点できています。\n"
        "次回はもう少し角のスペースも意識すると、さらに高得点を狙えます！\n"
        "引き続き楽しくプレイしてみてくださいね！\n"
        "AI生成ができなかったため,定型文になります。"
    )
    return comment
