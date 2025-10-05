# Deployment Guide - Kacchi Bhai Chatbot

This guide covers deploying your Kacchi Bhai chatbot to various platforms.

## Quick Deploy Options

- [Railway](#option-1-railway-recommended) - Easiest, auto-deploys from GitHub
- [Render](#option-2-render) - Free tier available
- [Heroku](#option-3-heroku) - Popular, easy to use
- [Vercel](#option-4-vercel) - For frontend-heavy apps

---

## Prerequisites

Before deploying:
- Code pushed to GitHub
- OpenAI API key ready
- MongoDB Atlas cluster created (for production database)

---

## Option 1: Railway (Recommended)

Railway auto-deploys from GitHub and handles everything.

### Step 1: Sign Up
1. Go to https://railway.app
2. Sign up with GitHub account

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `kacchi-bhai-chatbot` repository
4. Click "Deploy Now"

### Step 3: Add Environment Variables
1. Go to project → "Variables" tab
2. Add these variables:
   ```
   PORT=3000
   MONGODB_URI=your_atlas_connection_string
   ```

### Step 4: Configure Build
Railway auto-detects Node.js. Verify:
- **Build Command**: (leave empty, uses `npm install`)
- **Start Command**: `npm start`

### Step 5: Get Your URL
1. Go to "Settings" tab
2. Under "Domains" → "Generate Domain"
3. Your app will be live at: `your-app.up.railway.app`

**Total Time**: 5 minutes ✅

---

## Option 2: Render

Free tier available with some limitations.

### Step 1: Sign Up
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `kacchi-bhai-chatbot`

### Step 3: Configure Service
```
Name: kacchi-bhai-chatbot
Environment: Node
Region: Choose closest to Bangladesh (Singapore recommended)
Branch: main
Build Command: npm install
Start Command: npm start
Plan: Free
```

### Step 4: Add Environment Variables
In "Environment" section, add:
```
PORT=3000
MONGODB_URI=your_atlas_connection_string
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for first deploy
3. Your URL: `your-app.onrender.com`

**Note**: Free tier sleeps after 15 minutes of inactivity.

---

## Option 3: Heroku

### Step 1: Install Heroku CLI

```bash
brew tap heroku/brew && brew install heroku
```

### Step 2: Login

```bash
heroku login
```

### Step 3: Create App

```bash
cd kacchi-bhai-chatbot
heroku create kacchi-bhai-chatbot
```

### Step 4: Set Environment Variables

```bash
heroku config:set MONGODB_URI="your_atlas_connection_string"
```

### Step 5: Deploy

```bash
git push heroku main
```

### Step 6: Open App

```bash
heroku open
```

Your app: `https://kacchi-bhai-chatbot.herokuapp.com`

---

## Option 4: Vercel

Best for static sites, but works for Node.js with serverless functions.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
cd kacchi-bhai-chatbot
vercel
```

Follow prompts:
- Setup and deploy: Yes
- Scope: Your account
- Link to existing project: No
- Project name: kacchi-bhai-chatbot
- Directory: ./
- Override settings: No

### Step 4: Add Environment Variables

```bash
vercel env add MONGODB_URI
```

Paste your MongoDB connection string when prompted.

### Step 5: Redeploy

```bash
vercel --prod
```

---

## MongoDB Atlas Setup for Production

### 1. Create Production Database

In MongoDB Atlas:
- Go to your cluster
- Click "Connect"
- Select "Connect your application"
- Copy connection string

### 2. Update Connection String

Replace placeholders:
```
mongodb+srv://username:password@cluster.mongodb.net/kacchi_bhau?retryWrites=true&w=majority
```

### 3. Whitelist IPs

**Important**: For production, whitelist your deployment platform's IPs:

**Railway/Render/Heroku**: 
- Go to Atlas → Network Access
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (0.0.0.0/0)
- Confirm

**Security Note**: In production, use specific IP ranges when possible.

---

## Post-Deployment Checklist

After deploying:

- [ ] App loads successfully
- [ ] Can configure OpenAI API key
- [ ] Chatbot responds to messages
- [ ] Database connection works (check /api/health)
- [ ] Reservations save to database
- [ ] Orders save to database
- [ ] All branches selectable
- [ ] SSL certificate active (https://)

### Test Your Deployment

1. **Health Check**:
   ```
   https://your-app-url.com/api/health
   ```
   Should return: `{"status":"ok","database_connected":true}`

2. **Make Reservation**:
   - Open chatbot
   - Book a table
   - Check /api/reservations to verify it saved

3. **Place Order**:
   - Order Kacchi
   - Check /api/orders to verify it saved

---

## Custom Domain Setup

### Railway
1. Go to project → Settings → Domains
2. Click "Custom Domain"
3. Enter your domain (e.g., chat.kacchibhai.com)
4. Add CNAME record in your DNS:
   ```
   CNAME chat.kacchibhai.com → your-app.up.railway.app
   ```

### Render
1. Go to Dashboard → Your Service → Settings
2. Under "Custom Domains" click "Add Custom Domain"
3. Enter domain and follow DNS instructions

### Heroku
```bash
heroku domains:add chat.kacchibhai.com
```
Then add CNAME in your DNS provider.

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| PORT | No | Server port | 3000 |
| MONGODB_URI | Yes | MongoDB connection | mongodb+srv://... |
| NODE_ENV | No | Environment | production |

---

## Troubleshooting

### App Won't Start

**Check logs**:
```bash
# Railway: Check dashboard logs
# Render: View logs in dashboard
# Heroku:
heroku logs --tail
```

Common issues:
- Missing environment variables
- MongoDB connection failed
- Port binding error

### Database Connection Failed

1. Verify MONGODB_URI is correct
2. Check Atlas IP whitelist
3. Verify database user credentials
4. Check connection string format

### API Key Not Working

- Ensure you're setting the key in the web interface (not .env)
- Check OpenAI account has credits
- Verify key starts with `sk-`

---

## Monitoring & Maintenance

### View Logs

**Railway**: Dashboard → Deployments → Logs
**Render**: Dashboard → Logs tab
**Heroku**: `heroku logs --tail`

### Database Monitoring

MongoDB Atlas:
- Go to Cluster → Metrics
- Monitor connections, storage, operations

### Uptime Monitoring

Free services:
- UptimeRobot (https://uptimerobot.com)
- Pingdom (https://pingdom.com)

Set up alerts for downtime.

---

## Scaling

### Vertical Scaling (More Power)

**Railway**: Upgrade plan for more RAM/CPU
**Render**: Switch to paid tier
**Heroku**: Upgrade dyno type

### Horizontal Scaling (More Instances)

**Heroku**:
```bash
heroku ps:scale web=2
```

**Railway/Render**: Configure in dashboard

---

## Cost Estimates

### Free Tiers

| Platform | RAM | Hours/Month | Sleeps? |
|----------|-----|-------------|---------|
| Railway | 512MB | 500 hours | No |
| Render | 512MB | Unlimited | Yes (15min) |
| Heroku | 512MB | 1000 hours | Yes (30min) |
| Vercel | Serverless | Unlimited | No |

### Paid Plans

| Platform | Starting Price | RAM | Features |
|----------|---------------|-----|----------|
| Railway | $5/month | 1GB | Always on |
| Render | $7/month | 512MB | Always on |
| Heroku | $7/month | 512MB | Always on |

**MongoDB Atlas**: Free M0 tier (512MB storage)

---

## Security Best Practices

1. **Environment Variables**: Never commit `.env` to GitHub
2. **API Keys**: Rotate OpenAI keys periodically
3. **Database**: Use strong passwords, enable IP whitelist
4. **HTTPS**: All platforms provide free SSL
5. **Rate Limiting**: Consider adding to prevent abuse

---

## Backup Strategy

### Database Backups

**MongoDB Atlas**:
- Go to Cluster → Backup
- Enable automated backups (free on M10+)
- Manual backups: Database Tools → mongodump

### Code Backups

- Primary: GitHub repository
- Secondary: Download zip regularly
- Tags: Use git tags for versions

---

## Updating Your Deployment

### Railway/Render
Just push to GitHub - auto-deploys:
```bash
git add .
git commit -m "Update"
git push origin main
```

### Heroku
```bash
git push heroku main
```

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Heroku Docs**: https://devcenter.heroku.com
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **OpenAI API**: https://platform.openai.com/docs

---

## Next Steps After Deployment

1. ✅ Test all features in production
2. ✅ Set up monitoring/alerts  
3. ✅ Add custom domain
4. ✅ Configure database backups
5. ✅ Implement Phase 3 (SMS)
6. ✅ Build admin dashboard
7. ✅ Add payment integration

---

**Congratulations on deploying your Kacchi Bhai chatbot! 🎉🍛**
