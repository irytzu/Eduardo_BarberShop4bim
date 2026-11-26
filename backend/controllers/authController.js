const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { pool, transaction } = require('../database');

const PASTA_FOTOS = path.join(__dirname, '..', '..', 'imagens', 'perfil');

// o token vai no link; no banco fica só o hash dele (se o banco vazar, os links não valem)
const sha256 = (t) => crypto.createHash('sha256').update(t).digest('hex');

// apaga o arquivo da foto antiga (só se for uma foto de perfil)
const apagaFoto = (url) => {
  if (url && url.startsWith('/fotos-perfil/'))
    fs.unlink(path.join(PASTA_FOTOS, path.basename(url)), () => {});
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(senha || '', user.senha_hash)))
    return res.status(401).json({ erro: 'E-mail ou senha inválidos' });

  req.session.usuario = { id: user.id, nome: user.nome, email: user.email, papel: user.papel, foto_url: user.foto_url };
  res.json(req.session.usuario);
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
};

exports.me = (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ erro: 'Não logado' });
  res.json(req.session.usuario);
};

// cadastro de cliente: cria usuarios + perfis_cliente (1:1)
exports.registrar = async (req, res) => {
  const { nome, email, senha, telefone, endereco } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ erro: 'Preencha nome, e-mail e senha' });

  const existe = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
  if (existe.rowCount) return res.status(409).json({ erro: 'E-mail já cadastrado' });

  const hash = await bcrypt.hash(senha, 10);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const u = await client.query(
      `INSERT INTO usuarios (nome, email, senha_hash, papel)
       VALUES ($1,$2,$3,'cliente') RETURNING id, nome, email, papel, foto_url`,
      [nome, email, hash]);
    await client.query(
      'INSERT INTO perfis_cliente (usuario_id, telefone, endereco) VALUES ($1,$2,$3)',
      [u.rows[0].id, telefone || null, endereco || null]);
    await client.query('COMMIT');
    req.session.usuario = u.rows[0];
    res.status(201).json(u.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: 'Erro ao cadastrar' });
  } finally {
    client.release();
  }
};

// foto de perfil: salva o arquivo (multer), grava a URL no banco e atualiza a sessão
exports.enviarFoto = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ erro: 'Envie uma imagem JPG, PNG, WEBP ou GIF de até 2 MB' });
  const id = req.session.usuario.id;
  const antiga = (await pool.query('SELECT foto_url FROM usuarios WHERE id = $1', [id])).rows[0]?.foto_url;
  const url = '/fotos-perfil/' + req.file.filename;
  await pool.query('UPDATE usuarios SET foto_url = $1 WHERE id = $2', [url, id]);
  req.session.usuario.foto_url = url;
  apagaFoto(antiga);
  res.json(req.session.usuario);
};

exports.removerFoto = async (req, res) => {
  const id = req.session.usuario.id;
  const antiga = (await pool.query('SELECT foto_url FROM usuarios WHERE id = $1', [id])).rows[0]?.foto_url;
  await pool.query('UPDATE usuarios SET foto_url = NULL WHERE id = $1', [id]);
  req.session.usuario.foto_url = null;
  apagaFoto(antiga);
  res.json(req.session.usuario);
};

// ---------- recuperação de senha ----------
// 1) gera um token de uso único (1h) e "envia" o link. Sem servidor de e-mail,
//    o link aparece no terminal onde o servidor está rodando.
exports.esqueciSenha = async (req, res) => {
  const email = String(req.body.email || '').trim();
  if (!email) return res.status(400).json({ erro: 'Informe o e-mail' });

  const { rows } = await pool.query('SELECT id, nome FROM usuarios WHERE email = $1', [email]);
  if (rows[0]) {
    const token = crypto.randomBytes(32).toString('hex');
    // invalida pedidos anteriores ainda abertos e cria o novo
    await pool.query('UPDATE recuperacao_senha SET usado = TRUE WHERE usuario_id = $1 AND usado = FALSE', [rows[0].id]);
    await pool.query(
      `INSERT INTO recuperacao_senha (usuario_id, token_hash, expira_em)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, [rows[0].id, sha256(token)]);
    const link = `http://localhost:${process.env.PORT || 3000}/redefinir_senha/redefinir_senha.html?token=${token}`;
    console.log(`\n📧 Recuperação de senha para ${email} (${rows[0].nome})\n   Link (vale por 1 hora): ${link}\n`);
  }
  // mesma resposta exista o e-mail ou não (não revela quem tem conta)
  res.json({ mensagem: 'Se o e-mail estiver cadastrado, enviamos um link para redefinir a senha (válido por 1 hora).' });
};

// 2) confere o token (existe, não usado, não expirado) e troca a senha
exports.redefinirSenha = async (req, res) => {
  const { token, senha } = req.body;
  if (typeof token !== 'string' || !token) return res.status(400).json({ erro: 'Link inválido ou expirado' });
  if (typeof senha !== 'string' || senha.length < 4)
    return res.status(400).json({ erro: 'A nova senha precisa ter pelo menos 4 caracteres' });

  const hash = await bcrypt.hash(senha, 10);
  const trocou = await transaction(async (client) => {
    // marca como usado já na busca: o mesmo link não funciona duas vezes
    const t = await client.query(
      `UPDATE recuperacao_senha SET usado = TRUE
       WHERE token_hash = $1 AND usado = FALSE AND expira_em > NOW()
       RETURNING usuario_id`, [sha256(token)]);
    if (!t.rowCount) return false;
    await client.query('UPDATE usuarios SET senha_hash = $1 WHERE id = $2', [hash, t.rows[0].usuario_id]);
    return true;
  });
  if (!trocou) return res.status(400).json({ erro: 'Link inválido ou expirado' });
  res.json({ mensagem: 'Senha alterada! Entre com a nova senha.' });
};
