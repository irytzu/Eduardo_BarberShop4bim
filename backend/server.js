const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const session = require('express-session');
const app = express();

// Importar a configuração do banco PostgreSQL
const db = require('./database');

const HOST = 'localhost';
const PORT_FIXA = 3000; // porta padrão (pode ser trocada no .env)

// serve a pasta frontend como arquivos estáticos
const caminhoFrontend = path.join(__dirname, '../frontend');
app.use(express.static(caminhoFrontend));

// >>>>>>>>>>> SERVINDO PASTA DE IMAGENS <<<<<<<<<<
// Imagens dos serviços (upload via multer) ficam em /imagens/servico.
// Mantivemos a URL /uploads/arquivo.png, que é a que já está gravada no banco.
const caminhoImagensServico = path.join(__dirname, '../imagens', 'servico');
app.use('/uploads', express.static(caminhoImagensServico));

// fotos de perfil dos usuários ficam em /imagens/perfil
const caminhoImagensPerfil = path.join(__dirname, '../imagens', 'perfil');
app.use('/fotos-perfil', express.static(caminhoImagensPerfil));

// Middlewares
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 }, // cookie de sessão: 1h
}));

// Middleware de tratamento de erros JSON malformado
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ erro: 'JSON malformado' });
  }
  next(err);
});

/////////////////////////////////////////////////////////////////////////////////////////////
// Importando as rotas
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const servicoRoutes = require('./routes/servicoRoutes');
app.use('/api/servicos', servicoRoutes);

const barbeiroRoutes = require('./routes/barbeiroRoutes');
app.use('/api/barbeiros', barbeiroRoutes);

const agendamentoRoutes = require('./routes/agendamentoRoutes');
app.use('/api/agendamentos', agendamentoRoutes);
/////////////////////////////////////////////////////////////////////////////////////////////

// Rota padrão: abre o menu principal
app.get('/', (req, res) => res.redirect('/menu.html'));

// Rota para testar a conexão com o banco
app.get('/health', async (req, res) => {
  const ok = await db.testConnection();
  res.status(ok ? 200 : 500).json({
    status: ok ? 'OK' : 'ERROR',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
  });
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Inicialização do servidor
const startServer = async () => {
  console.log('Testando conexão com PostgreSQL...');
  if (!(await db.testConnection())) {
    console.error('❌ Falha na conexão com PostgreSQL (confira o arquivo .env)');
    process.exit(1);
  }
  console.log('✅ PostgreSQL conectado com sucesso');

  // garante a coluna da foto de perfil em bancos criados antes dessa funcionalidade
  await db.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url VARCHAR(255)');
  // garante a tabela de recuperação de senha em bancos criados antes dessa funcionalidade
  await db.query(`CREATE TABLE IF NOT EXISTS recuperacao_senha (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expira_em TIMESTAMP NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
)`);

  const PORT = process.env.PORT || PORT_FIXA;
  app.listen(PORT, () => {
    console.log(`🚀 BarberShop rodando em http://${HOST}:${PORT}`);
  });
};

// Encerramento graceful
const encerrar = async () => {
  console.log('\n🔄 Encerrando servidor...');
  await db.pool.end();
  process.exit(0);
};
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);

startServer();
