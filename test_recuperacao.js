const http = require('http');

async function testRecovery() {
  require('./app.js');
  await new Promise(r => setTimeout(r, 1000));

  function request(options, data) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, text: body });
          }
        });
      });
      req.on('error', reject);
      if (data) {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }
      req.end();
    });
  }

  const email = 'admin1@vibeeco.com';

  console.log('--- ETAPA 1: Solicitar Código de Recuperação ---');
  const reqRes = await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/usuarioADM/recuperarAcesso',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email });

  console.log('Status Solicitação:', reqRes.status);
  console.log('Resposta:', reqRes.data);

  if (reqRes.status !== 200) {
    throw new Error('Falha ao solicitar código de recuperação');
  }

  const codigo = reqRes.data?.response?.codigo_redefinicao;
  console.log('Código gerado e salvo no banco:', codigo);

  console.log('\n--- ETAPA 2: Testar Código Inválido ---');
  const invRes = await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/usuarioADM/validarCodigo',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, codigo: '000000' });
  console.log('Status Código Inválido (esperado 400):', invRes.status);
  if (invRes.status !== 400) throw new Error('Deveria ter rejeitado código inválido');

  console.log('\n--- ETAPA 3: Testar Código Válido ---');
  const valRes = await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/usuarioADM/validarCodigo',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, codigo });
  console.log('Status Código Válido (esperado 200):', valRes.status);
  if (valRes.status !== 200) throw new Error('Deveria ter aceito código válido');

  console.log('\n--- ETAPA 4: Redefinir Senha ---');
  const redRes = await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/usuarioADM/redefinirSenha',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, codigo, novaSenha: 'novasenha123' });
  console.log('Status Redefinição (esperado 200):', redRes.status);
  if (redRes.status !== 200) throw new Error('Falha ao redefinir senha');

  console.log('\n--- ETAPA 5: Testar Login com a Nova Senha ---');
  const loginNovo = await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/usuarioADM/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, senha: 'novasenha123' });
  console.log('Status Login com nova senha:', loginNovo.status);
  if (loginNovo.status !== 200) throw new Error('Não conseguiu logar com a nova senha');

  console.log('\n--- ETAPA 6: Restaurar Senha Padrão (admin123) ---');
  // Re-solicita e redefine para admin123 para manter dados padrão
  const reqRes2 = await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/usuarioADM/recuperarAcesso',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email });
  const codigo2 = reqRes2.data?.response?.codigo_redefinicao;
  await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/usuarioADM/redefinirSenha',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, codigo: codigo2, novaSenha: 'admin123' });

  console.log('\n🎉 FLUXO DE RECUPERAÇÃO DE SENHA 100% VALIDADO NO BANCO E NO BACKEND!');
  process.exit(0);
}

testRecovery().catch(err => {
  console.error('Erro no teste de recuperação:', err);
  process.exit(1);
});
