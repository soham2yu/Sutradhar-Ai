"""
Sutradhar Phase 1 — Demo test script.

Sends the payment outage demo transcript to the /api/analyze endpoint
and pretty-prints the structured incident intelligence.

Usage:
    1. Start the server:  uvicorn app.main:app --reload --port 8000
    2. Run this script:   python test_analyze.py
"""

import json
import sys

import httpx

BASE_URL = "http://localhost:8000"

# Demo payment outage transcript
DEMO_TRANSCRIPT = {
    "incident_id": "INC-001",
    "transcript": [
        {
            "speaker": "Engineer",
            "timestamp": "10:15:32",
            "text": "Payment API is returning 500 errors.",
        },
        {
            "speaker": "DevOps",
            "timestamp": "10:16:04",
            "text": "We deployed version 2.4 about fifteen minutes ago.",
        },
        {
            "speaker": "Engineer",
            "timestamp": "10:16:40",
            "text": "Maybe the database is down.",
        },
        {
            "speaker": "Database Engineer",
            "timestamp": "10:17:10",
            "text": "I checked the database. Metrics are normal.",
        },
    ],
}

# Second batch — simulates additional conversation
FOLLOWUP_TRANSCRIPT = {
    "incident_id": "INC-001",
    "transcript": [
        {
            "speaker": "DevOps",
            "timestamp": "10:18:30",
            "text": "I'll start a rollback to version 2.3 immediately.",
        },
        {
            "speaker": "Engineer",
            "timestamp": "10:19:15",
            "text": "Actually, I'm seeing connection pool exhaustion in the payment service logs.",
        },
        {
            "speaker": "Manager",
            "timestamp": "10:19:45",
            "text": "Let's page the on-call SRE and get more eyes on this.",
        },
    ],
}


def print_section(title: str, items: list, fields: list[str] | None = None):
    """Pretty-print a section of the analysis."""
    print(f"\n{'='*60}")
    print(f"  {title} ({len(items)} items)")
    print(f"{'='*60}")
    if not items:
        print("  (none)")
        return
    for i, item in enumerate(items, 1):
        print(f"\n  [{i}]")
        display = fields or item.keys()
        for key in display:
            if key in item:
                value = item[key]
                if isinstance(value, list):
                    if value:
                        print(f"    {key}:")
                        for v in value:
                            if isinstance(v, dict):
                                print(f"      - {json.dumps(v)}")
                            else:
                                print(f"      - {v}")
                    else:
                        print(f"    {key}: (none)")
                else:
                    print(f"    {key}: {value}")


def analyze_and_print(label: str, payload: dict):
    """Send a transcript to the analyze endpoint and print results."""
    print(f"\n{'#'*60}")
    print(f"  {label}")
    print(f"{'#'*60}")

    print(f"\nSending {len(payload['transcript'])} transcript entries...")
    response = httpx.post(f"{BASE_URL}/api/analyze", json=payload, timeout=60.0)

    if response.status_code != 200:
        print(f"\n  ERROR {response.status_code}: {response.text}")
        return None

    data = response.json()
    analysis = data["analysis"]

    print_section("FACTS", analysis["facts"])
    print_section("HYPOTHESES", analysis["hypotheses"])
    print_section("CONFLICTS", analysis["conflicts"])
    print_section("DECISIONS", analysis["decisions"])
    print_section("ACTIONS", analysis["actions"])
    print_section("TIMELINE", analysis["timeline"])
    print_section("RISKS", analysis["risks"])

    print(f"\nTotal transcript entries for incident: {data['transcript_length']}")
    return data


def check_incident_state(incident_id: str):
    """Fetch and print the accumulated incident state."""
    print(f"\n{'#'*60}")
    print(f"  ACCUMULATED INCIDENT STATE: {incident_id}")
    print(f"{'#'*60}")

    response = httpx.get(f"{BASE_URL}/api/incidents/{incident_id}", timeout=10.0)

    if response.status_code != 200:
        print(f"\n  ERROR {response.status_code}: {response.text}")
        return

    incident = response.json()
    print(f"\n  ID:           {incident['id']}")
    print(f"  Status:       {incident['status']}")
    print(f"  Participants: {', '.join(incident['participants'])}")
    print(f"  Transcript:   {len(incident['transcript'])} entries")
    print(f"  Facts:        {len(incident['facts'])}")
    print(f"  Hypotheses:   {len(incident['hypotheses'])}")
    print(f"  Conflicts:    {len(incident['conflicts'])}")
    print(f"  Decisions:    {len(incident['decisions'])}")
    print(f"  Actions:      {len(incident['actions'])}")
    print(f"  Timeline:     {len(incident['timeline'])}")
    print(f"  Risks:        {len(incident['risks'])}")


def main():
    # Check server health
    print("Checking server health...")
    try:
        health = httpx.get(f"{BASE_URL}/health", timeout=5.0)
        print(f"Server: {health.json()}")
    except httpx.ConnectError:
        print(f"ERROR: Cannot connect to {BASE_URL}")
        print("Make sure the server is running:")
        print("  cd backend")
        print("  uvicorn app.main:app --reload --port 8000")
        sys.exit(1)

    # Round 1: Initial transcript
    result1 = analyze_and_print("ROUND 1 — Initial Incident Report", DEMO_TRANSCRIPT)
    if not result1:
        sys.exit(1)

    # Round 2: Follow-up conversation
    print("\n\n")
    result2 = analyze_and_print(
        "ROUND 2 — Follow-up Conversation", FOLLOWUP_TRANSCRIPT
    )

    # Show accumulated state
    print("\n\n")
    check_incident_state("INC-001")

    print("\n\nDone! Phase 1 demo complete.")


if __name__ == "__main__":
    main()
