# Telefonagent Dashboard

Ein KI-gestütztes Dashboard zur Auswertung von Telefonanrufen.

## 🚀 Deployment Setup

### Frontend (Netlify)
Das Frontend wird automatisch auf Netlify deployed.

### Backend Deployment Optionen

#### Option 1: Railway (Empfohlen)
1. Gehen Sie zu [railway.app](https://railway.app)
2. Erstellen Sie ein neues Projekt
3. Verbinden Sie Ihr GitHub Repository
4. Railway erkennt automatisch die `railway.json` Konfiguration
5. Das Backend wird automatisch deployed

#### Option 2: Render
1. Gehen Sie zu [render.com](https://render.com)
2. Erstellen Sie einen neuen Web Service
3. Verbinden Sie Ihr Repository
4. Build Command: `npm install`
5. Start Command: `node server.js`

#### Option 3: IONOS VPS
1. Mieten Sie einen VPS bei IONOS
2. Installieren Sie Node.js (Version 18+)
3. Laden Sie den Code hoch
4. Installieren Sie PM2: `npm install -g pm2`
5. Starten Sie den Server: `pm2 start server.js`

## 🔧 Konfiguration

### Environment Variables

**Frontend (Netlify):**
- `VITE_BACKEND_URL`: URL Ihres Backend-Servers

**Backend:**
- `PORT`: Server Port (automatisch von Hosting-Provider gesetzt)
- `NODE_ENV`: production/development
- `FRONTEND_URL`: URL Ihres Frontend (optional)

### Webhook URL
Nach dem Backend-Deployment ist Ihr Webhook verfügbar unter:
`https://your-backend-url.com/webhook/call-transcription`

## 📊 API Endpoints

- `GET /health` - Health Check
- `GET /api/calls` - Alle Anrufe abrufen
- `POST /webhook/call-transcription` - Webhook für neue Anrufe
- `DELETE /api/calls` - Alle Anrufe löschen (Test)
- `POST /api/test-call` - Test-Anruf hinzufügen

## 🧪 Testing

Testen Sie das System mit:
```bash
curl -X POST https://your-backend-url.com/api/test-call
```

## 💰 Kostenberechnung

- Kosten pro Minute: €0.29
- Sekundengenaue Abrechnung
- Automatische Kostenberechnung im Dashboard