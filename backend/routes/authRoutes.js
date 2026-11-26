const router = require('express').Router();
const c = require('../controllers/authController');
const { exigeLogin } = require('../middlewares/auth');
const uploadPerfil = require('../middlewares/uploadPerfil');

// trata erro do multer (ex.: arquivo grande demais) devolvendo mensagem clara
const recebeFoto = (req, res, next) =>
  uploadPerfil.single('foto')(req, res, (err) => {
    if (!err) return next();
    const grande = err.code === 'LIMIT_FILE_SIZE';
    res.status(400).json({ erro: grande ? 'Foto muito grande (máximo 2 MB)' : 'Erro ao enviar a foto' });
  });

router.post('/login', c.login);
router.post('/logout', c.logout);
router.post('/registrar', c.registrar);
router.get('/me', c.me);
router.post('/esqueci-senha', c.esqueciSenha);
router.post('/redefinir-senha', c.redefinirSenha);
router.post('/foto', exigeLogin, recebeFoto, c.enviarFoto);
router.delete('/foto', exigeLogin, c.removerFoto);

module.exports = router;
