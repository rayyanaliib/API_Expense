import multer from 'multer';
import path from 'path';

// Mengatur penyimpanan file
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Inisialisasi upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // batas ukuran file 3MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image'); // 'image' adalah nama field form untuk file

// Memeriksa Tipe File
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Hanya gambar yang diperbolehkan!');
    }
}

export default upload;
