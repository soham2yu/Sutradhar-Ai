"""Quick smoke test for non-LLM endpoints."""
import httpx

BASE = "http://localhost:8000"

# Health
r = httpx.get(f"{BASE}/health")
print(f"Health: {r.status_code} {r.json()}")

# Create incident
r = httpx.post(f"{BASE}/api/incidents", json={"incident_id": "TEST-001", "title": "Test Incident"})
print(f"Create: {r.status_code} {r.json()}")

# List incidents
r = httpx.get(f"{BASE}/api/incidents")
print(f"List:   {r.status_code} -> {len(r.json())} incidents")

# Append transcript
r = httpx.post(f"{BASE}/api/incidents/TEST-001/transcript", json={
    "entries": [{"speaker": "Engineer", "timestamp": "10:00:00", "text": "Testing the API"}]
})
print(f"Append: {r.status_code} {r.json()}")

# Get incident state
r = httpx.get(f"{BASE}/api/incidents/TEST-001")
data = r.json()
print(f"State:  {r.status_code} participants={data['participants']} transcript={len(data['transcript'])} entries")

# Get transcript
r = httpx.get(f"{BASE}/api/incidents/TEST-001/transcript")
print(f"Transcript: {r.status_code} -> {len(r.json())} entries")

print("\nAll non-LLM endpoints working!")
