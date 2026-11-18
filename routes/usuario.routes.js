
// Importando o Express
const express = require("express")
const bodyParser = require("body-parser")
const jwt = require("../middleware/middlewareJWT.js")

// Criando um objeto para manipular dados do body em formato JSON
const bodyParserJSON = bodyParser.json()

// Criando um objeto de rotas
const router = express.Router()

// Importando as controllers
const controllerUsuario = require("../controller/usuario/controller_usuario.js")
const controllerUsuarioPainel = require("../controller/usuario/controller_usuario_painel.js")

// Configuração do Multer para upload de imagens
const multer = require("multer")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads")
    }
})

const upload = multer({ storage: storage })

// Middleware para validar o JWT
const verifyJWT = function (request, response, next) {

    const token = request.headers["x-access-token"] ||
        request.headers["authorization"]?.replace(/^Bearer\s+/i, "")

    try {
        const dadosToken = jwt.verificarToken(token)

        // Identificando o usuário autenticado
        request.adminId = dadosToken.userID

        next()

    } catch (erro) {
        return response.status(401).json({
            status: false,
            message: "Acesso negado! Token inválido ou expirado."
        })
    }
}

/*
|--------------------------------------------------------------------------
| ROTAS PÚBLICAS
|--------------------------------------------------------------------------
*/

// Recuperar senha
router.get("/recuperarAcesso", bodyParserJSON, async function (request, response) {

    let dados = request.body
    let contentType = request.headers["content-type"]

    let result = await controllerUsuario.recuperarAcessoUsuario(contentType, dados)

    response.status(result.status_code)
    response.json(result)
})

// Login do usuário
router.get("/login", bodyParserJSON, async function (request, response) {

    let login = request.body

    let result = await controllerUsuario.validarLogin(login)

    response.status(result.status_code)
    response.json(result)
})

// Listar usuários
router.get("/", async function (request, response) {

    let result = await controllerUsuario.listarUsuario()

    response.status(result.status_code)
    response.json(result)
})

/*
|--------------------------------------------------------------------------
| ROTAS DO PAINEL ADMINISTRATIVO
|--------------------------------------------------------------------------
*/

// Listar perfis (níveis de acesso)
router.get("/perfis", verifyJWT, async function (request, response) {

    let result = await controllerUsuarioPainel.listarPerfis()

    response.status(result.status_code)
    response.json(result)
})

// Cadastrar usuário pelo painel
router.post("/painel", verifyJWT, bodyParserJSON, async function (request, response) {

    let result = await controllerUsuarioPainel.inserirUsuarioPainel(request.body)

    response.status(result.status_code)
    response.json(result)
})

// Ativar ou desativar usuário
router.patch("/:id/status", verifyJWT, bodyParserJSON, async function (request, response) {

    let result = await controllerUsuarioPainel.alterarStatusUsuario(
        request.params.id,
        request.body
    )

    response.status(result.status_code)
    response.json(result)
})

// Editar usuário pelo painel
router.patch("/:id", verifyJWT, bodyParserJSON, async function (request, response) {

    let result = await controllerUsuarioPainel.atualizarUsuarioPainel(
        request.params.id,
        request.body
    )

    response.status(result.status_code)
    response.json(result)
})

/*
|--------------------------------------------------------------------------
| CRUD DE USUÁRIOS
|--------------------------------------------------------------------------
*/

// Cadastrar novo usuário
router.post("/", verifyJWT, bodyParserJSON, upload.single("foto"), async function (request, response) {

    let dados = request.body
    let contentType = request.headers["content-type"]
    let foto = request.file

    let result = await controllerUsuario.inserirNovaUsuario(contentType, dados, foto)

    response.status(result.status_code)
    response.json(result)
})

// Buscar usuário pelo ID
router.get("/:id", verifyJWT, async function (request, response) {

    let id = request.params.id

    let result = await controllerUsuario.buscarUsuarioId(id)

    response.status(result.status_code)
    response.json(result)
})

// Redefinir senha
router.put("/redefinirSenha/:id", verifyJWT, bodyParserJSON, async function (request, response) {

    let id = request.params.id
    let dados = request.body
    let contentType = request.headers["content-type"]

    let result = await controllerUsuario.redefinirSenhaUsuario(id, contentType, dados)

    response.status(result.status_code)
    response.json(result)
})

// Atualizar usuário
router.put("/:id", verifyJWT, bodyParserJSON, upload.single("foto"), async function (request, response) {

    let id = request.params.id
    let dados = request.body
    let contentType = request.headers["content-type"]
    let foto = request.file

    let result = await controllerUsuario.atualizarUsuario(id, contentType, dados, foto)

    response.status(result.status_code)
    response.json(result)
})

// Excluir usuário
router.delete("/:id", verifyJWT, async function (request, response) {

    let id = request.params.id

    let result = await controllerUsuario.excluirUsuario(id)

    response.status(result.status_code)
    response.json(result)
})

// Exportando as rotas
module.exports = router
