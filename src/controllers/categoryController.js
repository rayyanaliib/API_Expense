// Kategori: Mendapatkan semua kategori
export const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        console.error('Error mendapatkan kategori:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mendapatkan kategori' });
    }
};

// Kategori: Menambah kategori
export const createCategory = async (req, res) => {
    const { name, type } = req.body;
  
    try {
      // Cek apakah kategori sudah ada
      const existingCategory = await prisma.category.findUnique({
        where: { name },
      });
  
      if (existingCategory) {
        return res.status(400).json({ error: 'Kategori sudah ada' });
      }
  
      // Jika belum ada, tambahkan kategori baru
      const newCategory = await prisma.category.create({
        data: {
          name,
          type,
        },
      });
  
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

// Kategori: Menghapus kategori
export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.category.delete({
            where: { id: parseInt(id, 10) },
        });
        res.json({ message: 'Kategori dihapus' });
    } catch (error) {
        console.error('Error menghapus kategori:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus kategori' });
    }
};
// Controller untuk menambah kategori baru
export const addCategory = async (req, res) => {
    const { name, type } = req.body;

    if (!name || !type) {
        return res.status(400).json({ error: 'Nama dan jenis kategori wajib diisi.' });
    }

    try {
        const existingCategory = await Category.findOne({ name, type });
        if (existingCategory) {
            return res.status(400).json({ error: 'Kategori dengan nama yang sama sudah ada.' });
        }

        const category = new Category({ name, type });
        await category.save();

        res.status(201).json({ message: 'Kategori berhasil ditambahkan.', category });
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
};