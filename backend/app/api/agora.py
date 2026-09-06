import os
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Actually the pip package `agora-token-builder` is installed, so let's use it.
from agora_token_builder import RtcTokenBuilder

router = APIRouter()

class TokenRequest(BaseModel):
    channel_name: str
    uid: int

@router.post("/token")
async def generate_agora_token(request: TokenRequest):
    app_id = os.getenv("AGORA_APP_ID")
    app_certificate = os.getenv("AGORA_APP_CERTIFICATE")

    if not app_id or not app_certificate:
        raise HTTPException(status_code=500, detail="Agora credentials not configured")

    # Token validity time (e.g. 24 hours)
    expiration_time_in_seconds = 3600 * 24
    current_timestamp = int(time.time())
    privilege_expired_ts = current_timestamp + expiration_time_in_seconds

    try:
        # Build token with uid
        token = RtcTokenBuilder.buildTokenWithUid(
            app_id, 
            app_certificate, 
            request.channel_name, 
            request.uid, 
            1, # Role_Publisher
            privilege_expired_ts
        )
        return {"token": token, "uid": request.uid, "app_id": app_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import httpx
import base64

class AgentStartRequest(BaseModel):
    channel_name: str

@router.post("/start-agent")
async def start_agora_agent(request: AgentStartRequest):
    app_id = os.getenv("AGORA_APP_ID")
    customer_id = os.getenv("AGORA_CUSTOMER_ID")
    customer_secret = os.getenv("AGORA_CUSTOMER_SECRET")

    if not all([app_id, customer_id, customer_secret]):
        raise HTTPException(status_code=500, detail="Agora Customer credentials not configured")

    credentials = f"{customer_id}:{customer_secret}"
    base64_credentials = base64.b64encode(credentials.encode()).decode()

    url = f"https://api.agora.io/api/conversational-ai-agent/v2/projects/{app_id}/join"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {base64_credentials}"
    }
    
    # Required parameters based on Agora Conversational AI docs
    payload = {
        "name": "sutradhar_agent",
        "properties": {
            "channel": request.channel_name,
            "agent_rtc_uid": "1001",
            "remote_rtc_uids": ["*"],
            "llm": { "vendor": "openai" },
            "tts": { "vendor": "microsoft", "voice_name": "en-US-JennyNeural" }
        }
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                return resp.json()
            else:
                print("Failed to start agent:", resp.text)
                return {"error": resp.text, "status": resp.status_code}
    except Exception as e:
        import traceback
        traceback.print_exc()
        error_msg = str(e) if str(e) else type(e).__name__
        raise HTTPException(status_code=500, detail=f"Request failed: {error_msg}")

