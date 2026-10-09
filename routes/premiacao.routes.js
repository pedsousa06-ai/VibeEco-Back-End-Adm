//importando o express
const express = require("express")
const bodyParser    = require("body-parser")

//criando um objeto para manipular dados do body da API em formato Json
const bodyParserJSON = bodyParser.json()

//cria um objeto de rota para o arquivo
const router = express.Router()

//importando o arquivo da controller, para pode enviar os dados para serem processados
const controllerPremiacao = require("../controller/premiacao/controller_premiacao.js")


/* CRUD DA TABELA */

//cadastrar novo dado
router.post("/", bodyParserJSON /*serve para captar o conteúdo enviado na requisição e colocar*/, async function(request, response){
    
    //recebendo dados da requisição
    let dados = request.body

    //verificando content-type
    let contentType = request.headers["content-type"]

    //enviando para a controller
    let result = await controllerPremiacao.inserirNovaPremiacao(contentType, dados)

    //enviando resposta da requisição
    response.status(result.status_code)
    response.json(result)
})

//listar todos os dados
router.get("/", async function(request, response){

    //pede os dados e aguarda a resposta
    let result = await controllerPremiacao.listarPremiacao()

    //envia os dados recebidos
    response.status(result.status_code)
    response.json(result)
})

//buscar genero pelo id
router.get("/:id", async function(request, response){

    //recebendo id
    let id = request.params.id

    //chamando função da controller e enviando o id
    let result = await controllerPremiacao.buscarPremiacaoId(id)

    //enviando resposta
    response.status(result.status_code)
    response.json(result)
})

//atualizar dado
router.put("/:id", bodyParserJSON, async function(request, response){

    //recebendo o id e o conteúdo para serem enviados
    let id = request.params.id
    let dados = request.body
    let contentType = request.headers['content-type']

    //enviando os dados para controller
    let result = await controllerPremiacao.atualizarPremiacao(id, contentType, dados)

    //enviando para o usuário
    response.status(result.status_code)
    response.json(result)
})

//deletar dado
router.delete("/:id", async function(request, response){

    //recebendo o id
    let id = request.params.id

    //enviando id para realizar o delete
    let result = await controllerPremiacao.excluirPremiacao(id)

    //devolvendo mensagem e status-code
    response.status(result.status_code)
    response.json(result)
})

//exportando o router para ser utilizado no arquivo principal da API
module.exports = router