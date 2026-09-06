#!/usr/bin/env python3
"""
Sutradhar Project Explorer Script
==================================

Interactive script to explore and understand the Sutradhar project structure.
Run this script from the project root directory.

Usage:
  python3 explore_project.py
  
or make it executable:
  chmod +x explore_project.py
  ./explore_project.py
"""

import os
import json
from pathlib import Path
from typing import Dict, List

class SutradharExplorer:
    """Interactive project explorer for Sutradhar"""
    
    def __init__(self):
        self.root = Path.cwd()
        self.menu_options = {
            "1": ("📘 Architecture Overview", self.show_architecture),
            "2": ("📂 Backend Structure", self.show_backend),
            "3": ("🎨 Frontend Structure", self.show_frontend),
            "4": ("🎙️ Extension Structure", self.show_extension),
            "5": ("🔄 Data Flow Diagram", self.show_dataflow),
            "6": ("📊 Database Schema", self.show_schema),
            "7": ("🚀 Setup & Run Commands", self.show_setup),
            "8": ("🔗 API Endpoints", self.show_endpoints),
            "9": ("💡 Key Concepts", self.show_concepts),
            "0": ("❌ Exit", self.exit_program),
        }
    
    def clear_screen(self):
        """Clear terminal screen"""
        os.system('clear' if os.name == 'posix' else 'cls')
    
    def show_menu(self):
        """Display main menu"""
        self.clear_screen()
        print("=" * 70)
        print("🌌 SUTRADHAR: AI-Powered Incident Response Copilot")
        print("=" * 70)
        print("\nProject Explorer Menu:\n")
        for key, (name, _) in self.menu_options.items():
            print(f"  {key}. {name}")
        print("\n" + "=" * 70)
    
    def show_architecture(self):
        """Display system architecture"""
        self.clear_screen()
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║                    SYSTEM ARCHITECTURE                           ║
╚═══════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│                  SUTRADHAR INCIDENT COMMAND CENTER              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐   ┌─────────────────┐   ┌─────────────┐  │
│  │  Chrome Ext.     │   │  FastAPI        │   │  Next.js    │  │
│  │  (extension-v2)  │──→│  Backend        │──→│  Frontend   │  │
│  │                  │   │  (backend)      │   │ (frontend-v2)  │
│  │ • Audio Capture  │   │ • Gemini AI     │   │ • Dashboard │  │
│  │ • Transcripts    │   │ • Analysis      │   │ • Panels    │  │
│  │ • WebSocket      │   │ • Orchestration │   │ • Particles │  │
│  └──────────────────┘   └─────────────────┘   └─────────────┘  │
│           │                      │                    │          │
│           └──────────────────┬───┴────────────────────┘          │
│                              │                                    │
│                       ┌──────▼────────┐                          │
│                       │  Supabase DB  │                          │
│                       │  (PostgreSQL) │                          │
│                       └───────────────┘                          │
│                                                                   │
│  EXTERNAL SERVICES:                                             │
│  • Google Gemini API (LLM Processing)                           │
│  • Agora (Voice AI & Channel Management)                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

KEY CHARACTERISTICS:
✓ Real-time data streaming via WebSockets
✓ Async processing (FastAPI + Python async)
✓ Cloud-native database (Supabase)
✓ WebGL particle effects (Three.js + GLSL shaders)
✓ Voice AI integration (Agora SDK)
        """)
        input("\nPress Enter to continue...")
    
    def show_backend(self):
        """Display backend structure"""
        self.clear_screen()
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║                    BACKEND STRUCTURE                             ║
╚═══════════════════════════════════════════════════════════════════╝

backend/
├── app/main.py
│   └─ FastAPI app initialization
│   └─ Mounts all API routers
│   └─ CORS configuration
│
├── app/ai/
│   ├── analyzer.py       → IncidentAnalyzer (Gemini orchestration)
│   ├── prompts.py        → System prompts for LLM
│   └── schemas.py        → Pydantic output validation
│
├── app/api/
│   ├── analysis.py       → POST /api/analyze (trigger analysis)
│   ├── transcript.py     → POST /api/transcript/add
│   ├── incidents.py      → CRUD for incidents
│   ├── websocket.py      → WS /api/ws/{incident_id}
│   ├── agora.py          → Voice AI agent management
│   └── tts.py            → Text-to-speech endpoints
│
├── app/db/
│   ├── database.py       → SQLAlchemy engine & connection
│   └── models.py         → ORM models (Incident, Transcript)
│
├── app/services/
│   └── incident_service.py → Business logic (IncidentService)
│
└── requirements.txt      → Python dependencies

TECHNOLOGY STACK:
• FastAPI (async Python web framework)
• SQLAlchemy (async ORM)
• Supabase PostgreSQL (database)
• Google Gemini API (LLM)
• Agora SDK (voice AI)
• WebSockets (real-time comms)

MAIN ENTRY POINT:
  python -m uvicorn app.main:app --reload
        """)
        input("\nPress Enter to continue...")
    
    def show_frontend(self):
        """Display frontend structure"""
        self.clear_screen()
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║                  FRONTEND STRUCTURE                              ║
╚═══════════════════════════════════════════════════════════════════╝

frontend-v2/
├── src/app/
│   ├── page.tsx              → Main dashboard + landing
│   ├── layout.tsx            → Root layout (Auth provider)
│   ├── api/                  → Route handlers (agora, TTS)
│   └── incident/[id]/        → Incident detail view
│
├── src/components/
│   ├── IntelligenceDashboard → Main UI container
│   ├── FactsPanel            → Discovered facts display
│   ├── HypothesesPanel       → Working theories
│   ├── ConflictsPanel        → Team disagreements
│   ├── ActionsPanel          → TODO items with owners
│   ├── TimelinePanel         → Chronological view
│   ├── AIChatbox             → Sutra AI chat interface
│   ├── VoiceControl          → Voice command input
│   ├── LiveTranscript        → Real-time transcript
│   ├── IncidentHeader        → Top navigation
│   ├── ParticleTextOverlay   → 🎆 Particle FX engine
│   ├── ParticleOrb/          → 3D visualization
│   └── AuthModal             → Login UI
│
├── src/hooks/
│   ├── useAIEvents.ts        → WebSocket listener + state
│   ├── useAudioAnalyzer.ts   → Audio frequency analysis
│   ├── useAgoraSession.ts    → Voice channel management
│   ├── useSpeechRecognition.ts → Browser speech API
│   └── useIncident.ts        → Fetch incident data
│
├── src/lib/
│   ├── api.ts                → Centralized API client
│   ├── agora.ts              → Agora SDK setup
│   ├── conversation.ts       → Chat state
│   └── types.ts              → TypeScript types
│
├── src/shaders/
│   ├── particle.vert         → GLSL vertex shader
│   └── particle.frag         → GLSL fragment shader
│
└── tailwind.config.ts        → Custom theme (cybernetic colors)

TECHNOLOGY STACK:
• Next.js (React framework + SSR)
• React Hooks + Context API (state management)
• TypeScript (type safety)
• Tailwind CSS (styling)
• Framer Motion (animations)
• Three.js (3D graphics)
• Web Speech API (speech recognition)
• Agora SDK (voice integration)

MAIN ENTRY POINT:
  npm install
  npm run dev
  → http://localhost:3000
        """)
        input("\nPress Enter to continue...")
    
    def show_extension(self):
        """Display extension structure"""
        self.clear_screen()
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║               CHROME EXTENSION STRUCTURE                          ║
╚═══════════════════════════════════════════════════════════════════╝

extension-v2/
├── public/
│   ├── manifest.json         → Chrome extension config
│   │   └─ Permissions, service worker, content scripts
│   │
│   ├── background.js         → Service worker (background process)
│   │   └─ Listens for tab changes
│   │   └─ Manages extension state
│   │   └─ Coordinates scripts
│   │
│   └── content.js            → Content script (injected into pages)
│       └─ Activates Web Speech API
│       └─ Continuously captures audio
│       └─ Sends transcripts to backend
│       └─ Tags with speaker + timestamp
│
├── src/
│   ├── App.tsx               → React popup UI
│   ├── main.tsx              → React entry point
│   ├── useWebSpeech.ts       → Speech API hook
│   └── assets/               → Icons & images
│
└── vite.config.ts            → Build configuration

TECHNOLOGY STACK:
• Chrome Extensions API (manifest v3)
• React (popup UI)
• Web Speech API (audio capture)
• Vite (build tool)
• TypeScript

HOW IT WORKS:
1. User clicks extension icon
2. Popup UI shows: Start/Stop recording
3. Content script activates Web Speech API
4. Continuously captures audio from page
5. Transcripts sent to backend via:
   - REST: POST /api/transcript/add
   - WebSocket: /api/ws/{incident_id}
6. Each transcript tagged with speaker + timestamp

BUILD & LOAD:
  npm install
  npm run build
  → Load public/ folder in chrome://extensions
        """)
        input("\nPress Enter to continue...")
    
    def show_dataflow(self):
        """Display data flow"""
        self.clear_screen()
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║                  COMPLETE DATA FLOW                              ║
╚═══════════════════════════════════════════════════════════════════╝

FLOW 1: TRANSCRIPT INGESTION
═══════════════════════════════════════════════════════════════════

Meeting (Zoom/Google Meet)
    ↓
[Chrome Extension - content.js]
    ↓ (Web Speech API)
Capture: "The database is down"
    ↓
Package JSON:
{
  "speaker": "john_doe",
  "text": "The database is down",
  "timestamp": "2024-01-15T14:23:45Z",
  "channel_name": "incident-123"
}
    ↓ (REST or WebSocket)
POST /api/transcript/add
    ↓
[Backend - IncidentService]
    ↓
Queue for analysis


FLOW 2: ANALYSIS PROCESSING
═══════════════════════════════════════════════════════════════════

IncidentAnalyzer.analyze_transcript()
    ↓
1. Fetch current incident state from DB
2. Build multi-turn Gemini prompt:
   - System instructions
   - Incident context (previous facts, hypotheses)
   - New transcripts
   - Examples of expected output
    ↓
3. Call Google Gemini API
    ↓
4. Gemini response (structured JSON):
{
  "facts": [
    {"text": "Database lag detected", "confidence": 0.95}
  ],
  "hypotheses": [
    {"text": "Connection pool exhausted"}
  ],
  "conflicts": [
    {"person_a": "john", "claim_a": "DB reset", "person_b": "sarah", "claim_b": "Check logs"}
  ],
  "action_items": [
    {"text": "Check primary DB logs", "owner": "alice", "status": "TODO"}
  ],
  "risks": [
    {"text": "Data loss (5-min window)", "severity": "CRITICAL"}
  ]
}
    ↓
5. Validate against Pydantic schema
6. Merge with existing incident state
7. Update in Supabase DB
    ↓
8. Broadcast via WebSocket to frontend


FLOW 3: REAL-TIME VISUALIZATION
═══════════════════════════════════════════════════════════════════

[Backend WebSocket]
    ↓ (message: incident_state_update)
Broadcast to all connected clients
    ↓
[Frontend - useAIEvents hook]
    ↓
Parse WebSocket message
    ↓
React State Update:
  - facts: [...]
  - hypotheses: [...]
  - conflicts: [...]
  - action_items: [...]
  - risks: [...]
    ↓
Component Re-renders:
  ├─ FactsPanel
  ├─ HypothesesPanel
  ├─ ConflictsPanel
  ├─ ActionsPanel
  ├─ RisksPanel
  └─ ParticleTextOverlay (3D animation)
    ↓
User SEES:
  ✓ Glowing facts list
  ✓ Hypotheses with sources
  ✓ Conflicting opinions highlighted
  ✓ Action items with owners
  ✓ Critical risks in red
  ✓ Particle animation assembling text


FLOW 4: INTERACTIVE VOICE AI (Agora)
═══════════════════════════════════════════════════════════════════

User clicks "Summon Agora AI" button
    ↓
Frontend: POST /api/agora/start-agent
Body: { channel_name: "incident-123" }
    ↓
Backend:
  1. Initialize Agora SDK
  2. Generate channel token
  3. Spawn AI agent process
    ↓
AI Agent:
  1. Joins Agora channel
  2. Listens to incident call
  3. Analyzes conversation in real-time
    ↓
User: "Hey Sutra, what are top risks?"
    ↓
AI:
  1. Transcribe user question
  2. Query incident state
  3. Generate response
  4. Send to TTS engine
    ↓
Backend: /api/tts
  Converts text → audio
    ↓
AI: [Voice output] "Top risks are: data loss in 5-min window, 5% user impact..."
    ↓
Conversation continues live


TOTAL END-TO-END LATENCY:
Audio captured → Analyzed → Visualized: <10 seconds
        """)
        input("\nPress Enter to continue...")
    
    def show_schema(self):
        """Display database schema"""
        self.clear_screen()
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║                  DATABASE SCHEMA (Supabase)                      ║
╚═══════════════════════════════════════════════════════════════════╝

TABLE: incidents
─────────────────────────────────────────────────────────────────
  id (UUID primary key)
  title (string)
  description (text)
  severity (enum: LOW, MEDIUM, HIGH, CRITICAL)
  status (enum: ACTIVE, RESOLVED, CLOSED)
  created_at (timestamp)
  updated_at (timestamp)
  channel_name (string) - Discord/Slack channel
  owner_id (UUID, FK to users)
  state (JSON) - Full incident state
  ├─ facts[]
  ├─ hypotheses[]
  ├─ conflicts[]
  ├─ action_items[]
  └─ risks[]


TABLE: transcripts
─────────────────────────────────────────────────────────────────
  id (UUID primary key)
  incident_id (UUID, FK to incidents)
  speaker (string)
  text (text)
  timestamp (timestamp)
  processed (boolean)
  analysis_id (UUID, FK to analyses)
  created_at (timestamp)


TABLE: analyses
─────────────────────────────────────────────────────────────────
  id (UUID primary key)
  incident_id (UUID, FK to incidents)
  facts (JSON[])
  hypotheses (JSON[])
  conflicts (JSON[])
  action_items (JSON[])
  risks (JSON[])
  confidence_score (float)
  created_at (timestamp)


TABLE: action_items
─────────────────────────────────────────────────────────────────
  id (UUID primary key)
  incident_id (UUID, FK to incidents)
  text (string)
  owner_id (UUID, FK to users)
  status (enum: TODO, IN_PROGRESS, DONE)
  assigned_at (timestamp)
  completed_at (timestamp)


TABLE: users
─────────────────────────────────────────────────────────────────
  id (UUID primary key)
  email (string, unique)
  name (string)
  org_id (UUID, FK to organizations)
  role (enum: VIEWER, RESPONDER, COMMANDER)
  created_at (timestamp)


RELATIONSHIPS:
  incident ──1:N──> transcripts
  incident ──1:N──> analyses
  incident ──1:N──> action_items
  transcript ──N:1──> analysis
  action_item ──N:1──> user
  user ──N:1──> organization

INDEXES (for performance):
  - incidents(status, created_at)
  - transcripts(incident_id, timestamp)
  - action_items(incident_id, status)
  - analyses(incident_id, created_at)
        """)
        input("\nPress Enter to continue...")
    
    def show_setup(self):
        """Display setup commands"""
        self.clear_screen()
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║                SETUP & RUN COMMANDS                              ║
╚═══════════════════════════════════════════════════════════════════╝

PREREQUISITES:
• Node.js v18+
• Python 3.11+
• Supabase account + API key
• Google Gemini API key
• Agora account (optional for voice AI)


1️⃣  BACKEND SETUP
─────────────────────────────────────────────────────────────────

cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
GEMINI_API_KEY=sk-proj-...
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
AGORA_APP_ID=your-agora-id
AGORA_APP_CERTIFICATE=your-agora-cert
LOG_LEVEL=info
EOF

# Run development server
python -m uvicorn app.main:app --reload --port 8000

✓ API will be available at: http://localhost:8000
✓ Interactive docs: http://localhost:8000/docs


2️⃣  FRONTEND SETUP
─────────────────────────────────────────────────────────────────

cd frontend-v2

# Install dependencies
npm install
# or
pnpm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_AGORA_APP_ID=your-agora-id
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EOF

# Run dev server
npm run dev
# or
pnpm dev

✓ Dashboard will be available at: http://localhost:3000


3️⃣  EXTENSION SETUP
─────────────────────────────────────────────────────────────────

cd extension-v2

# Install dependencies
npm install
# or
pnpm install

# Build
npm run build
# or
pnpm build

# Load in Chrome:
1. Open chrome://extensions
2. Enable "Developer mode" (toggle top-right)
3. Click "Load unpacked"
4. Select the "public" folder

✓ Extension will now appear in your Chrome toolbar


QUICK START (All 3 parts):
─────────────────────────────────────────────────────────────────

# Terminal 1: Backend
cd backend && python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend-v2 && npm run dev

# Terminal 3: Extension (one-time)
cd extension-v2 && npm run build
# Then load in chrome://extensions

✓ Go to http://localhost:3000
✓ Open Google Meet/Zoom in another tab
✓ Start extension
✓ Begin an incident
✓ Transcripts will flow → Analysis → Dashboard updates


TESTING:
─────────────────────────────────────────────────────────────────

# Backend tests
cd backend
pytest test_analyze.py -v
pytest test_endpoints.py -v

# Run specific endpoint
pytest test_endpoints.py::test_create_incident -v

# Test WebSocket
pytest test_websocket.py -v
        """)
        input("\nPress Enter to continue...")
    
    def show_endpoints(self):
        """Display API endpoints"""
        self.clear_screen()
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║                    API ENDPOINTS REFERENCE                       ║
╚═══════════════════════════════════════════════════════════════════╝

ANALYSIS
═══════════════════════════════════════════════════════════════════

POST /api/analyze
  Purpose: Trigger immediate analysis of transcripts
  Body: {
    "incident_id": "inc_123",
    "transcripts": [
      {"speaker": "john", "text": "...", "timestamp": "..."}
    ]
  }
  Response: { "facts": [...], "hypotheses": [...], ... }


TRANSCRIPTS
═══════════════════════════════════════════════════════════════════

POST /api/transcript/add
  Purpose: Ingest new transcript from extension
  Body: {
    "incident_id": "inc_123",
    "speaker": "john_doe",
    "text": "The database is down",
    "timestamp": "2024-01-15T14:23:45Z"
  }
  Response: { "id": "tx_999", "status": "queued" }

GET /api/transcript/{incident_id}
  Purpose: Fetch transcript history
  Response: [
    {"speaker": "john", "text": "...", "timestamp": "...", "processed": true},
    ...
  ]


INCIDENTS
═══════════════════════════════════════════════════════════════════

POST /api/incidents
  Purpose: Create new incident
  Body: {
    "title": "Database Replication Lag",
    "severity": "CRITICAL",
    "channel_name": "incident-discord-channel"
  }
  Response: { "id": "inc_123", "status": "ACTIVE", "created_at": "..." }

GET /api/incidents
  Purpose: List all incidents (with filters)
  Query: ?status=ACTIVE&limit=10&offset=0
  Response: [{ "id": "inc_123", ... }, ...]

GET /api/incidents/{id}
  Purpose: Get incident details + full state
  Response: {
    "id": "inc_123",
    "title": "...",
    "status": "ACTIVE",
    "state": {
      "facts": [...],
      "hypotheses": [...],
      "conflicts": [...],
      "action_items": [...],
      "risks": [...]
    }
  }

PUT /api/incidents/{id}
  Purpose: Update incident
  Body: { "title": "...", "status": "...", "severity": "..." }
  Response: { "id": "inc_123", ... }

DELETE /api/incidents/{id}
  Purpose: Close incident
  Response: { "status": "deleted" }


WEBSOCKET
═══════════════════════════════════════════════════════════════════

WS /api/ws/{incident_id}
  Purpose: Subscribe to real-time incident updates
  
  Messages received:
  {
    "type": "incident_update",
    "incident_id": "inc_123",
    "state": {
      "facts": [...],
      "hypotheses": [...],
      "conflicts": [...],
      "action_items": [...],
      "risks": [...]
    },
    "timestamp": "..."
  }

  Connected clients auto-receive updates when state changes
  Useful for: Dashboard real-time sync, live transcript display


AGORA VOICE AI
═══════════════════════════════════════════════════════════════════

POST /api/agora/start-agent
  Purpose: Spawn AI voice agent on incident channel
  Body: { "channel_name": "incident-123" }
  Response: { "agent_id": "agent_123", "status": "joined" }

POST /api/agora/stop-agent
  Purpose: Stop AI voice agent
  Body: { "agent_id": "agent_123" }
  Response: { "status": "stopped" }

POST /api/tts
  Purpose: Text-to-speech for AI responses
  Body: { "text": "Top risks are...", "voice": "en-US-Neural2-C" }
  Response: { "audio_url": "https://...", "duration_ms": 3500 }


GENERAL PATTERNS
═══════════════════════════════════════════════════════════════════

All endpoints return:
  {
    "data": { ... },
    "error": null,
    "status": 200,
    "timestamp": "2024-01-15T14:23:45Z"
  }

Errors:
  {
    "error": "Incident not found",
    "status": 404,
    "detail": { ... }
  }

Authentication:
  Header: Authorization: Bearer <token>
  (Implement OAuth/JWT as needed)
        """)
        input("\nPress Enter to continue...")
    
    def show_concepts(self):
        """Display key concepts"""
        self.clear_screen()
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║                  KEY CONCEPTS & TERMINOLOGY                      ║
╚═══════════════════════════════════════════════════════════════════╝

INCIDENT
════════════════════════════════════════════════════════════════════
An operational event requiring team coordination and resolution.
Example: "Database replication lag on 2024-01-15 at 14:20"
- Has status: ACTIVE, RESOLVED, CLOSED
- Has severity: LOW, MEDIUM, HIGH, CRITICAL
- Contains state: facts, hypotheses, conflicts, actions, risks


FACT
════════════════════════════════════════════════════════════════════
Objectively extracted information from team communication.
Example: "Database replication lag detected"
- Confidence score (0.0-1.0)
- Source (who said it)
- Timestamp (when discovered)
Used for: building shared understanding


HYPOTHESIS
════════════════════════════════════════════════════════════════════
A proposed explanation or theory about the incident cause.
Example: "Connection pool is exhausted"
- Multiple hypotheses can exist
- Teams vote/support hypotheses
- Used for: root cause analysis


CONFLICT
════════════════════════════════════════════════════════════════════
A disagreement between team members on incident assessment.
Example: John says "DB reset needed" but Sarah says "Check logs first"
- Tracked by AI automatically
- Surfaced on dashboard
- Used for: ensuring all voices heard


ACTION ITEM
════════════════════════════════════════════════════════════════════
A task extracted from conversation, assigned to someone.
Example: "Check primary DB logs" → assigned to Alice
- Status: TODO, IN_PROGRESS, DONE
- Owner: person responsible
- Deadline: estimated completion
Used for: task tracking and coordination


RISK
════════════════════════════════════════════════════════════════════
A potential negative outcome if incident not resolved quickly.
Example: "Data loss in 5-minute window" (CRITICAL severity)
- Severity level
- Potential impact
- Mitigation options
Used for: prioritization and escalation


TRANSCRIPT
════════════════════════════════════════════════════════════════════
A chunk of spoken word captured from meeting audio.
Example: {
  "speaker": "john_doe",
  "text": "The database is down",
  "timestamp": "2024-01-15T14:23:45Z"
}
- Captured by Chrome extension
- Sent to backend for processing
- Stored in database
Used for: training AI, audit trail


ANALYSIS
════════════════════════════════════════════════════════════════════
Result of running incident state through Gemini LLM.
Contains: facts, hypotheses, conflicts, actions, risks
- Triggered when new transcripts arrive
- Runs every N seconds (configurable)
- Merges with existing state (delta update)
Used for: intelligent state extraction


INTELLIGENCE DASHBOARD
════════════════════════════════════════════════════════════════════
The main UI showing real-time incident state.
Panels:
  ✓ Facts Panel - Objective information
  ✓ Hypotheses Panel - Working theories
  ✓ Conflicts Panel - Team disagreements
  ✓ Actions Panel - Tasks to complete
  ✓ Risks Panel - Critical threats
  ✓ Timeline - Chronological view
  ✓ Live Transcript - Real-time chat
Used for: situational awareness


SUTRA (AI ASSISTANT)
════════════════════════════════════════════════════════════════════
Interactive voice/text AI that answers incident-specific questions.
Example: "Hey Sutra, what are the top risks?" 
Sutra: "Critical risks: data loss in 5-min window, 5% user impact"
- Powered by Agora voice channel
- Uses incident state + LLM
- Can provide voice or text responses
Used for: on-demand intelligence


WEB SPEECH API
════════════════════════════════════════════════════════════════════
Browser API for capturing audio and converting to text.
- Built into Chrome, Edge, Safari
- No special installation needed
- Continuous mode in extension
- Feeds directly to backend
Used for: effortless transcript capture


GEMINI API
════════════════════════════════════════════════════════════════════
Google's LLM used for incident analysis.
- Model: Gemini 3.6-Flash (fast, cheap, accurate)
- Takes multi-turn prompts with context
- Outputs structured JSON
- ~2-5 second latency per call
Used for: intelligent extraction and understanding


AGORA
════════════════════════════════════════════════════════════════════
Real-time communication platform for voice channels.
- Used for: Voice AI agent on incident channel
- Enables: Multi-user voice communication
- Features: Audio publishing/subscribing
Used for: interactive voice AI (Sutra)


WEBSOCKET
════════════════════════════════════════════════════════════════════
Persistent bidirectional connection between backend and frontend.
- Backend pushes incident state updates
- Frontend subscribes per-incident
- <1 second latency
- Auto-reconnect on disconnect
Used for: real-time dashboard sync


PARTICLE EFFECT ENGINE
════════════════════════════════════════════════════════════════════
WebGL-based 3D animation system.
- Renders 1000+ glowing particles
- Assembles text character-by-character
- Physics-based movement
- Smooth transitions between updates
- Custom GLSL shaders
Used for: visual impact and engagement
        """)
        input("\nPress Enter to continue...")
    
    def exit_program(self):
        """Exit the program"""
        self.clear_screen()
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║  Thank you for exploring Sutradhar! 🌌                           ║
║                                                                   ║
║  For more details, see: PROJECT_EXPLANATION.md                   ║
║                                                                   ║
║  Questions? Check the README.md in each folder.                  ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
        """)
        exit(0)
    
    def run(self):
        """Run the interactive menu"""
        while True:
            self.show_menu()
            choice = input("\nEnter your choice (0-9): ").strip()
            if choice in self.menu_options:
                _, handler = self.menu_options[choice]
                handler()
            else:
                input("Invalid choice. Press Enter to try again...")


if __name__ == "__main__":
    explorer = SutradharExplorer()
    explorer.run()
