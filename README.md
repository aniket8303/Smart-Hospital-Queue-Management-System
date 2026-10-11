# MediQueue — Smart Hospital Queue Management System

> **Team CodeForge** · VIT Hackathon · Theme 5 — Web & App Development

A real-world, production-ready hospital queue management platform for **Diksha Hospital** that eliminates reception crowding through three seamlessly integrated patient channels — all backed by one central queue engine.

---

## 🏥 The Problem

Patients visiting hospitals often endure two separate queues:
1. **Registration queue** — to get a token number
2. **Waiting queue** — to be called for consultation

After registering, patients repeatedly approach reception asking: *"What is my token? How many are ahead? How long until my turn?"*

## 💡 Our Solution

**One Hospital. One Central Queue. Three Ways to Join.**

| Channel | Patient Type | Token Type |
|---|---|---|
| 🖥️ Reception (Staff-assisted) | No smartphone | Physical printed slip |
| 📱 Mobile Website / QR Code | Has smartphone | Digital mobile pass |
| 🖥️ Self-service Kiosk | Prefers self-service | Print + QR code |

All three channels connect to the **same backend queue engine**. Reception, doctors, patients, and the public hospital display always see the same consistent state.

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 16.3.8** (App Router) + TypeScript
- **Tailwind CSS v4** — utility-first styling
- **Framer Motion v14** — animations & transitions
- **Recharts** — admin analytics charts
- **Lucide React** — consistent iconography
- **Canvas Confetti** — token generation celebration
- **QRCode** — QR code generation for mobile tracking

### Backend
- **Java 17** + **Spring Boot 3.2.4**
- **Spring Web** — REST API
- **Spring Data JPA** + **Hibernate**
- **Spring Security** — RBAC (demo: open, production: JWT)
- **H2 Database** — in-memory for demo; MySQL-ready for production
- **Lombok** — boilerplate reduction
- **Maven** — build management

---

## 🗂️ Project Structure

```
Smart-Hospital-Queue-Management-System/
├── src/                          # Next.js frontend (App Router)
│   ├── app/
│   │   ├── page.tsx              # Landing page (hero + 3-mode cards)
│   │   ├── patient/              # Patient portal — token tracking
│   │   ├── staff/                # Receptionist dashboard
│   │   ├── doctor/               # Doctor console
│   │   ├── admin/                # Admin analytics
│   │   ├── kiosk/                # Touchscreen kiosk (5-step flow)
│   │   ├── queue-display/        # TV/wall public queue display
│   │   └── login/                # Role-based login + 1-click demo
│   ├── components/
│   │   ├── common/               # Navbar, Footer, QR, Modals, Toasts
│   │   ├── patient/              # ActiveQueueCard, QueueTimeline
│   │   ├── staff/                # QueueStatsCards, StaffQueueTable, ReceptionTokenModal
│   │   ├── doctor/               # DoctorConsole
│   │   └── admin/                # AdminCharts
│   ├── context/
│   │   └── QueueContext.tsx      # Central shared state (localStorage + BroadcastChannel)
│   └── lib/
│       ├── types.ts              # TypeScript type definitions
│       ├── demo-data.ts          # Seeded demo queue (A-040 → A-044)
│       ├── network.ts            # LAN IP resolution for QR codes
│       └── audio.ts              # Hospital chime / notification sounds
│
├── backend/                      # Spring Boot backend
│   ├── src/main/java/com/mediqueue/core/
│   │   ├── MediQueueApplication.java
│   │   ├── SecurityConfig.java   # Spring Security (RBAC-ready)
│   │   ├── DemoDataInitializer.java  # Seeds Diksha Hospital data
│   │   ├── entity/               # JPA entities
│   │   ├── repository/           # JPA repositories
│   │   ├── service/              # Business logic
│   │   ├── controller/           # REST controllers
│   │   └── dto/                  # Request/response DTOs
│   └── src/main/resources/
│       └── application.yml       # Config (H2 default, MySQL for prod)
│
├── .env.example                  # Environment variable template (safe to commit)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+**
- **Java 17+** & **Maven 3.8+**
- **MySQL 8+** (optional; H2 is used by default for demo)

### 1. Frontend Setup

```bash
# Clone the repository
git clone https://github.com/Curiousparc_CodeForge/mediqueue.git
cd mediqueue

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server (accessible on local network for QR codes)
npm run dev
# App runs at http://localhost:3000
```

### 2. Backend Setup

```bash
cd backend

# Build the project (downloads dependencies)
mvn clean package -DskipTests

# Run the Spring Boot backend
mvn spring-boot:run

# Backend runs at http://localhost:8080
# H2 Console (dev only): http://localhost:8080/h2-console
```

### 3. Production MySQL Setup

Update `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mediqueue_db?useSSL=false&serverTimezone=Asia/Kolkata
    username: ${MYSQL_USER}
    password: ${MYSQL_PASSWORD}
  jpa:
    database-platform: org.hibernate.dialect.MySQL8Dialect
    hibernate:
      ddl-auto: validate
```

---

## 🎯 Live Demo Walkthrough

### Portals (accessible from navbar)

| Portal | URL | Demo Role |
|---|---|---|
| Patient | `/patient` | Aniket Parekar |
| Staff / Reception | `/staff` | Priya Verma |
| Doctor | `/doctor` | Dr. Priya Sharma |
| Admin Analytics | `/admin` | Dr. Rajesh Mehta |
| Kiosk | `/kiosk` | (self-service) |
| Queue TV Display | `/queue-display` | (public display) |
| Login | `/login` | All roles |

### Demo Credentials (all portals)
- **Staff/Doctor/Admin:** `mediqueue2026`
- **Patient:** `123456`

Use **"1-Click Demo Persona Switcher"** on the login page for instant role switching.

### 5-Step Demo Sequence

1. **Patient Joins (via Kiosk):** `/kiosk` → Select General Medicine → Dr. Priya Sharma → Enter name → Demo Pay ₹300 → Token GM-045 issued
2. **Staff Calls Next:** `/staff` → Click "Call Next Patient" → Token sequence advances
3. **Doctor Consults:** `/doctor` → See patient vitals → Click "Complete Consultation"
4. **Queue Display Updates:** `/queue-display` → Token numbers update in real-time (open in second tab)
5. **Patient Tracks:** `/patient` → Live position + estimated wait + notification history

---

## 🔑 Queue Engine Architecture

```
RECEPTION  ─┐
MOBILE/QR  ─┼──▶  joinQueue()  ──▶  QueueContext  ──▶  localStorage
KIOSK      ─┘              │         BroadcastChannel sync
                           │
                    ┌──────▼──────────────────┐
                    │  Token Generation (GM-042)│
                    │  Position Calculation     │
                    │  Wait Time Estimation     │
                    │  Status Transitions       │
                    │  WAITING→NEXT→IN_CONSULT  │
                    │  →COMPLETED/SKIPPED       │
                    └──────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
      Patient View   Staff Queue    Queue TV Display
      (mobile)       Table          (public screen)
```

**Token Prefix Convention (matching spec):**
- `GM-001` — General Medicine
- `CAR-001` — Cardiology  
- `ORT-001` — Orthopedics
- `PED-001` — Pediatrics
- `DRM-001` — Dermatology

---

## 🔒 Security

### Current (Demo Mode)
- Role isolation via QueueContext (`PATIENT`, `STAFF`, `DOCTOR`, `ADMIN`)
- No private patient information on public queue display
- QR tracking links use opaque session IDs

### Production Hardening Required
- Replace demo auth with Spring Security + JWT
- Restrict `/api/admin/**` to ADMIN role
- Restrict queue state transitions (call, complete, skip) to STAFF/DOCTOR
- Enable HTTPS with SSL certificate
- Validate all inputs on backend (currently done via Bean Validation)
- Use environment variables for all secrets (see `.env.example`)

---

## 🏗️ Backend REST API

Base URL: `http://localhost:8080`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/departments` | List all departments |
| `GET` | `/api/departments/{id}/doctors` | Doctors in department |
| `GET` | `/api/doctors` | All doctors |
| `GET` | `/api/doctors/{id}/availability` | Doctor availability |
| `PUT` | `/api/doctors/{id}/availability` | Update availability |
| `POST` | `/api/queue/tokens` | Create token (any source) |
| `GET` | `/api/queue/active` | Active queue for today |
| `GET` | `/api/queue/{token}` | Specific token status |
| `POST` | `/api/queue/{token}/call` | Call next patient |
| `POST` | `/api/queue/{token}/complete` | Complete consultation |
| `POST` | `/api/queue/{token}/skip` | Skip patient |
| `GET` | `/api/queue/estimate` | Estimate wait time |
| `GET` | `/h2-console` | H2 DB console (dev only) |

---

## 📱 QR Code Mobile Access

1. Start the development server on your machine
2. Note your Wi-Fi IP address (e.g., `10.20.4.229`)
3. Set `NEXT_PUBLIC_LAN_IP=10.20.4.229` in `.env.local`
4. Click **"Scan QR with Mobile"** on the landing page
5. Patients scanning the QR code are taken to `/patient?action=get-token`

---

## 🌐 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-backend-url.com
# NEXT_PUBLIC_DEMO_MODE=true
```

### Backend (Railway / Render / AWS)

```bash
cd backend
mvn clean package -DskipTests

# The JAR is at: backend/target/mediqueue-core-service-2.0.0-SNAPSHOT.jar
java -jar target/mediqueue-core-service-2.0.0-SNAPSHOT.jar

# Environment variables needed:
# MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD, JWT_SECRET
```

---

## 👥 Team CodeForge

| Member | Role |
|---|---|
| **Aniket Parekar** | Team Lead & Full-Stack Developer |
| **Gautam Kuwar** | Frontend Developer |
| **Tejas Kulkarni** | Backend Developer |
| **Shubham Dhobhale** | UI/UX & Integration |

---

## 📄 License

MIT License — Built for VIT Hackathon 2026, Theme 5: Web & App Development.

> **Diksha Hospital** is the demo hospital used in this project. All patient data shown is simulated and does not represent real medical records.
