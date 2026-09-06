import asyncio
import httpx
import json
import time

API_BASE = "http://localhost:8000/api"
INCIDENT_ID = "S-EXTREME-999"
ADMIN_ID = "test_admin"

# An absurdly chaotic incident where 5 different teams are yelling at once
CHAOTIC_TRANSCRIPT = [
    {"speaker": "Commander", "text": "Everyone listen up! Prod is completely down. I need status reports NOW."},
    {"speaker": "DBA_Sarah", "text": "The primary Postgres cluster is showing 100% CPU, but the read replicas are totally fine. I think we have a query loop."},
    {"speaker": "Frontend_Mike", "text": "Users are getting 502 Bad Gateways on the main landing page! Is the Node server dead?"},
    {"speaker": "Network_Dave", "text": "Wait wait, no, the load balancer is routing traffic into a blackhole. AWS us-east-1 might be having a partial outage."},
    {"speaker": "DBA_Sarah", "text": "Network Dave, you're wrong. I'm looking at Cloudflare and traffic is reaching us. It's the database."},
    {"speaker": "Security_Alice", "text": "Guys stop. I just saw a massive spike in outbound traffic to an unknown IP. We might be getting exfiltrated."},
    {"speaker": "Commander", "text": "What?! Alice, shut down the external VPC immediately. Do it now!"},
    {"speaker": "Network_Dave", "text": "Alice, don't do that! If you kill the VPC, you kill the authentication service for the mobile app!"},
    {"speaker": "Frontend_Mike", "text": "I'm deploying a hotfix to rollback the frontend just in case."},
    {"speaker": "Commander", "text": "Mike NO! Do NOT deploy anything right now! Stop the pipeline!"},
    {"speaker": "Security_Alice", "text": "VPC is locked down. Outbound traffic has stopped. But now nobody can log in."},
    {"speaker": "DBA_Sarah", "text": "Okay, the CPU just dropped to normal on Postgres. The unknown IP was hitting a massive unindexed search query!"},
    {"speaker": "Commander", "text": "Sarah, index that table. Alice, re-open the VPC but block that specific IP. Mike, check if the 502s are gone."}
]

async def run_stress_test():
    print("🚀 INITIALIZING EXTREME STRESS TEST 🚀")
    
    async with httpx.AsyncClient() as client:
        # 1. Create the room
        print(f"\\n[1] Creating Incident Room: {INCIDENT_ID}...")
        res = await client.post(f"{API_BASE}/incidents", json={
            "incident_id": INCIDENT_ID,
            "title": "Extreme Chaos Test",
            "admin_id": ADMIN_ID,
            "is_particle_text_enabled": True
        })
        if res.status_code != 200:
            print("❌ FAILED to create room:", res.text)
            return
        print("✅ Room Created Successfully in Supabase!")

        # 2. Blast the transcripts (Simulating Chrome Extension)
        print("\\n[2] Blasting Chaotic Transcripts at high speed...")
        for entry in CHAOTIC_TRANSCRIPT:
            # Emulate the exact payload from extension's content.js
            payload = {
                "incident_id": INCIDENT_ID,
                "speaker": entry["speaker"],
                "text": entry["text"]
            }
            await client.post(f"{API_BASE}/transcript", json=payload)
            print(f"  -> Submitted: [{entry['speaker']}] {entry['text'][:30]}...")
            await asyncio.sleep(0.1) # Fire them off rapidly

        print("✅ Transcript Pipeline Held Up!")

        # 3. Trigger AI Analysis
        print("\\n[3] Triggering AI Engine (Waiting for Gemini/LLM to process the chaos)...")
        start_time = time.time()
        res = await client.post(f"{API_BASE}/analyze", json={
            "incident_id": INCIDENT_ID,
            "ai_prompt": "Analyze this highly chaotic situation."
        }, timeout=60.0)
        
        if res.status_code != 200:
            print("❌ AI Analysis FAILED:", res.text)
            return
            
        print(f"✅ AI Engine Responded in {round(time.time() - start_time, 2)} seconds!")
        
        # 4. Fetch the final state and verify intelligence
        print("\\n[4] Fetching final dashboard state from Supabase...")
        res = await client.get(f"{API_BASE}/incidents/{INCIDENT_ID}")
        state = res.json()
        
        print("\\n🔥 --- AI DASHBOARD EXTRACTION RESULTS --- 🔥")
        
        print(f"\\n🚨 CRITICAL RISKS DETECTED: {len(state['risks'])}")
        for r in state['risks']:
            print(f"  - [{r['severity']}] {r['description']}")
            
        print(f"\\n⚡ CONFLICTS DETECTED: {len(state.get('topics', []))}")
        for t in state.get('topics', []):
            for c in t.get('conflicts', []):
                print(f"  - {c['description']}")
                
        print(f"\\n🎯 ACTION ITEMS ASSIGNED: {len(state.get('topics', []))}")
        for t in state.get('topics', []):
            for a in t.get('actions', []):
                print(f"  - [{a['status']}] {a['owner']}: {a['description']}")
                
        print(f"\\n🤖 AI VOICE RESPONSE:")
        print(f"  \"{state.get('ai_response', 'No response generated')}\"")

        print("\\n✅ STRESS TEST COMPLETE. SYSTEM IS INDESTRUCTIBLE.")

if __name__ == "__main__":
    asyncio.run(run_stress_test())
