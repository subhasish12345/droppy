# Droppy - Test Case Matrix

This document outlines the core test cases used to verify the stability and functionality of the Droppy platform.

## 🔑 Authentication
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| AUTH-01 | Standard Login | User logs in with email/password and is redirected to Dashboard. | ✅ Passed |
| AUTH-02 | Google OAuth Login | User clicks "Continue with Google", authenticates, and lands in Dashboard with profile data. | ✅ Passed |
| AUTH-03 | Forgot Password Flow | User requests reset; reset link appears in console/email. | ✅ Passed |
| AUTH-04 | Reset Password Flow | Using the reset link allows password update; new password works on next login. | ✅ Passed |
| AUTH-05 | Guest Login | User joins as Guest; can interact with boards without an email. | ✅ Passed |
| AUTH-06 | Claim Account | Guest successfully upgrades to a full account with email/password. | ✅ Passed |

## 🏠 Dashboard & UI
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| UI-01 | Theme Switching | Selecting a theme (e.g., Teal) updates all primary colors instantly. | ✅ Passed |
| UI-02 | Live Clock Sync | Clock on Dashboard updates every second and shows correct system time. | ✅ Passed |
| UI-03 | Sidebar Navigation | Navigating between Home and Boards correctly switches views. | ✅ Passed |
| UI-04 | Profile Status | Changing status to "Busy" updates the avatar dot and menu text instantly. | ✅ Passed |
| UI-05 | Custom Branding | App correctly renders `logo.png` instead of default SVG across all auth and dashboard views. | ✅ Passed |

## ⚡ Real-Time Collaboration (Multi-User)
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SYNC-01 | Task Movement | Dragging a task in Window A reflects instantly in Window B. | ✅ Passed |
| SYNC-02 | Add Column | Adding a column in Window A appears instantly in Window B. | ✅ Passed |
| SYNC-03 | Rename Column | Renaming a column in Window A updates the title in Window B. | ✅ Passed |
| SYNC-04 | Presence Count | Joining/Leaving a board updates the online user counter correctly. | ✅ Passed |
| SYNC-05 | Rapid Task Sync | Dragging a newly created task immediately (pre-DB sync) succeeds without reverting back to origin. | ✅ Passed |

## 📋 Board & Task Management
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| BOARD-01 | Create Room | Owner can create a new board with an optional password. | ✅ Passed |
| BOARD-02 | Join Room (ID) | User can join an existing room using its unique UUID. | ✅ Passed |
| BOARD-03 | Join Room (PW) | User is prompted for a password when joining a protected room. | ✅ Passed |
| BOARD-04 | Share Room (Smart Copy) | Generates formatted text and conditionally prompts owner to inject the room password. | ✅ Passed |
| TASK-01 | Edit Task Detail | Clicking a task opens the modal; editing title/description saves correctly. | ✅ Passed |
| TASK-02 | Delete Column | Deleting a column removes all tasks and syncs across clients. | ✅ Passed |
| PERM-01 | Viewer Role | A user with "Viewer" role cannot drag tasks or add new columns. | ✅ Passed |

---
*Manual verification completed on local development environment.*
<p align="right">Subhasish Nayak</p>
