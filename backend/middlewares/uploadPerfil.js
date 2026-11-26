const multer = require('multer');
const path = require('path');

const EXTENSOES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'imagens', 'perfil'),
  // um nome único por upload: usuario-<id>-<timestamp>.<ext>
  filename: (req, file, cb) =>
    cb(null, `usuario-${req.session.usuario.id}-${Date.now()}${EXTENSOES[file.mimetype]}`),
});

module.exports = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, Boolean(EXTENSOES[file.mimetype])),
});
