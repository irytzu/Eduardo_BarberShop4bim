-- BarberShop - DDL e carga inicial (PostgreSQL)
-- Crie o banco antes:  CREATE DATABASE barbershop;
-- Senha de TODOS os usuários de teste: 123456

DROP TABLE IF EXISTS recuperacao_senha, agendamentos, perfis_cliente, usuarios, barbeiros, servicos CASCADE;

-- tabela independente
CREATE TABLE servicos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  descricao VARCHAR(255),
  preco NUMERIC(10,2) NOT NULL,
  duracao_min INT NOT NULL,
  imagem_url VARCHAR(255)
);

-- tabela independente
CREATE TABLE barbeiros (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  especialidade VARCHAR(100),
  telefone VARCHAR(20)
);

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  papel VARCHAR(10) NOT NULL CHECK (papel IN ('admin','cliente')),
  foto_url VARCHAR(255)
);

-- relacionamento 1:1 (a PK também é FK de usuarios)
CREATE TABLE perfis_cliente (
  usuario_id INT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  telefone VARCHAR(20),
  endereco VARCHAR(200)
);

-- relacionamentos 1:N (usuario, barbeiro e servico têm vários agendamentos)
CREATE TABLE agendamentos (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id),
  barbeiro_id INT NOT NULL REFERENCES barbeiros(id),
  servico_id INT NOT NULL REFERENCES servicos(id),
  data_hora TIMESTAMP NOT NULL,
  forma_pagamento VARCHAR(20) NOT NULL,           -- pix | cartao | dinheiro (simulado)
  status_pagamento VARCHAR(30) DEFAULT 'pendente',
  status VARCHAR(20) DEFAULT 'confirmado',        -- confirmado | concluido | cancelado
  valor NUMERIC(10,2)
);

-- tokens de recuperação de senha (guarda só o hash do token; uso único, expira em 1h)
CREATE TABLE IF NOT EXISTS recuperacao_senha (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expira_em TIMESTAMP NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO servicos (nome, descricao, preco, duracao_min) VALUES
('Corte Masculino','Corte na tesoura ou máquina',45.00,40),
('Barba','Barba modelada com toalha quente',35.00,30),
('Corte + Barba','Combo completo',70.00,70),
('Degradê','Degradê navalhado',50.00,45),
('Sobrancelha','Design com navalha',15.00,15),
('Pezinho','Acabamento do contorno',15.00,15),
('Pigmentação','Pigmentação de barba ou cabelo',60.00,50),
('Hidratação','Hidratação capilar',40.00,30),
('Corte Infantil','Para crianças até 10 anos',35.00,30),
('Platinado','Descoloração e tonalização',120.00,120);

INSERT INTO barbeiros (nome, especialidade, telefone) VALUES
('Carlos Silva','Degradê','44 99100-0001'),
('Rafael Souza','Barba','44 99100-0002'),
('Bruno Lima','Corte clássico','44 99100-0003'),
('Lucas Pereira','Platinado','44 99100-0004'),
('Mateus Costa','Corte infantil','44 99100-0005'),
('Diego Santos','Pigmentação','44 99100-0006'),
('Thiago Alves','Degradê','44 99100-0007'),
('André Rocha','Barba','44 99100-0008'),
('Felipe Gomes','Corte clássico','44 99100-0009'),
('Gustavo Dias','Sobrancelha','44 99100-0010');

INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES
('Administrador','admin@barbershop.com','$2b$10$WpOAWxzfvAg8LKZcoggyouXwFxOdb/9Muo4VSnlNS7MXqGE9zgU22','admin'),
('João Pereira','joao@email.com','$2b$10$WpOAWxzfvAg8LKZcoggyouXwFxOdb/9Muo4VSnlNS7MXqGE9zgU22','cliente'),
('Pedro Almeida','pedro@email.com','$2b$10$WpOAWxzfvAg8LKZcoggyouXwFxOdb/9Muo4VSnlNS7MXqGE9zgU22','cliente'),
('Marcos Ribeiro','marcos@email.com','$2b$10$WpOAWxzfvAg8LKZcoggyouXwFxOdb/9Muo4VSnlNS7MXqGE9zgU22','cliente'),
('Vinícius Castro','vinicius@email.com','$2b$10$WpOAWxzfvAg8LKZcoggyouXwFxOdb/9Muo4VSnlNS7MXqGE9zgU22','cliente'),
('Eduardo Nunes','eduardo@email.com','$2b$10$WpOAWxzfvAg8LKZcoggyouXwFxOdb/9Muo4VSnlNS7MXqGE9zgU22','cliente'),
('Henrique Melo','henrique@email.com','$2b$10$WpOAWxzfvAg8LKZcoggyouXwFxOdb/9Muo4VSnlNS7MXqGE9zgU22','cliente'),
('Leonardo Faria','leonardo@email.com','$2b$10$WpOAWxzfvAg8LKZcoggyouXwFxOdb/9Muo4VSnlNS7MXqGE9zgU22','cliente'),
('Gabriel Teixeira','gabriel@email.com','$2b$10$WpOAWxzfvAg8LKZcoggyouXwFxOdb/9Muo4VSnlNS7MXqGE9zgU22','cliente'),
('Rodrigo Barros','rodrigo@email.com','$2b$10$WpOAWxzfvAg8LKZcoggyouXwFxOdb/9Muo4VSnlNS7MXqGE9zgU22','cliente'),
('Samuel Cardoso','samuel@email.com','$2b$10$WpOAWxzfvAg8LKZcoggyouXwFxOdb/9Muo4VSnlNS7MXqGE9zgU22','cliente');

INSERT INTO perfis_cliente (usuario_id, telefone, endereco) VALUES
(2,'44 98800-0002','Rua das Flores, 100'),
(3,'44 98800-0003','Av. Brasil, 250'),
(4,'44 98800-0004','Rua Paraná, 45'),
(5,'44 98800-0005','Rua Goiás, 310'),
(6,'44 98800-0006','Av. Capitão Índio Bandeira, 900'),
(7,'44 98800-0007','Rua Minas Gerais, 77'),
(8,'44 98800-0008','Rua São Paulo, 520'),
(9,'44 98800-0009','Rua Bahia, 18'),
(10,'44 98800-0010','Av. Irmãos Pereira, 1200'),
(11,'44 98800-0011','Rua Santa Catarina, 64');

INSERT INTO agendamentos (usuario_id, barbeiro_id, servico_id, data_hora, forma_pagamento, status_pagamento, status, valor) VALUES
(2,1,1,'2026-11-20 09:00','pix','aprovado (simulado)','confirmado',45.00),
(3,2,2,'2026-11-20 10:00','cartao','aprovado (simulado)','confirmado',35.00),
(4,3,3,'2026-11-20 14:00','dinheiro','aprovado (simulado)','confirmado',70.00),
(5,1,4,'2026-11-21 09:00','pix','aprovado (simulado)','confirmado',50.00),
(6,4,10,'2026-11-21 13:00','cartao','aprovado (simulado)','confirmado',120.00),
(7,5,9,'2026-11-22 10:00','pix','aprovado (simulado)','confirmado',35.00),
(8,6,7,'2026-11-22 15:00','cartao','aprovado (simulado)','confirmado',60.00),
(9,7,1,'2026-11-23 11:00','dinheiro','aprovado (simulado)','confirmado',45.00),
(10,8,2,'2026-11-23 16:00','pix','aprovado (simulado)','concluido',35.00),
(11,9,5,'2026-11-24 09:30','pix','aprovado (simulado)','cancelado',15.00);

INSERT INTO recuperacao_senha (usuario_id, token_hash, expira_em, usado) VALUES
(2,  md5('seed1')  || md5('seed1b'),  '2026-11-10 10:00', TRUE),
(3,  md5('seed2')  || md5('seed2b'),  '2026-11-10 11:00', TRUE),
(4,  md5('seed3')  || md5('seed3b'),  '2026-11-11 10:00', TRUE),
(5,  md5('seed4')  || md5('seed4b'),  '2026-11-11 11:00', TRUE),
(6,  md5('seed5')  || md5('seed5b'),  '2026-11-12 10:00', TRUE),
(7,  md5('seed6')  || md5('seed6b'),  '2026-11-12 11:00', TRUE),
(8,  md5('seed7')  || md5('seed7b'),  '2026-11-13 10:00', TRUE),
(9,  md5('seed8')  || md5('seed8b'),  '2026-11-13 11:00', TRUE),
(10, md5('seed9')  || md5('seed9b'),  '2026-11-14 10:00', TRUE),
(11, md5('seed10') || md5('seed10b'), '2026-11-14 11:00', TRUE);

UPDATE servicos SET imagem_url = '/uploads/1795529563017-cortemasculino.png' WHERE nome = 'Corte Masculino';
UPDATE servicos SET imagem_url = '/uploads/1795529436441-barba.png'         WHERE nome = 'Barba';
UPDATE servicos SET imagem_url = '/uploads/1795529506355-cortebarba.png'    WHERE nome = 'Corte + Barba';
UPDATE servicos SET imagem_url = '/uploads/1795529643120-degrade.png'       WHERE nome = 'Degradê';
UPDATE servicos SET imagem_url = '/uploads/1795529670516-sobrancelha.png'   WHERE nome = 'Sobrancelha';
UPDATE servicos SET imagem_url = '/uploads/1795529656369-pezinho.png'       WHERE nome = 'Pezinho';
UPDATE servicos SET imagem_url = '/uploads/1795529661216-pigmentacao.png'   WHERE nome = 'Pigmentação';
UPDATE servicos SET imagem_url = '/uploads/1795529650852-hidratacao.png'    WHERE nome = 'Hidratação';
UPDATE servicos SET imagem_url = '/uploads/1795529537294-crian__a.png'      WHERE nome = 'Corte Infantil';
UPDATE servicos SET imagem_url = '/uploads/1795529665393-platinado.png'     WHERE nome = 'Platinado';