# Instagram OAuth Backend Implementation

## Overview
This guide provides the backend implementation needed for Instagram Business OAuth code exchange. The backend needs to handle the `/client/oauth/exchange-code` endpoint with support for Instagram provider.

## Backend Endpoint: POST `/client/oauth/exchange-code`

### Request Payload
```json
{
  "platform": "instagram",
  "code": "access_token_code_from_instagram",
  "state": "state_parameter_for_security"
}
```

### Instagram-Specific Implementation

#### 1. Instagram Token Exchange

Use the Instagram API to exchange the authorization code for an access token:

```javascript
// POST https://graph.instagram.com/v18.0/access_token
// Parameters:
// - client_id: VITE_INSTAGRAM_CLIENT_ID
// - client_secret: VITE_INSTAGRAM_CLIENT_SECRET
// - grant_type: "authorization_code"
// - redirect_uri: "http://yourapp.com/auth/instagram/callback"
// - code: authorization_code_from_request

const exchangeInstagramCode = async (code, redirectUri) => {
  const response = await fetch('https://graph.instagram.com/v18.0/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.VITE_INSTAGRAM_CLIENT_ID,
      client_secret: process.env.VITE_INSTAGRAM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code
    })
  });
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    userId: data.user_id
  };
};
```

#### 2. Get Instagram User Profile

After getting the access token, fetch the user's Instagram business account information:

```javascript
// GET https://graph.instagram.com/v18.0/{user_id}?fields=username,name,profile_picture_url&access_token={access_token}

const getInstagramUserProfile = async (userId, accessToken) => {
  const response = await fetch(
    `https://graph.instagram.com/v18.0/${userId}?fields=username,name,profile_picture_url&access_token=${accessToken}`
  );
  
  const profile = await response.json();
  return {
    id: userId,
    username: profile.username,
    name: profile.name,
    profilePicture: profile.profile_picture_url
  };
};
```

#### 3. Get Instagram Business Account ID

To access business features, you need the business account ID:

```javascript
// GET https://graph.instagram.com/v18.0/{user_id}/instagram_business_account?access_token={access_token}

const getInstagramBusinessAccount = async (userId, accessToken) => {
  const response = await fetch(
    `https://graph.instagram.com/v18.0/${userId}/instagram_business_account?access_token=${accessToken}`
  );
  
  const data = await response.json();
  if (data.data && data.data.length > 0) {
    return data.data[0].id; // Business account ID
  }
  throw new Error('No Instagram business account found');
};
```

## Full Backend Implementation Example

```javascript
// Node.js/Express example
app.post('/client/oauth/exchange-code', async (req, res) => {
  try {
    const { platform, code, state } = req.body;
    
    if (!['google', 'facebook', 'linkedin', 'instagram'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    
    let credentials = {};
    
    if (platform === 'instagram') {
      // Step 1: Exchange code for access token
      const tokenResponse = await fetch('https://graph.instagram.com/v18.0/access_token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: process.env.VITE_INSTAGRAM_CLIENT_ID,
          client_secret: process.env.VITE_INSTAGRAM_CLIENT_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.APP_URL}/auth/instagram/callback`,
          code: code
        })
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        throw new Error('Failed to get Instagram access token: ' + (tokenData.error?.message || 'Unknown error'));
      }
      
      // Step 2: Get user profile
      const profileResponse = await fetch(
        `https://graph.instagram.com/v18.0/${tokenData.user_id}?fields=username,name,profile_picture_url&access_token=${tokenData.access_token}`
      );
      
      const profileData = await profileResponse.json();
      
      // Step 3: Get business account ID (optional but recommended)
      let businessAccountId = null;
      try {
        const businessResponse = await fetch(
          `https://graph.instagram.com/v18.0/${tokenData.user_id}/instagram_business_account?access_token=${tokenData.access_token}`
        );
        const businessData = await businessResponse.json();
        if (businessData.data && businessData.data.length > 0) {
          businessAccountId = businessData.data[0].id;
        }
      } catch (error) {
        console.warn('Could not fetch business account:', error);
      }
      
      credentials = {
        provider: 'instagram',
        accessToken: tokenData.access_token,
        userId: tokenData.user_id,
        businessAccountId: businessAccountId,
        userProfile: {
          id: tokenData.user_id,
          username: profileData.username,
          name: profileData.name,
          profilePicture: profileData.profile_picture_url
        },
        scopes: [
          'instagram_business_basic',
          'instagram_business_content_publish',
          'instagram_business_manage_messages',
          'instagram_business_manage_comments'
        ],
        expiresAt: Date.now() + (3600 * 1000) // 1 hour (adjust based on actual token expiry)
      };
    }
    
    // Continue with other platforms...
    // [google, facebook, linkedin implementations]
    
    // Step 4: Store credentials in database
    const user = await User.findOrCreate({
      email: credentials.userProfile.email,
      profile: credentials.userProfile
    });
    
    // Store OAuth credentials
    await OAuthConnection.upsert({
      userId: user.id,
      provider: platform,
      accessToken: credentials.accessToken,
      providerUserId: credentials.userId,
      metadata: {
        businessAccountId: credentials.businessAccountId,
        scopes: credentials.scopes
      }
    });
    
    // Step 5: Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    
    return res.json({
      token: token,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
      },
      credentials: {
        provider: platform,
        userProfile: credentials.userProfile,
        connectedAt: new Date().getTime()
      }
    });
    
  } catch (error) {
    console.error('OAuth exchange error:', error);
    return res.status(400).json({ 
      error: error.message || 'OAuth exchange failed'
    });
  }
});
```

## Important Notes

### Access Token Expiration
- Instagram access tokens may have expiration times
- Implement token refresh logic for long-term storage
- Store the `expires_in` field from the token response

### Scopes Explanation
The new Instagram Business scopes (effective Jan 27, 2025):
- `instagram_business_basic` - Access basic business profile information
- `instagram_business_content_publish` - Publish media and manage content
- `instagram_business_manage_messages` - Handle direct messages
- `instagram_business_manage_comments` - Manage comments on content

### Business Account ID
Different from the user ID, used for accessing business-specific APIs:
- Required for content publishing
- Required for insights and analytics
- Store this separately for future API calls

### Error Handling
Instagram API errors include:
- `invalid_request` - Missing required parameters
- `invalid_client` - Invalid client ID or secret
- `invalid_grant` - Invalid authorization code
- `access_denied` - User denied permissions

### Database Schema
Store Instagram connections with:
```sql
CREATE TABLE oauth_connections (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  provider VARCHAR(50) NOT NULL,
  providerUserId VARCHAR(255) NOT NULL,
  accessToken TEXT NOT NULL,
  refreshToken TEXT,
  expiresAt TIMESTAMP,
  businessAccountId VARCHAR(255),
  scopes TEXT[],
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, provider)
);
```

## Testing

1. Set your environment variables in backend `.env`:
```env
VITE_INSTAGRAM_CLIENT_ID=your-client-id
VITE_INSTAGRAM_CLIENT_SECRET=your-client-secret
APP_URL=http://localhost:5173
JWT_SECRET=your-jwt-secret
```

2. Test the OAuth flow:
- Click Instagram button in frontend
- Authorize the app
- Verify the backend receives and processes the code
- Check database for stored credentials

## Troubleshooting

**"Invalid redirect URI"**
- Ensure redirect URI in Meta app settings matches exactly
- Include protocol (http:// or https://)
- No trailing slashes

**"Invalid client ID or secret"**
- Verify credentials from Meta Developer Console
- Check they're set in environment variables
- Restart backend after changing env vars

**"No business account found"**
- User must have a business/professional account
- Not all test users have business accounts
- May need to create one in Instagram settings

**Token expires quickly**
- Instagram short-lived tokens expire in 60 minutes
- Implement token refresh using `refresh_token` if provided
- Store expiry time and refresh before calling APIs
