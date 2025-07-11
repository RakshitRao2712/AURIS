# Deployment Instructions

## Issues Fixed

1. **CSS Background Images**: Removed dependency on missing image files by using gradient-only backgrounds
2. **Redirect URLs**: Updated login/register redirects to use dynamic frontend URLs instead of hardcoded localhost:3000

## Steps to Deploy

### 1. Deploy Frontend to Vercel

1. Connect your GitHub repository to Vercel
2. Set your deployment settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Root Directory: `frontend`

### 2. Update Environment Variables

After deployment, update the following:

#### In Vercel Dashboard:
- `NEXT_PUBLIC_API_URL`: `https://auris-production.up.railway.app`
- `NEXT_PUBLIC_BACKEND_URL`: `https://auris-production.up.railway.app`
- `NEXT_PUBLIC_FRONTEND_URL`: `https://your-actual-vercel-domain.vercel.app`

#### In your local files:
1. Update `frontend/lib/config.ts` line 4:
   ```typescript
   const defaultFrontendUrl = isDevelopment ? 'http://localhost:3000' : 'https://your-actual-vercel-domain.vercel.app';
   ```

2. Update `frontend/vercel.json` line 18:
   ```json
   "NEXT_PUBLIC_FRONTEND_URL": "https://your-actual-vercel-domain.vercel.app"
   ```

### 3. Test the Flow

1. Visit your deployed login page
2. Register/login with an account
3. Verify it redirects to your deployed frontend dashboard (not localhost:3000)

## Architecture Overview

- **Backend**: Spring Boot app deployed on Railway (`https://auris-production.up.railway.app`)
  - Handles authentication APIs
  - Serves static homepage
  
- **Frontend**: Next.js app deployed on Vercel (`https://your-domain.vercel.app`)
  - Handles dashboard and user interface
  - Redirects users after login/registration

## Common Issues

- **CSS not loading**: Check that Tailwind CSS is properly configured and building
- **Still redirecting to localhost**: Make sure environment variables are set correctly in Vercel
- **Google OAuth issues**: Ensure your Google OAuth client is configured with the correct redirect URLs

## Alternative Deployment Options

If you prefer to host everything in one place:
1. **Railway**: Deploy the frontend build to Railway alongside your backend
2. **Netlify**: Similar to Vercel but with different configuration
3. **Custom Server**: Serve the Next.js build from your Spring Boot app's static resources
