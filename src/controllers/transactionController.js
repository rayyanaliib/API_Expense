import { PrismaClient } from '@prisma/client';
import upload from '../middleware/upload.js';

const prisma = new PrismaClient();

// Mendapatkan semua pengeluaran
export const getTransaction = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany();
        res.json(transactions);
    } catch (error) {
        console.error('Error mendapatkan pengeluaran:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mendapatkan pengeluaran' });
    }
};

// Menambah pengeluaran
export const createTransaction = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            res.status(400).json({ error: err });
        } else {
            const { title, date, type, category, description, cost } = req.body;
            const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

            try {
                // Cari categoryId berdasarkan nama kategori
                const categoryData = await prisma.category.findFirst({
                  where: { name: category }  // Cari berdasarkan nama kategori
                });
            
                // Jika kategori tidak ditemukan, kirimkan error
                if (!categoryData) {
                  return res.status(404).json({ error: 'Kategori tidak ditemukan' });
                }
                const transaction = await prisma.transaction.create({
                    data: {
                        title,
                        date: new Date(date),
                        type,
                        categoryId: categoryData.id,  // Isi categoryId sesuai dengan hasil pencarian
                        description,
                        cost,
                        userId: req.user.id,  // Ambil userId dari autentikasi
                        reporterName: req.user.name,  // Nama user yang login
                        reporterRole: req.user.role,  // Role user yang login
                    },

                });

                res.status(201).json(transaction);
            } catch (error) {
                console.error('Error menambah pengeluaran:', error);
                console.log(transaction); 
                res.status(500).json({ error: error.message });
            }
        }
    });
};

// Mendapatkan pengeluaran berdasarkan ID
export const getTransactionById = async (req, res) => {
    const { id } = req.params;
    const transactionId = parseInt(id, 10);  // Pastikan ID adalah integer

    // Validasi ID
    if (isNaN(transactionId)) {
        return res.status(400).json({ error: 'ID tidak valid' });
    }

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
        });

        // Jika data tidak ditemukan
        if (!transaction) {
            return res.status(404).json({ error: `Pengeluaran dengan ID ${transactionId} tidak ditemukan` });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Error saat mencari pengeluaran:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mencari pengeluaran' });
    }
};

// Mengubah pengeluaran berdasarkan ID
export const updateTransaction = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err });
        }

        const { id } = req.params;
        const { title, date, type, category, amount } = req.body;
        const transactionId = parseInt(id, 10);

        if (!title || !date || !type || !category || !amount) {
            return res.status(400).json({ error: 'Semua field harus diisi' });
        }

        try {
            const dataToUpdate = {
                title,
                date: new Date(date),
                type,
                category,
                amount: parseFloat(amount),
            };

            if (req.file) {
                dataToUpdate.imageUrl = `/uploads/${req.file.filename}`;
            }

            const updatedTransaction = await prisma.transaction.update({
                where: { id: transactionId },
                data: dataToUpdate,
            });

            res.json(updatedTransaction);
        } catch (error) {
            console.error('Error mengubah pengeluaran:', error);
            return res.status(404).json({ error: 'ID tidak terdaftar atau terjadi kesalahan saat mengubah pengeluaran' });
        }
    });
};

// Menghapus pengeluaran berdasarkan ID
export const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const transactionId = parseInt(id, 10);  // Pastikan ID adalah integer

    // Validasi ID
    if (isNaN(transactionId)) {
        return res.status(400).json({ error: 'ID tidak valid' });
    }

    try {
        await prisma.transaction.delete({
            where: { id: transactionId },
        });
        res.json({ message: 'Pengeluaran dihapus' });
    } catch (error) {
        console.error('Error menghapus pengeluaran:', error);
        return res.status(404).json({ error: 'ID tidak terdaftar atau terjadi kesalahan saat menghapus pengeluaran' });
    }
};

// Menampilkan saldo pengeluaran 
export const getTotalPengeluaran = async (req, res) => {
    try {
        const total = await prisma.transaction.aggregate({
            _sum: {
                cost: true,
            },
        });

        res.json({ totalPengeluaran: total._sum.cost || 0 });
    } catch (error) {
        console.error('Error menghitung total pengeluaran:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghitung total pengeluaran' });
    }
};

// Mendapatkan semua laporan (bendahara melihat laporan masuk)
export const getReports = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { status: 'Pending' }  // Menampilkan laporan yang belum disetujui/tidak
        });
        res.json(transactions);
    } catch (error) {
        console.error('Error mendapatkan laporan:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mendapatkan laporan' });
    }
};

// Menyetujui laporan pengeluaran
export const approveReport = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedTransaction = await prisma.transaction.update({
            where: { id: parseInt(id, 10) },
            data: { status: 'Approved' }
        });
        res.json(updatedTransaction);
    } catch (error) {
        console.error('Error menyetujui laporan:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menyetujui laporan' });
    }
};

// Menolak laporan pengeluaran
export const rejectReport = async (req, res) => {
    const { id } = req.params;
    const { remarks } = req.body;  // Catatan alasan penolakan dari bendahara
    try {
        const updatedTransaction = await prisma.transaction.update({
            where: { id: parseInt(id, 10) },
            data: {
                status: 'Rejected',
                remarks  // Simpan catatan alasan penolakan
            }
        });
        res.json(updatedTransaction);
    } catch (error) {
        console.error('Error menolak laporan:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menolak laporan' });
    }
};

// Mengubah status transaksi menjadi "APPROVED" atau "REJECTED" beserta keterangan
export const updateTransactionStatus = async (req, res) => {
    const { id } = req.params;  // Mengambil ID laporan dari parameter URL
    const { status, remarks } = req.body;  // Mengambil status dan remarks dari body request

    // Validasi status yang dikirim harus "APPROVED" atau "REJECTED"
    if (status !== 'APPROVED' && status !== 'REJECTED') {
        return res.status(400).json({ error: 'Status tidak valid. Gunakan "APPROVED" atau "REJECTED".' });
    }

    // Validasi jika status "REJECTED", maka remarks wajib diisi
    if (status === 'REJECTED' && !remarks) {
        return res.status(400).json({ error: 'Keterangan wajib diisi jika laporan ditolak.' });
    }

    try {
        // Cari transaksi berdasarkan ID dan ubah statusnya beserta keterangan (remarks)
        const updatedTransaction = await prisma.transaction.update({
            where: { id: Number(id) },
            data: {
                status,
                remarks: remarks || null,  // Jika ada remarks, tambahkan. Jika tidak ada, biarkan null
            },
        });

        res.status(200).json(updatedTransaction);  // Mengirimkan data transaksi yang diperbarui
    } catch (error) {
        console.error('Error memperbarui status transaksi:', error);
        res.status(500).json({ error: error.message });
    }
};



  // Controller untuk mendapatkan semua laporan dengan status pending
  export const getPendingReports = async (req, res) => {
    try {
        const pendingTransactions = await prisma.transaction.findMany({
            where: { status: 'Pending' }, // Filter berdasarkan status
        });

        // Mengembalikan laporan yang masih pending
        res.status(200).json(pendingTransactions);
    } catch (error) {
        console.error('Error mendapatkan laporan:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mendapatkan laporan' });
    }
};


