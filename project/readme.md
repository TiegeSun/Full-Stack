# SprintHub MERN Collaboration Platform

SprintHub is a portfolio-ready MERN application for team project delivery. It upgrades the original tutorial goal app into a SaaS-style collaboration workspace with authentication, role-based permissions, project management, task filtering, and analytics.

## Tech Stack

- MongoDB + Mongoose
- Express + Node.js
- React 17 + React Router
- Redux Toolkit + Axios
- JWT authentication with Bearer tokens
- Custom responsive CSS dashboard UI

## Features

- User registration, login, and protected routes
- Multi-user workspaces with `owner` and `member` roles
- Owner-only workspace member management
- Owner-only project create, edit, and delete actions
- Task create, edit, delete, assignment, status, priority, tags, and due dates
- Task search and filters for status, priority, assignee, and due date risk
- Analytics overview with task totals, completion rate, status distribution, priority distribution, overdue count, and upcoming tasks
- Seed script with realistic demo users, projects, and tasks

## Demo Accounts

After running the seed script:

- Owner: `ava@sprinthub.dev` / `password123`
- Member: `noah@sprinthub.dev` / `password123`

## Getting Started

Create `MERN-TUTORIAL/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Install dependencies:

```bash
npm install
npm install --prefix frontend
```

Seed the demo data:

```bash
npm run seed
```

Run the full app:

```bash
npm run dev
```

The React app runs at `http://localhost:3000` and proxies API requests to `http://localhost:5000`.

## API Overview

Authentication:

- `POST /api/users`
- `POST /api/users/login`
- `GET /api/users/me`
- `GET /api/users/search?query=`

Workspaces:

- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/workspaces/:id`
- `PATCH /api/workspaces/:id`
- `DELETE /api/workspaces/:id`
- `POST /api/workspaces/:id/members`
- `DELETE /api/workspaces/:id/members/:memberId`

Projects:

- `GET /api/projects?workspaceId=...`
- `POST /api/projects`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`

Tasks:

- `GET /api/tasks?workspaceId=&projectId=&status=&priority=&assignee=&search=&due=`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

Analytics:

- `GET /api/analytics/overview?workspaceId=...&projectId=...`

## Verification

```bash
node --check backend/server.js
node --check backend/controllers/taskController.js
npm run build --prefix frontend
```

The current dashboard charts are implemented with custom CSS so the app remains buildable even when npm cannot download additional chart packages.
