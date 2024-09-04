import express from 'express';
import { getTransaction, getTransactionById, createTransaction, updateTransaction, deleteTransaction, getTotalPengeluaran } from '../controllers/transactionController.js';
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

export default router;
