import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Rute untuk register
router.post('/register', registerUser);

// Rute untuk login
router.post('/login', loginUser);

export default router;
