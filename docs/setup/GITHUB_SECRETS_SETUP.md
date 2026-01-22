# GitHub Secrets Setup Guide

## Overview

This guide explains how to configure GitHub Secrets for the CI/CD pipeline to successfully build and release the extension.

## Required Secrets

### Firebase Configuration

The following Firebase secrets are required for the build process:

1. `FIREBASE_API_KEY` - Your Firebase API key
2. `FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain (e.g., `your-project.firebaseapp.com`)
3. `FIREBASE_PROJECT_ID` - Your Firebase project ID
4. `FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket (e.g., `your-project.firebasestorage.app`)
5. `FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
6. `FIREBASE_APP_ID` - Your Firebase app ID
7. `FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID (optional)

### Chrome Web Store Secrets

The following secrets are required for automatic Chrome Web Store uploads:

1. `CHROME_CLIENT_ID` - Chrome Web Store API client ID
2. `CHROME_CLIENT_SECRET` - Chrome Web Store API client secret
3. `CHROME_REFRESH_TOKEN` - Chrome Web Store API refresh token
4. `CHROME_EXTENSION_ID` - Your extension ID in Chrome Web Store

## How to Add Secrets

### Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ > Project settings
4. Scroll down to "Your apps" section
5. Find your web app and copy the configuration values

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret one by one:
   - Name: `FIREBASE_API_KEY`
   - Value: Your Firebase API key
   - Click **Add secret**
5. Repeat for all Firebase secrets

### Step 3: Add Chrome Web Store Secrets (Optional)

If you want automatic Chrome Web Store uploads:

1. Follow the [Chrome Web Store API setup guide](./CHROME_WEB_STORE_SETUP.md)
2. Add the Chrome Web Store secrets to GitHub

## Verification

After adding all secrets:

1. Push a commit to trigger the CI workflow
2. Check the Actions tab to see if the build succeeds
3. For releases, create a tag (e.g., `v1.0.0`) to trigger the release workflow

## Troubleshooting

### Build fails with "Cannot find module '../config/firebase'"

**Cause:** Firebase secrets are not configured in GitHub.

**Solution:** Add all required Firebase secrets as described above.

### Build succeeds but firebase.ts contains placeholder values

**Cause:** Some Firebase secrets are missing or empty.

**Solution:**

1. Check the build logs for missing environment variables
2. Verify all secrets are added correctly in GitHub Settings
3. Make sure there are no typos in secret names

### Local development

For local development, you don't need GitHub secrets. Instead:

1. Copy `src/shared/config/firebase.example.ts` to `src/shared/config/firebase.ts`
2. Replace the placeholder values with your actual Firebase configuration
3. The file is in `.gitignore` so it won't be committed

## Security Notes

- Never commit `firebase.ts` to the repository
- Keep your Firebase API keys secure
- Regularly rotate your Chrome Web Store API credentials
- Use GitHub's secret scanning to detect accidentally committed secrets

## Related Files

- Firebase config script: `scripts/create-firebase-config.js`
- Release workflow: `.github/workflows/release.yml`
- CI workflow: `.github/workflows/ci.yml`
- Firebase example: `src/shared/config/firebase.example.ts`
