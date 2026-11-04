// importando o arquivo de configuração do Azure
const AZURE = require('../modulo/config_upload_azure');

// importando o fetch para fazer requisições HTTP
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// função para fazer o upload de arquivos para o Azure
const uploadFiles = async function(files){

    // deixando o nome do arquivo seguro para URL (sem acento, espaço, "#", "?" ...) e único (timestamp + nome original)
    let nomeSeguro = String(files.originalname)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // tira os acentos
        .replace(/[^a-zA-Z0-9._-]/g, '_')                 // troca o resto por "_"
    let fileName = Date.now() + '-' + nomeSeguro;

    // tipo do arquivo: o Azure guarda esse tipo no blob e é ele que o navegador usa para abrir (imagem, pdf...)
    let tipoArquivo = files.mimetype || 'application/octet-stream';

    // criando a URL para fazer o upload do arquivo para o Azure
    let urlFile = `https://${AZURE.ACCOUNT}.blob.core.windows.net/${AZURE.CONTAINER}/${fileName}`;

    // criando a URL para fazer o upload do arquivo para o Azure com o token de acesso
    let urlFileToken = `${urlFile}?${AZURE.TOKEN}`;

    // fazendo a requisição para o Azure para fazer o upload do arquivo
    let response = await fetch(urlFileToken, {
        method: 'PUT',
        headers: {
            'x-ms-blob-type': 'BlockBlob',
            'x-ms-blob-content-type': tipoArquivo,
            'Content-Type': tipoArquivo
        },
        body: files.buffer // passando o buffer do arquivo para o corpo da requisição (buffer -> é o arquivo em si)
    })

    if(response.status == 201) { // se o status da resposta for 201 (Created) significa que o arquivo foi enviado com sucesso
        return urlFile; // retorna a URL do arquivo no Azure
    }else{
        return false; // caso contrário, retorna false
    }
}


module.exports = {
    uploadFiles
}
