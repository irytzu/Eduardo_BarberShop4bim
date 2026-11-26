# Instruções para executar o BarberShop

## Pré-requisitos
- node, npm e vscode instalados
- PostgreSQL instalado (saber usuário e senha) e pgAdmin4 (ou similar)

## 1 - Instalar dependências
Na pasta do projeto: `npm install`

## 2 - Criar o banco de dados
1. No pgAdmin4, crie o banco (o mesmo nome de `DB_NAME` no `.env`).
2. Abra `documentacao/scriptBarberShop.sql`, copie o conteúdo e execute no banco (cria as tabelas e popula os dados).

## 3 - Configurar o acesso ao banco
Copie `.env.example` para `.env` e ajuste `DB_PASSWORD` (e `DB_NAME`, se for o caso).

## 4 - Subir o servidor
`npm start` (executa `node backend/server.js`)

## 5 - Abrir o sistema
Acesse http://localhost:3000

Usuários de teste (senha 123456): `admin@barbershop.com` (admin) e `joao@email.com` (cliente).

## Esqueci a senha
Na tela de login, clique em "Esqueci minha senha" e informe o e-mail. Sem servidor de e-mail, o link para criar a nova senha aparece no **terminal** onde o `npm start` está rodando (vale por 1 hora e só funciona uma vez).
