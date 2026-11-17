//importando o express
const express = require("express")
const bodyParser    = require("body-parser")

//criando um objeto para manipular dados do body da API em formato Json
const bodyParserJSON = bodyParser.json()

//cria um objeto de rota para o arquivo
const router = express.Router()

//importando o arquivo da controller, para pode enviar os dados para serem processados
const controllerUsuarioADM = require("../controller/usuario_adm/controller_usuario_adm.js")

// função para receber o toke e validar o JWT
const verifyJWT = async function(request, response, next){
    
    const jwt = require("../middleware/middlewareJWT.js") //importando o middleware para validar o token
    
    let token = request.headers["x-access-token"] || request.headers["authorization"] //recebendo o token do cabeçalho da requisição

    const autencidadeToken = await jwt.validarJWT(token) //validando o token

    if(autencidadeToken){ //se o token for válido, chama a próxima função
        next()
    }else{ //se o token for inválido, retorna um erro
        return response.status(401).end("Acesso negado! Token inválido ou expirado.")
    }
}


/* CRUD DA TABELA */

//cadastrar novo dado
router.post("/", verifyJWT, bodyParserJSON /*serve para captar o conteúdo enviado na requisição e colocar*/, async function(request, response){
    
    //recebendo dados da requisição
    let dados = request.body

    //verificando content-type
    let contentType = request.headers["content-type"]

    //enviando para a controller
    let result = await controllerUsuarioADM.inserirNovaUsuarioADM(contentType, dados)

    //enviando resposta da requisição
    response.status(result.status_code)
    response.json(result)
})

//listar todos os dados
router.get("/", async function(request, response){

    //pede os dados e aguarda a resposta
    let result = await controllerUsuarioADM.listarUsuarioADM()

    //envia os dados recebidos
    response.status(result.status_code)
    response.json(result)
})

//recuperar senha (POST e GET para compatibilidade)
router.post("/recuperarAcesso", bodyParserJSON, async function(request, response){
    let dados = request.body
    let contentType = request.headers["content-type"]
    let result = await controllerUsuarioADM.recuperarAcessoUsuarioADM(contentType, dados)
    response.status(result.status_code)
    response.json(result)
})

router.get("/recuperarAcesso", bodyParserJSON, async function(request, response){
    let dados = request.body || request.query
    let contentType = request.headers["content-type"] || "application/json"
    let result = await controllerUsuarioADM.recuperarAcessoUsuarioADM(contentType, dados)
    response.status(result.status_code)
    response.json(result)
})

//validar código de recuperação
router.post("/validarCodigo", bodyParserJSON, async function(request, response){
    let dados = request.body
    let result = await controllerUsuarioADM.validarCodigoAcesso(dados)
    response.status(result.status_code)
    response.json(result)
})

//redefinir senha utilizando o código validado
router.post("/redefinirSenha", bodyParserJSON, async function(request, response){
    let dados = request.body
    let result = await controllerUsuarioADM.redefinirSenhaComCodigo(dados)
    response.status(result.status_code)
    response.json(result)
})

// validar login do usuário (POST e GET para compatibilidade)
router.post("/login", bodyParserJSON, async function(request, response){
    let login = request.body
    let result = await controllerUsuarioADM.validarLogin(login)
    response.status(result.status_code)
    response.json(result)
})

router.get("/login", bodyParserJSON, async function(request, response){

    //recebendo id
    let login = request.body

    //chamando função da controller e enviando o id
    let result = await controllerUsuarioADM.validarLogin(login)

    //enviando resposta
    response.status(result.status_code)
    response.json(result)
})

//buscar genero pelo id
router.get("/:id", async function(request, response){

    //recebendo id
    let id = request.params.id

    //chamando função da controller e enviando o id
    let result = await controllerUsuarioADM.buscarUsuarioADMId(id)

    //enviando resposta
    response.status(result.status_code)
    response.json(result)
})

//redefinir senha
router.put("/redefinirSenha/:id", bodyParserJSON, async function(request, response){

    //recebendo o id e o conteúdo para serem enviados
    let id = request.params.id
    let dados = request.body
    let contentType = request.headers['content-type']

    //enviando os dados para controller
    let result = await controllerUsuarioADM.redefinirSenhaUsuarioADM(id, contentType, dados)

    //enviando para o usuário
    response.status(result.status_code)
    response.json(result)
})

//atualizar dado
router.put("/:id", verifyJWT, bodyParserJSON, async function(request, response){

    //recebendo o id e o conteúdo para serem enviados
    let id = request.params.id
    let dados = request.body
    let contentType = request.headers['content-type']

    //enviando os dados para controller
    let result = await controllerUsuarioADM.atualizarUsuarioADM(id, contentType, dados)

    //enviando para o usuário
    response.status(result.status_code)
    response.json(result)
})

//deletar dado
router.delete("/:id", verifyJWT, async function(request, response){

    //recebendo o id
    let id = request.params.id

    //enviando id para realizar o delete
    let result = await controllerUsuarioADM.excluirUsuarioADM(id)

    //devolvendo mensagem e status-code
    response.status(result.status_code)
    response.json(result)
})

//exportando o router para ser utilizado no arquivo principal da API
module.exports = router