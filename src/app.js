import express from 'express';
import transactionRoutes from './routes/transactionRoutes.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import{ authenticateToken } from './middleware/authMiddleware.js';
import categoryRoutes from './routes/categoryRoutes.js';

const app = express();

// Middleware untuk menangani request dalam format JSON
app.use(express.json());

// Middleware untuk menangani CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Proteksi rute pengeluaran dengan middleware authenticateToken
app.use('/app/transactions', authenticateToken, transactionRoutes);

// Route untuk penaganan auth
app.use('/api/auth', authRoutes)

// Route untuk endpoint API pengeluaran
app.use('/api/transactions', transactionRoutes);

// Gunakan rute kategori
app.use('/api', categoryRoutes);  // Prefix '/api' untuk semua rute kategori

// Route untuk root path
app.get('/', (req, res) => {
    res.send('API berjalan, gunakan endpoint "/api/transactions"');
});

// Menangani rute yang tidak ditemukan
app.use((req, res, next) => {
    res.status(404).json({ message: 'Rute tidak ditemukan' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
