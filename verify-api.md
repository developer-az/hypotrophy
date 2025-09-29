# API Configuration Verification

## Quick Vercel Setup Check

### 1. Test API Health (after deployment):
```
GET https://your-app.vercel.app/api/ai/insights
```

Expected response:
```json
{
  "status": "ok",
  "apiConfigured": true,
  "timestamp": "2025-09-28T..."
}
```

### 2. If apiConfigured is false:
- Go to Vercel Dashboard → Project Settings → Environment Variables
- Add: `GEMINI_API_KEY` = `YOUR_ACTUAL_GEMINI_API_KEY_HERE`
- Redeploy

### 3. Environment Variable Setup:

**For Local Development:**
Create a `.env.local` file in your project root:
```bash
# .env.local
GEMINI_API_KEY=your_actual_api_key_here
```

**For Vercel Deployment:**
```
Name: GEMINI_API_KEY
Value: YOUR_ACTUAL_GEMINI_API_KEY_HERE
Environments: ✅ Production ✅ Preview ✅ Development
```

**Get your API key from:** https://aistudio.google.com/app/apikey

### 4. Common Issues:
- **500 Error**: API key not set in Vercel environment variables
- **404 Error**: API route not deployed (check build logs)
- **Network Error**: CORS or deployment issue

### 5. Debug Commands:
```bash
# Test locally first
curl http://localhost:3000/api/ai/insights

# Test on Vercel
curl https://your-app.vercel.app/api/ai/insights
```

Both should return the same health check response.
