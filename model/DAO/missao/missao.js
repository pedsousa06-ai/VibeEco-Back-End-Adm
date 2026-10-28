/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de missao (com categoria e etapas)
 * Data: 09/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.2.10.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development)

// SELECT base: datas já em 'YYYY-MM-DD' (evita o JSON devolver Date com fuso e mudar o dia)
// A categoria vem de tbl_missao_categoria (uma missão pode ter mais de uma; aqui usamos a de menor id)
const SELECT_MISSAO = `
    select  tbl_missao.id, tbl_missao.nome, tbl_missao.descricao, tbl_missao.dica, tbl_missao.coins, tbl_missao.total_xp_missao,
            date_format(tbl_missao.data_inicio, '%Y-%m-%d')  as data_inicio,
            date_format(tbl_missao.data_termino, '%Y-%m-%d') as data_termino,
            tbl_missao.id_dificuldade,
            tbl_dificuldade.nome as dificuldade,
            tbl_categoria.id as id_categoria,
            tbl_categoria.nome as categoria
        from tbl_missao
            inner join tbl_dificuldade
                on tbl_missao.id_dificuldade = tbl_dificuldade.id
            left join (select id_missao, min(id_categoria) as id_categoria
                            from tbl_missao_categoria
                                group by id_missao) as mc
                on mc.id_missao = tbl_missao.id
            left join tbl_categoria
                on tbl_categoria.id = mc.id_categoria
`

// Anexa em cada missão o array "etapas" (ordenado)
const anexarEtapas = async function(missoes){

    if(missoes.length === 0){
        return missoes
    }

    let ids = missoes.map(m => m.id)

    // um "?" para cada id (não depende de o driver expandir arrays)
    let marcadores = ids.map(() => "?").join(", ")

    let result = await knexConex.raw(
        `select id, id_missao, titulo, xp, ordem
            from tbl_missao_etapa
                where id_missao in (${marcadores})
            order by id_missao, ordem;`,
        ids
    )

    let etapas = result[0]

    missoes.forEach(m => {
        m.etapas = etapas
            .filter(e => e.id_missao === m.id)
            .map(e => ({ id: e.id, titulo: e.titulo, xp: e.xp, ordem: e.ordem }))
    })

    return missoes
}

// Grava categoria e etapas de uma missão dentro de uma transação já aberta
const gravarCategoria = async function(trx, idMissao, idCategoria){

    await trx.raw(`delete from tbl_missao_categoria where id_missao = ?;`, [idMissao])

    if(idCategoria){
        await trx.raw(
            `insert into tbl_missao_categoria (id_missao, id_categoria) values (?, ?);`,
            [idMissao, idCategoria]
        )
    }
}

const gravarEtapas = async function(trx, idMissao, etapas){

    // etapas que já existem no banco
    let atuais = (await trx.raw(`select id from tbl_missao_etapa where id_missao = ?;`, [idMissao]))[0].map(e => e.id)

    // etapas que continuam na lista (têm id)
    let mantidas = etapas.filter(e => e.id).map(e => Number(e.id))

    // etapas removidas pelo administrador: apaga primeiro o progresso dos usuários nelas
    let removidas = atuais.filter(id => !mantidas.includes(id))

    for(const idEtapa of removidas){
        await trx.raw(`delete from tbl_usuario_missao_etapa where id_missao_etapa = ?;`, [idEtapa])
        await trx.raw(`delete from tbl_missao_etapa where id = ?;`, [idEtapa])
    }

    // a "ordem" é única por missão (UQ_MISSAO_ORDEM): passa tudo para uma faixa alta
    // antes de renumerar, para uma troca de posição não bater na restrição
    await trx.raw(`update tbl_missao_etapa set ordem = ordem + 1000 where id_missao = ?;`, [idMissao])

    for(const [i, etapa] of etapas.entries()){

        if(etapa.id && atuais.includes(Number(etapa.id))){
            await trx.raw(
                `update tbl_missao_etapa set titulo = ?, xp = ?, ordem = ? where id = ? and id_missao = ?;`,
                [etapa.titulo, etapa.xp, i + 1, etapa.id, idMissao]
            )
        }else{
            await trx.raw(
                `insert into tbl_missao_etapa (id_missao, titulo, xp, ordem) values (?, ?, ?, ?);`,
                [idMissao, etapa.titulo, etapa.xp, i + 1]
            )
        }
    }
}

/* INICIANDO CRUD DA TABELA DE MISSAO */

//inserir dado (missão + categoria + etapas, tudo ou nada)
const insertMissao = async function(missao){

    try {

        let idMissao = await knexConex.transaction(async (trx) => {

            // "?" = valores enviados separados da query (evita SQL injection e quebra com aspas no texto)
            let result = await trx.raw(
                `insert into tbl_missao (nome, descricao, dica, coins, total_xp_missao, data_inicio, data_termino, id_dificuldade)
                    values (?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                    missao.nome,
                    missao.descricao,
                    missao.dica || null,
                    missao.coins,
                    missao.total_xp_missao,
                    missao.data_inicio,
                    missao.data_termino,
                    missao.id_dificuldade
                ]
            )

            let novoId = result[0].insertId

            await gravarCategoria(trx, novoId, missao.id_categoria)
            await gravarEtapas(trx, novoId, missao.etapas)

            return novoId
        })

        return idMissao

    } catch (error) {
        console.log(error)
        return false
    }
}

//atualizar dado (missão + categoria + etapas, tudo ou nada)
const updateMissao = async function(missao){

    try {

        await knexConex.transaction(async (trx) => {

            await trx.raw(
                `update tbl_missao set
                    nome            = ?,
                    descricao       = ?,
                    dica            = ?,
                    coins           = ?,
                    total_xp_missao = ?,
                    data_inicio     = ?,
                    data_termino    = ?,
                    id_dificuldade  = ?
                 where id = ?;`,
                [
                    missao.nome,
                    missao.descricao,
                    missao.dica || null,
                    missao.coins,
                    missao.total_xp_missao,
                    missao.data_inicio,
                    missao.data_termino,
                    missao.id_dificuldade,
                    missao.id
                ]
            )

            await gravarCategoria(trx, missao.id, missao.id_categoria)
            await gravarEtapas(trx, missao.id, missao.etapas)
        })

        return true

    } catch (error) {
        console.log(error)
        return false
    }
}

//retornar todos os dados
const selectAllMissao = async function(){

    try {

        let result = await knexConex.raw(`${SELECT_MISSAO} order by tbl_missao.id desc;`)

        if(Array.isArray(result)){
            return await anexarEtapas(result[0])
        }else{
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

//retornar dado com base no id
const selectByIdMissao = async function(id){

    try {

        let result = await knexConex.raw(`${SELECT_MISSAO} where tbl_missao.id = ?;`, [id])

        if(Array.isArray(result)){
            return await anexarEtapas(result[0])
        }else{
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

//deletar dado pelo id (apaga antes o que depende da missão; falha se algum usuário já participou)
const deleteMissao = async function(id){

    try {

        await knexConex.transaction(async (trx) => {

            await trx.raw(
                `delete from tbl_usuario_missao_etapa
                    where id_missao_etapa in (select id from tbl_missao_etapa where id_missao = ?);`,
                [id]
            )
            await trx.raw(`delete from tbl_missao_etapa where id_missao = ?;`, [id])
            await trx.raw(`delete from tbl_missao_categoria where id_missao = ?;`, [id])
            await trx.raw(`delete from tbl_missao where id = ?;`, [id])
        })

        return true

    } catch (error) {
        console.log(error)
        return false
    }
}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    insertMissao,
    updateMissao,
    selectAllMissao,
    selectByIdMissao,
    deleteMissao
}
