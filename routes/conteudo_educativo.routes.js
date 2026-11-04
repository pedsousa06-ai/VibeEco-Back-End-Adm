//importando o express
const express = require("express")
const bodyParser    = require("body-parser")

//criando um objeto para manipular dados do body da API em formato Json
const bodyParserJSON = bodyParser.json()

//cria um objeto de rota para o arquivo
const router = express.Router()

//importando o arquivo da controller, para pode enviar os dados para serem processados
const controllerConteudoEducativo = require("../controller/conteudo_educativo/controller_conteudo_educativo.js")

// Sessão de manipulação e criação de instacias para upload de arquivos
const multer        = require("multer") // multer é uma biblioteca que permite o upload de arquivos para a API, como imagens, vídeos, áudios, etc.

// guarda os arquivos em memória (buffer) só até a controller enviar para o Azure, com limite de tamanho e de quantidade
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 6 } // 10 MB por arquivo, 1 imagem + até 5 anexos
})

// campos de arquivo aceitos: "img" (capa, 1 arquivo) e "anexos" (até 5 arquivos)
const receberArquivos = upload.fields([
    { name: "img", maxCount: 1 },
    { name: "anexos", maxCount: 5 }
])

// executa o multer e, se der erro (arquivo grande, campo inesperado...), responde em JSON em vez de estourar 500 em HTML
const uploadComTratamento = function(request, response, next){

    receberArquivos(request, response, function(erro){

        if(erro){
            return response.status(400).json({
                status: false,
                status_code: 400,
                message: "Não foi possível receber os arquivos: " + erro.message
            })
        }

        next()
    })
}


/* CRUD DA TABELA */

//cadastrar novo dado
router.post("/", bodyParserJSON /*serve para captar o conteúdo enviado na requisição e colocar*/, uploadComTratamento, async function(request, response){

    //recebendo dados da requisição
    let dados = request.body

    //verificando content-type
    let contentType = request.headers["content-type"]

    let arquivos = request.files //recebendo os arquivos enviados na requisição ({ img: [...], anexos: [...] })

    //enviando para a controller
    let result = await controllerConteudoEducativo.inserirNovaConteudoEducativo(contentType, dados, arquivos)

    //enviando resposta da requisição
    response.status(result.status_code)
    response.json(result)
})

//listar todos os dados
router.get("/", async function(request, response){

    //pede os dados e aguarda a resposta
    let result = await controllerConteudoEducativo.listarConteudoEducativo()

    //envia os dados recebidos
    response.status(result.status_code)
    response.json(result)
})

//buscar conteúdo pelo id
router.get("/:id", async function(request, response){

    //recebendo id
    let id = request.params.id

    //chamando função da controller e enviando o id
    let result = await controllerConteudoEducativo.buscarConteudoEducativoId(id)

    //enviando resposta
    response.status(result.status_code)
    response.json(result)
})

//atualizar dado
router.put("/:id", bodyParserJSON, uploadComTratamento, async function(request, response){

    //recebendo o id e o conteúdo para serem enviados
    let id = request.params.id
    let dados = request.body
    let contentType = request.headers['content-type']

    let arquivos = request.files //recebendo os arquivos enviados na requisição

    //enviando os dados para controller
    let result = await controllerConteudoEducativo.atualizarConteudoEducativo(id, contentType, dados, arquivos)

    //enviando para o usuário
    response.status(result.status_code)
    response.json(result)
})

//deletar dado
router.delete("/:id", async function(request, response){

    //recebendo o id
    let id = request.params.id

    //enviando id para realizar o delete
    let result = await controllerConteudoEducativo.excluirConteudoEducativo(id)

    //devolvendo mensagem e status-code
    response.status(result.status_code)
    response.json(result)
})

//exportando o router para ser utilizado no arquivo principal da API
module.exports = router
