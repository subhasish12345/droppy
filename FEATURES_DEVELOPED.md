# Droppy - Features Developed

Droppy is a professional-grade, real-time collaborative Kanban platform inspired by the clean aesthetics of Zoom and Canva.

## 🔐 Authentication & Security
- **Google OAuth 2.0**: Seamless login using Google accounts via Passport.js.
- **Secure Password Reset**: Token-based password recovery system using JWT and Nodemailer for email delivery.
- **JWT Session Management**: Robust authentication using JSON Web Tokens.
- **Guest-to-User Flow**: Allows users to try the platform as a guest and later claim their account with a real email and password.
- **Password Hashing**: Secure storage using bcrypt.

## 🎨 Premium UI/UX (Zoom-Inspired)
- **Dynamic Theming Engine**: Support for 4 curated themes (Classic Indigo, Violet, Teal, Rose) using CSS variables.
- **Professional Dashboard**:
    - **Live Clock**: Real-time updating clock with date.
    - **Sidebar Navigation**: Sleek, slim sidebar for quick access to Home, Boards, and Settings.
    - **Quick Actions**: Large, accessible cards for "New Room" and "Join Room".
    - **Workspace Stats**: High-level overview of total rooms, recent activity, and membership status.
- **Glassmorphic Design**: Modern aesthetics with subtle blurs, smooth gradients, and premium shadows.
- **Custom Branding**: Supports dynamic injection of custom user logos for favicons, login pages, and sidebar headers.
- **Responsive Layout**: Designed to work across different screen sizes.

## ⚡ Real-Time Collaboration
- **Socket.IO Integration**: Instant synchronization of all board changes across all connected clients.
- **Optimistic UI Updates**: "Fire-and-forget" synchronization logic ensures 0ms latency for user actions like moving tasks or adding columns.
- **Race-Condition Prevention**: Intelligently locks drag-and-drop handles for milliseconds during active database syncs to prevent state desynchronization.
- **Presence Tracking**: Real-time indicator of how many users are currently online in a board.
- **Status Indicators**: Users can set their status (Available, Busy, Do Not Disturb, Away, Out of Office) which updates in real-time.

## 📋 Kanban & Project Management
- **Workspace/Room Management**: Create password-protected rooms or open collaboration spaces.
- **Column Operations**:
    - **Add Column**: Instant creation with optimistic UI.
    - **Rename Column**: Inline editing with real-time sync.
    - **Delete Column**: Permanent removal with confirmation.
- **Task Operations**:
    - **Add Task**: Quick-add feature within columns.
    - **Task Detail Modal**: Detailed view to edit titles and descriptions.
    - **Drag & Drop**: Smooth, performant task movement between and within columns.
    - **Delete Task**: Easy removal from the task modal.
- **Permission System**:
    - **Owner**: Full control over board settings and members.
    - **Editor**: Can add, edit, and move tasks/columns.
    - **Viewer**: Read-only access to view boards without making changes.
- **Smart Sharing**: "Share Room" feature generates formatted clipboard text (with intelligent prompts to optionally securely inject the room password) for easy sharing on WhatsApp/Slack.

## ⚙️ Advanced Settings
- **General Tab**: Manage global workspace theme and view application version.
- **Account Tab**: Update display name, view masked email, and change password.
- **Modals**: Integrated Help (shortcuts/tips) and Language selection modals.

---
*Developed with precision for a premium collaborative experience.*
<p align="right">Subhasish Nayak</p>
