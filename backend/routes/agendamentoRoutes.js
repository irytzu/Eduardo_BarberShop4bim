const router = require('express').Router();
const c = require('../controllers/agendamentoController');
const { exigeLogin, exigeAdmin } = require('../middlewares/auth');

// visão do cliente
router.post('/', exigeLogin, c.criar);
router.get('/meus', exigeLogin, c.meus);
router.put('/:id/cancelar', exigeLogin, c.cancelar);

// visão administrativa
router.get('/', exigeAdmin, c.listarTodos);
router.put('/:id/status', exigeAdmin, c.mudarStatus);

module.exports = router;
