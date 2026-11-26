const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

// Pool de conexões com o PostgreSQL (dados vêm do arquivo .env na raiz do projeto)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Tratamento de erros do pool
pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexões:', err);
});

// Função para testar a conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (err) {
    console.error('Erro ao conectar com o PostgreSQL:', err.message);
    return false;
  }
};

// Função para executar queries
const query = (text, params) => pool.query(text, params);

// Função para transações
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { pool, query, transaction, testConnection };
