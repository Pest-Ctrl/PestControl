# PestControl

> **Intelligent Git-Integrated Bug Tracking, Code Inspection, and Audit Platform**

[![Live Demo](https://img.shields.io/badge/Demo-pstctrl.vercel.app-blue?style=for-the-badge&logo=vercel)](https://pstctrl.vercel.app/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%204-green?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

**PestControl** bridges the gap between conventional bug trackers and source code management. Rather than treating bugs as disconnected text tickets, PestControl binds every issue directly to its root GitHub repository, commit snapshot, file path, and specific line range. Engineers can inspect syntax-highlighted code in context, trace git commit timelines, manage defect lifecycles, and maintain an immutable audit trail.

---

## Live Application

PestControl is deployed and hosted live at:  
**[https://pstctrl.vercel.app/](https://pstctrl.vercel.app/)**

> **Note:** The application is fully hosted in the cloud. You do not need to set up or run local servers to explore PestControl.

---

## Key Features

### 1. Direct Source Code Issue Binding
- **Interactive Code Inspector**: Browse imported repository file trees and view source code with syntax highlighting.
- **Line-Level Defect Tagging**: Select specific code line numbers or ranges when filing a defect to capture the exact code context at a given commit.

### 2. GitHub Synchronization & Commit Timeline
- **Repo Ingestion**: Connect public or private GitHub repositories into workspaces with cached directory file trees (JSONB).
- **Commit Pipeline**: Ingest and deduplicate commit history with author metadata, timestamps, messages, and direct links.
- **Gitline Visualization**: Chronological commit stream allowing teams to view commits alongside associated bug reports.

### 3. Multi-Tenant Workspaces (Spaces)
- Group repositories, team members, and issues into isolated project spaces.
- Cascade management for repos, issues, and audit logs within a space.

### 4. Defect Lifecycle & Issue Tracking
- **Lifecycle States**: `Open` ➔ `InProgress` ➔ `UnderReview` ➔ `Resolved` ➔ `Closed` (with `Reopened` support).
- **Categorization**:
  - **Bug Types**: `Functional`, `Performance`, `Security`, `UI`, `Compatibility`, `Data`.
  - **Severity Levels**: `Critical`, `High`, `Medium`, `Low`.
- **Metadata**: Assignees, reporters, target commit, file path, line range, and deadlines.
- **Discussions**: Threaded comments with author tagging and mention alerts.

### 5. Role-Based Access Control (RBAC)
Four distinct user roles designed for modern engineering workflows:
- **Admin**: Full authority over spaces, user roles, repository imports, and system configurations.
- **Developer**: Claims assigned issues, inspects code, updates defect statuses, comments, and analyzes commit logs.
- **QA Engineer**: Reports defects with precise file/line bindings, verifies fixes, tests resolutions, and reopens/closes issues.
- **Repo Importer**: Connects GitHub repositories to spaces and manages commit history synchronization.

### 6. Audit Logging & In-App Notifications
- **Immutable Audit Trail**: Tracks critical events such as repo imports, issue creation, status transitions, severity adjustments, and deadline changes.
- **Inbox Notifications**: Real-time notifications for task assignments, mentions, and issue state updates.

### 7. Engineering Health & Analytics Dashboard
- Comprehensive metrics including active issues by severity, resolution velocity, commit frequency, and team workload distribution.

---

## Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **NextAuth v5**, **Lucide Icons** |
| **Backend** | **Spring Boot 4**, **Java 25**, **Spring Data JPA**, **Spring Security**, **OAuth2 Resource Server** |
| **Database** | **PostgreSQL** (with `pgcrypto`, custom ENUMs, JSONB trees, UUID primary keys) |
| **Integrations** | **GitHub REST API v3** (Repositories, Trees, Commits) |
| **Testing** | **Playwright** (Frontend E2E & Compliance), **JUnit 5 / Spring Boot Test** (Backend Unit & Integration) |
| **Hosting** | Hosted on **Vercel** ([pstctrl.vercel.app](https://pstctrl.vercel.app/)) |

---

## Database Schema Overview

The underlying PostgreSQL database models the full engineering workflow:
- **`Users`**: User credentials, role (`Roles` enum), OAuth bindings, timestamps.
- **`Space` & `SpaceMembers`**: Multi-tenant workspace partitioning and memberships.
- **`Repo`**: Linked GitHub repositories with default branch, privacy flags, and JSONB `FileTree`.
- **`Commit`**: Commit hashes, commit messages, author details, timestamps, and commit URLs.
- **`Issues`**: Core defect entity linking `Space`, `Repo`, `Commit`, reporter, assignee, status, severity, bug type, `FilePath`, and `LineRange`.
- **`Comments` & `CommentMentions`**: Threaded discussion comments and user mentions.
- **`AuditLog`**: Chronological event logs for accountability and traceability.
- **`Inbox`**: User notifications for system alerts, assignments, and updates.
- **`Tags` & `IssueTags`**: Flexible labeling for issues.

---

## Testing & Git Verification

The repository enforces automated quality gates across both frontend and backend before changes are committed.

### Pre-commit Verification
A Husky pre-commit hook runs both suites automatically:
1. **Frontend Tests**: Playwright compliance and issue creation test suites (`FrontEnd/tests`).
2. **Backend Tests**: JUnit 5 controller, entity, service, and security tests (`backend/src/test`).

### Bypassing Pre-commit Hooks
use ``git commit -m "" --no-verify`` to bypass test cases

---

## Repository Structure

```text
PestControl/
├── FrontEnd/                 # Next.js 16 Web Application
│   ├── app/                  # App Router pages (dashboard, spaces, projects, auth, api)
│   ├── components/           # UI components (CodeViewer, Gitline, FileTree, IssueTable)
│   ├── lib/                  # Utilities, database pool, and auth helpers
│   └── tests/                # Playwright end-to-end and compliance test suites
├── backend/                  # Spring Boot 4 REST API
│   ├── src/main/java/        # Controllers, entities, repositories, services, security
│   └── src/test/java/        # JUnit 5 test suites (controllers, services, entities)
├── DB/                       # Database DDL & Seed scripts
│   └── main.sql              # PostgreSQL schema, enums, triggers, and seed data
├── docs/                     # Additional documentation & diagrams
│   ├── PROJECT_DOCUMENTATION.md # Comprehensive engineering & academic documentation
│   ├── api.md                # GitHub REST API reference
│   └── PestControlERDiagram.jpeg # Entity-Relationship diagram
├── .husky/                   # Git pre-commit hooks
└── README.md                 # Project documentation
```

---

## Roles & Permissions Summary

| Action | Admin | Developer | QA Engineer | Repo Importer |
|---|:---:|:---:|:---:|:---:|
| Manage Spaces & Members | ✅ | ❌ | ❌ | ❌ |
| Import GitHub Repositories | ✅ | ❌ | ❌ | ✅ |
| Sync Commit Histories | ✅ | ❌ | ❌ | ✅ |
| Browse Code & Commits | ✅ | ✅ | ✅ | ✅ |
| Create Issues with Line Binding | ✅ | ✅ | ✅ | ❌ |
| Transition Issue Status | ✅ | ✅ | ✅ | ❌ |
| Close / Reopen Issues | ✅ | ❌ | ✅ | ❌ |
| View Audit Logs & Analytics | ✅ | ✅ | ✅ | ✅ |

---

## License

This project is licensed under the [**MIT License**](LICENSE).

---

## Attribution

Developed by the **Pest-Ctrl** team.
