# FindONE Development Setup Guide

This guide will walk you through setting up the FindONE project for development, including all necessary configurations and third-party services.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control
- **Code Editor** (VS Code recommended)
- **Postman** or similar API testing tool

## Project Structure

```
FindONE/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling
│   └── public/            # Static assets
├── server/                # Node.js Backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── config/           # Configuration files
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
└── docs/                 # Documentation
```

## Step 1: Clone and Setup Project

### 1.1 Clone Repository
```bash
git clone <your-repository-url>
cd FindONE
```

### 1.2 Install Dependencies

**Backend Dependencies:**
```bash
cd server
npm install
```

**Frontend Dependencies:**
```bash
cd ../client
npm install
```

## Step 2: MongoDB Atlas Setup

### 2.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project

### 2.2 Create Database Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider and region
4. Click "Create"

### 2.3 Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username and password (save these!)
5. Select "Read and write to any database" role
6. Click "Add User"

### 2.4 Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### 2.5 Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Add database name: `/findone?retryWrites=true&w=majority`

## Step 3: Google Cloud Setup

### 3.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your Project ID

### 3.2 Enable Custom Search API
1. Go to "APIs & Services" → "Library"
2. Search for "Custom Search API"
3. Click on it and press "Enable"

### 3.3 Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to Custom Search API only

### 3.4 Set Up Custom Search Engine
1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click "Create a search engine"
3. Leave "Sites to search" blank
4. Set name: "FindONE Product Search"
5. Check "Search the entire web"
6. Click "Create"
7. Go to "Setup" tab and copy the Search Engine ID

### 3.5 Set Up Billing (Required)
1. Go to Google Cloud Console → "Billing"
2. Link a billing account (required even for free tier)
3. The free tier includes 100 searches/day

## Step 4: Environment Configuration

### 4.1 Backend Environment Variables
Create `server/.env` file:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/findone?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Google Search API Configuration
GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4.2 Generate JWT Secret
You can generate a secure JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 5: Start Development Servers

### 5.1 Start Backend Server
```bash
cd server
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: your-cluster.mongodb.net
```

### 5.2 Start Frontend Server
```bash
cd client
npm run dev
```

You should see:
```
Local:   http://localhost:5173/
Network: http://192.168.x.x:5173/
```

## Step 6: Verify Setup

### 6.1 Test Backend API
Use Postman or curl to test:

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Search API:**
```bash
curl "http://localhost:5000/api/search/products?query=iphone"
```

### 6.2 Test Frontend
1. Open http://localhost:5173 in your browser
2. Verify the dark UI loads correctly
3. Test the authentication modals
4. Check that the search bar is visible

## Step 7: Development Workflow

### 7.1 Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

### 7.2 Code Style Guidelines
- Use ES6+ features
- Follow consistent naming conventions
- Add JSDoc comments for functions
- Use meaningful variable names
- Implement proper error handling

### 7.3 Testing
- Test API endpoints with Postman
- Test frontend components manually
- Verify authentication flow
- Check search functionality

## Troubleshooting

### Common Issues

#### MongoDB Connection Error
**Error:** `MongoDB connection error: Protocol and host list are required`

**Solution:**
1. Verify connection string format
2. Check username/password
3. Ensure network access is configured
4. Verify database user has correct permissions

#### Google Search API 400 Error
**Error:** `Request failed with status code 400`

**Solution:**
1. Verify API key is correct
2. Check Search Engine ID format
3. Ensure Custom Search API is enabled
4. Verify billing is set up

#### Frontend Not Loading
**Error:** Tailwind CSS not working

**Solution:**
1. Check `tailwind.config.js` content paths
2. Verify PostCSS configuration
3. Restart development server

#### Authentication Issues
**Error:** JWT token not working

**Solution:**
1. Verify JWT_SECRET is set
2. Check token expiration
3. Ensure proper Authorization header format

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

### Logs Location
- **Backend logs:** Console output
- **Frontend logs:** Browser developer tools
- **MongoDB logs:** Atlas dashboard

## Performance Optimization

### Development Tips
1. Use `npm run dev` for auto-restart
2. Enable browser caching
3. Use React DevTools for debugging
4. Monitor API response times

### Production Considerations
1. Set `NODE_ENV=production`
2. Use environment-specific configurations
3. Implement proper error handling
4. Add monitoring and logging

## Next Steps

After successful setup:

1. **Explore the Codebase:**
   - Review API endpoints in `server/routes/`
   - Check React components in `client/src/components/`
   - Understand the authentication flow

2. **Start Development:**
   - Add new features
   - Improve existing functionality
   - Write tests
   - Optimize performance

3. **Deployment:**
   - Set up production environment
   - Configure domain and SSL
   - Set up monitoring
   - Implement CI/CD pipeline

## Support

If you encounter issues:

1. Check the troubleshooting section
2. Review error logs carefully
3. Verify all environment variables
4. Test API endpoints individually
5. Create an issue in the repository

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Google Custom Search API Documentation](https://developers.google.com/custom-search/v1/overview)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Happy Coding! 🚀** 