/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de conteudo_educativo
 *           (e nas tabelas de relação: categoria e anexo)
 * Data: 21/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.1.10.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/* Os valores são enviados por "?" (bindings do knex): evita quebrar a query com aspas no texto e SQL injection */
/* Inserir, atualizar e excluir usam TRANSAÇÃO: se qualquer passo falhar, nada é gravado (sem conteúdo pela metade) */

/* FUNÇÕES AUXILIARES (rodam dentro de uma transação) */

//liga o conteúdo às categorias
const vincularCategorias = async function(trx, idConteudo, categorias){

    for(const categoria of categorias){
        await trx.raw(
            `insert into tbl_conteudo_educativo_categoria (id_conteudo_educativo, id_categoria) values (?, ?);`,
            [idConteudo, categoria.id]
        )
    }
}

//cria os anexos em tbl_anexo e liga ao conteúdo
const inserirAnexos = async function(trx, idConteudo, anexos){

    for(const anexo of anexos){

        let resultAnexo = await trx.raw(
            `insert into tbl_anexo (nome, endereco_url) values (?, ?);`,
            [anexo.nome, anexo.endereco_url]
        )

        await trx.raw(
            `insert into tbl_conteudo_educativo_anexo (id_conteudo_educativo, id_anexo) values (?, ?);`,
            [idConteudo, resultAnexo[0].insertId]
        )
    }
}

//desliga os anexos do conteúdo e apaga de tbl_anexo SÓ os que ninguém mais usa (posts e recompensas também usam tbl_anexo)
const desvincularAnexos = async function(trx, idConteudo, idsAnexos){

    for(const idAnexo of idsAnexos){

        await trx.raw(
            `delete from tbl_conteudo_educativo_anexo where id_conteudo_educativo = ? and id_anexo = ?;`,
            [idConteudo, idAnexo]
        )

        await trx.raw(
            `delete from tbl_anexo
                where id = ?
                    and id not in (select id_anexo from tbl_post_anexo)
                    and id not in (select id_anexo from tbl_recompensa_anexo)
                    and id not in (select id_anexo from tbl_conteudo_educativo_anexo);`,
            [idAnexo]
        )
    }
}

/* INICIANDO CRUD DA TABELA DE CONTEUDO EDUCATIVO */

//inserir dado (conteúdo + categorias + anexos). Retorna o id gerado
const insertConteudoEducativo = async function(conteudoEducativo){

    try {

        return await knexConex.transaction(async (trx) => {

            let result = await trx.raw(
                `insert into tbl_conteudo_educativo (nome, descricao, img, duracao_leitura, qtde_xp) values (?, ?, ?, ?, ?);`,
                [
                    conteudoEducativo.nome,
                    conteudoEducativo.descricao ?? null,
                    conteudoEducativo.img ?? "",
                    conteudoEducativo.duracao_leitura,
                    conteudoEducativo.qtde_xp
                ]
            )

            let id = result[0].insertId //pega o id do item adicionado para retornar, ao invés de retornar só o "true"

            await vincularCategorias(trx, id, conteudoEducativo.categoria)
            await inserirAnexos(trx, id, conteudoEducativo.anexos ?? [])

            return id
        })

    } catch (error) {
        console.log(error)
        return false
    }

}

//atualizar dado (conteúdo + recria as categorias + remove/adiciona anexos)
const updateConteudoEducativo = async function(conteudoEducativo){

    try {

        await knexConex.transaction(async (trx) => {

            await trx.raw(
                `update tbl_conteudo_educativo set
                    nome            = ?,
                    descricao       = ?,
                    img             = ?,
                    duracao_leitura = ?
                where id = ?;`,
                [
                    conteudoEducativo.nome,
                    conteudoEducativo.descricao ?? null,
                    conteudoEducativo.img ?? "",
                    conteudoEducativo.duracao_leitura,
                    conteudoEducativo.id
                ]
            )

            //categorias: apaga as antigas (pelo ID DO CONTEÚDO) e grava as novas
            await trx.raw(`delete from tbl_conteudo_educativo_categoria where id_conteudo_educativo = ?;`, [conteudoEducativo.id])
            await vincularCategorias(trx, conteudoEducativo.id, conteudoEducativo.categoria)

            //anexos: tira os removidos e coloca os novos (os mantidos não são tocados)
            await desvincularAnexos(trx, conteudoEducativo.id, conteudoEducativo.anexos_remover ?? [])
            await inserirAnexos(trx, conteudoEducativo.id, conteudoEducativo.anexos ?? [])
        })

        return true

    } catch (error) {
        console.log(error)
        return false
    }

}

//retornar todos os dados
const selectAllConteudoEducativo = async function(){

    try {

        let sql = `select id, nome, descricao, img, duracao_leitura from tbl_conteudo_educativo order by id desc;`

        let result = await knexConex.raw(sql)

        //Verificando se é um array
        if(Array.isArray(result)){
            return result[0]
        }else{
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

//retornar dado com base no id
const selectByIdConteudoEducativo = async function(id){

    try {

        let sql = `select id, nome, descricao, img, duracao_leitura from tbl_conteudo_educativo where id = ?;`

        let result = await knexConex.raw(sql, [id])

        if(Array.isArray(result)){
            return result[0]
        }else{
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

//retornar as categorias dos conteúdos (todas, ou só as de um conteúdo se o id for informado)
const selectCategoriasConteudo = async function(idConteudo = null){

    try {

        let sql = `select tbl_conteudo_educativo_categoria.id_conteudo_educativo, tbl_categoria.id, tbl_categoria.nome
                        from tbl_conteudo_educativo_categoria
                            inner join tbl_categoria
                                on tbl_conteudo_educativo_categoria.id_categoria = tbl_categoria.id`
        let bindings = []

        if(idConteudo !== null){
            sql += ` where tbl_conteudo_educativo_categoria.id_conteudo_educativo = ?`
            bindings.push(idConteudo)
        }

        sql += ` order by tbl_categoria.nome asc;`

        let result = await knexConex.raw(sql, bindings)

        if(Array.isArray(result)){
            return result[0]
        }else{
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

//retornar os anexos dos conteúdos (todos, ou só os de um conteúdo se o id for informado)
const selectAnexosConteudo = async function(idConteudo = null){

    try {

        let sql = `select tbl_conteudo_educativo_anexo.id_conteudo_educativo, tbl_anexo.id, tbl_anexo.nome, tbl_anexo.endereco_url
                        from tbl_conteudo_educativo_anexo
                            inner join tbl_anexo
                                on tbl_conteudo_educativo_anexo.id_anexo = tbl_anexo.id`
        let bindings = []

        if(idConteudo !== null){
            sql += ` where tbl_conteudo_educativo_anexo.id_conteudo_educativo = ?`
            bindings.push(idConteudo)
        }

        sql += ` order by tbl_anexo.id asc;`

        let result = await knexConex.raw(sql, bindings)

        if(Array.isArray(result)){
            return result[0]
        }else{
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

//deletar dado pelo id (apaga categorias, anexos e por fim o conteúdo)
const deleteConteudoEducativo = async function(id){

    try {

        await knexConex.transaction(async (trx) => {

            await trx.raw(`delete from tbl_conteudo_educativo_categoria where id_conteudo_educativo = ?;`, [id])

            let anexos = await trx.raw(`select id_anexo from tbl_conteudo_educativo_anexo where id_conteudo_educativo = ?;`, [id])
            await desvincularAnexos(trx, id, anexos[0].map(anexo => anexo.id_anexo))

            //se algum usuário já acessou o conteúdo (tbl_usuario_conteudo_educativo) o banco recusa e tudo volta ao que era
            await trx.raw(`delete from tbl_conteudo_educativo where id = ?;`, [id])
        })

        return true

    } catch (error) {
        console.log(error)
        return false
    }
}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    insertConteudoEducativo,
    updateConteudoEducativo,
    selectAllConteudoEducativo,
    selectByIdConteudoEducativo,
    selectCategoriasConteudo,
    selectAnexosConteudo,
    deleteConteudoEducativo
}
