# Droppy - Test Cases & Verification

This document outlines the strict verification tests that have been run and passed on the Droppy application.

## 1. Authentication System
| Scenario | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Registration** | User signs up with valid details | JWT generated, password securely hashed, redirect to Dashboard. | ✅ Passed |
| **Login** | User enters correct email and password | JWT returned and saved locally, redirect to Dashboard. | ✅ Passed |
| **Protected Routes** | Unauthenticated user tries to access `/` or `/b/:id` | Redirected to `/login`. | ✅ Passed |

## 2. Workspace & Board Isolation
| Scenario | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Create Board** | User creates a board with a name and optional password | Board created, user set as admin, redirected to board page. | ✅ Passed |
| **Data Privacy** | User attempts to fetch a board they don't belong to | Backend throws a 403 Forbidden error. | ✅ Passed |
| **Dashboard Fetch** | User loads the dashboard | Only boards where the user is an active member are displayed. | ✅ Passed |

## 3. Room Joining & Passwords
| Scenario | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Join Public Room** | User pastes Room ID with no password | User added to `BoardMember` table, granted access. | ✅ Passed |
| **Join Private Room** | User pastes Room ID with correct password | Password verified against hash, user granted access. | ✅ Passed |
| **Failed Join attempt** | User tries joining private room with wrong password | `401 Invalid password` error returned, access denied. | ✅ Passed |

## 4. Task & Column Management
| Scenario | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Add Task** | User clicks "+ Add Task" and presses Enter | Task appears instantly on screen. | ✅ Passed |
| **Add Column** | User clicks "+ Add Column" and presses Enter | Column appears instantly at the end of the board. | ✅ Passed |

## 5. Real-Time & Optimistic UI
| Scenario | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Drag & Drop** | Move task from "To Do" to "In Progress" | UI updates instantly with no loading delay. | ✅ Passed |
| **Float Math** | Drop task between two existing tasks | DB calculates accurate float `position` to place it precisely. | ✅ Passed |
| **Refresh Page** | User reloads page after moving a task | Task remains in the exact position it was moved to. | ✅ Passed |
| **Multi-tab Sync** | Move task in Tab A | Tab B updates instantly via WebSocket broadcast. | ✅ Passed |
| **Presence System** | 2 tabs open the same board | Header displays `🟢 2 users online`. Closes tab -> updates to `1 user`. | ✅ Passed |
