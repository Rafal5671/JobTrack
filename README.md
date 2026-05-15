# JobTrack

> A full-stack web application for tracking job applications with a kanban board, reminders, contacts and statistics.
Built with Go (Gin + GORM), React 19 and PostgreSQL.

---

## Build Status

![Platform](https://img.shields.io/badge/platform-Web%20App-blue)
![Frontend](https://img.shields.io/badge/frontend-React%2019-61dafb)
![Backend](https://img.shields.io/badge/backend-Go%20(Gin)-00ADD8)
![Database](https://img.shields.io/badge/database-PostgreSQL-336791)
![Auth](https://img.shields.io/badge/authentication-JWT-green)
![Mail](https://img.shields.io/badge/mail-Mailpit-orange)
![Containerized](https://img.shields.io/badge/docker-enabled-2496ed)
![Language](https://img.shields.io/badge/language-Go%20%2F%20TypeScript-yellow)
![Styling](https://img.shields.io/badge/styling-Tailwind%20CSS%20v4-38bdf8)

---

## Description

JobTrack is a full-stack job search management application that lets you track every stage of your recruitment process in one clean interface. It features a drag-and-drop kanban board for managing application statuses, a contacts CRM for tracking HR contacts and recruiters, a reminder system with email notifications, and a statistics dashboard with charts showing your job search progress.


---

## Features

- User registration and login with JWT authentication
- Drag-and-drop kanban board with 7 application statuses
- Full application detail view with inline editing
- Notes per application with timestamps
- Reminders with email notifications via a background Go worker
- HR contacts CRM with search and LinkedIn integration
- Statistics dashboard with bar chart, pie chart and recruitment funnel
- Form validation with Zod and React Hook Form
- HTML email templates for welcome and reminder notifications
- Dockerized full-stack environment with Podman support

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, React Query, Zustand, React Hook Form, Zod, Recharts, @hello-pangea/dnd
- **Backend:** Go, Gin, GORM, PostgreSQL, JWT, bcrypt
- **Database:** PostgreSQL 16
- **Email:** Mailpit (development), SMTP
- **Containerization:** Docker, docker-compose

---

## Project Structure

```
jobtrack/
├── docker-compose.yml
├── jobtrack-api/                   # Go REST API
│   ├── Dockerfile
│   ├── main.go
│   ├── go.mod / go.sum
│   ├── .env.example
│   ├── templates/
│   │   ├── welcome.html
│   │   └── reminder.html
│   ├── config/
│   │   └── config.go
│   ├── db/
│   │   └── db.go
│   ├── models/
│   │   ├── user.go
│   │   ├── application.go
│   │   ├── contact.go
│   │   ├── note.go
│   │   └── reminder.go
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── applications.go
│   │   ├── contacts.go
│   │   ├── notes.go
│   │   ├── reminders.go
│   │   └── stats.go
│   ├── services/
│   │   ├── auth_service.go
│   │   ├── application_service.go
│   │   ├── contact_service.go
│   │   ├── note_service.go
│   │   ├── reminder_service.go
│   │   ├── stats_service.go
│   │   └── mail_service.go
│   ├── middleware/
│   │   ├── auth.go
│   │   └── cors.go
│   ├── router/
│   │   └── router.go
│   ├── worker/
│   │   └── reminder_worker.go
│   └── utils/
│       └── response.go
└── jobtrack-client/                # React SPA
    ├── Dockerfile
    ├── nginx.conf
    ├── vite.config.ts
    └── src/
        ├── api/
        │   ├── client.ts
        │   ├── auth.ts
        │   ├── applications.ts
        │   ├── contacts.ts
        │   ├── notes.ts
        │   ├── reminders.ts
        │   └── stats.ts
        ├── hooks/
        │   ├── useApplications.ts
        │   ├── useContacts.ts
        │   └── useStats.ts
        ├── store/
        │   └── authStore.ts
        ├── types/
        │   └── index.ts
        ├── constants/
        │   └── board.ts
        ├── components/
        │   ├── Board/
        │   │   ├── KanbanColumn.tsx
        │   │   ├── KanbanCard.tsx
        │   │   └── AddApplicationModal.tsx
        │   └── UI/
        │       └── Layout.tsx
        └── pages/
            ├── Login.tsx
            ├── Register.tsx
            ├── Board.tsx
            ├── Dashboard.tsx
            ├── ApplicationDetail.tsx
            └── Contacts.tsx
```

---

## Architecture

```
┌─────────────┐     HTTP/REST     ┌──────────────────┐     SQL      ┌──────────────┐
│   React     │ ────────────────► │    Go API         │ ──────────► │  PostgreSQL  │
│  Frontend   │                   │   Gin + GORM      │             └──────────────┘
│  :5173      │                   │   (port 8080)     │
└─────────────┘                   └──────────────────┘
                                           │
                                    goroutine worker
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │  Reminder Worker  │
                                  │  (checks hourly)  │
                                  └──────────────────┘
                                           │
                                           ▼
                                     ┌─────────┐
                                     │ Mailpit │
                                     │  :8025  │
                                     └─────────┘
```

---

## Getting Started

### Prerequisites
- Docker
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Rafal5671/JobTrack.git
cd JobTrack
```

### 2. Create `.env` file

```bash
cp jobtrack-api/.env.example jobtrack-api/.env
```

Edit `jobtrack-api/.env` with your values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jobtrack
JWT_SECRET=your-super-secret-key
PORT=8080
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=noreply@jobtrack.local
```

### 3. Run the full stack

```bash
docker-compose up --build
```

### 4. Open in browser

| Service   | URL                        |
|-----------|----------------------------|
| App       | http://localhost:5173      |
| API       | http://localhost:8080/api  |
| Mailpit   | http://localhost:8025      |

---

## API Overview

| Method | Endpoint                                       | Auth     | Description                    |
|--------|------------------------------------------------|----------|--------------------------------|
| POST   | /api/auth/register                             | Public   | Register new user              |
| POST   | /api/auth/login                                | Public   | Login and get JWT token        |
| GET    | /api/auth/me                                   | Required | Get current user profile       |
| GET    | /api/applications                              | Required | List all applications          |
| POST   | /api/applications                              | Required | Create application             |
| GET    | /api/applications/:id                          | Required | Get application with details   |
| PUT    | /api/applications/:id                          | Required | Update application             |
| PATCH  | /api/applications/:id/status                   | Required | Update application status      |
| DELETE | /api/applications/:id                          | Required | Delete application             |
| GET    | /api/applications/:id/notes                    | Required | List notes for application     |
| POST   | /api/applications/:id/notes                    | Required | Create note                    |
| PUT    | /api/applications/:id/notes/:noteID            | Required | Update note                    |
| DELETE | /api/applications/:id/notes/:noteID            | Required | Delete note                    |
| GET    | /api/applications/:id/reminders                | Required | List reminders                 |
| POST   | /api/applications/:id/reminders                | Required | Create reminder                |
| DELETE | /api/applications/:id/reminders/:reminderID    | Required | Delete reminder                |
| GET    | /api/contacts                                  | Required | List all contacts              |
| POST   | /api/contacts                                  | Required | Create contact                 |
| PUT    | /api/contacts/:id                              | Required | Update contact                 |
| DELETE | /api/contacts/:id                              | Required | Delete contact                 |
| GET    | /api/stats                                     | Required | Get dashboard statistics       |

---

## Application Statuses

| Status    | Description                           |
|-----------|---------------------------------------|
| saved     | Job bookmarked, not yet applied       |
| applied   | Application submitted                 |
| screening | Initial contact from recruiter        |
| interview | Interview scheduled                   |
| offer     | Job offer received                    |
| rejected  | Application unsuccessful              |
| withdrawn | Application withdrawn by user         |

---

## Email Notifications

| Event          | Trigger                                          |
|----------------|--------------------------------------------------|
| Welcome email  | User registration                                |
| Reminder email | Background worker when reminder due date passes  |

---

## Environment Variables

| Variable       | Description                        | Default                |
|----------------|------------------------------------|------------------------|
| DB_HOST        | PostgreSQL host                    | localhost              |
| DB_PORT        | PostgreSQL port                    | 5432                   |
| DB_USER        | PostgreSQL user                    | postgres               |
| DB_PASSWORD    | PostgreSQL password                | —                      |
| DB_NAME        | PostgreSQL database name           | jobtrack               |
| JWT_SECRET     | Secret key for signing JWT tokens  | changeme               |
| PORT           | API server port                    | 8080                   |
| SMTP_HOST      | SMTP server host                   | localhost              |
| SMTP_PORT      | SMTP server port                   | 1025                   |
| SMTP_USERNAME  | SMTP username (empty for Mailpit)  | —                      |
| SMTP_PASSWORD  | SMTP password (empty for Mailpit)  | —                      |
| SMTP_FROM      | Sender email address               | noreply@jobtrack.local |

---

##Example Screenshots
<img width="1920" height="918" alt="Screenshot 2026-05-15 at 20-17-04 jobtrack-client" src="https://github.com/user-attachments/assets/3c7abc87-03a1-48b9-9e46-d85920259216" />
<img width="1920" height="918" alt="Screenshot 2026-05-15 at 20-17-13 jobtrack-client" src="https://github.com/user-attachments/assets/e6280f83-32b0-4acb-86b5-b57bb5f51841" />
<img width="1920" height="918" alt="Screenshot 2026-05-15 at 20-17-22 jobtrack-client" src="https://github.com/user-attachments/assets/9cf5277b-5d5c-4cf4-9162-77f8fa717314" />
<img width="1920" height="918" alt="Screenshot 2026-05-15 at 20-17-30 jobtrack-client" src="https://github.com/user-attachments/assets/88514ce0-2a59-4537-8080-ba9de49bc39f" />
<img width="1920" height="918" alt="Screenshot 2026-05-15 at 20-17-35 jobtrack-client" src="https://github.com/user-attachments/assets/30671993-45bd-4cf0-9cea-ec9b643e1aa7" />

