import asyncio
import httpx
import time

API_BASE = "http://localhost:8000/api"
INCIDENT_ID = "S-SPEED-TEST-LITE"

CHAOTIC_TRANSCRIPT = [
    {"speaker": "Commander", "text": "Everyone listen up! Prod is completely down. I need status reports NOW.", "timestamp": "2026-09-06T10:00:00Z"},
    {"speaker": "DBA_Sarah", "text": "The primary Postgres cluster is showing 100% CPU, but the read replicas are totally fine. I think we have a query loop.", "timestamp": "2026-09-06T10:00:05Z"},
    {"speaker": "Frontend_Mike", "text": "Users are getting 502 Bad Gateways on the main landing page!", "timestamp": "2026-09-06T10:00:10Z"},
    {"speaker": "Network_Dave", "text": "Wait, the load balancer is routing traffic into a blackhole. AWS us-east-1 might be having a partial outage.", "timestamp": "2026-09-06T10:00:15Z"},
    {"speaker": "DBA_Sarah", "text": "Network Dave, you're wrong. Traffic is reaching us via Cloudflare. It's the database.", "timestamp": "2026-09-06T10:00:20Z"},
    {"speaker": "Security_Alice", "text": "I just saw a massive spike in outbound traffic to an unknown IP. We might be getting exfiltrated.", "timestamp": "2026-09-06T10:00:25Z"},
    {"speaker": "Commander", "text": "Alice, shut down the external VPC immediately!", "timestamp": "2026-09-06T10:00:30Z"},
    {"speaker": "Network_Dave", "text": "If you kill the VPC, you kill the auth service for mobile!", "timestamp": "2026-09-06T10:00:35Z"},
    {"speaker": "Security_Alice", "text": "VPC locked. Outbound stopped. But now nobody can log in.", "timestamp": "2026-09-06T10:00:50Z"},
    {"speaker": "DBA_Sarah", "text": "CPU dropped to normal. The unknown IP was hitting an unindexed search query!", "timestamp": "2026-09-06T10:00:55Z"},
    {"speaker": "Commander", "text": "Sarah index that table. Alice reopen VPC but block that IP. Hey Sutra, what is the status right now?", "timestamp": "2026-09-06T10:01:00Z"},
]

async def run_speed_test():
    async with httpx.AsyncClient() as client:
        await client.post(f"{API_BASE}/incidents", json={
            "incident_id": INCIDENT_ID,
            "title": "Speed Test Lite",
            "admin_id": "test",
            "is_particle_text_enabled": True
        })

        print("Triggering AI with gemini-3.5-flash-lite...")
        start = time.time()
        res = await client.post(f"{API_BASE}/analyze", json={
            "incident_id": INCIDENT_ID,
            "transcript": CHAOTIC_TRANSCRIPT
        }, timeout=120.0)
        elapsed = round(time.time() - start, 2)

        if res.status_code != 200:
            print("FAILED:", res.text)
            return

        state = await client.get(f"{API_BASE}/incidents/{INCIDENT_ID}")
        data = state.json()
        risks = len(data.get('risks', []))
        topics = len(data.get('topics', []))
        ai = data.get('ai_response', 'None')

        print(f"RESPONSE TIME: {elapsed}s")
        print(f"Risks: {risks}, Topics: {topics}")
        print(f"AI Response: {ai}")

if __name__ == "__main__":
    asyncio.run(run_speed_test())
