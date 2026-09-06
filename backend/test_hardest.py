import asyncio
import httpx
import uuid
from datetime import datetime

async def test_hardest_way():
    incident_id = f"TEST-HARD-{str(uuid.uuid4())[:8].upper()}"
    print(f"Starting chaos test on incident: {incident_id}")

    # A chaotic incident transcript with multiple participants talking over each other,
    # conflicting facts, evolving hypotheses, and a direct AI invocation.
    transcript_batches = [
        # Batch 1: Initial chaos
        [
            {"speaker": "Alice", "text": "The entire database cluster is down! I'm seeing connection timeouts from the API.", "timestamp": datetime.now().isoformat()},
            {"speaker": "Bob", "text": "No it's not down, I can query the read replicas fine. It's only the master node.", "timestamp": datetime.now().isoformat()},
            {"speaker": "Charlie", "text": "Wait, the monitoring dashboard shows a huge CPU spike on the master. Did someone deploy?", "timestamp": datetime.now().isoformat()},
        ],
        # Batch 2: Conflicting hypotheses
        [
            {"speaker": "Alice", "text": "I think the new caching layer we deployed an hour ago is overloading the DB.", "timestamp": datetime.now().isoformat()},
            {"speaker": "Bob", "text": "I checked the logs, the caching layer is disabled in production.", "timestamp": datetime.now().isoformat()},
            {"speaker": "Charlie", "text": "Let's rollback the deployment anyway just to be safe. Alice, can you do that?", "timestamp": datetime.now().isoformat()},
        ],
        # Batch 3: Actions and direct AI invocation
        [
            {"speaker": "Alice", "text": "Rolling back the deployment now. It will take 2 minutes.", "timestamp": datetime.now().isoformat()},
            {"speaker": "Bob", "text": "Hey Sutra, what are our current active hypotheses and who is doing what?", "timestamp": datetime.now().isoformat()},
            {"speaker": "Charlie", "text": "Oh look, the CPU is dropping. It was definitely a bad query from the marketing batch job that runs at 2 PM, not the deployment.", "timestamp": datetime.now().isoformat()},
        ]
    ]

    async with httpx.AsyncClient() as client:
        for i, batch in enumerate(transcript_batches):
            print(f"Sending batch {i+1}...")
            response = await client.post(
                "http://127.0.0.1:8000/api/analyze",
                json={
                    "incident_id": incident_id,
                    "transcript": batch
                },
                timeout=60.0
            )
            print(f"Batch {i+1} response status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print("--- AI Intelligence Extracted ---")
                print(f"Topics: {len(data['analysis']['topics'])}")
                print(f"Facts: {sum(len(t['facts']) for t in data['analysis']['topics'])}")
                print(f"Hypotheses: {sum(len(t['hypotheses']) for t in data['analysis']['topics'])}")
                print(f"Conflicts: {sum(len(t['conflicts']) for t in data['analysis']['topics'])}")
                print(f"Actions: {sum(len(t['actions']) for t in data['analysis']['topics'])}")
                print(f"AI Response: {data['analysis'].get('ai_response', 'None')}")
                print("---------------------------------")
            else:
                print(f"Error: {response.text}")
            
            await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(test_hardest_way())
