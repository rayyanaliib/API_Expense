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
    }tra
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
                const transaction = await prisma.transaction.create({
                    data: {
                        title,
                        date: new Date(date),
                        type,
                        category,
                        description,
                        reporterName: req.user.name, // Mengisi nama dari user yang login
                        reporterRole: req.user.role,  // Mengisi role dari user yang login
                        cost: parseFloat(cost),
                        imageUrl,
                        userId: req.user.id, // Mengisi userId dari user yang login
                    },
                });

                res.status(201).json(transaction);
            } catch (error) {
                console.error('Error menambah pengeluaran:', error);
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

