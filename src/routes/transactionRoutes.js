import express from 'express';
import { getTransaction, getTransactionById, createTransaction, updateTransaction, deleteTransaction, getTotalPengeluaran, updateTransactionStatus, getPendingReports } from '../controllers/transactionController.js';
import{ createCategory, deleteCategory, getCategories } from '../controllers/categoryController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Gunakan middleware authenticateToken untuk melindungi rute
router.use(authenticateToken);

// Rute untuk mendapatkan semua pengeluaran
router.get('/', getTransaction);

// Rute untuk mendapatkan total pengeluaran
router.get('/total', getTotalPengeluaran);

// Rute untuk mendapatkan pengeluaran berdasarkan ID
router.get('/:id', getTransactionById);

// Rute untuk menambah pengeluaran
router.post('/', createTransaction);

// Rute untuk mengubah pengeluaran berdasarkan ID
router.put('/:id', updateTransaction);

// Rute untuk menghapus pengeluaran berdasarkan ID
router.delete('/:id', deleteTransaction);

// Rute untuk mendapatkan semua kategori 
router.get('/categories', getCategories);

// Rute untuk menambah kategori
router.post('/categories', createCategory);

// Rute untuk menghapus kategori berdasarkan id
router.delete('/categories/:id', deleteCategory);

router.patch('/transactions/:id/status', updateTransactionStatus);

router.get('/reports/pending', getPendingReports);

export default router;
