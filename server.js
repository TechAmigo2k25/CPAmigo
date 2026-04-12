import dotenv from 'dotenv';
import express from 'express';
import { httpLogger } from './src/config/logger.js';
import helmet from 'helmet';
import cors from 'cors';
import { createConnection } from './src/db/db-utils.js';
 import healthRouter from './src/routes/v1/health.routes.js';
import authRouter from './src/routes/v1/auth.routes.js';
console.log("Before user route import");
import userRouter from './src/routes/v1/user.route.js';
import errorMiddleware from './src/middlewares/error.middleware.js';

const app=express();
dotenv.config();


// Request logging
app.use(httpLogger);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : '*',
  credentials: true
}));


// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Server is running!',
    timestamp: new Date().toISOString(),
  });
});


 app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);


const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL is not set. Database features will be disabled.');
} else {
  createConnection(databaseUrl)
    .then(conn => {
      console.log(`✅ Connected to ${conn.type} database`);
    })
    .catch(err => {
      console.error(`❌ Database connection error: ${err.message}`);
    });
}


const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  console.log(`📝 Logs: ${NODE_ENV === 'production' ? 'logs/' : 'console'}`);
});




