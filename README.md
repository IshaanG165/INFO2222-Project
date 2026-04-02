# SyncSpace 

SyncSpace is a high-fidelity prototype of a web-based collaboration platform tailored specifically for university student group projects. It attempts to remove coordination friction by emphasizing individual accountability and clear deadline tracking over standard, unstructured team messaging.

## Project Overview
Current tools like Slack and Discord are excellent for chatting, but terrible for structured coordination. SyncSpace solves this by offering targeted visibility into who is completing assignments, triggering automatic group urgency, and breaking down project tasks step-by-step per team member.

## Features
**Functional Features (Database-Free Persistence)**
- **Deadline Management**: Add deliverables with titles, course associations, assignees, and due dates. Automatic logic triggers a visual alert (Due inside 48h), and tasks can be toggled or deleted.
- **Group Progress Tracker**: Monitor projects featuring nested, individual task checklists. Adding or completing a member's assigned task instantly recalculates completion percentages and repaints individual and overall progress bars.
- **Smart Notification Bell**: Automatically scans all uncompleted deadlines and flashes a pulsing notification at the top right if any deliverable falls within the critical 48-hour window.

**Mock Features (Visual Demonstrations)**
- Sidebar navigation panels (Groups, Messages, Files, Projects)
- Global search bar and Profile Settings
- Team Activity Updates Feed
- Quick stats placeholders

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons & Utils:** `lucide-react`, `clsx`, `tailwind-merge`
- **Data Persistence:** Browser `localStorage` (No backend required)

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)

## Limitations
As a high-fidelity prototype meant to test usability and interface design:
- **No Backend**: All data lives locally inside your browser cache.
- **No Authentication**: The application assumes a simulated session state rather than utilizing secure OAuth.
- **No Real-Time Sync**: Because there is no database, multiple students cannot view live updates from different computers.
- **Mock Routes**: Extraneous items (Messages, Files) are present purely to validate the full UI breadth.
