import { getReports, approveReport, rejectReport } from '../controllers/transactionController.js';

// Mendapatkan semua laporan
router.get('/reports', getReports);

// Menyetujui laporan pengeluaran
router.put('/reports/approve/:id', approveReport);

// Menolak laporan pengeluaran
router.put('/reports/reject/:id', rejectReport);
