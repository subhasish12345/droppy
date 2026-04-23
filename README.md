# Droppy

Droppy is a real-time, optimistic Kanban board application that allows teams to collaborate seamlessly. Built with modern web technologies, it features instantaneous drag-and-drop mechanics, live user presence tracking, and password-protected collaboration rooms.

## Tech Stack
- **Frontend**: React, Zustand (State Management), Tailwind CSS, dnd-kit (Drag & Drop), Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO, Prisma ORM.
- **Database**: PostgreSQL.

## Features
- 🚀 **Optimistic UI**: Instant updates before server verification.
- 🔄 **Real-Time Sync**: Multi-tab synchronization using WebSockets.
- 🔐 **Secure Rooms**: Invite-only and password-protected collaborative boards.
- 🟢 **Live Presence**: Track exactly how many users are viewing a board in real-time.

---

## 🛠️ Setup & Installation

Follow these steps to get Droppy running on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/subhasish12345/droppy.git
cd droppy
```

### 2. Setup the Backend
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with your database configuration and JWT secret:
```env
DATABASE_URL="your_postgresql_database_url"
DIRECT_URL="your_postgresql_direct_url"
JWT_SECRET="your_secret_key"
PORT=5000
```

Initialize the database:
```bash
npx prisma db push
```

Start the backend server:
```bash
npm run dev
```
*(The backend will run on `http://localhost:5000`)*

### 3. Setup the Frontend
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```
*(The frontend will run on `http://localhost:5173`)*

### 4. Usage
Open `http://localhost:5173` in your browser. Register an account, create a new workspace (room), and share the Room ID with your friends to start collaborating in real-time!

---
