// importando o arquivo de configuração do Azure
const AZURE = require('../modulo/config_upload_azure'); 

// importando o fetch para fazer requisições HTTP
const fetch = require('node-fetch').default; 

// função para fazer o upload de arquivos para o Azure
const uploadFiles = async function(files){ 

    // criando um nome único para o arquivo (timestamp + nome original do arquivo)
    let fileName = Date.now() + files.originalname; 

    // criando a URL para fazer o upload do arquivo para o Azure
    let urlFile = `https://${AZURE.ACCOUNT}.blob.core.windows.net/${AZURE.CONTAINER}/${fileName}`;
    
    // criando a URL para fazer o upload do arquivo para o Azure com o token de acesso
    let urlFileToken = `${urlFile}?${AZURE.TOKEN}`;

    // fazendo a requisição para o Azure para fazer o upload do arquivo
    let response = await fetch(urlFileToken, {
        method: 'PUT',
        headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': "aplication/octet-stream"
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
