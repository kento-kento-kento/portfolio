import os
from typing import Optional

from openai import OpenAI
from openai import RateLimitError, OpenAIError

from .rules import GAME_RULES


def get_client() -> Optional[OpenAI]:
    """
    APIキーがある場合のみ OpenAI クライアントを返す
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    return OpenAI(api_key=api_key)


def call_llm(prompt: str) -> str:
    client = get_client()

    # APIキーが無い場合は即フォールバック
    if client is None:
        return generate_fallback_comment()

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": f"""
あなたはブロックパズルゲームのコーチです。
以下はこのゲームの絶対的ルールです。
{GAME_RULES}
"""
                },
                {"role": "user", "content": prompt}
            ],
        )
        return response.choices[0].message.content

    except RateLimitError:
        return generate_fallback_comment()

    except OpenAIError as e:
        print("OpenAI error:", e)
        return generate_fallback_comment()

    except Exception as e:
        print("Unexpected error:", e)
        return generate_fallback_comment()


def generate_fallback_comment() -> str:
    """
    AIが使えない場合の定型コメント
    """
    return (
        "今回のプレイお疲れさまでした！🎮\n"
        "ブロック配置は全体的に安定しており、無駄なスペースも少なかったです。\n"
        "中央エリアをうまく活用できている点は高評価です。\n"
        "次回は端のスペースを意識すると、さらに長くプレイできそうですね。\n"
        "引き続き楽しみながら挑戦してみてください！"
    )
