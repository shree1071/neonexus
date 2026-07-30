# NeoNexus (ScreenAwareTutor)

An AI-powered personalized learning platform designed to enhance educational experiences through intelligent real-time screen analysis, interactive 3D physics simulations, and classroom analytics.

---

## 🚀 Key Features

* **3D Simulation Sandbox** — Interactive, real-time 3D physics models (e.g. Wind Turbine, Robotic Arm) with telemetry sync.
* **Real-time YouTube OCR** — Screen reading to extract math equations and overlay interactive solutions.
* **Confusion Heatmaps** — Visual analytics showing teachers exactly where students are struggling in lessons.

---

## 🛠️ Landing Page & Onboarding Flow

### 1. Front Page Split Layout
The landing page features a modern, clean Vercel-inspired SaaS design:
- **Left Column:** Product values, NVIDIA Nemotron integration badges, and a direct onboarding call-to-action.
- **Right Column:** A live instance of the interactive 3D sandbox wrapped in a browser mockup interface to demonstrate the core simulation experience immediately.

### 2. Multi-Step Onboarding Questionnaire
To customize the learning space, users go through a simple onboarding path:
- **Step 1: Role Selection** — Select either **Student** (to join classes and learn interactively) or **Teacher** (to host sessions and monitor analytics).
- **Step 2: Classroom Code** — Students can enter a classroom code (e.g., `PHYS-101`) to automatically sync progress to their teacher's dashboard.
- **Step 3: Account Creation** — Instantly create an account to save session history and customized simulation parameters.

---

## 💻 Quick Start

```bash
# Clone the repository
git clone https://github.com/shree1071/neonexus.git
cd PersonalLearningPro

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start the development server (runs on port 5001)
npm run dev
```
