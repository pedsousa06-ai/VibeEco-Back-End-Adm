// Carregando variáveis de ambiente
require("dotenv").config();

// Importando o arquivo de serviço de envio de e-mails
const arquivoEmail  = require("./service/email.js");

// Executando o teste
const testarEnvio = async function(){

    const resultado = await arquivoEmail.enviarEmail(
        "lucaskolle2020@gmail.com",
        "Receba este email de teste enviado pelo Node.js. Caso você tenha recebido, significa que o serviço de envio de e-mails está funcionando corretamente.",
        "Este é um e-mail de teste enviado pelo Node.js!"
    );

    console.log(resultado);

};

testarEnvio();