# backend

🚀 A production-ready Node.js server created with `create-server`

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── routes/          # Route definitions
│   ├── middlewares/     # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── app.js       # Express app setup
├── package.json
├── server.js        # Entry point
└── .env.example         # Environment template
```

## Features

✅ Express.js with modern ES modules
✅ Structured project organization
✅ Winston logging with file rotation
✅ Health check endpoint
✅ Error handling middleware
✅ Security headers (Helmet, CORS, Rate Limiting)
✅ JWT authentication setup
✅ mongodb database integration


## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3000
   curl http://localhost:3000/api/v1/health
   ```

## Available Scripts

- `npm start` - Start development server with hot reload
- `npm start` - Start production server

- `npm test` - Run tests

## Health Check

The server includes a health check endpoint at `/api/v1/health` that returns:
- Server status
- Timestamp
- Node.js version
- Environment

## Deployment

1. Build the project (if TypeScript):
   ```bash
   npm run build
   ```

2. Set production environment:
   ```bash
   NODE_ENV=production npm start
   ```

3. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name "backend"
   ```
