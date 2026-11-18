/********************************************************************************************************************************************************************************************
 * Objetivo: Regras da tela "Progresso geral" do painel administrativo.
 * Data: 18/11/2026
 * Versão: 1.0.0
 ********************************************************************************************************************************************************************************************/

const config_message = require("../modulo/configMessages.js")
const progressoDAO = require("../../model/DAO/progresso/progresso.js")

const PERIODOS_VALIDOS = [7, 30, 90]

const validarPeriodo = function (periodo) {
    const n = Number(periodo)
    if (!PERIODOS_VALIDOS.includes(n)) return null
    return n
}

const obterProgresso = async function (periodo) {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        const dias = validarPeriodo(periodo)
        if (!dias) {
            message.ERROR_BAD_REQUEST.field = "[PERIODO] deve ser 7, 30 ou 90"
            return message.ERROR_BAD_REQUEST
        }

        const [
            media,
            concluidas,
            engajados,
            xp,
            porCategoria,
            topMissoes,
            ranking
        ] = await Promise.all([
            progressoDAO.conclusaoMedia(),
            progressoDAO.missoesConcluidas(dias),
            progressoDAO.usuariosEngajados(dias),
            progressoDAO.xpDistribuido(dias),
            progressoDAO.conclusaoPorCategoria(),
            progressoDAO.missoesMaiorConclusao(),
            progressoDAO.rankingUsuarios()
        ])

        message.DEFAULT_MESSAGE.status = true
        message.DEFAULT_MESSAGE.status_code = 200
        message.DEFAULT_MESSAGE.response = {
            periodo: dias,
            atualizadoEm: new Date().toISOString(),
            metricas: [
                { id: "conclusao-media", titulo: "Conclusão média", valor: media, formato: "percentual", nota: "Das missões em andamento" },
                { id: "missoes-concluidas", titulo: "Missões concluídas", valor: concluidas, formato: "numero", nota: "No período selecionado" },
                { id: "usuarios-engajados", titulo: "Usuários engajados", valor: engajados, formato: "numero", nota: "Com ao menos uma atividade" },
                { id: "xp-distribuido", titulo: "XP distribuído", valor: xp, formato: "compacto", nota: "Total entregue em recompensas" }
            ],
            categorias: porCategoria,
            topMissoes,
            ranking
        }

        return message.DEFAULT_MESSAGE
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    obterProgresso
}