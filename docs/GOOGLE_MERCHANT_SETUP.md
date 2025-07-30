# Google Merchant Center Setup Guide

## Overview
Google Merchant Center provides access to Google's Shopping data, which includes product information from thousands of retailers. This will significantly improve our search results.

## Step 1: Complete Merchant Center Account Setup

### 1.1 Verify Your Account
- Go to [Google Merchant Center](https://merchants.google.com/)
- Complete any pending verification steps
- Ensure your account is approved (usually takes 24-48 hours)

### 1.2 Set Up Your Store
- Add your website URL (can be localhost for development)
- Set your target country to "India"
- Configure your business information

### 1.3 Enable Shopping Features
- Go to "Growth" → "Shopping ads"
- Enable "Shopping ads" (even if you don't plan to run ads)
- This gives you access to Shopping data

## Step 2: Get Shopping API Access

### 2.1 Enable Content API for Shopping
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Select your project
- Go to "APIs & Services" → "Library"
- Search for "Content API for Shopping"
- Click "Enable"

### 2.2 Create Service Account
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "Service Account"
- Name: "FindONE Shopping API"
- Description: "Service account for product search"
- Click "Create and Continue"
- Skip role assignment (we'll do this manually)
- Click "Done"

### 2.3 Download Service Account Key
- Click on your new service account
- Go to "Keys" tab
- Click "Add Key" → "Create New Key"
- Choose "JSON"
- Download the key file
- **IMPORTANT**: Keep this file secure!

### 2.4 Grant Merchant Center Access
- Go back to [Google Merchant Center](https://merchants.google.com/)
- Go to "Settings" → "Users"
- Click "Add User"
- Enter your service account email (from the JSON file)
- Role: "Standard" or "Admin"
- Click "Add"

## Step 3: Configure Environment Variables

Add these to your `server/.env` file:

```env
# Google Merchant Center (Shopping API)
GOOGLE_MERCHANT_ACCOUNT_ID=your_merchant_account_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

## Step 4: Install Required Dependencies

```bash
cd server
npm install googleapis google-auth-library
```

## Step 5: Test the Integration

Once setup is complete, you can test the Shopping API integration.

## Troubleshooting

### Common Issues:
1. **Account not verified**: Wait 24-48 hours for verification
2. **API not enabled**: Make sure Content API for Shopping is enabled
3. **Permission denied**: Check service account permissions in Merchant Center
4. **Invalid credentials**: Verify JSON key file and environment variables

### Support:
- [Google Merchant Center Help](https://support.google.com/merchants/)
- [Content API for Shopping Documentation](https://developers.google.com/shopping-content/guides/quickstart) 