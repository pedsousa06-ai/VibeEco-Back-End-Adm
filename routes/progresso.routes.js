const express = require("express")
const controllerProgresso = require("../controller/progresso/controller_progresso.js")
const { protegerApi } = require("../middleware/middlewareJWT.js")

const router = express.Router()

router.get("/", protegerApi, async function (request, response) {
    let result = await controllerProgresso.obterProgresso(request.query.periodo)
    response.status(result.status_code).json(result)
})

module.exports = router