# 🌌 Sutradhar: AI-Powered Incident Response Copilot - Complete Project Explanation

## Executive Summary

**Sutradhar** (meaning "Director" or "String-puller" in Sanskrit) is a **next-generation, AI-driven Incident Response (IR) war room platform**. It acts as an autonomous copilot during critical engineering outages, using Google Gemini AI to analyze team communications in real-time and provide structured intelligence extraction.

### Mission
Transform chaotic incident response into organized, AI-assisted crisis management by:
- Capturing team voice communications via browser extension
- Analyzing conversations with Google Gemini AI
- Extracting facts, hypotheses, conflicts, and action items
- Visualizing intelligence on a cybernetic command center dashboard
- Providing interactive voice AI assistance (Sutra)

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SUTRADHAR INCIDENT COMMAND CENTER               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────┐    ┌──────────────────┐    ┌───────────┐   │
│  │ Chrome Extension   │    │  FastAPI Backend │    │  Next.js  │   │
│  │   (extension-v2)   │───→│  (backend)       │───→│ Dashboard │   │
│  │                    │    │                  │    │           │   │
│  │ • Speech Capture   │    │ • Gemini AI      │    │ • Panels  │   │
│  │ • Audio Stream     │    │ • Async Process  │    │ • 3D FX   │   │
│  │ • WebSocket        │    │ • Orchestration  │    │ • Real-   │   │
│  │                    │    │ • State Mgmt     │    │   time    │   │
│  └────────────────────┘    └──────────────────┘    └───────────┘   │
│           │                        │                      │          │
│           └────────────────────┬───┴──────────────────────┘          │
│                                │                                     │
│                         ┌──────▼────────┐                           │
│                         │  Supabase DB  │                           │
│                         │  (PostgreSQL) │                           │
│                         └───────────────┘                           │
│                                                                       │
│  EXTERNAL SERVICES:                                                  │
│  • Google Gemini API (LLM Processing)                               │
│  • Agora (Voice AI - Conversational)                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Data Flow

### 1. **CAPTURE PHASE** (Chrome Extension → Backend)
```
Meeting (Zoom/Google Meet/Discord)
         ↓
Browser Speech Recognition API (extension-v2)
         ↓
Audio chunk captured → JSON payload with metadata
{
  "speaker": "john_doe",
  "timestamp": "2024-01-15T14:23:45Z",
  "text": "The database is down...",
  "channel_name": "incident-123"
}
         ↓
WebSocket/REST to Backend (/api/transcript/add)
```

### 2. **ANALYSIS PHASE** (Backend Intelligence Engine)
```
Transcript received → Queue batch processing
         ↓
IncidentAnalyzer (app/ai/analyzer.py) activated
         ↓
Constructs Gemini prompt with full incident context:
  - Previous state (facts, hypotheses, etc.)
  - New transcripts (what team just said)
  - System instructions (extract structure)
         ↓
Google Gemini API processes → Returns structured JSON:
{
  "facts": ["Database replication lag detected", "..."],
  "hypotheses": ["Connection pool exhausted", "..."],
  "conflicts": ["John thinks X, Sarah thinks Y"],
  "action_items": ["Check logs", "Restart service"],
  "risks": ["Data loss potential", "..."]
}
         ↓
Backend validates schema → Stores in Supabase DB
         ↓
WebSocket broadcast to Frontend (real-time update)
```

### 3. **VISUALIZATION PHASE** (Frontend Dashboard)
```
WebSocket message received with updated incident state
         ↓
React component state updated (useAIEvents hook)
         ↓
IntelligenceDashboard re-renders:
  - Facts Panel: Glowing list of discovered facts
  - Hypotheses Panel: Team's working theories
  - Conflicts Panel: Disagreements flagged
  - Action Items Panel: TODO list with owners
  - Risks Panel: Critical risks identified
         ↓
ParticleTextOverlay: WebGL particle animation
  - Text assembled from 1000s of glowing particles
  - Smooth physics-based transitions
  - Real-time visual feedback
         ↓
User sees live incident intelligence
         ↓
[INTERACTIVE] User can ask Sutra (AI) questions via voice
```

### 4. **INTERACTIVE PHASE** (Agora Voice AI)
```
User clicks "Summon Agora AI" button
         ↓
Frontend: POST /api/agora/start-agent
         ↓
Backend: Spawns AI voice agent on Agora channel
         ↓
AI joins call → Can listen, analyze, respond
         ↓
User: "Hey Sutra, what are the critical risks?"
         ↓
AI: [Voice synthesis] "Based on transcripts: data loss, 5% user impact..."
         ↓
Conversation continues in real-time
```

---

## 📂 Complete Directory Structure & Responsibilities

```
Sutradhar/
│
├── 📄 README.md
│   └─ Project overview and setup guide
│
├── 📁 backend/
│   │   ⚙️  RESPONSIBILITY: AI Intelligence Engine + REST API
│   │
│   ├── app/
│   │   ├── main.py
│   │   │   └─ FastAPI app entry point
│   │   │   └─ Mounts all routers (analysis, incidents, transcript, websocket)
│   │   │   └─ Configures CORS middleware
│   │   │
│   │   ├── ai/
│   │   │   ├── analyzer.py
│   │   │   │   └─ IncidentAnalyzer class (core LLM orchestration)
│   │   │   │   └─ Main method: analyze_transcript()
│   │   │   │   └─ Calls Google Gemini API with context
│   │   │   │   └─ Validates output schema
│   │   │   │   └─ Merges with existing incident state
│   │   │   │
│   │   │   ├── prompts.py
│   │   │   │   └─ System prompt templates for Gemini
│   │   │   │   └─ Instruction-following chains
│   │   │   │   └─ JSON schema definition (Facts, Hypotheses, etc.)
│   │   │   │
│   │   │   └── schemas.py
│   │   │       └─ Pydantic models for LLM output validation
│   │   │       └─ AnalysisResult, IncidentState, ActionItem schemas
│   │   │
│   │   ├── api/
│   │   │   ├── analysis.py (Router)
│   │   │   │   └─ POST /api/analyze
│   │   │   │   └─ Endpoint: Trigger immediate analysis
│   │   │   │   └─ Consumes transcript, returns structured result
│   │   │   │
│   │   │   ├── transcript.py (Router)
│   │   │   │   └─ POST /api/transcript/add
│   │   │   │   └─ Endpoint: Ingest audio transcripts from extension
│   │   │   │   └─ Queues analysis job
│   │   │   │
│   │   │   ├── incidents.py (Router)
│   │   │   │   └─ GET /api/incidents
│   │   │   │   └─ GET /api/incidents/{id}
│   │   │   │   └─ POST /api/incidents (create new incident)
│   │   │   │   └─ Manages incident CRUD operations
│   │   │   │
│   │   │   ├── websocket.py (Router)
│   │   │   │   └─ WebSocket /api/ws/{incident_id}
│   │   │   │   └─ Real-time updates to connected clients
│   │   │   │   └─ Broadcast incident state changes
│   │   │   │
│   │   │   ├── agora.py (Router)
│   │   │   │   └─ POST /api/agora/start-agent
│   │   │   │   └─ Spawns Agora voice AI agent on channel
│   │   │   │   └─ Manages conversational AI lifecycle
│   │   │   │
│   │   │   ├── tts.py (Router)
│   │   │   │   └─ Text-to-Speech endpoints (Agora integration)
│   │   │   │   └─ Generates voice audio for AI responses
│   │   │   │
│   │   │   └── integrations.py (Router)
│   │   │       └─ Third-party service integrations
│   │   │       └─ Slack, PagerDuty, etc. (if configured)
│   │   │
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   │   └─ SQLAlchemy engine + session factory
│   │   │   │   └─ Connection to Supabase PostgreSQL
│   │   │   │   └─ Database initialization
│   │   │   │
│   │   │   └── models.py
│   │   │       └─ SQLAlchemy ORM models
│   │   │       └─ Incident, Transcript, ActionItem, etc.
│   │   │       └─ Database schema definitions
│   │   │
│   │   ├── models/
│   │   │   ├── incident.py
│   │   │   │   └─ Pydantic schemas for API requests/responses
│   │   │   │   └─ IncidentCreate, IncidentUpdate, IncidentResponse
│   │   │   │
│   │   │   └── __init__.py
│   │   │
│   │   ├── services/
│   │   │   ├── incident_service.py
│   │   │   │   └─ IncidentService class (business logic)
│   │   │   │   └─ Methods:
│   │   │   │       - create_incident()
│   │   │   │       - get_incident()
│   │   │   │       - add_transcript()
│   │   │   │       - get_incident_state()
│   │   │   │       - update_incident_state()
│   │   │   │
│   │   │   └── __init__.py
│   │   │
│   │   └── __init__.py
│   │
│   ├── requirements.txt
│   │   └─ Python dependencies (FastAPI, SQLAlchemy, google-generativeai, etc.)
│   │
│   ├── scratch_incident_service.py
│   │   └─ Legacy/test incident service code
│   │
│   └── test_*.py files
│       └─ Unit tests for various endpoints and analyzers
│
│
├── 📁 frontend-v2/
│   │   🎨 RESPONSIBILITY: Main UI Dashboard + Real-time Visualization
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   │   └─ HOME PAGE (Landing + Dashboard)
│   │   │   │   └─ State: appPhase (LANDING vs DASHBOARD)
│   │   │   │   └─ Main hooks: useAgoraSession, useAudioAnalyzer, useAIEvents
│   │   │   │   └─ Renders:
│   │   │   │       - Landing UI (Incident ID input)
│   │   │   │       - IntelligenceDashboard (when incident active)
│   │   │   │       - AIChatbox (Sutra voice AI)
│   │   │   │       - ParticleOrb (3D scene)
│   │   │   │   └─ Key button: "Summon Agora AI"
│   │   │   │       └─ Calls: POST /api/agora/start-agent
│   │   │   │
│   │   │   ├── layout.tsx
│   │   │   │   └─ Root layout component
│   │   │   │   └─ Tailwind CSS setup
│   │   │   │   └─ Auth provider wrapper
│   │   │   │
│   │   │   ├── globals.css
│   │   │   │   └─ Global styles + Tailwind directives
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── generate-agora-token/
│   │   │   │   │   └─ Route handler: /api/generate-agora-token
│   │   │   │   │   └─ Calls Agora SDK to generate voice channel token
│   │   │   │   │
│   │   │   │   ├── invite-agent/
│   │   │   │   │   └─ Route handler: /api/invite-agent
│   │   │   │   │   └─ Invites AI agent to active incident channel
│   │   │   │   │
│   │   │   │   └── stop-conversation/
│   │   │   │       └─ Route handler: /api/stop-conversation
│   │   │   │       └─ Terminates Agora session
│   │   │   │
│   │   │   ├── incident/
│   │   │   │   └─ [id]/
│   │   │   │       └─ Dynamic route for individual incident views
│   │   │   │
│   │   │   └── dashboard/
│   │   │       └─ Dashboard-specific layouts
│   │   │
│   │   ├── components/
│   │   │   ├── IntelligenceDashboard.tsx
│   │   │   │   └─ MAIN DASHBOARD CONTAINER
│   │   │   │   └─ Renders all analysis panels in grid layout
│   │   │   │   └─ Displays: Facts, Hypotheses, Conflicts, Actions, Risks
│   │   │   │   └─ Connected to real-time WebSocket updates
│   │   │   │
│   │   │   ├── FactsPanel.tsx
│   │   │   │   └─ Displays discovered facts with confidence scores
│   │   │   │   └─ Animation: Framer Motion fade-in
│   │   │   │   └─ UI: Cards with glowing borders (Tailwind)
│   │   │   │
│   │   │   ├── HypothesesPanel.tsx
│   │   │   │   └─ Displays working theories
│   │   │   │   └─ Shows which team member proposed each
│   │   │   │   └─ Supports voting/confidence indicators
│   │   │   │
│   │   │   ├── ConflictsPanel.tsx
│   │   │   │   └─ Highlights disagreements
│   │   │   │   └─ Shows conflicting opinions side-by-side
│   │   │   │   └─ UI: Red/orange accent colors
│   │   │   │
│   │   │   ├── IncidentSummary.tsx
│   │   │   │   └─ High-level incident overview
│   │   │   │   └─ Title, status, duration, participant count
│   │   │   │   └─ Quick-access incident controls
│   │   │   │
│   │   │   ├── TimelinePanel.tsx
│   │   │   │   └─ Chronological incident timeline
│   │   │   │   └─ Shows when facts/actions were discovered/assigned
│   │   │   │
│   │   │   ├── ActionsPanel.tsx
│   │   │   │   └─ Displays action items with owners
│   │   │   │   └─ Status: TODO, IN_PROGRESS, DONE
│   │   │   │   └─ Checkbox to mark complete
│   │   │   │   └─ Integration: Can push to external task systems
│   │   │   │
│   │   │   ├── VoiceControl.tsx
│   │   │   │   └─ Voice command input widget
│   │   │   │   └─ "Hey Sutra" wake word detection
│   │   │   │   └─ Transcribes user speech to text
│   │   │   │   └─ Sends to AI for processing
│   │   │   │
│   │   │   ├── LiveTranscript.tsx
│   │   │   │   └─ Real-time rolling transcript display
│   │   │   │   └─ Shows what's being said in incident call
│   │   │   │   └─ Color-coded by speaker
│   │   │   │   └─ Scrollable, searchable history
│   │   │   │
│   │   │   ├── IncidentHeader.tsx
│   │   │   │   └─ Top navigation bar
│   │   │   │   └─ Incident title, status, time
│   │   │   │   └─ Buttons: Back, Settings, Export
│   │   │   │
│   │   │   ├── AIChatbox.tsx
│   │   │   │   └─ Chat interface for Sutra AI
│   │   │   │   └─ Text input + voice input options
│   │   │   │   └─ Message history with timestamps
│   │   │   │   └─ Connects to backend /api/agora/start-agent
│   │   │   │
│   │   │   ├── AuthModal.tsx
│   │   │   │   └─ Login/Auth screen
│   │   │   │   └─ Supabase authentication
│   │   │   │
│   │   │   ├── ParticleTextOverlay.tsx
│   │   │   │   └─ WebGL PARTICLE EFFECT ENGINE 🎆
│   │   │   │   └─ Assembles text from 1000s of glowing particles
│   │   │   │   └─ Physics-based particle movement
│   │   │   │   └─ Smooth transitions between words
│   │   │   │   └─ Custom shaders in /shaders folder
│   │   │   │
│   │   │   ├── ParticleOrb/
│   │   │   │   ├── OrbScene.tsx
│   │   │   │   │   └─ 3D visualization (Three.js)
│   │   │   │   │   └─ Rotating data orb in background
│   │   │   │   │   └─ Represents incident data as particles
│   │   │   │   │
│   │   │   │   └── [other 3D components]
│   │   │   │
│   │   │   └── [Other UI components as listed]
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   │   └─ Global authentication state (useAuth hook)
│   │   │   │   └─ Manages user login/logout
│   │   │   │   └─ Wraps entire app
│   │   │   │
│   │   │   └── [Other context providers]
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAgoraSession.ts
│   │   │   │   └─ Manages Agora voice channel lifecycle
│   │   │   │   └─ Handles join/leave channel
│   │   │   │   └─ Audio publishing/subscribing
│   │   │   │
│   │   │   ├── useAudioAnalyzer.ts
│   │   │   │   └─ Real-time audio frequency analysis
│   │   │   │   └─ Detects speech vs. silence
│   │   │   │   └─ Powers voice activity indicators
│   │   │   │
│   │   │   ├── useAIEvents.ts
│   │   │   │   └─ MAIN STATE HOOK
│   │   │   │   └─ Connects to backend WebSocket
│   │   │   │   └─ Listens for incident state updates
│   │   │   │   └─ Parses Facts, Hypotheses, Conflicts, Actions
│   │   │   │   └─ Updates React state in real-time
│   │   │   │
│   │   │   ├── useSpeechRecognition.ts
│   │   │   │   └─ Browser Speech Recognition API wrapper
│   │   │   │   └─ Converts user voice to text
│   │   │   │   └─ Streams live transcription
│   │   │   │
│   │   │   └── useIncident.ts
│   │   │       └─ Incident data fetching
│   │   │       └─ GET /api/incidents/{id}
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   │   └─ Centralized API client
│   │   │   │   └─ fetch() wrapper with error handling
│   │   │   │   └─ Base URL from env vars
│   │   │   │
│   │   │   ├── agora.ts
│   │   │   │   └─ Agora SDK initialization
│   │   │   │   └─ Channel join/leave logic
│   │   │   │   └─ Audio track management
│   │   │   │
│   │   │   ├── conversation.ts
│   │   │   │   └─ AI conversation state management
│   │   │   │   └─ Stores chat history
│   │   │   │
│   │   │   ├── types.ts
│   │   │   │   └─ TypeScript types for all frontend state
│   │   │   │   └─ Incident, Transcript, ActionItem types
│   │   │   │
│   │   │   └── useAgoraConversation.ts
│   │   │       └─ High-level Agora + conversation hook
│   │   │
│   │   ├── shaders/
│   │   │   ├── particle.vert (GLSL)
│   │   │   │   └─ Vertex shader for particles
│   │   │   │
│   │   │   ├── particle.frag (GLSL)
│   │   │   │   └─ Fragment shader (colors, glow effects)
│   │   │   │
│   │   │   └── [Other WebGL shaders]
│   │   │
│   │   ├── types/
│   │   │   ├── conversation.ts
│   │   │   │   └─ Conversation, Message interfaces
│   │   │   │
│   │   │   └── env.d.ts
│   │   │       └─ Environment variable type definitions
│   │   │
│   │   └── utils/
│   │       └─ Helper functions
│   │
│   ├── tailwind.config.ts
│   │   └─ Tailwind CSS theming
│   │   └─ Custom color palette (cybernetic theme)
│   │   └─ Animation presets
│   │
│   ├── tsconfig.json
│   │   └─ TypeScript configuration
│   │
│   ├── package.json
│   │   └─ Next.js project + dependencies
│   │   └─ Scripts: dev, build, start, lint
│   │
│   ├── .env.local
│   │   └─ Public environment variables
│   │   └─ NEXT_PUBLIC_BACKEND_URL (points to FastAPI)
│   │   └─ NEXT_PUBLIC_AGORA_APP_ID (Agora integration)
│   │
│   └── [Config files: postcss, vite, etc.]
│
│
└── 📁 extension-v2/
    │   🎙️ RESPONSIBILITY: Audio Capture + Transcript Streaming
    │
    ├── src/
    │   ├── App.tsx
    │   │   └─ React popup UI component
    │   │   └─ Render: Start/Stop recording buttons
    │   │   └─ Shows connection status
    │   │
    │   ├── main.tsx
    │   │   └─ React app entry point
    │   │   └─ ReactDOM.createRoot()
    │   │
    │   ├── useWebSpeech.ts
    │   │   └─ React hook wrapping Web Speech API
    │   │   └─ Captures audio chunks
    │   │   └─ Exposes: isListening, transcript, error
    │   │
    │   └── assets/
    │       └─ Images, icons for extension UI
    │
    ├── public/
    │   ├── manifest.json
    │   │   └─ Chrome extension manifest
    │   │   └─ Permissions: activeTab, scripting, tabCapture
    │   │   └─ Background service worker
    │   │   └─ Content script injection
    │   │
    │   ├── background.js
    │   │   └─ Service worker (runs in background)
    │   │   └─ Listens for tab changes
    │   │   └─ Manages extension state persistence
    │   │   └─ Coordinates content scripts
    │   │
    │   └── content.js
    │       └─ INJECTED INTO WEB PAGES
    │       └─ Activates Web Speech API
    │       └─ Continuously captures audio
    │       └─ Sends transcripts via:
    │           - WebSocket to backend (/api/ws)
    │           - OR REST POST to /api/transcript/add
    │       └─ Tags each transcript with speaker + timestamp
    │
    ├── package.json
    │   └─ Build dependencies (Vite, React, TypeScript)
    │
    ├── vite.config.ts
    │   └─ Vite build config for extension
    │   └─ Outputs into public/ folder
    │
    ├── tsconfig.json
    │   └─ TypeScript config
    │
    └── [Other config files: postcss, tailwind, etc.]


```

---

## 🔑 Key Concepts & Components

### 1. **The Analyzer (Core Brain)**
**Location:** `backend/app/ai/analyzer.py`

```python
class IncidentAnalyzer:
    """Orchestrates conversation analysis via Gemini LLM"""
    
    async def analyze_transcript(incident_id, new_transcripts):
        # 1. Fetch current incident state from DB
        # 2. Build context prompt with history
        # 3. Call Google Gemini API
        # 4. Parse JSON response into AnalysisResult
        # 5. Merge with existing incident state
        # 6. Save updated state to DB
        # 7. Broadcast via WebSocket to frontend
        # 8. Return updated incident
```

**Input:** Array of transcripts (speaker, text, timestamp)
**Process:** Constructs multi-turn Gemini prompt with system instructions
**Output:** Structured JSON with Facts, Hypotheses, Conflicts, Action Items, Risks

### 2. **The WebSocket Connection**
**Location:** `backend/app/api/websocket.py`

```
Extension → Backend (HTTP/WebSocket)
            ↓
        IncidentAnalyzer
            ↓
        Supabase DB
            ↓
        Backend → Frontend (WebSocket broadcast)
            ↓
        React State Update
            ↓
        Particle Animation + Panel Refresh
```

**Protocol:** JSON messages with incident state deltas
**Latency:** Near real-time (<1 second)

### 3. **The Particle Effect Engine**
**Location:** `frontend-v2/src/components/ParticleTextOverlay.tsx`

Uses WebGL + Custom Shaders to:
- Render 1000+ particles
- Apply physics-based movement
- Assemble text from particles
- Smooth transitions between updates
- Glow/bloom effects

**Technologies:**
- Three.js (3D rendering)
- GLSL shaders (particle rendering)
- Canvas API (fallback)

### 4. **Agora Voice AI Integration**
**Location:** `backend/app/api/agora.py`

```
User clicks "Summon Agora AI"
    ↓
POST /api/agora/start-agent
    ↓
Backend initializes Agora SDK
    ↓
Spawns AI agent on incident channel
    ↓
AI can listen to meeting
    ↓
AI can respond with voice (TTS)
    ↓
TTS via /api/tts endpoint
```

**Features:**
- Real-time voice agent joins meeting
- Listens to conversation
- Analyzes context
- Provides voice responses
- Can answer incident-specific questions

---

## 💾 Data Models (Schema)

### **Incident**
```json
{
  "id": "inc_12345",
  "title": "Database Replication Lag",
  "created_at": "2024-01-15T14:20:00Z",
  "severity": "CRITICAL",
  "status": "ACTIVE" | "RESOLVED",
  "channel_name": "incident-discord-channel",
  "state": {
    "facts": [
      {
        "text": "Database replication lag detected",
        "confidence": 0.95,
        "source": "john_doe",
        "extracted_at": "2024-01-15T14:23:45Z"
      }
    ],
    "hypotheses": [...],
    "conflicts": [...],
    "action_items": [
      {
        "id": "action_1",
        "text": "Check primary DB logs",
        "owner": "alice_engineer",
        "status": "TODO" | "IN_PROGRESS" | "DONE",
        "created_at": "2024-01-15T14:25:00Z"
      }
    ],
    "risks": [...]
  }
}
```

### **Transcript**
```json
{
  "id": "tx_9999",
  "incident_id": "inc_12345",
  "speaker": "john_doe",
  "text": "The database is down, replication lag is 5 minutes",
  "timestamp": "2024-01-15T14:23:45Z",
  "processed": true,
  "analysis_id": "analysis_123"
}
```

### **Analysis Result**
```json
{
  "id": "analysis_123",
  "incident_id": "inc_12345",
  "facts": [...],
  "hypotheses": [...],
  "conflicts": [...],
  "action_items": [...],
  "risks": [...],
  "created_at": "2024-01-15T14:24:00Z"
}
```

---

## 🚀 Main Entry Points

### **Backend Entry**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
→ Starts FastAPI server
→ Listens on `http://localhost:8000`
→ API docs: `http://localhost:8000/docs`

### **Frontend Entry**
```bash
cd frontend-v2
npm run dev
```
→ Starts Next.js dev server
→ Listens on `http://localhost:3000`
→ HMR enabled for live reloads

### **Extension Entry**
```bash
cd extension-v2
npm run build
```
→ Builds React + content scripts
→ Output: `public/` folder
→ Load in Chrome: `chrome://extensions` → Load unpacked

---

## 🔗 API Endpoints Overview

### **Analysis**
- `POST /api/analyze` → Trigger manual analysis
- `POST /api/analysis/batch` → Batch process transcripts

### **Transcripts**
- `POST /api/transcript/add` → Ingest new transcript
- `GET /api/transcript/{incident_id}` → Get transcript history

### **Incidents**
- `POST /api/incidents` → Create incident
- `GET /api/incidents/{id}` → Get incident details
- `PUT /api/incidents/{id}` → Update incident
- `DELETE /api/incidents/{id}` → Close incident

### **WebSocket**
- `WS /api/ws/{incident_id}` → Subscribe to real-time updates

### **Agora Integration**
- `POST /api/agora/start-agent` → Spawn AI voice agent
- `POST /api/agora/stop-agent` → Stop AI voice agent
- `POST /api/tts` → Text-to-speech for AI responses

---

## 🛠️ Technology Stack

### **Backend**
- **Framework:** FastAPI (Python async framework)
- **Database:** Supabase (PostgreSQL)
- **ORM:** SQLAlchemy (async)
- **LLM:** Google Gemini API (3.6-Flash model)
- **Real-time:** WebSockets (built into FastAPI)
- **Task Queue:** (Optional Celery/Redis if heavy async needed)

### **Frontend**
- **Framework:** Next.js (React + SSR)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **3D Graphics:** Three.js
- **Voice:** Web Speech API + Agora SDK
- **State Management:** React Hooks + Context API
- **Build:** Vite

### **Extension**
- **Framework:** React + Vite
- **Speech Recognition:** Web Speech API
- **Communication:** WebSocket + REST

### **External Services**
- **AI LLM:** Google Gemini
- **Voice AI:** Agora (voice channel + audio processing)
- **Database:** Supabase (managed PostgreSQL)

---

## 📊 Real-time Data Flow Diagram

```
┌─────────────────┐
│ Chrome Extension│
│  - Web Speech   │
│  - Transcript   │
└────────┬────────┘
         │ POST /api/transcript/add
         ↓
┌─────────────────────────┐
│  FastAPI Backend        │
│  ┌─────────────────┐    │
│  │ IncidentService │    │
│  └────────┬────────┘    │
│           │             │
│    ┌──────▼──────┐      │
│    │ Analyzer    │      │
│    │ (Gemini AI) │      │
│    └──────┬──────┘      │
│           │             │
│    ┌──────▼──────┐      │
│    │ DB Update   │      │
│    │ (Supabase)  │      │
│    └──────┬──────┘      │
│           │             │
│    ┌──────▼──────────┐  │
│    │ WebSocket Emit  │  │
│    │ (to Frontend)   │  │
│    └──────┬──────────┘  │
└───────────┼──────────────┘
            │ WebSocket message
            ↓
┌─────────────────────────┐
│ Next.js Frontend        │
│ ┌─────────────────┐     │
│ │ useAIEvents Hook│     │
│ │ (WebSocket)     │     │
│ └────────┬────────┘     │
│          │              │
│   ┌──────▼──────┐       │
│   │ React State │       │
│   │ Update      │       │
│   └──────┬──────┘       │
│          │              │
│   ┌──────▼──────────┐   │
│   │ Dashboard Re-   │   │
│   │ render (Panels) │   │
│   └──────┬──────────┘   │
│          │              │
│   ┌──────▼──────────┐   │
│   │ Particle Effect │   │
│   │ Animation       │   │
│   └─────────────────┘   │
│                         │
│   USER SEES:            │
│   - Facts Panel         │
│   - Hypotheses Panel    │
│   - Conflicts Panel     │
│   - Actions Panel       │
│   - Risks Panel         │
│   - Particle Animation  │
└─────────────────────────┘
```

---

## 🎯 User Workflow

### **Scenario: Database Goes Down at 2 PM**

```
1. ALARM → Engineer opens Google Meet
2. CAPTURE → Chrome extension auto-starts listening
3. STREAM → Transcripts flow to backend every 2-3 seconds
4. ANALYZE → Gemini parses: "DB is down", "replication lag", "5% user impact"
5. EXTRACT → Facts, Hypotheses, Conflicts extracted
6. BROADCAST → WebSocket sends update to dashboard
7. VISUALIZE → Dashboard shows:
   - Facts: "Database replication lag detected"
   - Hypotheses: "Connection pool exhausted"
   - Conflicts: "John: DB reset needed" vs "Sarah: Check logs first"
   - Actions: "Check primary DB logs" (assigned to Alice)
   - Risks: "Data loss (5 min window)"
8. INTERACT → Engineer says "Hey Sutra, what are top risks?"
9. AI RESPONDS → Agora AI voice: "Top risk: data loss in 5-minute window. Mitigation: rollback to backup."
10. RESOLVE → Actions completed, incident status → RESOLVED
```

---

## 🔧 Configuration & Environment

### **Backend .env**
```env
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
GEMINI_API_KEY=sk-proj-...
CORS_ORIGINS=http://localhost:3000,https://app.sutradhar.io
AGORA_APP_ID=agora-app-id
AGORA_APP_CERTIFICATE=agora-cert
LOG_LEVEL=info
```

### **Frontend .env.local**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_AGORA_APP_ID=agora-app-id
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### **Extension manifest.json**
```json
{
  "permissions": ["activeTab", "scripting", "tabs"],
  "host_permissions": ["<all_urls>"],
  "action": {
    "default_popup": "index.html"
  }
}
```

---

## 🚨 Critical Paths & Performance

### **Low-Latency Requirements**
| Component | Latency Target | Why |
|-----------|----------------|-----|
| Transcript capture to backend | < 500ms | User expects near-instant processing |
| Analysis (Gemini call) | 2-5s | LLM API call + parsing |
| WebSocket broadcast to frontend | < 1s | Real-time dashboard updates |
| Particle animation render | 60 FPS | Smooth visual feedback |
| **Total end-to-end** | **< 10s** | From spoken word to dashboard |

### **Scalability Considerations**
- **Multi-incident support:** Each incident has separate WebSocket connection
- **High-throughput transcripts:** Batch processing to reduce API calls
- **Database indexing:** Key on incident_id, timestamp
- **Caching:** Incident state cached in frontend; invalidate on broadcast
- **Load balancing:** Multiple FastAPI instances behind reverse proxy

---

## 📝 Summary

**Sutradhar** transforms incident response through AI-powered intelligence extraction:

1. **Extension** captures team conversations
2. **Backend** processes with Gemini AI
3. **Database** persists structured intelligence
4. **Frontend** visualizes on cybernetic dashboard
5. **Agora AI** provides interactive voice assistance

All connected via WebSockets for **real-time, collaborative incident management**.

---

## 🎓 Next Steps for Development

1. **To add a new panel:** Create component in `frontend-v2/src/components/`, connect to `useAIEvents` hook
2. **To modify AI behavior:** Edit `backend/app/ai/prompts.py` and test in `backend/test_*.py`
3. **To add new API endpoint:** Create router in `backend/app/api/`, mount in `main.py`
4. **To enhance visualizations:** Edit shaders in `frontend-v2/src/shaders/`
5. **To test end-to-end:** Use `backend/test_endpoints.py` as reference

---

Generated: 2024 — Sutradhar Project Documentation
