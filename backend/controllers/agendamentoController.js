const { pool } = require('../database');

const SELECT = `
  SELECT a.id, a.data_hora, a.forma_pagamento, a.status_pagamento, a.status, a.valor,
         u.nome AS cliente, b.nome AS barbeiro, s.nome AS servico
  FROM agendamentos a
  JOIN usuarios u ON u.id = a.usuario_id
  JOIN barbeiros b ON b.id = a.barbeiro_id
  JOIN servicos s ON s.id = a.servico_id`;

// NÚCLEO: cliente agenda um serviço; pagamento apenas simulado
exports.criar = async (req, res) => {
  const { barbeiro_id, servico_id, data_hora, forma_pagamento } = req.body;
  if (!barbeiro_id || !servico_id || !data_hora || !forma_pagamento)
    return res.status(400).json({ erro: 'Preencha todos os campos' });
  if (new Date(data_hora) < new Date())
    return res.status(400).json({ erro: 'Escolha uma data futura' });

  // regra de negócio: o barbeiro não pode ter dois agendamentos no mesmo horário
  const conflito = await pool.query(
    `SELECT 1 FROM agendamentos
     WHERE barbeiro_id=$1 AND data_hora=$2 AND status <> 'cancelado'`,
    [barbeiro_id, data_hora]);
  if (conflito.rowCount)
    return res.status(409).json({ erro: 'Esse barbeiro já tem cliente nesse horário' });

  const serv = await pool.query('SELECT preco FROM servicos WHERE id=$1', [servico_id]);
  if (!serv.rowCount) return res.status(404).json({ erro: 'Serviço não encontrado' });

  // pagamento SIMULADO: consideramos aprovado na hora
  const { rows } = await pool.query(
    `INSERT INTO agendamentos
       (usuario_id, barbeiro_id, servico_id, data_hora, forma_pagamento,
        status_pagamento, status, valor)
     VALUES ($1,$2,$3,$4,$5,'aprovado (simulado)','confirmado',$6) RETURNING *`,
    [req.session.usuario.id, barbeiro_id, servico_id, data_hora,
     forma_pagamento, serv.rows[0].preco]);
  res.status(201).json(rows[0]);
};

exports.meus = async (req, res) => {
  const { rows } = await pool.query(
    SELECT + ' WHERE a.usuario_id=$1 ORDER BY a.data_hora DESC', [req.session.usuario.id]);
  res.json(rows);
};

exports.cancelar = async (req, res) => {
  const { rowCount } = await pool.query(
    `UPDATE agendamentos SET status='cancelado' WHERE id=$1 AND usuario_id=$2`,
    [req.params.id, req.session.usuario.id]);
  if (!rowCount) return res.status(404).json({ erro: 'Agendamento não encontrado' });
  res.json({ ok: true });
};

exports.listarTodos = async (req, res) => {
  const { rows } = await pool.query(SELECT + ' ORDER BY a.data_hora DESC');
  res.json(rows);
};

exports.mudarStatus = async (req, res) => {
  const { status } = req.body;
  if (!['confirmado', 'concluido', 'cancelado'].includes(status))
    return res.status(400).json({ erro: 'Status inválido' });
  await pool.query('UPDATE agendamentos SET status=$1 WHERE id=$2', [status, req.params.id]);
  res.json({ ok: true });
};
