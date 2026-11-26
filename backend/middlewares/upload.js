const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'imagens', 'servico'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')),
});

module.exports = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});
