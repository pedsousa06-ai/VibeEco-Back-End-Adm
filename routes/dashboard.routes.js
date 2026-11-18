const express = require("express")
const controllerDashboard = require("../controller/dashboard/controller_dashboard.js")

const router = express.Router()

router.get("/resumo", async function (request, response) {
    let result = await controllerDashboard.obterResumo(request.query.periodo)
    response.status(result.status_code).json(result)
})

router.get("/exportar", async function (request, response) {
    let result = await controllerDashboard.exportarXLSX(request.query.periodo)

    if (!result.status) {
        return response.status(result.status_code).json(result)
    }

    const dias = request.query.periodo || 30
    response.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response.setHeader(
        "Content-Disposition",
        `attachment; filename="vibeeco-dashboard-${dias}d.xlsx"`
    )
    return response.send(result.response)
})

module.exports = router