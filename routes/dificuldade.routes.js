const express = require("express")
const bodyParser = require("body-parser")
const controllerDificuldade = require("../controller/dificuldade/controller_dificuldade.js")
const { validarJWT } = require("../middleware/middlewareJWT.js")

const bodyParserJSON = bodyParser.json()
const router = express.Router()

const verifyJWT = async function(request, response, next){
    let token = request.headers["x-access-token"] || request.headers["authorization"]?.replace(/^Bearer\s+/i, "")
    const autencidadeToken = await validarJWT(token)
    if(autencidadeToken){
        next()
    }else{
        return response.status(401).json({ status: false, message: "Acesso negado! Token inválido ou expirado." })
    }
}

router.post("/", verifyJWT, bodyParserJSON, async function(request, response){
    let dados = request.body
    let contentType = request.headers["content-type"]
    let result = await controllerDificuldade.inserirNovaDificuldade(contentType, dados)
    response.status(result.status_code).json(result)
})

router.get("/", async function(request, response){
    let result = await controllerDificuldade.listarDificuldade()
    response.status(result.status_code).json(result)
})

router.get("/:id", async function(request, response){
    let id = request.params.id
    let result = await controllerDificuldade.buscarDificuldadeId(id)
    response.status(result.status_code).json(result)
})

router.put("/:id", verifyJWT, bodyParserJSON, async function(request, response){
    let id = request.params.id
    let dados = request.body
    let contentType = request.headers["content-type"]
    let result = await controllerDificuldade.atualizarDificuldade(id, contentType, dados)
    response.status(result.status_code).json(result)
})

router.delete("/:id", verifyJWT, async function(request, response){
    let id = request.params.id
    let result = await controllerDificuldade.excluirDificuldade(id)
    response.status(result.status_code).json(result)
})

module.exports = router
