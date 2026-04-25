# Jobplotter — Frontend

Jobplotter is the intelligent way to navigate the modern job market. Plot your path to the perfect role with data-driven matches and ATS-ready resumes.

This repository contains the Jobplotter web frontend: a React + Vite single-page app with the resume builder, job board, dashboard, and pricing flows.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui + Base UI (Radix successor)
- React Router v7
- Framer Motion

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```
   npm install
   ```
2. Copy the env file and adjust as needed:
   ```
   cp .env.example .env.local
   ```
3. Start the dev server:
   ```
   npm run dev
   ```

The app runs on http://localhost:3000.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — build for production into `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — type-check with `tsc --noEmit`
- `npm run clean` — remove the `dist/` directory
