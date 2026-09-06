import asyncio
import httpx
import json
import time

API_BASE = "http://localhost:8000/api"
INCIDENT_ID = "S-EXTREME-999-FASTER"
ADMIN_ID = "test_admin"

CHAOTIC_TRANSCRIPT = [
    {"speaker": "Commander", "text": "Everyone listen up! Prod is completely down. I need status reports NOW.", "timestamp": "2026-09-06T10:00:00Z"},
    {"speaker": "DBA_Sarah", "text": "The primary Postgres cluster is showing 100% CPU, but the read replicas are totally fine. I think we have a query loop.", "timestamp": "2026-09-06T10:00:05Z"},
    {"speaker": "Frontend_Mike", "text": "Users are getting 502 Bad Gateways on the main landing page! Is the Node server dead?", "timestamp": "2026-09-06T10:00:10Z"},
    {"speaker": "Network_Dave", "text": "Wait wait, no, the load balancer is routing traffic into a blackhole. AWS us-east-1 might be having a partial outage.", "timestamp": "2026-09-06T10:00:15Z"},
    {"speaker": "DBA_Sarah", "text": "Network Dave, you're wrong. I'm looking at Cloudflare and traffic is reaching us. It's the database.", "timestamp": "2026-09-06T10:00:20Z"},
    {"speaker": "Security_Alice", "text": "Guys stop. I just saw a massive spike in outbound traffic to an unknown IP. We might be getting exfiltrated.", "timestamp": "2026-09-06T10:00:25Z"},
    {"speaker": "Commander", "text": "What?! Alice, shut down the external VPC immediately. Do it now!", "timestamp": "2026-09-06T10:00:30Z"},
    {"speaker": "Network_Dave", "text": "Alice, don't do that! If you kill the VPC, you kill the authentication service for the mobile app!", "timestamp": "2026-09-06T10:00:35Z"},
    {"speaker": "Frontend_Mike", "text": "I'm deploying a hotfix to rollback the frontend just in case.", "timestamp": "2026-09-06T10:00:40Z"},
    {"speaker": "Commander", "text": "Mike NO! Do NOT deploy anything right now! Stop the pipeline!", "timestamp": "2026-09-06T10:00:45Z"},
    {"speaker": "Security_Alice", "text": "VPC is locked down. Outbound traffic has stopped. But now nobody can log in.", "timestamp": "2026-09-06T10:00:50Z"},
    {"speaker": "DBA_Sarah", "text": "Okay, the CPU just dropped to normal on Postgres. The unknown IP was hitting a massive unindexed search query!", "timestamp": "2026-09-06T10:00:55Z"},
    {"speaker": "Commander", "text": "Sarah, index that table. Alice, re-open the VPC but block that specific IP. Mike, check if the 502s are gone.", "timestamp": "2026-09-06T10:01:00Z"},
    {"speaker": "Commander", "text": "Hey Sutra, what is the status of the database right now?", "timestamp": "2026-09-06T10:01:05Z"}
]

async def run_stress_test():
    print("INITIALIZING EXTREME STRESS TEST")
    
    async with httpx.AsyncClient() as client:
        # 1. Create the room
        print("[1] Creating Incident Room...")
        res = await client.post(f"{API_BASE}/incidents", json={
            "incident_id": INCIDENT_ID,
            "title": "Extreme Chaos Test",
            "admin_id": ADMIN_ID,
            "is_particle_text_enabled": True
        })
        print("Room Created Successfully in Supabase!")

        # 2. Trigger AI Analysis
        print("[2] Triggering AI Engine (Waiting for Gemini/LLM to process the chaos)...")
        start_time = time.time()
        res = await client.post(f"{API_BASE}/analyze", json={
            "incident_id": INCIDENT_ID,
            "ai_prompt": "Analyze this highly chaotic situation.",
            "transcript": CHAOTIC_TRANSCRIPT
        }, timeout=60.0)
        
        if res.status_code != 200:
            print("AI Analysis FAILED:", res.text)
            return
            
        print(f"AI Engine Responded in {round(time.time() - start_time, 2)} seconds!")
        
        # 3. Fetch the final state
        print("[3] Fetching final dashboard state from Supabase...")
        res = await client.get(f"{API_BASE}/incidents/{INCIDENT_ID}")
        state = res.json()
        
        print("\n--- AI DASHBOARD EXTRACTION RESULTS ---")
        
        print(f"CRITICAL RISKS DETECTED: {len(state.get('risks', []))}")
        for r in state.get('risks', []):
            print(f"  - [{r.get('severity', '')}] {r.get('description', '')}")
            
        print(f"\nCONFLICTS DETECTED: {sum(len(t.get('conflicts', [])) for t in state.get('topics', []))}")
        for t in state.get('topics', []):
            for c in t.get('conflicts', []):
                print(f"  - {c.get('description', '')}")
                
        print(f"\nACTION ITEMS ASSIGNED: {sum(len(t.get('actions', [])) for t in state.get('topics', []))}")
        for t in state.get('topics', []):
            for a in t.get('actions', []):
                print(f"  - [{a.get('status', '')}] {a.get('owner', '')}: {a.get('description', '')}")
                
        print(f"\nAI VOICE RESPONSE:")
        print(f"  \"{state.get('ai_response', 'No response generated')}\"")

if __name__ == "__main__":
    asyncio.run(run_stress_test())
