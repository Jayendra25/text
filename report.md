# Project Report: Ephemeral Text Share Web App ⚡️

## 📖 Overview
This project is a modern, fast, and aesthetically pleasing web application designed entirely for sharing text securely through self-destructing links. Users can paste content (up to 100KB), set an expiration timer (from 1 to 10 minutes), and get a generated URL. The link allows anyone to view and edit the text until it automatically expires and gets wiped from the system permanently.

## 🛠 Tech Stack Used
The application is built completely dynamically using industry-leading modern web technology:

- **Next.js 15 (App Router)**: The core React framework used for server-side rendering, routing (`app/` directory), and backend API points.
- **Tailwind CSS v4**: A utility-first CSS framework providing a sleek, dark-themed styling, background gradients, and responsiveness globally.
- **Framer Motion**: The animation library enabling the fluid component transitions, layout changes, and dynamic interface loads.
- **Lucide-React**: SVG Icon package providing standard, minimalist icons.
- **Node.js (FS API)**: Used within Next.js API Routes to create a custom local database saving JSON files right on the drive.

## 📂 Architecture and File Map
The application is structured into clearly separated frontend routing and backend API routes.

### 1. The Database Schema (`src/lib/db.ts`)
Instead of setting up a heavy relational database server (like PostgreSQL), the system uses a custom-built JSON local "database" (`data.json` inside the project root).
- **Functions:** Exposes `createText`, `getText`, and `updateText`.
- **How it works:** Whenever someone requests a piece of text by its `id`, the server calculates the difference between current time `Date.now()` and its pre-assigned `expiresAt` integer. If the time has exceeded the lifespan, it intentionally fails to return data and deletes the entry from the JSON structure completely.

### 2. The APIs 
- **`src/app/api/texts/route.ts`** (POST endpoint)
  This route takes incoming JSON (`content` and `expiryMinutes`). It performs safety validations tracking whether the textual data exceeds 100kb limits or if the expiry limit exceeds 10 minutes. Then it provisions a 6-character short alphanumeric ID and pipes it functionally to `db.ts` to be saved.
- **`src/app/api/texts/[id]/route.ts`** (GET & PUT endpoints)
  - `GET`: Looks up the database for the short `id` passed in the URL. If the text exists and isn't expired, it resolves and serves the text.
  - `PUT`: Allows an external user accessing the dynamic link to update and edit shared text before the time is up.

### 3. Frontend Views (`src/app/`)
- **`page.tsx` (Homepage Editor)** 
  An aesthetically animated landing layout holding a glass-morphic text area. As the user inputs text and defines the duration, a sleek "Create Secret Link" button is enabled. Submitting issues a `fetch` request securely and shifts the component dynamically into a 'success' state, exposing the active link without jarring browser refreshes.
- **`[id]/page.tsx` (Dynamic Link View)**
  Matches any generated string route (ex: `http://localhost:3000/x7fwa3`). On load, it pings the GET request using Next.js `useParams`.
  - If the link has successfully expired, it returns an "Oops! Text not found or expired" component.
  - If active, it provides an editing interface similar to the homepage and wires a "Save Changes" functionality attached to the Backend `PUT` method.

## 🚀 The Data Flow Experience
1. **Creation:** A user lands on the website -> pastes the target payload -> tweaks the expiration parameter -> hits "Create".
2. **Transfer:** The client makes a `POST` request to the backend. The API trims out a unique identifier, stores everything chronologically in the Node `filesystem` data-structure, and throws the `id` string block (ex: `v7s3w8`) back down to the browser.
3. **Sharing:** The browser mounts the Success Page letting the user click-to-copy.
4. **Resolution:** The receiver clicks the link. The application resolves `/[id]/page.tsx`, checks the API if `Date.now() > expiresAt`. Since it isn't, the user gains instant edit access.
5. **Self-Destruction:** 10 minutes pass. Someone attempts to click the link. The API recognizes expiration instantly and erases the data actively in memory, returning an unrecoverable 404 response to front-end consumers.
