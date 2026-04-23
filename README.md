# Droppy

Droppy is a professional, real-time collaborative Kanban platform designed for high-performance team collaboration. Featuring a premium Zoom-inspired interface, it offers seamless task management with instant synchronization.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (or a Supabase instance)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/subhasish12345/droppy.git
   cd droppy
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   DATABASE_URL="your_postgresql_url"
   DIRECT_URL="your_direct_url"
   JWT_SECRET="your_secret_key"
   FRONTEND_URL="http://localhost:5173"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   EMAIL_USER="your_gmail@gmail.com"
   EMAIL_PASS="your_app_password"
   ```
   Run migrations:
   ```bash
   npx prisma db push
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start Backend**:
   ```bash
   cd backend
   node src/index.js
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## ✨ Key Features
- **Real-Time Sync**: Powered by Socket.IO for 0ms collaborative lag.
- **Google OAuth**: One-click secure login.
- **Dynamic Themes**: Curated color palettes with persistence.
- **Advanced Permissions**: Owner, Editor, and Viewer roles.
- **Live Dashboard**: Interactive sidebar, live clock, and workspace stats.
- **Optimistic UI**: Instant updates for a buttery-smooth experience with drag-race-condition prevention.
- **Smart Sharing**: Share rooms directly with formatted clipboard text and optional password injection.
- **Custom Branding**: Integrated custom logo injection for a personalized aesthetic.

## 🛠️ Developed By
Developed with ❤️ for a premium collaboration experience.

---
<p align="right">antigravity</p>
