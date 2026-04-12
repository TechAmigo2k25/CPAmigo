import { Router } from 'express';
import { login, registerStudent, getProfile } from '../../controllers/auth.controller.js';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/v1/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', registerStudent);

/**
 * @route GET /api/v1/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authenticateJWT, getProfile);

export default router;