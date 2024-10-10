import express from 'express';
import { addCategory, getCategories } from '../controllers/categoryController.js';

const router = express.Router();

// Route untuk menambah kategori
router.post('/add-category', addCategory);

// Route untuk mengambil semua kategori
router.get('/categories', getCategories);

export default router;
