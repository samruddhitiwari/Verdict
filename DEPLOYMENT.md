# VERDICT - Deployment Guide

## Prerequisites

- **Supabase account** ([supabase.com](https://supabase.com))
- **Vercel** or **Render** account
- **OpenRouter account** ([openrouter.ai](https://openrouter.ai))
- **Payment provider** (Dodo Payments / Razorpay)
- **GitHub repository** with your code

---

## Step 1: Supabase Setup

### 1.1 Create Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project** → name it `verdict`
3. Save the database password

### 1.2 Run Migrations
1. Go to **SQL Editor**
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_external_validation.sql`

### 1.3 Enable Google OAuth
1. **Authentication > Providers > Google**
2. Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. Redirect URI: `https://your-project.supabase.co/auth/v1/callback`

### 1.4 Get API Keys
Go to **Settings > API** and copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: OpenRouter Setup

1. Go to [openrouter.ai](https://openrouter.ai)
2. Create API key → `OPENROUTER_API_KEY`
3. Add credits (~$10 for 1000 verdicts)

---

## Option A: Deploy to Vercel (Recommended)

### A.1 Connect Repository
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)

### A.2 Environment Variables
Add in **Settings > Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENROUTER_API_KEY=sk-or-v1-...
DODO_API_KEY=your_key
DODO_WEBHOOK_SECRET=your_secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### A.3 Deploy
1. Click **Deploy**
2. Wait for build (~2 minutes)
3. Your app is live at `your-app.vercel.app`

### A.4 Custom Domain (Optional)
1. **Settings > Domains**
2. Add your domain
3. Update DNS as instructed

---

## Option B: Deploy to Render

### B.1 Create Web Service
1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **New > Web Service**
3. Connect your GitHub repository

### B.2 Configure Build Settings

| Setting | Value |
|---------|-------|
| **Name** | verdict |
| **Region** | Choose closest to users |
| **Branch** | main |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Starter ($7/mo) or Free |

### B.3 Environment Variables
Add in **Environment** tab:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENROUTER_API_KEY=sk-or-v1-...
DODO_API_KEY=your_key
DODO_WEBHOOK_SECRET=your_secret
NEXT_PUBLIC_APP_URL=https://verdict.onrender.com
NODE_ENV=production
```

### B.4 Deploy
1. Click **Create Web Service**
2. Wait for build (~5 minutes)
3. Your app is live at `verdict.onrender.com`

### B.5 Custom Domain
1. Go to **Settings > Custom Domains**
2. Add your domain
3. Update DNS CNAME to `verdict.onrender.com`

---

## Step 3: Post-Deployment

### Update Supabase URLs
1. **Authentication > URL Configuration**
2. Site URL: `https://your-production-domain.com`
3. Add to Redirect URLs: `https://your-production-domain.com/**`

### Configure Webhooks
1. In your payment provider dashboard
2. Webhook URL: `https://your-domain.com/api/webhooks/dodo`
3. Enable `payment.success` events

### Update Google OAuth
Add production callback URL:
`https://your-project.supabase.co/auth/v1/callback`

---

## Environment Variables Reference

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
OPENROUTER_API_KEY=

# Payments
DODO_API_KEY=
DODO_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=
NODE_ENV=production
```

---

## Vercel vs Render Comparison

| Feature | Vercel | Render |
|---------|--------|--------|
| **Free tier** | 100GB bandwidth | 750 hours/mo |
| **Cold starts** | Instant | ~30s on free |
| **Deploy time** | ~2 min | ~5 min |
| **Serverless** | Yes | Optional |
| **Price** | Free → $20/mo | Free → $7/mo |

**Recommendation**: Use **Vercel** for best Next.js performance and instant deployments.

---

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify Node.js version (18+)

### Auth Not Working
- Verify Supabase Site URL matches your domain
- Check Google OAuth redirect URIs

### Payments Not Processing
- Verify webhook URL is publicly accessible
- Check webhook secret matches

### AI Analysis Failing
- Check OpenRouter API key and credits
- View function logs for errors

