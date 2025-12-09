# Instagram Posting Implementation - FIXED

## Problem
Instagram posting was not working - the function was throwing an error: "Real Instagram posting not implemented yet"

## Solution Implemented

### 1. Created `postToInstagramFromServer` Function

**Location:** `src/lib/socialPoster.ts` (lines ~103-119)

```typescript
export async function postToInstagramFromServer(
  accessToken: string,
  post: GeneratedPost
) {
  try {
    if (!post.imageUrl) {
      throw new Error("Instagram post requires an image");
    }

    console.log("📸 Instagram posting with:", {
      hasImage: !!post.imageUrl,
      caption: post.caption?.substring(0, 50) + "...",
      hashtags: post.hashtags?.length || 0,
    });

    const response = await API.instagramPost({ accessToken, post });

    return response.data;
  } catch (error: any) {
    console.error("Instagram posting error:", error.response?.data);
    throw new Error(error.response?.data?.error || error.message);
  }
}
```

### 2. Updated `postWithRealOAuth` Function

**Location:** `src/lib/socialPoster.ts` (lines ~609-616)

Changed from:
```typescript
case "instagram":
  // Add real Instagram posting logic here
  throw new Error("Real Instagram posting not implemented yet");
```

To:
```typescript
case "instagram":
  // Post to Instagram using the backend API
  const igResult = await postToInstagramFromServer(accessToken, post);
  return {
    success: true,
    message: `Successfully posted to Instagram`,
    postId: igResult.postId || igResult.data?.id,
    username: igResult.username,
  };
```

## How It Works

### Frontend Flow:
1. User creates a post and selects Instagram as a platform
2. User clicks "Publish"
3. `PublishPosts` component calls `postToAllPlatforms()`
4. For Instagram, it retrieves the access token from `API.tokenForPlatform("instagram")`
5. Calls `postWithRealOAuth()` with the Instagram access token
6. `postWithRealOAuth()` now calls `postToInstagramFromServer()`
7. `postToInstagramFromServer()` calls the backend API endpoint: `POST /client/instagram/post`
8. Backend processes the request and returns the result

### Backend Requirements

The backend must have an endpoint at `/client/instagram/post` that:

1. Receives the Instagram access token and post data
2. Gets the Instagram business account ID from the stored credentials
3. Creates a media container using the Instagram Graph API
4. Publishes the media
5. Returns the result with postId and username

**Example backend implementation:**

```javascript
app.post("/client/instagram/post", async (req, res) => {
  try {
    const { accessToken, post } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Missing access token" });
    }
    
    if (!post.imageUrl) {
      return res.status(400).json({ error: "Instagram post requires imageUrl" });
    }
    
    // Get user's Instagram business account ID from stored credentials
    const instagramConnection = await OAuthConnection.findOne({
      where: { accessToken, provider: "instagram" }
    });
    
    if (!instagramConnection?.businessAccountId) {
      return res.status(400).json({ error: "No Instagram business account found" });
    }
    
    const businessAccountId = instagramConnection.businessAccountId;
    const caption = `${post.caption}\n${post.hashtags?.join(" ") || ""}`;
    
    // Step 1: Create media container
    const mediaResponse = await axios.post(
      `https://graph.instagram.com/v18.0/${businessAccountId}/media`,
      {
        image_url: post.imageUrl,
        caption: caption,
        access_token: accessToken,
      }
    );
    
    const mediaId = mediaResponse.data.id;
    
    // Step 2: Publish the media
    const publishResponse = await axios.post(
      `https://graph.instagram.com/v18.0/${businessAccountId}/media_publish`,
      {
        creation_id: mediaId,
        access_token: accessToken,
      }
    );
    
    return res.json({
      postId: publishResponse.data.id,
      username: instagramConnection.metadata?.username || "Unknown",
      success: true,
    });
    
  } catch (error) {
    console.error("Instagram posting error:", error);
    return res.status(400).json({
      error: error.message || "Failed to post to Instagram",
    });
  }
});
```

## Data Flow Diagram

```
Frontend                Backend                Instagram Graph API
   |                      |                            |
   |--[POST /post]--------|                            |
   |    (with Instagram   |                            |
   |     access token)    |                            |
   |                      |--[POST /media]------------>|
   |                      |   (create container)       |
   |                      |<--[media ID]---|           |
   |                      |                            |
   |                      |--[POST /media_publish]---->|
   |                      |   (publish media)          |
   |                      |<--[post ID]---|            |
   |                      |                            |
   |<--[success]----------|                            |
   |   (with post ID)     |                            |
```

## Requirements

### Frontend:
- ✅ Already implemented - `postToInstagramFromServer()` function
- ✅ Already implemented - Call to `API.instagramPost()`
- ✅ Already implemented - Integration in `postWithRealOAuth()`

### Backend:
- ⚠️ **MUST IMPLEMENT** - `/client/instagram/post` endpoint
- ⚠️ Need to fetch Instagram business account ID from stored credentials
- ⚠️ Need to call Instagram Graph API v18.0 (or later)
- ⚠️ Handle token errors and invalid credentials

### Data Requirements:
- User must have connected Instagram Business Account
- Post must have `imageUrl` (required)
- Post should have `caption` and `hashtags` (optional but recommended)
- Access token must be valid and have required scopes:
  - `instagram_business_basic`
  - `instagram_business_content_publish`
  - `instagram_business_manage_messages`
  - `instagram_business_manage_comments`

## Testing

1. Make sure Instagram is connected (shows in connections list)
2. Create a post with an image
3. Select Instagram as target platform
4. Click "Publish"
5. Monitor console for logs showing "📸 Instagram posting with:"
6. Check backend logs for API calls to Instagram Graph API
7. Verify post appears on Instagram business account

## Troubleshooting

### Error: "Instagram post requires an image"
- **Cause:** Post doesn't have an imageUrl
- **Fix:** Make sure the post includes an image before publishing

### Error: "Failed to get token for instagram"
- **Cause:** Instagram account not connected or token expired
- **Fix:** Go to Settings > Connected Accounts and reconnect Instagram

### Error: "No valid OAuth token found"
- **Cause:** Token not stored or token invalid in database
- **Fix:** Reconnect Instagram account and ensure token is properly saved

### Error from backend: "No Instagram business account found"
- **Cause:** User's Instagram account is personal, not business
- **Fix:** Convert Instagram account to business/professional account

### Instagram Graph API errors:
- **#100 (Invalid parameter)** - Caption or image URL format issue
- **#200 (Permissions error)** - Access token missing required scopes
- **#190 (Invalid access token)** - Token expired or revoked
- **#809 (Rate limit)** - Too many requests, implement backoff

## Next Steps

1. Implement the `/client/instagram/post` backend endpoint
2. Test with sample Instagram business account
3. Verify token storage includes `businessAccountId`
4. Monitor error logs for any API issues
5. Add retry logic if needed for rate limiting
