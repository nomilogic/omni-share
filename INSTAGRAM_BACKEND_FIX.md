# Instagram OAuth Backend Configuration - Fixed

## Changes Made to `src/utils/backend-auth.js`

### 1. Updated Instagram OAuth Configuration

**Before:**
```javascript
instagram: {
  scopes: [
    "instagram_basic",
    "instagram_content_publish",
    "instagram_manage_insights",
    "pages_show_list",
    "pages_read_engagement",
  ],
  authUrl: "https://api.instagram.com/oauth/authorize",
  tokenUrl: "https://api.instagram.com/oauth/access_token",
}
```

**After:**
```javascript
instagram: {
  scopes: [
    "instagram_business_basic",
    "instagram_business_content_publish",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
  ],
  authUrl: "https://www.instagram.com/oauth/authorize",
  tokenUrl: "https://api.instagram.com/oauth/access_token",
  longLivedTokenUrl: "https://graph.instagram.com/access_token",
}
```

**Why:** 
- Old scopes deprecated as of January 27, 2025
- New authorization endpoint is at `www.instagram.com` not `api.instagram.com`
- Added separate endpoint for long-lived token exchange (valid 60 days)

---

### 2. Fixed Token Exchange for Instagram

**Before:**
```javascript
if ((platform === "facebook" || platform === "instagram") && tokenResponse.access_token) {
  const longLivedResponse = await axios.get(config.tokenUrl, {
    params: {
      grant_type: "fb_exchange_token",  // ❌ Wrong for Instagram!
      client_id: config.client_id,
      client_secret: config.client_secret,
      fb_exchange_token: tokenResponse.access_token,
    },
  });
}
```

**After:**
```javascript
if ((platform === "facebook" || platform === "instagram") && tokenResponse.access_token) {
  try {
    if (platform === "instagram") {
      // ✅ Instagram-specific long-lived token exchange
      const longLivedResponse = await axios.get(
        config.longLivedTokenUrl,
        {
          params: {
            grant_type: "ig_exchange_token",  // ✅ Correct grant type
            client_secret: config.client_secret,
            access_token: tokenResponse.access_token,
          },
        }
      );
      if (longLivedResponse.data.access_token) {
        tokenResponse = {
          ...tokenResponse,
          access_token: longLivedResponse.data.access_token,
          token_type: longLivedResponse.data.token_type,
          expires_in: longLivedResponse.data.expires_in, // 5184000 seconds = 60 days
        };
      }
    } else {
      // Facebook token exchange (unchanged)
      // ...
    }
  } catch (err) {
    console.warn(`Failed to exchange for long-lived token (${platform}):`, err.message);
  }
}
```

**Why:**
- Instagram uses `ig_exchange_token` grant type, not `fb_exchange_token`
- Instagram uses separate endpoint: `https://graph.instagram.com/access_token`
- Returns token valid for 60 days (5,184,000 seconds)

---

### 3. Added Instagram Profile Endpoint

**Before:**
```javascript
case "facebook":
  profileUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture&access_token=${accessToken}`;
  break;
case "linkedin":
  // ...
```

**After:**
```javascript
case "facebook":
  profileUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture&access_token=${accessToken}`;
  break;
case "instagram":
  // ✅ Use Graph API to fetch Instagram business profile
  profileUrl = `https://graph.instagram.com/me?fields=id,username,name,biography,profile_picture_url,website&access_token=${accessToken}`;
  break;
case "linkedin":
  // ...
```

**Why:**
- Instagram user profiles are fetched from Graph API, not basic API
- Returns username, biography, profile picture, and website
- Supports new `instagram_business_*` scopes

---

## Summary of Fixes

✅ **Scope Update**: Changed from deprecated `instagram_basic` to new `instagram_business_*` scopes  
✅ **Authorization Endpoint**: Changed to correct Instagram authorization URL  
✅ **Token Exchange Logic**: Implemented proper Instagram long-lived token flow  
✅ **Profile Fetching**: Added Instagram-specific profile endpoint with correct fields  
✅ **Error Handling**: Improved error messages for token exchange failures  

---

## Testing

After these changes:

1. **Authorization flow** will redirect to `https://www.instagram.com/oauth/authorize`
2. **Code exchange** will use the Instagram token endpoint
3. **Token conversion** will exchange short-lived token (60 min) for long-lived token (60 days)
4. **Profile fetch** will retrieve Instagram business account details
5. **Token storage** will include expiry information for 60-day validity

---

## Environment Requirements

Ensure your `.env` file contains:

```env
VITE_INSTAGRAM_CLIENT_ID=your-client-id
VITE_INSTAGRAM_CLIENT_SECRET=your-client-secret
VITE_APP_URL=http://localhost:5173  # for development
```

---

## Important Dates

⚠️ **January 27, 2025**: Old scope values (`business_*`) will be deprecated and stop working

Make sure this updated code is deployed before that date to avoid service disruptions.
