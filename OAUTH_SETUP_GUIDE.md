# Google and Facebook OAuth Authentication Setup

This guide explains how to set up Google and Facebook OAuth authentication for user registration and login in your social media AI agent application.

## ✅ What's Been Implemented

### Frontend Changes:
- ✅ **AuthForm Component**: Added Google and Facebook login buttons with proper styling
- ✅ **OAuth Utilities**: Created helper functions for OAuth flows and state management
- ✅ **OAuth Callback Component**: Handles authentication callbacks from Google/Facebook
- ✅ **Routes**: Added `/auth/google/callback` and `/auth/facebook/callback` routes
- ✅ **Security**: Implemented state parameter validation for OAuth flows

### Backend Changes:
- ✅ **OAuth Routes**: Added `/api/auth/oauth/google` and `/api/auth/oauth/facebook` endpoints
- ✅ **User Management**: Handles OAuth user creation and existing user linking
- ✅ **Database Schema**: Updated users table to support OAuth providers
- ✅ **JWT Integration**: OAuth users get the same JWT tokens as regular users

### Database Changes:
- ✅ **Users Table**: Added `oauth_provider`, `oauth_id`, `avatar_url`, `email_verified` fields
- ✅ **Migration Script**: Created SQL migration to update existing database

## 🛠 Setup Instructions

### 1. Google OAuth Setup

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
   - For production, add your domain: `https://yourdomain.com/auth/google/callback`

4. **Get Client ID and Secret**:
   - Copy the Client ID and Client Secret

### 2. Facebook OAuth Setup

1. **Create Facebook App**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "Create App" > "Consumer" > "Next"
   - Enter app name and contact email

2. **Add Facebook Login**:
   - In app dashboard, click "Add Product"
   - Find "Facebook Login" and click "Set Up"

3. **Configure OAuth Settings**:
   - Go to Facebook Login > Settings
   - Add Valid OAuth Redirect URI: `http://localhost:3000/auth/facebook/callback`
   - For production, add: `https://yourdomain.com/auth/facebook/callback`
   - Enable "Login with the JavaScript SDK"

4. **Get App ID and Secret**:
   - Go to Settings > Basic
   - Copy the App ID and App Secret

### 3. Environment Configuration

Create/update your `.env` files:

**Client `.env` file:**
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=your-facebook-app-id-here
VITE_APP_URL=http://localhost:5000
```

**Server `.env` file:**
```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
FACEBOOK_APP_ID=your-facebook-app-id-here
FACEBOOK_APP_SECRET=your-facebook-app-secret-here

# Existing configuration
JWT_SECRET=your-jwt-secret-here
DATABASE_URL=your-database-url-here
```

### 4. Database Migration

Run the database migration to add OAuth fields:

```bash
# If using PostgreSQL directly
psql -d your-database-name -f server/migrations/add-oauth-fields.sql

# Or if using a migration tool, add the migration
npm run migrate
```

### 5. Install Dependencies

Make sure you have the required dependencies:

```bash
# Server dependencies (if not already installed)
cd server
npm install node-fetch crypto

# Client dependencies should already be installed
cd client
npm install
```

## 🚀 How It Works

### User Flow:
1. User visits `/auth` page
2. User can choose between:
   - Traditional email/password registration/login
   - Google OAuth login
   - Facebook OAuth login
3. For OAuth:
   - User clicks Google/Facebook button
   - Redirected to provider's authorization page
   - After authorization, redirected to `/auth/{provider}/callback`
   - System exchanges code for user profile
   - User is created/updated in database
   - JWT token is generated and stored
   - User is redirected to dashboard

### Technical Details:
- **State Parameter**: Used for CSRF protection during OAuth flows
- **User Linking**: If user with same email exists, OAuth info is added to existing account
- **JWT Compatibility**: OAuth users get same JWT tokens as regular users
- **Avatar Support**: User's profile picture from OAuth provider is stored
- **Email Verification**: OAuth users are considered verified by default

## 🧪 Testing

1. **Start your application**:
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev

   # Terminal 2 - Client
   cd client
   npm run dev
   ```

2. **Test OAuth flows**:
   - Go to `http://localhost:3000/auth`
   - Click Google or Facebook login buttons
   - Complete authorization flow
   - Verify user is created and logged in

## 🔧 Configuration Options

### OAuth Button Visibility:
The OAuth buttons only show if the respective client IDs are configured:
- Google button shows if `VITE_GOOGLE_CLIENT_ID` is set
- Facebook button shows if `VITE_FACEBOOK_APP_ID` is set

### Redirect URIs:
For production deployment, update redirect URIs in:
1. Google Cloud Console (for Google OAuth)
2. Facebook Developer Console (for Facebook OAuth)
3. Update `redirectUri` in `src/utils/authOAuth.ts` if needed

## 🔒 Security Features

- **State Parameter Validation**: Prevents CSRF attacks
- **JWT Token Generation**: Same security as regular user authentication
- **Email Uniqueness**: Prevents duplicate accounts with same email
- **Secure Token Exchange**: Uses server-side OAuth flow (not client-side)

## 📝 Database Schema

The users table now supports:
```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NULL, -- Optional for OAuth users
  name TEXT NOT NULL,
  oauth_provider TEXT NULL, -- 'google' | 'facebook'
  oauth_id TEXT NULL, -- Provider's user ID
  avatar_url TEXT NULL, -- Profile picture URL
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🎯 Next Steps

Your OAuth authentication is now fully implemented! Users can:
- ✅ Register/login with Google
- ✅ Register/login with Facebook  
- ✅ Continue using traditional email/password auth
- ✅ Access all existing features with OAuth accounts

The OAuth users will seamlessly integrate with your existing onboarding flow and feature set.
