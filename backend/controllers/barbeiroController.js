const { pool } = require('../database');

exports.listar = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM barbeiros ORDER BY nome');
  res.json(rows);
};

exports.criar = async (req, res) => {
  const { nome, especialidade, telefone } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO barbeiros (nome, especialidade, telefone) VALUES ($1,$2,$3) RETURNING *',
    [nome, especialidade, telefone]);
  res.status(201).json(rows[0]);
};

exports.atualizar = async (req, res) => {
  const { nome, especialidade, telefone } = req.body;
  const { rows } = await pool.query(
    'UPDATE barbeiros SET nome=$1, especialidade=$2, telefone=$3 WHERE id=$4 RETURNING *',
    [nome, especialidade, telefone, req.params.id]);
  if (!rows[0]) return res.status(404).json({ erro: 'Barbeiro não encontrado' });
  res.json(rows[0]);
};

exports.remover = async (req, res) => {
  try {
    await pool.query('DELETE FROM barbeiros WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(409).json({ erro: 'Barbeiro possui agendamentos, não pode ser excluído' });
  }
};
