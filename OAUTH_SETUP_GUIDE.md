# Google, Facebook, LinkedIn, and Instagram OAuth Authentication Setup

This guide explains how to set up Google, Facebook, LinkedIn, and Instagram OAuth authentication for user registration and login in your social media AI agent application.

## ✅ What's Been Implemented

### Frontend Changes:

- ✅ **AuthForm Component**: Added Google, Facebook, LinkedIn, and Instagram login buttons with proper styling
- ✅ **OAuth Utilities**: Created helper functions for OAuth flows and state management
- ✅ **OAuth Callback Component**: Handles authentication callbacks from all OAuth providers
- ✅ **Routes**: Added `/auth/{provider}/callback` routes for all providers
- ✅ **Security**: Implemented state parameter validation for OAuth flows

### Backend Changes:

- ✅ **OAuth Routes**: Added `/api/auth/oauth/{provider}` endpoints for Google, Facebook, LinkedIn, and Instagram
- ✅ **User Management**: Handles OAuth user creation and existing user linking
- ✅ **Database Schema**: Updated users table to support multiple OAuth providers
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
   - Add authorized redirect URI: `https://4q2ddj89-3000.uks1.devtunnels.ms/auth/google/callback`
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
   - Add Valid OAuth Redirect URI: `https://4q2ddj89-3000.uks1.devtunnels.ms/auth/facebook/callback`
   - For production, add: `https://yourdomain.com/auth/facebook/callback`
   - Enable "Login with the JavaScript SDK"

4. **Get App ID and Secret**:
   - Go to Settings > Basic
   - Copy the App ID and App Secret

### 3. LinkedIn OAuth Setup

1. **Create LinkedIn App**:

   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Click "Create app"
   - Fill in app name, LinkedIn Page, app logo, and legal agreement
   - Click "Create app"

2. **Configure OAuth Settings**:

   - Go to the "Auth" tab
   - Under "Authorized redirect URLs for your app", click "Add redirect URL"
   - Add: `https://yourdomain.com/auth/linkedin/callback`
   - Add for development: `http://localhost:5173/auth/linkedin/callback`

3. **Request Access to Sign In with LinkedIn**:

   - Go to the "Products" tab
   - Find "Sign In with LinkedIn" and request access
   - Wait for LinkedIn to approve your request

4. **Get Client ID and Secret**:
   - Go to the "Auth" tab
   - Copy the Client ID and Client Secret

### 4. Instagram Business Account Setup

1. **Create Instagram App** (requires Facebook app first):

   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Create or select your existing Facebook app
   - Add "Instagram Basic Display" product to your app

2. **Configure Instagram Login**:

   - Go to Settings > Basic in your app
   - Find the "Instagram Basic Display" section
   - Add Valid OAuth Redirect URIs:
     - `https://yourdomain.com/auth/instagram/callback`
     - For development: `http://localhost:5173/auth/instagram/callback`

3. **Instagram API Scopes** (Updated - Effective Jan 27, 2025):

   The Instagram API now requires new scope values. These replace the deprecated `business_*` scopes:

   - `instagram_business_basic` – Access basic business profile information
   - `instagram_business_content_publish` – Publish and get media
   - `instagram_business_manage_comments` – Manage and reply to comments
   - `instagram_business_manage_messages` – Send and receive messages

   **Deprecated scopes (will stop working Jan 27, 2025):**
   - `business_basic`
   - `business_content_publish`
   - `business_manage_comments`
   - `business_manage_messages`

   ⚠️ **Important**: Update your implementation before January 27, 2025, to avoid service disruption.

4. **Get App ID**:
   - Go to Settings > Basic
   - Copy the App ID (you'll need this as `VITE_INSTAGRAM_APP_ID`)

5. **Add Test Users** (for development):
   - Go to Roles > Test Users
   - Add test Instagram business accounts that can authorize your app

6. **Enable Instagram Business Account**:
   - Ensure you're using an Instagram professional/business account
   - The account must be connected to a Facebook Page (for production)
   - Note: Development/testing does not require a linked Facebook Page

### 5. Environment Configuration

Create/update your `.env` files:

**Client `.env` file:**

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=your-facebook-app-id-here
VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id-here
VITE_INSTAGRAM_APP_ID=your-instagram-app-id-here
VITE_APP_URL=http://localhost:5000
```

**Server `.env` file:**

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
FACEBOOK_APP_ID=your-facebook-app-id-here
FACEBOOK_APP_SECRET=your-facebook-app-secret-here
LINKEDIN_CLIENT_ID=your-linkedin-client-id-here
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret-here
INSTAGRAM_APP_ID=your-instagram-app-id-here
INSTAGRAM_APP_SECRET=your-instagram-app-secret-here

# Existing configuration
JWT_SECRET=your-jwt-secret-here
DATABASE_URL=your-database-url-here
```

### 6. Database Migration

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
   - LinkedIn OAuth login
   - Instagram Business OAuth login
3. For OAuth:
   - User clicks provider button
   - Redirected to provider's authorization page
   - After authorization, redirected to `/auth/{provider}/callback`
   - System exchanges code for user profile and access token
   - User is created/updated in database with provider info
   - JWT token is generated and stored
   - User is redirected to dashboard

### Instagram-Specific Features:

Once authenticated with Instagram Business Account, your app can:

- 📸 **Content Publishing** – Get and publish media content
- 💬 **Comment Management** – Manage and reply to comments on media
- 📊 **Media Insights** – Get insights and analytics on media performance
- 🏷️ **Mentions** – Identify media where the user has been @mentioned
- 💌 **Direct Messaging** – Send and receive messages with customers

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
   - Go to `http://localhost:5173/auth` (or your dev URL)
   - Click on any OAuth provider button (Google, Facebook, LinkedIn, or Instagram)
   - Complete authorization flow
   - Verify user is created and logged in

3. **Testing Instagram Business Account**:
   - Use a test Instagram business account (via Meta Developer Console)
   - Or use your own Instagram business/professional account
   - Ensure account has permission to access the development app

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
- ✅ Register/login with LinkedIn
- ✅ Register/login with Instagram Business Account
- ✅ Continue using traditional email/password auth
- ✅ Access all existing features with OAuth accounts

### For Instagram Integration:

1. **Backend Setup** (if not already done):
   - Add endpoints to handle Instagram media API calls
   - Store Instagram access tokens securely
   - Implement media publishing endpoints
   - Add webhook handlers for Instagram events

2. **Frontend Features**:
   - Build Instagram feed display components
   - Add media publishing interface
   - Create analytics dashboard for Instagram insights
   - Implement comment management UI

3. **Environment Variables**:
   - Ensure `VITE_INSTAGRAM_APP_ID` is set before Jan 27, 2025
   - Update any old scope references to new ones
   - Update Instagram API endpoints if using older versions

The OAuth users will seamlessly integrate with your existing onboarding flow and feature set. Instagram business account holders will have access to additional content publishing and management features.
