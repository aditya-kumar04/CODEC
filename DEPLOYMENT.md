# 🚀 CODEC Deployment Guide

## Free Deployment Options

### Option 1: Vercel (Recommended)
**Frontend + Backend**: Vercel (Free)
**Database**: MongoDB Atlas (Free)

#### Step 1: Setup MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (free tier)
4. Get connection string

#### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a random secret
   - `GEMINI_API_KEY`: Your Gemini API key

#### Step 3: Deploy
- Vercel will automatically build and deploy
- Your app will be available at `your-app.vercel.app`

### Option 2: Netlify + Render
**Frontend**: Netlify (Free)
**Backend**: Render (Free)
**Database**: MongoDB Atlas (Free)

#### Frontend (Netlify)
1. Connect GitHub repository to Netlify
2. Build command: `cd client && npm run build`
3. Publish directory: `client/dist`

#### Backend (Render)
1. Connect GitHub repository to Render
2. Build command: `npm install`
3. Start command: `npm start`
4. Add environment variables

## Environment Variables Required
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Random secret for JWT
- `GEMINI_API_KEY`: Google Gemini API key
- `PORT`: 5050 (for Render)

## Post-Deployment Setup
1. Create admin user using the create-admin script
2. Test all features work correctly
3. Set up custom domain (optional)

## Free Tier Limits
- **Vercel**: 100GB bandwidth/month
- **MongoDB Atlas**: 512MB storage
- **Render**: 750 hours/month

Perfect for development and small projects!
