# Vercel Deployment Troubleshooting Guide

## Current Issue: API 500 Error
The `/api/ai/insights` endpoint is returning a 500 error on Vercel production.

## Step-by-Step Fix Process

### 1. Deploy Current Changes
```bash
git add .
git commit -m "Add enhanced API debugging for Vercel"
git push origin main
```

### 2. Check API Health on Vercel
After deployment, visit:
```
https://your-app.vercel.app/api/ai/insights
```

Expected response should show:
```json
{
  "status": "ok",
  "apiConfigured": true,
  "envKeysFound": 1,
  "keyLength": 39,
  "nodeEnv": "production",
  "timestamp": "2025-09-28T..."
}
```

### 3. If apiConfigured is false:

#### Option A: Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Set:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyDdl33nc5BXTdg-gZghU5n3B0l8-pP2C84`
   - **Environments**: ✅ Production ✅ Preview ✅ Development
6. Click **Save**
7. Go to **Deployments** tab and click **Redeploy** on the latest deployment

#### Option B: Vercel CLI
```bash
npx vercel env add GEMINI_API_KEY production
# Paste: AIzaSyDdl33nc5BXTdg-gZghU5n3B0l8-pP2C84

npx vercel env add GEMINI_API_KEY preview
# Paste: AIzaSyDdl33nc5BXTdg-gZghU5n3B0l8-pP2C84

npx vercel --prod
```

### 4. Test API After Environment Variable Setup

#### Health Check:
```bash
curl https://your-app.vercel.app/api/ai/insights
```

#### API Functionality:
```bash
curl -X POST https://your-app.vercel.app/api/ai/insights \
  -H "Content-Type: application/json" \
  -d '{
    "type": "task",
    "task": {
      "title": "Test task",
      "category": "health",
      "priority": "medium"
    },
    "userHistory": []
  }'
```

### 5. Common Issues & Solutions

#### Issue: "envKeysFound": 0
**Solution**: Environment variable not set in Vercel
- Re-add the environment variable in Vercel dashboard
- Ensure it's enabled for Production environment
- Redeploy after adding

#### Issue: "keyLength": 0 but "envKeysFound": 1
**Solution**: Environment variable exists but empty
- Check the value in Vercel dashboard
- Re-enter the API key: `AIzaSyDdl33nc5BXTdg-gZghU5n3B0l8-pP2C84`

#### Issue: Works in Preview but not Production
**Solution**: Environment variable not enabled for Production
- Edit the environment variable in Vercel
- Check the "Production" checkbox
- Redeploy

### 6. Debugging Steps

#### Check Vercel Function Logs:
1. Go to Vercel Dashboard → Your Project
2. Click on **Functions** tab
3. Click on `/api/ai/insights`
4. Check the logs for error details

#### View Deployment Logs:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check build and runtime logs

### 7. Fallback Solution
If the API still doesn't work, the app will fall back to the enhanced local AI service which provides intelligent responses without requiring the external API.

## Verification Checklist
- [ ] Environment variable added to Vercel
- [ ] Variable enabled for Production environment
- [ ] Redeployed after adding environment variable
- [ ] Health check returns `"apiConfigured": true`
- [ ] POST request to API returns success (not 500)
- [ ] App works end-to-end on Vercel

## Contact Info
If issues persist, check the Vercel function logs and console output for specific error messages.
