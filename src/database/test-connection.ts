import { connect, connection } from 'mongoose';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '../.env') });

async function testConnection() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ DATABASE_URL não encontrada no arquivo .env');
    process.exit(1);
  }

  console.log('🔍 Testando conexão com MongoDB...');
  console.log(`📍 URL: ${dbUrl.replace(/\/\/.*:.*@/, '//***:***@')}\n`);

  try {
    await connect(dbUrl);
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`📊 Database: ${connection.db.databaseName}`);
    console.log(`🏠 Host: ${connection.host}`);
    console.log(`🔌 Port: ${connection.port}`);

    // Listar coleções
    const collections = await connection.db.listCollections().toArray();
    console.log(`\n📚 Coleções encontradas (${collections.length}):`);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    await connection.close();
    console.log('\n✅ Teste concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao conectar ao MongoDB:');
    console.error(error.message);

    if (error.message.includes('authentication')) {
      console.log('\n💡 Dica: MongoDB está pedindo autenticação.');
      console.log('   Verifique o arquivo MONGODB_AUTH.md para soluções.\n');
      console.log('   Opções:');
      console.log('   1. Criar usuário no MongoDB');
      console.log('   2. Desabilitar autenticação (desenvolvimento)');
      console.log('   3. Atualizar DATABASE_URL com credenciais corretas');
    }

    await connection.close().catch(() => {});
    process.exit(1);
  }
}

testConnection();

