#!/bin/bash

###############################################################################
# Sutradhar Project - Quick Start Guide
# 
# This script provides quick commands to setup and run the project
# Run: ./quickstart.sh
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing=0
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 not found"
        print_info "Install from: https://www.python.org/downloads/"
        missing=1
    else
        local pyver=$(python3 --version 2>&1 | awk '{print $2}')
        print_step "Python $pyver ✓"
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found"
        print_info "Install from: https://nodejs.org/"
        missing=1
    else
        local nodever=$(node --version)
        print_step "Node.js $nodever ✓"
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found"
        missing=1
    else
        local npmver=$(npm --version)
        print_step "npm $npmver ✓"
    fi
    
    if [ $missing -eq 1 ]; then
        print_error "Please install missing prerequisites"
        return 1
    fi
    
    return 0
}

show_menu() {
    print_header "🌌 Sutradhar - Quick Start"
    
    echo "Choose what you want to do:"
    echo ""
    echo "  1) Setup Backend (Python + FastAPI)"
    echo "  2) Setup Frontend (Next.js)"
    echo "  3) Setup Extension (Chrome)"
    echo "  4) Setup All 3"
    echo "  5) Run Backend"
    echo "  6) Run Frontend"
    echo "  7) Run Backend + Frontend"
    echo "  8) View Project Structure"
    echo "  9) View Architecture"
    echo "  0) Exit"
    echo ""
}

setup_backend() {
    print_header "Setting up Backend 🔧"
    
    if [ ! -d "backend" ]; then
        print_error "backend/ folder not found"
        return 1
    fi
    
    cd backend
    print_step "Installing Python dependencies..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_step "Virtual environment created"
    fi
    
    source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
    pip install -r requirements.txt --quiet
    
    print_step "Python dependencies installed ✓"
    
    if [ ! -f ".env" ]; then
        print_info "Creating .env template..."
        cat > .env << 'EOF'
# Supabase Database
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres

# Google Gemini API
GEMINI_API_KEY=sk-proj-your-api-key

# CORS Origins
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# Agora (Voice AI)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-cert

# Logging
LOG_LEVEL=info
EOF
        print_info ".env created - PLEASE UPDATE WITH YOUR KEYS"
    fi
    
    cd ..
    print_step "Backend setup complete ✓"
}

setup_frontend() {
    print_header "Setting up Frontend 🎨"
    
    if [ ! -d "frontend-v2" ]; then
        print_error "frontend-v2/ folder not found"
        return 1
    fi
    
    cd frontend-v2
    print_step "Installing Node dependencies..."
    
    npm install --silent
    
    print_step "Node dependencies installed ✓"
    
    if [ ! -f ".env.local" ]; then
        print_info "Creating .env.local template..."
        cat > .env.local << 'EOF'
# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Agora
NEXT_PUBLIC_AGORA_APP_ID=your-agora-app-id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF
        print_info ".env.local created - PLEASE UPDATE WITH YOUR KEYS"
    fi
    
    cd ..
    print_step "Frontend setup complete ✓"
}

setup_extension() {
    print_header "Setting up Extension 🎙️"
    
    if [ ! -d "extension-v2" ]; then
        print_error "extension-v2/ folder not found"
        return 1
    fi
    
    cd extension-v2
    print_step "Installing Node dependencies..."
    
    npm install --silent
    
    print_step "Node dependencies installed ✓"
    print_step "Building extension..."
    
    npm run build --silent
    
    print_step "Extension built ✓"
    print_info "To load in Chrome:"
    print_info "  1. Open chrome://extensions"
    print_info "  2. Enable 'Developer mode'"
    print_info "  3. Click 'Load unpacked'"
    print_info "  4. Select: extension-v2/public"
    
    cd ..
    print_step "Extension setup complete ✓"
}

run_backend() {
    print_header "Starting Backend 🚀"
    
    if [ ! -d "backend" ]; then
        print_error "backend/ folder not found"
        return 1
    fi
    
    cd backend
    
    if [ ! -f ".env" ]; then
        print_error ".env file not found in backend/"
        print_info "Run: ./quickstart.sh → select 1 (Setup Backend)"
        return 1
    fi
    
    print_step "Activating virtual environment..."
    source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
    
    print_step "Starting FastAPI server on http://localhost:8000"
    print_info "API docs available at: http://localhost:8000/docs"
    print_info "Press Ctrl+C to stop"
    echo ""
    
    python -m uvicorn app.main:app --reload --port 8000
    
    cd ..
}

run_frontend() {
    print_header "Starting Frontend 🎨"
    
    if [ ! -d "frontend-v2" ]; then
        print_error "frontend-v2/ folder not found"
        return 1
    fi
    
    cd frontend-v2
    
    if [ ! -f ".env.local" ]; then
        print_error ".env.local file not found in frontend-v2/"
        print_info "Run: ./quickstart.sh → select 2 (Setup Frontend)"
        return 1
    fi
    
    print_step "Starting Next.js dev server on http://localhost:3000"
    print_info "Press Ctrl+C to stop"
    echo ""
    
    npm run dev
    
    cd ..
}

run_both() {
    print_header "Starting Backend + Frontend 🚀"
    
    print_info "Starting Backend in background..."
    cd backend
    source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
    python -m uvicorn app.main:app --reload --port 8000 > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    sleep 3
    print_step "Backend started (PID: $BACKEND_PID)"
    
    print_info "Starting Frontend..."
    cd frontend-v2
    npm run dev
    cd ..
}

show_structure() {
    print_header "Project Structure 📂"
    
    cat << 'EOF'
Sutradhar/
├── backend/                     # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py              → FastAPI entry point
│   │   ├── ai/                  → AI/Gemini orchestration
│   │   ├── api/                 → REST & WebSocket endpoints
│   │   ├── db/                  → Database models & connection
│   │   └── services/            → Business logic
│   ├── requirements.txt
│   └── test_*.py                → Unit tests
│
├── frontend-v2/                 # Next.js React Dashboard
│   ├── src/
│   │   ├── app/                 → Pages & routes
│   │   ├── components/          → UI Components
│   │   ├── hooks/               → Custom React hooks
│   │   ├── lib/                 → Utilities
│   │   └── shaders/             → WebGL particle shaders
│   ├── tailwind.config.ts
│   └── package.json
│
└── extension-v2/                # Chrome Extension
    ├── public/
    │   ├── manifest.json        → Extension config
    │   ├── background.js        → Service worker
    │   └── content.js           → Injected script
    ├── src/
    │   ├── App.tsx              → React popup
    │   └── useWebSpeech.ts      → Speech API hook
    └── vite.config.ts

EOF
}

show_architecture() {
    print_header "System Architecture 🏗️"
    
    cat << 'EOF'
┌─────────────────────────────────────────────────────────────┐
│             SUTRADHAR INCIDENT COMMAND CENTER              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Chrome Ext. → FastAPI Backend → Next.js Dashboard        │
│  (Capture)     (Analyze + AI)    (Visualize)              │
│       │               │                │                   │
│       └───────────────┼────────────────┘                   │
│                       ↓                                    │
│                 Supabase PostgreSQL                       │
│                                                             │
│  External: Google Gemini API, Agora Voice AI              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

DATA FLOW:
  1. Chrome Extension captures audio → transcripts
  2. Backend receives transcripts
  3. Gemini AI analyzes → extracts facts, hypotheses, actions
  4. Database stores incident state
  5. WebSocket broadcasts to frontend
  6. Dashboard shows real-time intelligence
  7. Agora AI provides interactive voice assistance

TECHNOLOGIES:
  Backend:  FastAPI, SQLAlchemy, Supabase, Google Gemini, Agora
  Frontend: Next.js, React, Tailwind, Three.js, WebGL shaders
  Ext:      Chrome API, Web Speech API, React

FEATURES:
  ✓ Real-time transcript capture
  ✓ AI-powered analysis
  ✓ Live dashboard with multiple panels
  ✓ Interactive voice AI assistant
  ✓ Particle effect visualizations
  ✓ WebSocket for real-time updates

EOF
}

main() {
    while true; do
        show_menu
        read -p "Enter choice [0-9]: " choice
        
        case $choice in
            1) setup_backend ;;
            2) setup_frontend ;;
            3) setup_extension ;;
            4) 
                setup_backend && setup_frontend && setup_extension
                print_header "✓ All setup complete!"
                print_info "Next step: Configure .env files with your API keys"
                ;;
            5) run_backend ;;
            6) run_frontend ;;
            7) run_both ;;
            8) show_structure ;;
            9) show_architecture ;;
            0) 
                print_header "Goodbye! 👋"
                exit 0
                ;;
            *) 
                print_error "Invalid choice"
                sleep 2
                ;;
        esac
        
        if [ "$choice" != "5" ] && [ "$choice" != "6" ] && [ "$choice" != "7" ]; then
            echo ""
            read -p "Press Enter to continue..."
        fi
    done
}

# Check prerequisites first
if ! check_prerequisites; then
    exit 1
fi

# Run main menu
main
