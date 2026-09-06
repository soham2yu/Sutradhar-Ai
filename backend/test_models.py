import asyncio
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
import time

load_dotenv()

async def test_models():
    client = AsyncOpenAI(
        api_key=os.getenv("LLM_API_KEY"),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )
    
    models_to_try = ["gemini-3.6-flash-lite", "gemini-3.5-flash-lite", "gemini-2.5-flash-lite", "gemini-3.6-flash"]
    
    for model in models_to_try:
        try:
            start = time.time()
            response = await client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "Say hello in 3 words"}],
                temperature=0,
            )
            elapsed = round(time.time() - start, 2)
            print(f"{model}: {elapsed}s - {response.choices[0].message.content}")
        except Exception as e:
            print(f"{model}: FAILED - {str(e)[:80]}")

if __name__ == "__main__":
    asyncio.run(test_models())
