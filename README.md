# MPESA Messages — Next.js PWA

iOS Messages–style frontend for the `mpesa_message_notification` Django app.

## Features
- iOS dark Messages UI (list + conversation thread)
- Polls `GET /notifications/` every few seconds
- Caller-ID style drop-down popup for every new notification (incl. withdrawals)
- Marks notifications as read via `POST /notifications/<id>/read/`
- Installable PWA (Add to Home Screen, standalone, dark theme)

## Setup
```bash
cp .env.example .env.local
# edit NEXT_PUBLIC_API_BASE to point at your Django server
npm install
npm run dev
```

Open http://localhost:3000

## Auth
The app reads the JWT from `localStorage` under the key set in
`NEXT_PUBLIC_TOKEN_KEY` (default `access_token`) and sends it as
`Authorization: Bearer <token>` on every request. Put your token there
however you already do it, e.g. in the browser console:

```js
localStorage.setItem("access_token", "<your-jwt>")
```

## Backend CORS
Make sure your Django backend allows the frontend origin:

```python
# settings.py (django-cors-headers)
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = False
```

## URL routes consumed
- `GET  {NEXT_PUBLIC_API_BASE}/notifications/`
- `POST {NEXT_PUBLIC_API_BASE}/notifications/<id>/read/`

These match the `urls.py` you provided.

## PWA icons
Replace `public/icons/icon-192.png` and `icon-512.png` with your own
artwork before deploying. Placeholder PNGs are included.

## Build
```bash
npm run build
npm run start
```

The service worker is generated automatically by `next-pwa` in production
builds.
