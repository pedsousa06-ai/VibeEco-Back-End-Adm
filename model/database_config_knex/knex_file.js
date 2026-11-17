require('dotenv').config();

module.exports = {
    development: {
      // ⚠️ ALTERAÇÃO: Define o cliente como 'mysql2'
      client: 'mysql2',
      connection: {
        host: process.env.DB_HOST || '127.0.0.1', //onde está instalado o banco de dados (pode ser o IP)
        user: process.env.DB_USER || 'root', // Substitua pelo seu usuário
        password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'bcd127', // Substitua pela sua senha
        database: process.env.DB_NAME || 'db_vibeeco_2026', //nome do database
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306, // Porta padrão do MySQL
       
        // Opcional: Define charset (recomendado para UTF8)
        charset: 'utf8mb4'
      },
     
      // Configurações de Migração
      migrations: {
        tableName: 'knex_migrations', // Nome da tabela de migrações
        directory: './db/migrations'
      },
      seeds: {
        directory: './db/seeds'
      }
    },
   
    // Você pode adicionar configurações para produção, testes, etc.
  };