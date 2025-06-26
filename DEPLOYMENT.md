# 🚀 Webhook Deployment Guide

Your frontend is already deployed at: **https://aesthetic-tiramisu-fca7d8.netlify.app**

Now you need to deploy the backend webhook server. Here are your options:

## 🎯 Quick Deploy Options

### Option 1: Railway (Recommended - Free Tier Available)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select this repository
5. Railway will automatically detect the `railway.json` config
6. Your webhook will be available at: `https://your-app-name.railway.app/webhook/call-transcription`

### Option 2: Render (Free Tier)
1. Go to [render.com](https://render.com)
2. Sign up and connect GitHub
3. Create new "Web Service"
4. Select this repository
5. Use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: `NODE_ENV=production`

### Option 3: Fly.io (Free Tier)
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run: `fly auth signup`
3. Run: `fly launch` (use the included fly.toml)
4. Your app will be deployed automatically

### Option 4: Docker (Any Provider)
```bash
docker build -t telefonagent-webhook .
docker run -p 3001:3001 telefonagent-webhook
```

## 🔧 After Deployment

1. **Get your webhook URL** from your chosen provider
2. **Update Netlify environment variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add: `VITE_BACKEND_URL` = `https://your-backend-url.com`
   - Redeploy your Netlify site

3. **Configure your AI phone system** to send webhooks to:
   ```
   https://your-backend-url.com/webhook/call-transcription
   ```

## 🧪 Testing Your Webhook

Test if everything works:
```bash
# Test the webhook is alive
curl https://your-backend-url.com/health

# Add a test call
curl -X POST https://your-backend-url.com/api/test-call

# Check if the call appears in your dashboard
```

## 📊 Webhook Endpoints

- `POST /webhook/call-transcription` - Main webhook endpoint
- `GET /api/calls` - Get all calls (used by frontend)
- `GET /health` - Health check
- `POST /api/test-call` - Add test data
- `DELETE /api/calls` - Clear all calls

## 🔒 Security Notes

- The webhook accepts calls from any source (configure IP restrictions if needed)
- CORS is configured for your Netlify domain
- All errors are logged for debugging
- Data is stored in memory (consider a database for production)

## 💡 Next Steps

1. Deploy the backend using one of the options above
2. Update your Netlify environment variables
3. Configure your AI phone system with the webhook URL
4. Test with real calls!

Your webhook URL will be: `https://your-backend-url.com/webhook/call-transcription`