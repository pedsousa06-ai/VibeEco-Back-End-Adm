//importando o express
const express = require("express")
const bodyParser = require("body-parser")

//criando um objeto para manipular dados do body da API em formato Json
const bodyParserJSON = bodyParser.json()

//cria um objeto de rota para o arquivo
const router = express.Router()

//importando o arquivo da controller, para pode enviar os dados para serem processados
const controllerUsuarioADM = require("../controller/usuario_adm/controller_usuario_adm.js")

/*
 * A validação do JWT é feita UMA vez, no app.js (middleware "protegerApi").
 * Rotas públicas (sem token): POST /login, /recuperarAcesso, /validarCodigo e /redefinirSenha.
 * Todas as outras exigem o header "x-access-token" ou "Authorization: Bearer <token>".
 * O id do administrador logado fica em request.adminId.
 */

//envia a resposta padronizada
const responder = function(response, result){
    response.status(result.status_code)
    response.json(result)
}

/* ROTAS PÚBLICAS */

// login: devolve os dados do administrador e o token JWT
router.post("/login", bodyParserJSON, async function(request, response){
    responder(response, await controllerUsuarioADM.validarLogin(request.body))
})

// "esqueci a senha" - etapa 1: envia o código por e-mail
router.post("/recuperarAcesso", bodyParserJSON, async function(request, response){
    let contentType = request.headers["content-type"]
    responder(response, await controllerUsuarioADM.recuperarAcessoUsuarioADM(contentType, request.body))
})

// "esqueci a senha" - etapa 2: valida o código
router.post("/validarCodigo", bodyParserJSON, async function(request, response){
    responder(response, await controllerUsuarioADM.validarCodigoAcesso(request.body))
})

// "esqueci a senha" - etapa 3: define a nova senha usando o código
router.post("/redefinirSenha", bodyParserJSON, async function(request, response){
    responder(response, await controllerUsuarioADM.redefinirSenhaComCodigo(request.body))
})

/* PERFIL DO ADMINISTRADOR LOGADO (tela de Configurações) - ficam ANTES de "/:id" */

router.get("/me", async function(request, response){
    responder(response, await controllerUsuarioADM.obterMeuPerfil(request.adminId))
})

router.put("/me", bodyParserJSON, async function(request, response){
    responder(response, await controllerUsuarioADM.atualizarMeuPerfil(request.adminId, request.body))
})

router.put("/me/senha", bodyParserJSON, async function(request, response){
    responder(response, await controllerUsuarioADM.alterarMinhaSenha(request.adminId, request.body))
})

/* CRUD DA TABELA (protegido pelo JWT) */

//cadastrar novo dado
router.post("/", bodyParserJSON, async function(request, response){
    let contentType = request.headers["content-type"]
    responder(response, await controllerUsuarioADM.inserirNovaUsuarioADM(contentType, request.body))
})

//listar todos os dados
router.get("/", async function(request, response){
    responder(response, await controllerUsuarioADM.listarUsuarioADM())
})

//buscar pelo id
router.get("/:id", async function(request, response){
    responder(response, await controllerUsuarioADM.buscarUsuarioADMId(request.params.id))
})

//atualizar dado
router.put("/:id", bodyParserJSON, async function(request, response){
    let contentType = request.headers["content-type"]
    responder(response, await controllerUsuarioADM.atualizarUsuarioADM(request.params.id, contentType, request.body))
})

//deletar dado (não permite que o administrador exclua a si mesmo)
router.delete("/:id", async function(request, response){

    if(Number(request.params.id) === Number(request.adminId)){
        return response.status(400).json({
            status: false,
            status_code: 400,
            message: "Você não pode excluir o seu próprio acesso."
        })
    }

    responder(response, await controllerUsuarioADM.excluirUsuarioADM(request.params.id))
})

//exportando o router para ser utilizado no arquivo principal da API
module.exports = router
