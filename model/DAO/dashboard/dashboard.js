/********************************************************************************************************************************************************************************************
 * Objetivo: Queries de agregação para o dashboard "Início" do painel.
 * Data: 18/11/2026
 * Versão: 1.0.0
 *******************************************************************************************************************************************************************************************/

const knexFactory = require("knex")
const config = require("../../database_config_knex/knex_file.js")
const knex = knexFactory(config.development)

// ---- helpers -------------------------------------------------------------

const hoje = () => new Date()

const inicioPeriodo = (dias) => {
    const d = hoje()
    d.setDate(d.getDate() - Number(dias))
    return d.toISOString().slice(0, 10)
}

const inicioPeriodoAnterior = (dias) => {
    const d = hoje()
    d.setDate(d.getDate() - Number(dias) * 2)
    return d.toISOString().slice(0, 10)
}

// ---- missões -------------------------------------------------------------

const totalMissoesAtivas = async function () {
    const [row] = await knex("tbl_missao")
        .whereRaw("data_termino >= CURDATE()")
        .count({ total: "*" })
    return Number(row.total) || 0
}

const totalMissoesAtivasPeriodoAnterior = async function (dias) {
    const ini = inicioPeriodoAnterior(dias)
    const fim = inicioPeriodo(dias)
    const [row] = await knex("tbl_missao")
        .whereBetween("data_termino", [ini, fim])
        .count({ total: "*" })
    return Number(row.total) || 0
}

// ---- desafios ------------------------------------------------------------

const totalDesafios = async function () {
    const [row] = await knex("tbl_desafio")
        .whereRaw("data_termino >= CURDATE()")
        .count({ total: "*" })
    return Number(row.total) || 0
}

const novosDesafiosNoPeriodo = async function (dias) {
    const ini = inicioPeriodo(dias)
    const [row] = await knex("tbl_desafio")
        .where("data_inicio", ">=", ini)
        .count({ total: "*" })
    return Number(row.total) || 0
}

// ---- usuários (ignora Administrador = nivel 1) ---------------------------

const totalUsuariosAtivos = async function () {
    const [row] = await knex("tbl_usuario as u")
        .innerJoin("tbl_status as s", "s.id", "u.id_status")
        .where("s.is_active", 1)
        .where("u.id_nivel_acesso", "!=", 1)
        .count({ total: "u.id" })
    return Number(row.total) || 0
}

const novosUsuariosNoPeriodo = async function (dias) {
    const ini = `${inicioPeriodo(dias)} 00:00:00`
    const [row] = await knex("tbl_usuario as u")
        .innerJoin("tbl_status as s", "s.id", "u.id_status")
        .where("s.is_active", 1)
        .where("u.id_nivel_acesso", "!=", 1)
        .whereNotNull("u.data_ultimo_acesso")
        .where("u.data_ultimo_acesso", ">=", ini)
        .count({ total: "u.id" })
    return Number(row.total) || 0
}

// ---- progresso geral -----------------------------------------------------

const progressoGeralMedio = async function () {
    const [row] = await knex("tbl_usuario_missao")
        .where("status", "EM_ANDAMENTO")
        .avg({ media: "progresso" })
    const media = Number(row.media)
    return isNaN(media) ? 0 : Math.round(media)
}

module.exports = {
    totalMissoesAtivas,
    totalMissoesAtivasPeriodoAnterior,
    totalDesafios,
    novosDesafiosNoPeriodo,
    totalUsuariosAtivos,
    novosUsuariosNoPeriodo,
    progressoGeralMedio,
}