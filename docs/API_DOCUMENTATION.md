# FindONE API Documentation

## Overview

The FindONE API is a RESTful service that provides product search, user authentication, and recommendation functionality. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "data": object | array,
  "message": string (optional),
  "error": string (optional)
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### Register User

**Endpoint:** `POST /auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "preferences": {},
      "searchHistory": [],
      "savedProducts": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### Login User

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and return JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Get User Profile

**Endpoint:** `GET /auth/profile`

**Description:** Get current user's profile information

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "preferences": {
        "categories": ["Electronics", "Gaming"],
        "priceRange": "medium",
        "brands": ["Apple", "Samsung"]
      },
      "searchHistory": [
        {
          "query": "iPhone 15",
          "timestamp": "2024-01-01T00:00:00.000Z",
          "results": 25
        }
      ],
      "savedProducts": [
        {
          "productId": "https://example.com/product",
          "title": "iPhone 15 Pro",
          "url": "https://example.com/product",
          "savedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

## Search Endpoints

### Search Products

**Endpoint:** `GET /search/products`

**Description:** Search for products using Google Custom Search API

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `query` | string | Yes | Search term | `"iphone 15"` |
| `category` | string | No | Product category filter | `"electronics"` |
| `priceRange` | string | No | Price range filter | `"low"`, `"medium"`, `"high"` |
| `sortBy` | string | No | Sort order | `"price_low"`, `"price_high"`, `"rating"`, `"relevance"` |
| `page` | number | No | Page number for pagination | `1` |

**Example Request:**
```
GET /api/search/products?query=iphone&category=electronics&priceRange=medium&sortBy=price_low&page=1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "https://example.com/product",
        "title": "iPhone 15 Pro Max",
        "description": "Latest iPhone with advanced camera system and A17 Pro chip...",
        "url": "https://example.com/product",
        "image": "https://example.com/images/iphone15.jpg",
        "price": "$1199.99",
        "rating": "4.8",
        "source": "example.com",
        "category": "Smartphones",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalResults": 150,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "searchInfo": {
      "query": "iphone electronics",
      "searchTime": 0.45,
      "category": "electronics",
      "priceRange": "medium",
      "sortBy": "price_low"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Search query is required"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Google Search API quota exceeded or invalid credentials"
}
```

### Get Search Suggestions

**Endpoint:** `GET /search/suggestions`

**Description:** Get search suggestions based on partial query

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Partial search term |

**Example Request:**
```
GET /api/search/suggestions?query=lap
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "laptop",
      "laptop stand",
      "laptop bag",
      "laptop charger",
      "laptop cooling pad"
    ]
  }
}
```

### Get Trending Searches

**Endpoint:** `GET /search/trending`

**Description:** Get currently trending search terms

**Example Request:**
```
GET /api/search/trending
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "trending": [
      "iPhone 15",
      "MacBook Pro",
      "Sony WH-1000XM5",
      "Nintendo Switch",
      "Samsung Galaxy S24",
      "AirPods Pro",
      "iPad Air",
      "GoPro Hero 12",
      "Fitbit Charge 6",
      "PlayStation 5"
    ]
  }
}
```

---

## Health Check

### API Health Status

**Endpoint:** `GET /health`

**Description:** Check if the API is running and healthy

**Example Request:**
```
GET /api/health
```

**Success Response (200):**
```json
{
  "status": "ok",
  "message": "API is healthy"
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error details (development only)"
}
```

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid parameters or request format |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions or API quota exceeded |
| 404 | Not Found | Resource not found |
| 408 | Request Timeout | Request timed out |
| 500 | Internal Server Error | Server-side error |

### Rate Limiting

- **Google Search API**: 100 requests/day (free tier)
- **Authentication**: No specific limits
- **Health Check**: No limits

---

## Data Models

### User Model

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  preferences: {
    categories: [String],
    priceRange: String,
    brands: [String]
  },
  searchHistory: [{
    query: String,
    timestamp: Date,
    results: Number
  }],
  savedProducts: [{
    productId: String,
    title: String,
    url: String,
    savedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Product Response Model

```javascript
{
  id: String,           // Product URL as unique identifier
  title: String,        // Product name
  description: String,  // Product description
  url: String,          // Product URL
  image: String,        // Product image URL
  price: String,        // Product price
  rating: String,       // Product rating
  source: String,       // Source website domain
  category: String,     // Inferred product category
  timestamp: String     // ISO timestamp
}
```

---

## Integration Examples

### Frontend Integration (JavaScript)

```javascript
// Search products
const searchProducts = async (query, filters = {}) => {
  const params = new URLSearchParams({ query, ...filters });
  const response = await fetch(`/api/search/products?${params}`);
  const data = await response.json();
  return data;
};

// User authentication
const loginUser = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  return data;
};

// Authenticated request
const getUserProfile = async (token) => {
  const response = await fetch('/api/auth/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data;
};
```

### cURL Examples

```bash
# Search products
curl -X GET "http://localhost:5000/api/search/products?query=iphone&category=electronics"

# Register user
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login user
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get user profile (with token)
curl -X GET "http://localhost:5000/api/auth/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Security Considerations

### Authentication
- JWT tokens expire after 24 hours
- Passwords are hashed using bcrypt with salt rounds
- Tokens are stored securely in localStorage (frontend)

### API Security
- CORS is configured for frontend communication
- Input validation on all endpoints
- Rate limiting on external API calls
- Environment variables for sensitive data

### Data Protection
- User passwords are never returned in responses
- Sensitive data is filtered from user objects
- API keys are stored in environment variables

---

## Performance Notes

### Response Times
- **Search API**: 1-3 seconds (depends on Google API)
- **Authentication**: < 100ms
- **Health Check**: < 50ms

### Caching
- Search results are not cached (real-time data)
- User profiles are fetched fresh each time
- Consider implementing Redis for future optimization

### Optimization Tips
- Use pagination for large result sets
- Implement request debouncing for search
- Cache static data like trending searches
- Use compression for large responses 