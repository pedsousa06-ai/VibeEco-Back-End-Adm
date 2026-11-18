/********************************************************************************************************************************************************************************************
 * Objetivo: Regras da tela "Início" do painel administrativo.
 * Data: 18/11/2026
 * Versão: 1.0.0
 *******************************************************************************************************************************************************************************************/

const config_message = require("../modulo/configMessages.js")
const dashboardDAO = require("../../model/DAO/dashboard/dashboard.js")
const XLSX = require("exceljs")

const PERIODOS_VALIDOS = [7, 30, 90]

const validarPeriodo = function (periodo) {
    const n = Number(periodo)
    if (!PERIODOS_VALIDOS.includes(n)) return null
    return n
}

const variacao = function (atual, anterior) {
    if (anterior === 0) return atual > 0 ? "+100%" : "0%"
    const pct = ((atual - anterior) / anterior) * 100
    const sinal = pct > 0 ? "+" : ""
    return `${sinal}${pct.toFixed(0)}%`
}

const tendencia = function (atual, anterior) {
    if (atual > anterior) return "up"
    if (atual < anterior) return "down"
    return "neutro"
}

// ---- resumo --------------------------------------------------------------

const obterResumo = async function (periodo) {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        const dias = validarPeriodo(periodo)
        if (!dias) {
            message.ERROR_BAD_REQUEST.field = "[PERIODO] deve ser 7, 30 ou 90"
            return message.ERROR_BAD_REQUEST
        }

        const [
            missoesAtivas,
            missoesAnterior,
            desafios,
            novosDesafios,
            usuarios,
            novosUsuarios,
            progresso,
        ] = await Promise.all([
            dashboardDAO.totalMissoesAtivas(),
            dashboardDAO.totalMissoesAtivasPeriodoAnterior(dias),
            dashboardDAO.totalDesafios(),
            dashboardDAO.novosDesafiosNoPeriodo(dias),
            dashboardDAO.totalUsuariosAtivos(),
            dashboardDAO.novosUsuariosNoPeriodo(dias),
            dashboardDAO.progressoGeralMedio(),
        ])

        const metricas = [
            {
                id: "missoes-ativas",
                titulo: "Missões ativas",
                valor: missoesAtivas,
                formato: "numero",
                nota: `${variacao(missoesAtivas, missoesAnterior)} em relação ao período anterior`,
                tendencia: tendencia(missoesAtivas, missoesAnterior),
            },
            {
                id: "desafios",
                titulo: "Desafios",
                valor: desafios,
                formato: "numero",
                nota: `${novosDesafios} novos nos últimos ${dias} dias`,
                tendencia: novosDesafios > 0 ? "up" : "neutro",
            },
            {
                id: "usuarios",
                titulo: "Usuários",
                valor: usuarios,
                formato: "compacto",
                nota: `${novosUsuarios} novos cadastros nos últimos ${dias} dias`,
                tendencia: novosUsuarios > 0 ? "up" : "neutro",
            },
            {
                id: "progresso-geral",
                titulo: "Progresso geral",
                valor: progresso,
                formato: "percentual",
                nota: "Conclusão média das missões em andamento",
                tendencia: "neutro",
            },
        ]

        message.DEFAULT_MESSAGE.status = true
        message.DEFAULT_MESSAGE.status_code = 200
        message.DEFAULT_MESSAGE.response = {
            periodo: dias,
            atualizadoEm: new Date().toISOString(),
            metricas,
        }
        return message.DEFAULT_MESSAGE
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

// ---- exportação XLSX -----------------------------------------------------

const exportarXLSX = async function (periodo) {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        const dias = validarPeriodo(periodo)
        if (!dias) {
            message.ERROR_BAD_REQUEST.field = "[PERIODO] deve ser 7, 30 ou 90"
            return message.ERROR_BAD_REQUEST
        }

        const resumo = await obterResumo(dias)
        if (!resumo.status) return resumo

        const { metricas } = resumo.response

        const wb = new XLSX.Workbook()
        wb.creator = "VibeEco Admin"
        wb.created = new Date()

        const ws = wb.addWorksheet("Resumo")
        ws.columns = [
            { header: "Métrica", key: "titulo", width: 24 },
            { header: "Valor", key: "valor", width: 14 },
            { header: "Observação", key: "nota", width: 52 },
            { header: "Tendência", key: "tendencia", width: 12 },
        ]
        metricas.forEach((m) => {
            let valorExibido = m.valor
            if (m.formato === "percentual") valorExibido = `${m.valor}%`
            ws.addRow({
                titulo: m.titulo,
                valor: valorExibido,
                nota: m.nota,
                tendencia: m.tendencia,
            })
        })
        ws.getRow(1).font = { bold: true }
        ws.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFCDEED7" },
        }

        const wsInfo = wb.addWorksheet("Info")
        wsInfo.columns = [
            { header: "Campo", key: "campo", width: 20 },
            { header: "Valor", key: "valor", width: 40 },
        ]
        wsInfo.addRows([
            { campo: "Período", valor: `Últimos ${dias} dias` },
            { campo: "Gerado em", valor: new Date().toLocaleString("pt-BR") },
            { campo: "Gerado por", valor: "Painel Administrativo VibeEco" },
        ])
        wsInfo.getRow(1).font = { bold: true }

        const buffer = await wb.xlsx.writeBuffer()

        message.DEFAULT_MESSAGE.status = true
        message.DEFAULT_MESSAGE.status_code = 200
        message.DEFAULT_MESSAGE.message = "Arquivo gerado com sucesso."
        message.DEFAULT_MESSAGE.response = buffer
        return message.DEFAULT_MESSAGE
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    obterResumo,
    exportarXLSX,
}