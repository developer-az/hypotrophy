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
- Add: `GEMINI_API_KEY` = `AIzaSyDdl33nc5BXTdg-gZghU5n3B0l8-pP2C84`
- Redeploy

### 3. Environment Variable Setup:
```
Name: GEMINI_API_KEY
Value: AIzaSyDdl33nc5BXTdg-gZghU5n3B0l8-pP2C84
Environments: ✅ Production ✅ Preview ✅ Development
```

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
