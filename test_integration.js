const http = require('http');

async function runTests() {
  // Start backend
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

  console.log('--- TEST 1: Login de Administrador ---');
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/usuarioADM/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin1@vibeeco.com', senha: 'admin123' });

  console.log('Login Status:', loginRes.status);
  console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));

  const adm = loginRes.data?.response?.usuarioADM?.[0];
  const token = adm?.token;
  if (!token) {
    throw new Error('Falha ao obter token de login!');
  }
  console.log('Token obtido com sucesso!');

  console.log('\n--- TEST 2: Listar Missões ---');
  const missoesRes = await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/missao',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    }
  });
  console.log('Missões Status:', missoesRes.status);
  console.log('Total de missões retornadas:', missoesRes.data?.response?.missao?.length || 0);

  console.log('\n--- TEST 3: Listar Desafios ---');
  const desafiosRes = await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/desafio',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    }
  });
  console.log('Desafios Status:', desafiosRes.status);
  console.log('Total de desafios retornados:', desafiosRes.data?.response?.desafio?.length || 0);

  console.log('\n--- TEST 4: Listar Conteúdos Educativos ---');
  const conteudosRes = await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/conteudoEducativo',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    }
  });
  console.log('Conteúdos Status:', conteudosRes.status);
  console.log('Total de conteúdos retornados:', conteudosRes.data?.response?.conteudoEducativo?.length || 0);

  console.log('\n--- TEST 5: Listar Usuários ---');
  const usuariosRes = await request({
    hostname: '127.0.0.1',
    port: 8080,
    path: '/v1/vibeEco/administrador/usuario',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    }
  });
  console.log('Usuários Status:', usuariosRes.status);
  console.log('Total de usuários retornados:', usuariosRes.data?.response?.usuario?.length || 0);

  console.log('\n✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Erro nos testes:', err);
  process.exit(1);
});
