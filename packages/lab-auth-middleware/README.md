# @panoptical/lab-auth-middleware

Drop-in server-side authorization middleware for independently deployed Panoptical workshop labs (`https://lab1.live-labs.org`, `https://interview.panoptical.org`, etc.).

## Overview

This middleware ensures that **individually deployed lab URLs cannot be accessed simply by sharing or guessing their links**. Every request to your standalone lab server is authenticated and validated against the central Panoptical Authorization API (`POST /api/auth/authorize-lab`).

If a user visits your lab URL without authorization:
1. They are redirected to sign in at `https://live-labs.org/login`.
2. Their token and permissions (`user_lab_access`) are verified server-side.
3. If unauthorized, they receive a **403 Forbidden - Access Denied** page instantly.

---

## Installation

```bash
npm install @panoptical/lab-auth-middleware
```

*(Or link locally via `npm link` during platform development).*

---

## Usage with Express / Node.js

```javascript
const express = require("express");
const { createLabAuthMiddleware } = require("@panoptical/lab-auth-middleware");

const app = express();

// Protect all routes with Panoptical Central Authorization
app.use(
  createLabAuthMiddleware({
    centralAuthUrl: "https://live-labs.org/api/auth/authorize-lab",
    loginUrl: "https://live-labs.org/login",
    labId: "lab1", // Or your lab slug / domain name
  })
);

// Your protected lab routes below
app.get("/", (req, res) => {
  res.send(`<h1>Welcome to Lab 1, ${req.labUser.name}!</h1>`);
});

app.listen(3001, () => console.log("Lab server running on 3001"));
```

---

## How It Works

```text
User Visits Lab URL (e.g. https://lab1.live-labs.org)
                 │
                 ▼
     Extract Token (cookie / query)
                 │
         ┌───────┴───────┐
         ▼               ▼
     No Token        Has Token
         │               │
         ▼               ▼
   Redirect to     POST /api/auth/authorize-lab
  Central Login          │
                 ┌───────┴───────┐
                 ▼               ▼
            Authorized     Unauthorized
                 │               │
                 ▼               ▼
             Load Lab      403 Forbidden
                           (Access Denied)
```
