import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Register akun baru
export const registerUser = async (req, res) => {
    const { username, name, password, role } = req.body;

    if (!username || !name || !password || !role) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan user ke database
        const newUser = await prisma.user.create({
            data: {
                username,
                name,
                password: hashedPassword,
                role,
            },
        });

        res.status(201).json({ message: 'User berhasil didaftarkan', user: newUser });
    } catch (error) {
        console.error('Error saat register user:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat register user' });
    }
};

// Login akun
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Cari user berdasarkan username
        const user = await prisma.user.findUnique({
            where: { username },
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(400).json({ error: 'Username atau password salah' });
        }

        // Cek password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // Jika password salah
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Username atau password salah' });
        }

        // Buat JWT token
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,  // Menggunakan kunci rahasia dari file .env
            { expiresIn: '1h' }  // Token berlaku selama 1 jam
        );

        // Kirimkan token ke klien
        res.json({ message: 'Login berhasil', accessToken: token });
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};