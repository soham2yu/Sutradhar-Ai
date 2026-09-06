# 🎬 Sutradhar — Demo Video Script

## 4-Member Incident War Room Simulation

> **Duration:** ~4 minutes
> **Setting:** A fictional e-commerce company "ShopFlash" is experiencing a critical production outage during a flash sale.
> **Purpose:** Showcase every feature of Sutradhar in a realistic, high-pressure scenario.

---

## 🎭 Cast

| Role | Name | Color Tag | Description |
|------|------|-----------|-------------|
| **Incident Commander** | Arjun | 🔴 Red | Senior Engineering Manager leading the war room |
| **Backend Engineer** | Priya | 🟢 Green | Owns the payment microservice |
| **DevOps / SRE** | Ravi | 🔵 Blue | Manages infrastructure, Kubernetes, monitoring |
| **Database Admin** | Meera | 🟡 Yellow | PostgreSQL and Redis specialist |

---

## 📋 Pre-Recording Setup

1. Open **Sutradhar Dashboard** at `localhost:3002` (or deployed URL)
2. Log in → Create a new incident room (e.g. `S-DEMO-001`)
3. Share the room code with all 4 members
4. Each member joins the room on their own browser tab/device
5. Load the **Chrome Extension** and connect it to the room
6. Start screen-recording the **Command Center dashboard** (this is what the audience sees)
7. Each person speaks into their microphone naturally

---

## 🎬 ACT 1 — "The Alarm" (0:00 – 0:45)

> *Dashboard is empty. The 3D Particle Orb is spinning peacefully. All counters show 00.*

**ARJUN (Commander):**
> "Alright team, we have a P1. ShopFlash checkout is completely down during the flash sale. Customers are getting timeout errors on the payment page. I need status from everyone right now."

**PRIYA (Backend):**
> "I'm looking at the payment service logs. I'm seeing a massive spike in 504 Gateway Timeout errors starting about 8 minutes ago. The service itself seems to be running but requests are just hanging."

**RAVI (DevOps):**
> "Kubernetes pods for the payment service are all healthy, no restarts. But I'm seeing CPU at 92% on the database nodes. Something is hammering the database."

> 🎯 **What the audience sees on dashboard:**
> - Live transcript appearing in the AUDIO STREAM panel
> - Sutradhar AI processes and populates:
>   - **Facts Panel:** "504 errors on payment service", "CPU at 92% on DB nodes", "Pods are healthy"
>   - **Risks:** "Payment checkout completely down during flash sale" (critical)

---

## 🎬 ACT 2 — "The Conflict" (0:45 – 1:45)

**MEERA (DBA):**
> "Wait, I'm checking PostgreSQL. There are 847 active connections right now. Our pool limit is 200. Something is leaking connections and not releasing them."

**PRIYA (Backend):**
> "That can't be right. We refactored the connection pooling last week. I tested it thoroughly. The payment service releases connections properly."

**RAVI (DevOps):**
> "Actually Priya, I think Meera might be right. I just checked — the deployment from last Friday changed the connection timeout from 30 seconds to 300 seconds. That's a 10x increase. Connections are being held way too long."

**PRIYA (Backend):**
> "No, that timeout change was intentional. It was for handling slow third-party payment gateway responses. The real problem is probably the database itself being slow."

> 🎯 **What the audience sees on dashboard:**
> - ⚡ **Conflict detected:** "Connection pool issue vs database performance — Priya says pooling is correct, Meera and Ravi say connections are leaking"
> - 🔮 **Hypotheses:** "Connection timeout increase from 30s to 300s causing pool exhaustion" (Ravi), "Database itself is slow" (Priya)
> - The particle text FX renders the latest speech beautifully on screen

---

## 🎬 ACT 3 — "Hey Sutra" (1:45 – 2:30)

**ARJUN (Commander):**
> "This is going in circles. Hey Sutra, based on everything you've heard, what do you think is the most likely root cause?"

> 🎯 **What the audience sees:**
> - Sutradhar AI responds in the **SUTRADHAR AI** panel at the bottom right:
>   - *"Based on the evidence: Meera confirmed 847 active connections against a 200 pool limit. Ravi identified a deployment last Friday that changed connection timeout from 30 to 300 seconds. This 10x timeout increase combined with flash sale traffic volume is the most probable cause of connection pool exhaustion, which is causing the 504 timeouts Priya observed. I recommend testing by temporarily reverting the timeout value."*

**ARJUN (Commander):**
> "Good analysis. Priya, I need you to push a hotfix reverting that timeout back to 30 seconds. Ravi, prepare a canary deployment. Meera, kill the stale connections manually right now to bring the count down."

> 🎯 **Dashboard updates:**
> - ✅ **Actions assigned:**
>   - Priya: "Push hotfix reverting connection timeout to 30s" (critical, pending)
>   - Ravi: "Prepare canary deployment for the hotfix" (high, pending)
>   - Meera: "Kill stale database connections immediately" (critical, pending)
> - 📋 **Decision logged:** "Revert connection timeout from 300s to 30s"

---

## 🎬 ACT 4 — "Resolution" (2:30 – 3:30)

**MEERA (DBA):**
> "I've terminated 640 idle connections. Active count is back down to 195. Database CPU dropping to 45%."

**PRIYA (Backend):**
> "Hotfix is deployed to canary. Payment success rate on canary is back to 99.2%. Timeout errors have stopped completely on canary pods."

**RAVI (DevOps):**
> "Canary looks clean. I'm promoting the hotfix to 100% of production pods now."

**ARJUN (Commander):**
> "Excellent work everyone. Hey Sutra, give me a final status summary."

> 🎯 **Sutradhar responds:**
> - *"Incident resolved. Root cause was connection pool exhaustion triggered by a 10x timeout increase deployed last Friday, amplified by flash sale traffic. Meera manually cleared stale connections. Priya deployed a hotfix reverting the timeout. Payment success rate has recovered to 99.2%. Recommend a post-mortem to review the deployment approval process for connection configuration changes."*

> 🎯 **Final dashboard state:**
> - All panels populated with rich data
> - Timeline shows full chronological event log
> - Actions show mix of ✅ completed and 🔄 in-progress items
> - Risk panel shows "mitigated"

---

## 🎬 ACT 5 — "The Close" (3:30 – 4:00)

> *Camera zooms out to show the full Command Center dashboard in all its glory — the glowing 3D orb, the populated intelligence panels, the live transcript, and the AI response.*

**ARJUN (voiceover):**
> "In under 4 minutes, Sutradhar analyzed our entire conversation, detected the conflict between our engineers, identified the most probable root cause, assigned action items, and guided us to resolution. No one had to take notes. No one had to write a summary. Sutradhar was the invisible string-puller — the Sutradhar — behind our incident response."

> *Sutradhar logo fades in. Tagline: "Your AI Incident Commander."*

---

## 🎥 Recording Tips

1. **Screen record the dashboard** — this is the star of the show. Use OBS or Loom.
2. **Each person speaks from their own device** — demonstrates the multi-user real-time capability.
3. **Leave 3-5 second pauses** between speakers to let the AI panels update visually.
4. **Zoom into specific panels** when they update (Facts, Conflicts, Actions) for dramatic effect.
5. **Keep it natural** — don't read robotically. Real incident calls are messy and that's the point.
6. **The "Hey Sutra" moment** is the climax — pause dramatically after asking, then let the AI response appear.

---

## 💡 Alternative: Solo Recording Mode

If you can't get 4 people, one person can simulate all 4 voices:
1. Open the dashboard
2. Use the **AI Chatbox** at the bottom right to type each person's dialogue manually
3. Or use the Chrome Extension and speak in slightly different tones for each character
4. The AI doesn't care about voice — it only reads the text transcript with speaker names

---

## 🔥 Key Features Showcased in This Demo

| Feature | When It Appears |
|---------|----------------|
| Real-time transcript capture | Act 1 onwards |
| Fact extraction | Act 1 |
| Conflict detection | Act 2 |
| Hypothesis tracking | Act 2 |
| "Hey Sutra" AI voice response | Act 3 & Act 4 |
| Action item assignment | Act 3 |
| Decision logging | Act 3 |
| Risk assessment | Act 1 & Act 4 |
| Timeline generation | Throughout |
| 3D Particle Orb visualization | Background throughout |
| Particle Text FX | Act 2 |
| Multi-user collaboration | Throughout |
