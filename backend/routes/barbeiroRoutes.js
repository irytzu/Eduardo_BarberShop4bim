const router = require('express').Router();
const c = require('../controllers/barbeiroController');
const { exigeAdmin } = require('../middlewares/auth');

router.get('/', c.listar);
router.post('/', exigeAdmin, c.criar);
router.put('/:id', exigeAdmin, c.atualizar);
router.delete('/:id', exigeAdmin, c.remover);

module.exports = router;
