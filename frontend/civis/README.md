# Civis Frontend

React + TypeScript frontend for the Civis complaint reporting app.

## Development

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Backend Dependency

The frontend expects the Spring Boot backend to be running at `/api`.

Default backend URL in development:

```text
http://localhost:8080/api
```

## Auth and Data Behavior

- Users and complaints are loaded from the backend, not from browser storage.
- The app does not use `localStorage` or `sessionStorage` for app data.
- Access token is kept in memory and attached as `Authorization: Bearer <token>`.
- Session survives refresh through backend-issued HTTP-only refresh-token cookie (`/api/auth/refresh`).
- Complaint APIs require authentication and are scoped to the logged-in user.

## Required Frontend Env

Set on Vercel (or your frontend host):

```env
VITE_API_BASE_URL=https://<your-backend-domain>
```

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` builds the production bundle.
- `npm run lint` runs ESLint.
- `npm run preview` previews the production build locally.
