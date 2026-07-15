# Panoptical Labs Ecosystem

A modern enterprise-grade web application serving as a centralized gateway for all programs, courses, and externally deployed labs across multiple domains and subdomains.

## Project Vision

The platform acts as a single unified portal where users can discover programs, courses, and labs, while administrators manage the entire ecosystem from one centralized dashboard. 

It handles multiple labs deployed on different domains (e.g., `ai.panoptical.org`, `nano.panoptical.org`) connecting them to this central platform through a unified authentication and authorization system.

## Key Features

- **Public Homepage**: Premium, enterprise-level entry point showcasing featured labs and programs.
- **Single Sign-On (SSO)**: Centralized authentication allowing users to register and login once to access authorized resources across the ecosystem.
- **Role-Based Access Control (RBAC)**: Support for Super Admin, Program Manager, Lab Manager, Support Manager, and Users.
- **Master Control Center**: Powerful administration panel to manage users, labs, access requests, and monitor system health.
- **Lab Discovery & Management**: Centralized registry of all external labs with their statuses, domains, and visibility settings.
- **User Dashboard**: Dedicated portals where students see only authorized labs and can request access to restricted ones.

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, ShadCN UI, Framer Motion
- **Backend**: Next.js App Router (Server Actions / API Routes), NextAuth.js
- **Database**: Prisma ORM with SQLite (Easily swappable to PostgreSQL)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Platform Gateway: `http://localhost:3000`
   - Registration: `http://localhost:3000/register` (The first registered user is automatically a SUPER_ADMIN)
   - Login: `http://localhost:3000/login`
   - Admin Panel: `http://localhost:3000/admin`
