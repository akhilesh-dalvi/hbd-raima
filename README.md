# Raima Birthday Coupons

A small Vite + React birthday website for Raima, from Akhilesh.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Edit the message and coupons

The personal content is near the top of `src/App.tsx`:

- `birthdayGirl`
- `fromName`
- `birthdayMessage`
- `coupons`

Coupon redemption state is stored in the visitor's browser with `localStorage`.

## Deploy on Vercel

Use the default Vite settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
