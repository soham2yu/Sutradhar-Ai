import os
import asyncio
from openai import AsyncOpenAI

async def test():
    client = AsyncOpenAI(
        api_key=os.environ.get("LLM_API_KEY", "YOUR_API_KEY"),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    try:
        print("Calling 3.5-flash...")
        response = await client.chat.completions.create(
            model="gemini-3.5-flash",
            messages=[{"role": "user", "content": "Hello!"}]
        )
        print("Success 3.5:", response.choices[0].message.content)
    except Exception as e:
        print("Error 3.5:", e)

    try:
        print("Calling 3.5-flash-lite...")
        response = await client.chat.completions.create(
            model="gemini-3.5-flash-lite",
            messages=[{"role": "user", "content": "Hello!"}]
        )
        print("Success lite:", response.choices[0].message.content)
    except Exception as e:
        print("Error lite:", e)

asyncio.run(test())

