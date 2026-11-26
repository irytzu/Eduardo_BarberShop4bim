const router = require('express').Router();
const c = require('../controllers/servicoController');
const { exigeAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', c.listar);
router.post('/', exigeAdmin, upload.single('imagem'), c.criar);
router.put('/:id', exigeAdmin, upload.single('imagem'), c.atualizar);
router.delete('/:id', exigeAdmin, c.remover);

module.exports = router;
