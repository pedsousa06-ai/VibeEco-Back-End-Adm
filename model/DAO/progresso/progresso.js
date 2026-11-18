const knexFactory = require("knex")
const config = require("../../database_config_knex/knex_file.js")
const knex = knexFactory(config.development)

const inicioPeriodo = (dias) => {
    const d = new Date()
    d.setDate(d.getDate() - Number(dias))
    return `${d.toISOString().slice(0, 10)} 00:00:00`
}

const conclusaoMedia = async function () {
    const [row] = await knex("tbl_usuario_missao").where("status", "EM_ANDAMENTO").avg({ media: "progresso" })
    return Math.round(Number(row.media) || 0)
}

const missoesConcluidas = async function (dias) {
    const ini = inicioPeriodo(dias)
    const [row] = await knex("tbl_usuario_missao").where("status", "CONCLUIDA").where("data_conclusao", ">=", ini).count({ total: "*" })
    return Number(row.total) || 0
}

const usuariosEngajados = async function (dias) {
    const ini = inicioPeriodo(dias)
    const [row] = await knex("tbl_usuario_missao")
        .where(function () {
            this.where("data_conclusao", ">=", ini).orWhere("status", "EM_ANDAMENTO")
        })
        .countDistinct({ total: "id_usuario" })
    return Number(row.total) || 0
}

const xpDistribuido = async function (dias) {
    const ini = inicioPeriodo(dias)
    const [row] = await knex("tbl_usuario_missao as um")
        .join("tbl_missao as m", "m.id", "um.id_missao")
        .where("um.status", "CONCLUIDA").where("um.data_conclusao", ">=", ini)
        .sum({ total: "m.total_xp_missao" })
    return Number(row.total) || 0
}

const conclusaoPorCategoria = async function () {
    const rows = await knex("tbl_usuario_missao as um")
        .join("tbl_missao_categoria as mc", "mc.id_missao", "um.id_missao")
        .join("tbl_categoria as c", "c.id", "mc.id_categoria")
        .where("um.status", "EM_ANDAMENTO")
        .groupBy("c.id", "c.nome").select("c.nome").avg({ media: "um.progresso" }).orderBy("media", "desc")
    return rows.map(r => ({ nome: r.nome, porcentagem: Math.round(Number(r.media) || 0) }))
}

const missoesMaiorConclusao = async function () {
    const rows = await knex("tbl_usuario_missao as um")
        .join("tbl_missao as m", "m.id", "um.id_missao")
        .groupBy("m.id", "m.nome").select("m.nome").count({ total: "*" })
        .sum({ concluidas: knex.raw("CASE WHEN um.status = 'CONCLUIDA' THEN 1 ELSE 0 END") })
        .orderBy("concluidas", "desc").limit(4)
    return rows.map(r => {
        const total = Number(r.total); const concluidas = Number(r.concluidas) || 0
        return { nome: r.nome, porcentagem: total > 0 ? Math.round((concluidas / total) * 100) : 0 }
    })
}

const rankingUsuarios = async function () {
    const rows = await knex("tbl_usuario as u")
        .leftJoin("tbl_usuario_missao as um", "um.id_usuario", "u.id")
        .where("u.id_nivel_acesso", "!=", 1).groupBy("u.id", "u.nome", "u.total_xp")
        .select("u.nome", "u.total_xp")
        .count({ missoes: knex.raw("CASE WHEN um.status = 'CONCLUIDA' THEN 1 ELSE 0 END") })
        .orderBy("u.total_xp", "desc").limit(5)
    return rows.map(r => ({ nome: r.nome, xp: Number(r.total_xp), missoes: Number(r.missoes) || 0 }))
}

module.exports = { conclusaoMedia, missoesConcluidas, usuariosEngajados, xpDistribuido, conclusaoPorCategoria, missoesMaiorConclusao, rankingUsuarios }
