
import asyncio
import httpx
import uuid
from datetime import datetime

async def test_extreme():
    incident_id = f"EXTREME-{str(uuid.uuid4())[:8].upper()}"
    print(f"Starting EXTREME chaos test on incident: {incident_id}")

    # 4 distinct conversations happening simultaneously in the same room
    transcript_batches = [
        [
            # Topic 1: Database Outage
            {"speaker": "DB_Admin", "text": "The Postgres master just OOM killed itself! We are losing writes!", "timestamp": datetime.now().isoformat()},
            # Topic 2: Lunch Plans
            {"speaker": "Intern", "text": "Hey guys, is anyone ordering pizza for lunch today? I have a coupon.", "timestamp": datetime.now().isoformat()},
            # Topic 3: Security Breach
            {"speaker": "SecOps", "text": "Wait, I am seeing unauthorized access from a Russian IP on the bastion host.", "timestamp": datetime.now().isoformat()},
            # Topic 4: Office Temperature
            {"speaker": "HR", "text": "The AC is broken on floor 3, someone call maintenance.", "timestamp": datetime.now().isoformat()},
        ],
        [
            {"speaker": "DB_Admin", "text": "Promoting the read replica to master now. Sutra, track this action.", "timestamp": datetime.now().isoformat()},
            {"speaker": "Intern", "text": "Sutra, what is the phone number for Domino's Pizza?", "timestamp": datetime.now().isoformat()},
            {"speaker": "SecOps", "text": "I am severing the VPN connection. The attacker extracted 3 megabytes.", "timestamp": datetime.now().isoformat()},
            {"speaker": "HR", "text": "Sutra, please send an alert to facilities about the AC.", "timestamp": datetime.now().isoformat()},
        ],
        [
            {"speaker": "DB_Admin", "text": "Database is back online. Crisis averted on that front.", "timestamp": datetime.now().isoformat()},
            {"speaker": "CEO", "text": "Sutra, I just joined the room. Summarize EVERYTHING happening right now across all 4 topics.", "timestamp": datetime.now().isoformat()},
        ]
    ]

    async with httpx.AsyncClient() as client:
        for i, batch in enumerate(transcript_batches):
            print(f"\n--- Sending Batch {i+1} ({len(batch)} overlapping messages) ---")
            payload = {"incident_id": incident_id, "transcript": batch}
            resp = await client.post("http://127.0.0.1:8000/api/analyze", json=payload, timeout=30.0)
            if resp.status_code == 200:
                # Fetch full incident state
                resp_get = await client.get(f"http://127.0.0.1:8000/api/incidents/{incident_id}")
                data = resp_get.json()
                
                print(f"\n--- AI Analysis Result ---")
                topics = data.get("topics", [])
                print(f"Distinct Topics Identified: {len(topics)}")
                for t in topics:
                    print(f"  -> Topic: {t.get('title')} (Status: {t.get('status')})")
                    print(f"     Facts: {len(t.get('facts', []))}")
                    print(f"     Actions: {len(t.get('actions', []))}")
                    print(f"     Risks: {len(t.get('risks', []))}")
                
            else:
                print(f"Error: {resp.text}")
            await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(test_extreme())

