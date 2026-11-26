const { pool } = require('../database');

exports.listar = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM servicos ORDER BY nome');
  res.json(rows);
};

exports.criar = async (req, res) => {
  const { nome, descricao, preco, duracao_min } = req.body;
  const imagem = req.file ? '/uploads/' + req.file.filename : req.body.imagem_url || null;
  const { rows } = await pool.query(
    `INSERT INTO servicos (nome, descricao, preco, duracao_min, imagem_url)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [nome, descricao, preco, duracao_min, imagem]);
  res.status(201).json(rows[0]);
};

exports.atualizar = async (req, res) => {
  const { nome, descricao, preco, duracao_min } = req.body;
  const imagem = req.file ? '/uploads/' + req.file.filename : null; // null mantém a atual
  const { rows } = await pool.query(
    `UPDATE servicos SET nome=$1, descricao=$2, preco=$3, duracao_min=$4,
       imagem_url = COALESCE($5, imagem_url)
     WHERE id=$6 RETURNING *`,
    [nome, descricao, preco, duracao_min, imagem, req.params.id]);
  if (!rows[0]) return res.status(404).json({ erro: 'Serviço não encontrado' });
  res.json(rows[0]);
};

exports.remover = async (req, res) => {
  try {
    await pool.query('DELETE FROM servicos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(409).json({ erro: 'Serviço usado em agendamentos, não pode ser excluído' });
  }
};
