# Meta Graph API Integration Setup Guide
## Sri Sagar Driving School — Facebook & Instagram Photo Publishing

This document provides the complete, step-by-step developer and administrator instructions to configure automatic and manual photo publishing from the Sri Sagar Driving School Admin Panel to **Instagram Professional Account** and **Facebook Business Page**.

---

### Security Overview
- **Zero Frontend Secrets**: No Meta App Secrets, User Tokens, or Page Access Tokens exist in the React frontend or client-side bundles.
- **Edge Function Architecture**: All Meta Graph API calls are executed securely inside the Supabase Edge Function (`publish-social-post`) with authenticated administrator authorization verification.
- **Secrets Management**: Secrets are stored exclusively in Supabase Edge Function Secrets environment variables.

---

### Step 1: Create and Configure Meta Developer App
1. Go to the [Meta for Developers Portal](https://developers.facebook.com/) and log in with the administrator Facebook account.
2. Click **My Apps** > Select your existing app: `Sri Sagar Social Publisher` (or `Sri Sagar Driving School Social Sync`).
3. In the App Dashboard, under **Facebook Login for Business** (or **Facebook Login**) > **Settings**:
   - **Enforce HTTPS**: ON (Mandatory by Meta)
   - **Client OAuth Login**: YES
   - **Web OAuth Login**: YES
   - **Valid OAuth Redirect URIs**: Add the exact HTTPS URLs below:
     - `https://ais-dev-grs4qx3jkb5kz6wb4okt57-756928453260.asia-southeast1.run.app/auth/facebook/callback`
     - `https://ais-pre-grs4qx3jkb5kz6wb4okt57-756928453260.asia-southeast1.run.app/auth/facebook/callback`
     - `https://wcurzjcdqxkahcardcyi.supabase.co/functions/v1/facebook-auth/callback`
     - `https://wcurzjcdqxkahcardcyi.supabase.co/functions/v1/facebook-auth`
4. Under **App Settings** > **Basic**:
   - **App Domains**: `run.app`, `supabase.co`
   - **Privacy Policy URL**: `https://ais-pre-grs4qx3jkb5kz6wb4okt57-756928453260.asia-southeast1.run.app`
   - **Site URL**: `https://ais-pre-grs4qx3jkb5kz6wb4okt57-756928453260.asia-southeast1.run.app`

---

### Step 2: Connect Facebook Page & Instagram Professional Account
1. Open the [Facebook Business Page](https://facebook.com/) for Sri Sagar Driving School.
2. Go to **Settings** > **Linked Accounts** > **Instagram**.
3. Click **Connect Account** and log in to your Instagram account.
4. Ensure the Instagram account is set to **Professional (Business or Creator)**.

---

### Step 3: Required Permissions
To publish photos seamlessly, the Meta token needs these permissions:
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `instagram_business_basic`
- `instagram_business_manage_messages`
- `instagram_business_manage_comments`
- `instagram_business_content_publish`
- `instagram_business_manage_insights`
- `business_management`

---

### Step 4: Generate a Permanent / Long-Lived Page Access Token
1. Open the [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2. Select your App from the dropdown.
3. In **User or Page**, select **Get User Access Token**.
4. Check the permissions listed in Step 3 and click **Generate Access Token**.
5. Convert to a Long-Lived User Token:
   ```http
   GET https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id={YOUR_APP_ID}&client_secret={YOUR_APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}
   ```
6. Obtain the Never-Expiring Page Access Token:
   ```http
   GET https://graph.facebook.com/v19.0/me/accounts?access_token={LONG_LIVED_USER_TOKEN}
   ```
7. Copy the `access_token` for the Sri Sagar Driving School Page and its `id` (`FACEBOOK_PAGE_ID`).
8. Retrieve the Instagram Business Account ID:
   ```http
   GET https://graph.facebook.com/v19.0/{FACEBOOK_PAGE_ID}?fields=instagram_business_account&access_token={PAGE_ACCESS_TOKEN}
   ```
   Copy the `instagram_business_account.id` (`INSTAGRAM_ACCOUNT_ID`).

---

### Step 5: Configure Supabase Edge Function Secrets
Set the secrets in your Supabase project using the Supabase CLI or the Supabase Web Dashboard:

#### Via Supabase CLI:
```bash
supabase secrets set \
  FACEBOOK_PAGE_ID="YOUR_PAGE_ID" \
  FACEBOOK_PAGE_ACCESS_TOKEN="YOUR_PAGE_ACCESS_TOKEN" \
  INSTAGRAM_ACCOUNT_ID="YOUR_INSTAGRAM_ACCOUNT_ID" \
  INSTAGRAM_ACCESS_TOKEN="YOUR_PAGE_ACCESS_TOKEN" \
  META_API_VERSION="v19.0"
```

#### Via Supabase Dashboard:
1. Go to your Supabase Project Dashboard.
2. Navigate to **Edge Functions** > **Secrets** (or **Project Settings** > **Configuration**).
3. Add the key-value pairs:
   - `FACEBOOK_PAGE_ID`
   - `FACEBOOK_PAGE_ACCESS_TOKEN`
   - `INSTAGRAM_ACCOUNT_ID`
   - `INSTAGRAM_ACCESS_TOKEN`

---

### Step 6: Verify Connection in Admin Panel
1. Log in to the Sri Sagar Driving School Admin Panel (`/admin`).
2. Go to **Gallery & Social Media**.
3. Under **Social Media Connection Status**, click **Test Connection**.
4. The system will make a live handshake with Meta Graph API and show:
   - 🟢 **Facebook Page**: Connected (Sri Sagar Driving School)
   - 🟢 **Instagram**: Connected (@srisagardrivingschool)

---

### Step 7: Publishing Workflows

#### A. Manual Publish (Default & Recommended)
1. In the **Upload & Publish New Photo** form, choose your image file, title, and optional caption.
2. Click **Upload Photo**. The photo is immediately saved to the website gallery.
3. Click on any photo in the library to open the **Publish Dialog**.
4. Review/edit the caption, select Instagram, Facebook, or both, and click **Publish Now**.
5. The system shows live progress and updates the status to **✓ Published** with the Meta Post ID.

#### B. Auto-Publish on Upload
1. In Admin **Settings** or the Gallery header, toggle **Social Media Auto Publish** ON.
2. When a photo is uploaded, it is automatically posted to the selected channels.

#### C. Handling Partial Failures & Retries
- If Instagram succeeds but Facebook fails (or vice versa), the system flags the specific platform.
- Click the **Retry** button next to the failed platform to re-publish without duplicating the post on the successful platform.

---

### Common Troubleshooting & Solutions

| Error Message | Cause | Solution |
|---|---|---|
| `SETUP REQUIRED: Credentials not configured` | Secrets are missing in Supabase Edge Functions | Follow Step 5 to set the secrets in Supabase. |
| `(#200) Permissions error` | Token lacks `instagram_business_content_publish` or `pages_manage_posts` | Re-generate token with required permissions in Step 3. |
| `Media container processing timed out` | Image format or aspect ratio unsupported by Instagram | Use JPG/PNG with aspect ratio between 4:5 and 1.91:1. |
| `Invalid OAuth access token` | Token expired or password changed | Generate a long-lived Page token via Step 4. |
