import express from 'express';
import { httpLogger } from './config/logger.js';

import dotenv from 'dotenv';
// Database connection
import { createConnection } from './db/db-utils.js';
// Security middleware


dotenv.config();

const app = express();







// Error handling must be last
app.use(errorMiddleware);


export default app;
