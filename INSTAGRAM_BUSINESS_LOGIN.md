# Instagram Business Login - Complete Implementation Guide

## Overview
This guide provides the complete backend implementation for Instagram Business Login OAuth, including the 4-step token exchange flow for obtaining long-lived access tokens.

## Reference
Based on [Instagram Business Login Documentation](https://developers.instagram.com/docs/instagram-api/guides/getting-started/)

---

## Complete OAuth Flow

```
1. User clicks Instagram login button
   ↓
2. Frontend redirects to: https://www.instagram.com/oauth/authorize
   ↓
3. User authorizes app with requested scopes
   ↓
4. Instagram redirects to: https://yourapp.com/auth/instagram/callback?code=...&state=...
   ↓
5. Backend exchanges code for SHORT-LIVED token (valid ~60 min)
   ↓
6. Backend exchanges SHORT-LIVED token for LONG-LIVED token (valid 60 days)
   ↓
7. Backend fetches user profile and business account info
   ↓
8. Backend stores credentials and returns JWT token to frontend
```

---

## Step 1: Authorization Request (Frontend)

Frontend redirects user to Instagram's authorization endpoint:

```
GET https://www.instagram.com/oauth/authorize
  ?client_id=YOUR_INSTAGRAM_APP_ID
  &redirect_uri=https://yourapp.com/auth/instagram/callback
  &response_type=code
  &scope=instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments
  &state=STATE_VALUE
```

**Query Parameters:**
- `client_id` - Your Instagram App ID
- `redirect_uri` - Must match callback URL registered in Meta Dashboard
- `response_type` - Always "code"
- `scope` - Comma-separated permissions (new scope names effective Jan 27, 2025)
- `state` - Random value for CSRF protection

**User authorizes** → Instagram redirects back to callback with authorization code

---

## Step 2: Exchange Authorization Code for Short-lived Token

After user authorizes, Instagram redirects to your callback URL with an authorization code.

**Endpoint:** `POST https://api.instagram.com/oauth/access_token`

### Backend Implementation

```javascript
async function getShortLivedToken(code, redirectUri) {
  try {
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_INSTAGRAM_CLIENT_ID,
        client_secret: process.env.VITE_INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      })
    });
    
    const data = await response.json();
    
    if (data.error_type) {
      throw new Error(`Instagram Error: ${data.error_message} (Code: ${data.code})`);
    }
    
    if (!data.data || !data.data[0]) {
      throw new Error('Invalid response from Instagram API');
    }
    
    const result = data.data[0];
    
    return {
      accessToken: result.access_token,
      userId: result.user_id,
      permissions: result.permissions
    };
    
  } catch (error) {
    console.error('Short-lived token exchange failed:', error);
    throw error;
  }
}
```

**Response Example:**
```json
{
  "data": [
    {
      "access_token": "EAACEdEose0cBAJZBZA...",
      "user_id": "1020...",
      "permissions": "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments"
    }
  ]
}
```

**Note:** Short-lived tokens expire in approximately 60 minutes.

---

## Step 3: Exchange Short-lived Token for Long-lived Token (IMPORTANT)

To get a token valid for 60 days, exchange the short-lived token:

**Endpoint:** `GET https://graph.instagram.com/access_token`

### Backend Implementation

```javascript
async function getLongLivedToken(shortLivedToken) {
  try {
    const url = new URL('https://graph.instagram.com/access_token');
    url.searchParams.append('grant_type', 'ig_exchange_token');
    url.searchParams.append('client_secret', process.env.VITE_INSTAGRAM_CLIENT_SECRET);
    url.searchParams.append('access_token', shortLivedToken);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Token exchange failed: ${data.error.message}`);
    }
    
    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in, // Seconds until expiration (approx 5,184,000 for 60 days)
      expiryDate: new Date(Date.now() + data.expires_in * 1000)
    };
    
  } catch (error) {
    console.error('Long-lived token exchange failed:', error);
    throw error;
  }
}
```

**Response Example:**
```json
{
  "access_token": "EAACEdEose0cBAJZBZA...",
  "token_type": "bearer",
  "expires_in": 5184000
}
```

**Key Points:**
- This token is valid for 60 days (~5,184,000 seconds)
- Must be kept secure on backend
- Can be refreshed to extend validity another 60 days

---

## Step 4: Fetch User Profile Information

Get details about the Instagram business account:

**Endpoint:** `GET https://graph.instagram.com/{user_id}`

### Backend Implementation

```javascript
async function getInstagramBusinessProfile(userId, accessToken) {
  try {
    const url = new URL(`https://graph.instagram.com/${userId}`);
    url.searchParams.append('fields', 'username,name,biography,profile_picture_url,website,ig_metadata');
    url.searchParams.append('access_token', accessToken);
    
    const response = await fetch(url.toString());
    const profile = await response.json();
    
    if (profile.error) {
      throw new Error(`Profile fetch failed: ${profile.error.message}`);
    }
    
    return {
      id: userId,
      username: profile.username,
      name: profile.name,
      biography: profile.biography || '',
      profilePicture: profile.profile_picture_url,
      website: profile.website || ''
    };
    
  } catch (error) {
    console.error('Failed to fetch Instagram profile:', error);
    throw error;
  }
}
```

---

## Step 5: Get Instagram Business Account ID

Optional but recommended for accessing business-specific APIs:

**Endpoint:** `GET https://graph.instagram.com/{user_id}/instagram_business_account`

### Backend Implementation

```javascript
async function getInstagramBusinessAccountId(userId, accessToken) {
  try {
    const url = new URL(`https://graph.instagram.com/${userId}/instagram_business_account`);
    url.searchParams.append('access_token', accessToken);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.error) {
      console.warn('Business account not found:', data.error.message);
      return null;
    }
    
    if (data.data && data.data.length > 0) {
      return data.data[0].id;
    }
    
    return null;
    
  } catch (error) {
    console.error('Error fetching business account:', error);
    return null;
  }
}
```

---

## Complete Backend Endpoint Implementation

### Full `/client/oauth/exchange-code` Endpoint

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/client/oauth/exchange-code', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { platform, code, state } = req.body;
    
    // Validation
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }
    
    if (platform !== 'instagram') {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    
    console.log(`[Instagram OAuth] Starting OAuth flow for new user`);
    
    // ============================================
    // STEP 1: Exchange code for short-lived token
    // ============================================
    console.log(`[Instagram OAuth] Step 1: Exchanging authorization code for short-lived token`);
    const shortLivedTokenData = await getShortLivedToken(
      code,
      `${process.env.APP_URL}/auth/instagram/callback`
    );
    console.log(`[Instagram OAuth] ✓ Got short-lived token for user: ${shortLivedTokenData.userId}`);
    
    // ============================================
    // STEP 2: Exchange short-lived for long-lived
    // ============================================
    console.log(`[Instagram OAuth] Step 2: Exchanging short-lived token for long-lived token (60-day validity)`);
    const longLivedTokenData = await getLongLivedToken(shortLivedTokenData.accessToken);
    console.log(`[Instagram OAuth] ✓ Got long-lived token, expires in ${Math.round(longLivedTokenData.expiresIn / 86400)} days`);
    
    // ============================================
    // STEP 3: Fetch user profile
    // ============================================
    console.log(`[Instagram OAuth] Step 3: Fetching Instagram business profile`);
    const userProfile = await getInstagramBusinessProfile(
      shortLivedTokenData.userId,
      longLivedTokenData.accessToken
    );
    console.log(`[Instagram OAuth] ✓ Profile fetched: @${userProfile.username}`);
    
    // ============================================
    // STEP 4: Fetch business account ID
    // ============================================
    console.log(`[Instagram OAuth] Step 4: Fetching Instagram business account ID`);
    const businessAccountId = await getInstagramBusinessAccountId(
      shortLivedTokenData.userId,
      longLivedTokenData.accessToken
    );
    
    if (businessAccountId) {
      console.log(`[Instagram OAuth] ✓ Business account ID: ${businessAccountId}`);
    } else {
      console.log(`[Instagram OAuth] ⚠ No business account found (account may not have business features)`);
    }
    
    // ============================================
    // STEP 5: Create or update user in database
    // ============================================
    console.log(`[Instagram OAuth] Step 5: Creating/updating user in database`);
    
    let user = await User.findOne({ 
      where: { instagramId: shortLivedTokenData.userId }
    });
    
    if (!user) {
      user = await User.create({
        instagramId: shortLivedTokenData.userId,
        email: `instagram_${shortLivedTokenData.userId}@omni-share.local`,
        username: userProfile.username,
        name: userProfile.name,
        profilePicture: userProfile.profilePicture,
        provider: 'instagram'
      });
      console.log(`[Instagram OAuth] ✓ Created new user: ${user.id}`);
    } else {
      await user.update({
        username: userProfile.username,
        name: userProfile.name,
        profilePicture: userProfile.profilePicture
      });
      console.log(`[Instagram OAuth] ✓ Updated existing user: ${user.id}`);
    }
    
    // ============================================
    // STEP 6: Store OAuth credentials
    // ============================================
    console.log(`[Instagram OAuth] Step 6: Storing OAuth credentials and metadata`);
    
    const oauthConnection = await OAuthConnection.upsert(
      {
        userId: user.id,
        provider: 'instagram',
        accessToken: longLivedTokenData.accessToken,
        expiresAt: longLivedTokenData.expiryDate,
        providerUserId: shortLivedTokenData.userId,
        businessAccountId: businessAccountId,
        metadata: {
          permissions: shortLivedTokenData.permissions,
          username: userProfile.username,
          biography: userProfile.biography,
          website: userProfile.website,
          lastRefreshed: new Date()
        }
      },
      { 
        where: { userId: user.id, provider: 'instagram' },
        returning: true 
      }
    );
    
    console.log(`[Instagram OAuth] ✓ OAuth credentials stored`);
    
    // ============================================
    // STEP 7: Generate JWT token
    // ============================================
    console.log(`[Instagram OAuth] Step 7: Generating JWT authentication token`);
    
    const jwtToken = jwt.sign(
      { 
        userId: user.id, 
        provider: 'instagram',
        instagramId: shortLivedTokenData.userId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log(`[Instagram OAuth] ✓ JWT token generated`);
    
    // ============================================
    // STEP 8: Return response
    // ============================================
    const duration = Date.now() - startTime;
    console.log(`[Instagram OAuth] ✓ OAuth flow completed successfully in ${duration}ms`);
    
    return res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
        provider: 'instagram'
      },
      credentials: {
        provider: 'instagram',
        userProfile: userProfile,
        businessAccountId: businessAccountId,
        permissions: shortLivedTokenData.permissions,
        tokenExpiresAt: longLivedTokenData.expiryDate,
        connectedAt: new Date().getTime()
      }
    });
    
  } catch (error) {
    console.error('[Instagram OAuth] ✗ Error:', error.message);
    return res.status(400).json({ 
      error: error.message || 'Instagram OAuth failed',
      type: error.name
    });
  }
});

// Helper Functions
async function getShortLivedToken(code, redirectUri) {
  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_INSTAGRAM_CLIENT_ID,
      client_secret: process.env.VITE_INSTAGRAM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code
    })
  });
  
  const data = await response.json();
  
  if (data.error_type) {
    throw new Error(`Instagram API Error: ${data.error_message} (Code: ${data.code})`);
  }
  
  if (!data.data || !data.data[0]) {
    throw new Error('Invalid response structure from Instagram API');
  }
  
  return {
    accessToken: data.data[0].access_token,
    userId: data.data[0].user_id,
    permissions: data.data[0].permissions
  };
}

async function getLongLivedToken(shortLivedToken) {
  const url = new URL('https://graph.instagram.com/access_token');
  url.searchParams.append('grant_type', 'ig_exchange_token');
  url.searchParams.append('client_secret', process.env.VITE_INSTAGRAM_CLIENT_SECRET);
  url.searchParams.append('access_token', shortLivedToken);
  
  const response = await fetch(url.toString());
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Token exchange failed: ${data.error.message}`);
  }
  
  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
    expiryDate: new Date(Date.now() + data.expires_in * 1000)
  };
}

async function getInstagramBusinessProfile(userId, accessToken) {
  const url = new URL(`https://graph.instagram.com/${userId}`);
  url.searchParams.append('fields', 'username,name,biography,profile_picture_url,website');
  url.searchParams.append('access_token', accessToken);
  
  const response = await fetch(url.toString());
  const profile = await response.json();
  
  if (profile.error) {
    throw new Error(`Profile fetch failed: ${profile.error.message}`);
  }
  
  return {
    id: userId,
    username: profile.username,
    name: profile.name,
    biography: profile.biography || '',
    profilePicture: profile.profile_picture_url,
    website: profile.website || ''
  };
}

async function getInstagramBusinessAccountId(userId, accessToken) {
  const url = new URL(`https://graph.instagram.com/${userId}/instagram_business_account`);
  url.searchParams.append('access_token', accessToken);
  
  const response = await fetch(url.toString());
  const data = await response.json();
  
  if (data.error) {
    console.warn('Business account fetch warning:', data.error.message);
    return null;
  }
  
  return data.data && data.data.length > 0 ? data.data[0].id : null;
}

module.exports = router;
```

---

## Database Schema

```sql
CREATE TABLE oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  providerUserId VARCHAR(255) NOT NULL,
  accessToken TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  businessAccountId VARCHAR(255),
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, provider),
  INDEX idx_provider_user (provider, providerUserId),
  INDEX idx_expires_at (expiresAt)
);

-- Sample metadata structure:
-- {
--   "permissions": "instagram_business_basic,instagram_business_content_publish,...",
--   "username": "mybusinessaccount",
--   "biography": "My business biography",
--   "website": "https://mywebsite.com",
--   "lastRefreshed": "2025-12-05T10:30:00Z"
-- }
```

---

## Token Refresh (Before Expiry)

Refresh long-lived tokens before they expire to maintain access:

```javascript
async function refreshInstagramToken(accessToken) {
  const url = new URL('https://graph.instagram.com/refresh_access_token');
  url.searchParams.append('grant_type', 'ig_refresh_token');
  url.searchParams.append('access_token', accessToken);
  
  const response = await fetch(url.toString());
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Token refresh failed: ${data.error.message}`);
  }
  
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    expiryDate: new Date(Date.now() + data.expires_in * 1000)
  };
}

// Refresh endpoint
router.post('/client/oauth/refresh-instagram-token', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const connection = await OAuthConnection.findOne({
      where: { userId, provider: 'instagram' }
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Instagram connection not found' });
    }
    
    const daysUntilExpiry = (connection.expiresAt - Date.now()) / (1000 * 60 * 60 * 24);
    
    if (daysUntilExpiry > 30) {
      return res.json({ message: 'Token valid for more than 30 days' });
    }
    
    const refreshedToken = await refreshInstagramToken(connection.accessToken);
    
    await connection.update({
      accessToken: refreshedToken.accessToken,
      expiresAt: refreshedToken.expiryDate
    });
    
    return res.json({ 
      message: 'Token refreshed successfully',
      expiresAt: refreshedToken.expiryDate 
    });
    
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
```

---

## Scopes Reference (New - Effective Jan 27, 2025)

| Scope | Permission | Use Case |
|-------|-----------|----------|
| `instagram_business_basic` | Access basic profile info | Username, name, profile picture, biography |
| `instagram_business_content_publish` | Publish media | Post photos/videos, stories, reels |
| `instagram_business_manage_messages` | Direct messaging | Send/receive DMs with followers |
| `instagram_business_manage_comments` | Comment management | Reply to and delete comments |

**Deprecated scopes** (will stop working Jan 27, 2025):
- `business_basic`
- `business_content_publish`
- `business_manage_comments`
- `business_manage_messages`

---

## Environment Variables

```env
# Instagram Business Login
VITE_INSTAGRAM_CLIENT_ID=1331166918330754
VITE_INSTAGRAM_CLIENT_SECRET=4a043b6832db007f21330806f059ea65
APP_URL=http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/omnishare
```

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `Matching code was not found or was already used` | Code expired or reused | Re-initiate OAuth flow |
| `Redirect URI mismatch` | URL doesn't match App Dashboard | Verify exact URI in Meta Console |
| `Invalid client ID or secret` | Wrong credentials | Check environment variables |
| `#200` | Invalid/expired access token | Refresh token or re-authorize |
| `#190` | Access token has expired | User must re-authorize app |

---

## Production Checklist

- [ ] Update redirect URIs to production domain in Meta App Dashboard
- [ ] Use HTTPS for all OAuth URLs
- [ ] Enable Advanced Access if serving accounts you don't own
- [ ] Set up cron job to refresh tokens before expiry
- [ ] Implement error logging and monitoring
- [ ] Test with real Instagram business accounts
- [ ] Document API rate limits (default: 200 calls/hour)
- [ ] Set up monitoring for failed token exchanges
- [ ] Enable request signing if available
- [ ] Back up credentials securely

---

## Testing Checklist

- [ ] Set all environment variables
- [ ] Create test Instagram business account
- [ ] Add account in Meta App Dashboard > Roles > Test Users
- [ ] Click Instagram login button
- [ ] Verify redirect to Instagram authorization
- [ ] Grant permissions
- [ ] Verify callback to your redirect URI
- [ ] Check backend logs for successful token exchanges
- [ ] Verify JWT token received by frontend
- [ ] Check database for stored credentials
- [ ] Test token refresh before expiry
- [ ] Test re-login with existing account
