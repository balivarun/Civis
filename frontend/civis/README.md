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
- Auth session is in-memory only, so a page refresh clears the logged-in state.

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` builds the production bundle.
- `npm run lint` runs ESLint.
- `npm run preview` previews the production build locally.
