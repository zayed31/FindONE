# FindONE - AI-Powered Product Recommendation System

<div align="center">

![FindONE Logo](https://img.shields.io/badge/FindONE-AI%20Powered%20Search-blue?style=for-the-badge&logo=search)
![React](https://img.shields.io/badge/React-18.0.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.0.0-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

**Discover products with AI intelligence. Find the perfect products using our advanced AI-powered search, get personalized recommendations, compare prices, and discover hidden gems.**

[Live Demo](#) • [Documentation](#-documentation) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 🚀 Features

### 🔍 **AI-Powered Search**
- **Multi-layered search algorithm** with natural language processing
- **Real-time product discovery** from multiple e-commerce sources
- **Intelligent query understanding** with spell correction and synonym expansion
- **Contextual search** with attribute parsing and intent recognition

### 🛒 **E-commerce Integration**
- **Google Shopping API** integration for high-quality product data
- **Google Custom Search API** with shopping focus
- **Multi-source retrieval** with intelligent fallback mechanisms
- **Domain-specific filtering** for trusted e-commerce sites

### 🎯 **Smart Filtering & Ranking**
- **E-commerce domain whitelisting** (Amazon, Flipkart, Snapdeal, etc.)
- **GTIN-based deduplication** to remove duplicate products
- **Multi-factor relevance scoring** (lexical, semantic, business, behavioral)
- **Accessory filtering** to exclude irrelevant products

### 👤 **User Experience**
- **Dark & sleek UI/UX** with glassmorphism effects
- **Smooth animations** using Framer Motion
- **Responsive design** for all devices
- **Real-time search suggestions** and trending searches

### 🔐 **Authentication & Personalization**
- **JWT-based authentication** with secure password hashing
- **User profiles** with search history and preferences
- **Personalized recommendations** (coming soon)
- **Product saving** and favorites functionality

### ⚡ **Performance & Reliability**
- **Intelligent caching** with TTL-based invalidation
- **Graceful error handling** with fallback mechanisms
- **API rate limiting** and retry logic
- **Optimized search response** times

---

## 🏗️ Architecture

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

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth transitions
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icon library

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for API calls

### **External APIs**
- **Google Custom Search API** - Web search with shopping focus
- **Google Content API for Shopping** - High-quality product data
- **MongoDB Atlas** - Cloud database hosting

### **Development Tools**
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Git** - Version control
- **GitHub** - Code hosting and collaboration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Google Cloud Platform account
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/FindONE.git
cd FindONE
```

### 2. Backend Setup
```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials
```

### 3. Frontend Setup
```bash
cd client
npm install
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

---

## 📚 Documentation

### **Core Documentation**
- [**Algorithm Documentation**](./docs/ALGORITHM_DOCUMENTATION.md) - Complete technical specification of the AI-powered search algorithm
- [**Algorithm Flowchart**](./docs/ALGORITHM_FLOWCHART.md) - Visual flowcharts and diagrams of the search process
- [**API Documentation**](./docs/API_DOCUMENTATION.md) - Complete API reference with examples
- [**Development Setup**](./docs/DEVELOPMENT_SETUP.md) - Detailed setup guide for developers

### **Setup Guides**
- [**Google Merchant Setup**](./docs/GOOGLE_MERCHANT_SETUP.md) - Step-by-step Google API configuration

### **Quick References**
- [**Developer Quick Reference**](./docs/DEVELOPER_QUICK_REFERENCE.md) - Quick reference guide for developers

---

## 🔍 Search Algorithm

FindONE uses a sophisticated **4-layer AI-powered search algorithm**:

### **1. Query Understanding Layer**
- Spell correction and synonym expansion
- Attribute parsing (brand, model, category)
- Intent recognition and query enhancement

### **2. Multi-Source Retrieval Layer**
- Google Shopping API (primary)
- Google Custom Search API (shopping focus)
- Google Custom Search API (Indian sites)
- Web scraping fallback

### **3. E-commerce Filter Layer**
- Domain whitelisting for trusted sites
- Content analysis for product-specific content
- GTIN-based deduplication
- Accessory filtering

### **4. Relevance Ranking Engine**
- **Lexical Score (40%)** - Exact keyword matches
- **Semantic Score (30%)** - Semantic similarity
- **Business Score (20%)** - Price, availability, ratings
- **Behavioral Score (10%)** - User preferences (future)

---

## 🌐 API Reference

### **Search Endpoints**
```bash
# Comprehensive product search
GET /api/search/comprehensive?query=iphone&page=1

# Search suggestions
GET /api/search/suggestions?query=iphone

# Trending searches
GET /api/search/trending

# API health check
GET /api/search/health
```

### **Authentication Endpoints**
```bash
# Register user
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

# Login user
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

# Get user profile (protected)
GET /api/auth/profile
Authorization: Bearer <token>
```

For complete API documentation, see [API Documentation](./docs/API_DOCUMENTATION.md).

---

## 🎨 UI/UX Design

### **Design Philosophy**
- **Dark & Sleek Theme** - Modern, professional appearance
- **Glassmorphism Effects** - Subtle transparency and blur
- **Micro-interactions** - Smooth animations and transitions
- **High Contrast** - Accessibility-focused design

### **Color Palette**
```css
/* Primary Colors */
--bg-primary: #0d1117;      /* Deep charcoal */
--bg-secondary: #1a1a1a;    /* Dark gray */
--bg-tertiary: #262626;     /* Lighter gray */

/* Accent Colors */
--accent-purple: #6366f1;   /* Muted purple */
--accent-teal: #0891b2;     /* Soft teal */
--accent-amber: #f59e0b;    /* Warm amber */

/* Text Colors */
--text-primary: #ffffff;    /* Pure white */
--text-secondary: #e5e7eb;  /* Light gray */
```

### **Key Features**
- **Responsive Design** - Works on all devices
- **Smooth Animations** - Framer Motion powered transitions
- **Loading States** - Skeleton screens and spinners
- **Error Handling** - User-friendly error messages

---

## 🔧 Configuration

### **Environment Variables**

#### **Backend (.env)**
```bash
# Google APIs
GOOGLE_SEARCH_API_KEY=your_search_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
GOOGLE_MERCHANT_ACCOUNT_ID=your_merchant_account_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key

# Database
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Server
PORT=5000
NODE_ENV=development
```

### **API Configuration**
- **Google Custom Search API**: 100 queries/day (free tier)
- **Google Shopping API**: 1000 requests/day (free tier)
- **MongoDB Atlas**: 512MB storage (free tier)

---

## 📊 Performance & Monitoring

### **Key Performance Indicators**
- **Search Response Time**: < 2 seconds
- **Cache Hit Rate**: > 60%
- **API Success Rate**: > 95%
- **Error Rate**: < 2%

### **Caching Strategy**
- **TTL-based caching** (5 minutes)
- **Query-based invalidation**
- **Memory-efficient storage**

### **Error Handling**
- **Graceful degradation** with fallback APIs
- **Retry logic** with exponential backoff
- **User-friendly error messages**

---

## 🚀 Deployment

### **Backend Deployment**
1. Set production environment variables
2. Configure MongoDB Atlas connection
3. Set up Google API credentials
4. Configure CORS for production domain
5. Set up logging and monitoring

### **Frontend Deployment**
1. Update API endpoints for production
2. Configure environment variables
3. Build optimized production bundle
4. Set up CDN for static assets

### **Recommended Platforms**
- **Backend**: Heroku, Railway, or DigitalOcean
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Database**: MongoDB Atlas (already configured)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Style**
- Use ESLint configuration
- Follow React best practices
- Write meaningful commit messages
- Add tests for new features

---

## 📈 Roadmap

### **Phase 1: Core Features** ✅
- [x] AI-powered search algorithm
- [x] Multi-source product retrieval
- [x] User authentication
- [x] Dark & sleek UI/UX
- [x] Real-time search suggestions

### **Phase 2: Advanced Features** 🚧
- [ ] Image-based search
- [ ] Voice search integration
- [ ] Personalized recommendations
- [ ] Price comparison
- [ ] Product reviews and ratings

### **Phase 3: Enterprise Features** 📋
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] API rate limiting and monetization
- [ ] Advanced machine learning models

---

## 🐛 Troubleshooting

### **Common Issues**

#### **Search Not Working**
- Check Google API credentials in `.env`
- Verify API quotas and rate limits
- Check browser console for errors

#### **Authentication Issues**
- Ensure JWT_SECRET is set in `.env`
- Check MongoDB connection string
- Verify CORS configuration

#### **Performance Issues**
- Monitor API response times
- Check cache hit rates
- Optimize database queries

For more detailed troubleshooting, see [Developer Quick Reference](./docs/DEVELOPER_QUICK_REFERENCE.md).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google APIs** for providing search and shopping data
- **MongoDB Atlas** for cloud database hosting
- **React Community** for excellent documentation and tools
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations

---

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/FindONE/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/FindONE/discussions)
- **Email**: support@findone.com

---

<div align="center">

**Made with ❤️ by the FindONE Team**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/FindONE?style=social)](https://github.com/yourusername/FindONE/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/FindONE?style=social)](https://github.com/yourusername/FindONE/network)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/FindONE)](https://github.com/yourusername/FindONE/issues)
[![GitHub license](https://img.shields.io/github/license/yourusername/FindONE)](https://github.com/yourusername/FindONE/blob/main/LICENSE)

</div> 