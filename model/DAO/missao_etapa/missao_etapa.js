/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela intermediária missao_categoria, que faz a relação entre as tabelas missão e etapa
 * Data: 17/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.1.11.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/* INICIANDO CRUD DA TABELA MISSAO_CATEGORIA (TABELA INTERMEDIÁRIA) */

//função para inserir dados
const insertMissaoEtapa = async function(missaoEtapa){

    try {

        let sql =
            `insert into tbl_missao_etapa (
                titulo,
                xp,
                ordem
                id_missao
            )
            values (
                ${missaoEtapa.titulo},
                ${missaoEtapa.xp},
                ${missaoEtapa.ordem},
                ${missaoEtapa.id_missao}
            );`

        let result = await knexConex.raw(sql)

        if(result)
            return result[0].insertId
        else
            return false

    } catch (error) {
        console.log(error)
        return false
    }
}

//função para atualizar um dado
const updateMissaoEtapa = async function(missaoEtapa){

    try {

        let sql =   `update tbl_missao_etapa set
        titulo         = ${missaoEtapa.titulo}
        xp             = ${missaoEtapa.xp}
        ordem          = ${missaoEtapa.ordem}
        id_missao      = ${missaoEtapa.id_missao}
            where id = ${missaoEtapa.id};`

        let result = await knexConex.raw(sql)

        if(result){
            return true
        }else{
            return false
        }

    } catch (error) {
        return false
    }
}

//função para retornar todos os dados
const selectAllMissaoEtapa = async function(){

    try {

        let sql = "select * from tbl_missao_etapa order by id desc;"

        let result = await knexConex.raw(sql)

        if(Array.isArray(result)){

            return result[0]

        }else{
            return false
        }

    } catch (error) {
        return false
    }
}

//função para retornar um dado pelo id
const selectByIdMissaoEtapa = async function(id){

    try {

        let sql = `select * from tbl_missao_etapa where id = ${id}`

        let result = await knexConex.raw(sql)

        if(Array.isArray(result)){

            return result[0]

        }else{
            return false
        }
    } catch (error) {
        return false
    }
}

//função para deletar um dado pelo id
const deleteMissaoEtapa = async function(id){

    try {

        let sql = `delete from tbl_missao_etapa where id = ${id};`

        let result = await knexConex.raw(sql)

        if(result){
            return true
        }else{
            return false
        }

    } catch (error) {
        return false
    }
}

/* ATÉ AQUI FOI SÓ ALTERAÇÃO SIMPLES, DAQUI PRA BAIXO SÃO IMPLEMENTAÇÕES DIFERENTES */

//função para retornar os dados da tabela principal pelo id da tabela secundaria
const selectMissaoByIdEtapa = async function(idEtapa){

    try {
        //criando variável sql
        let sql = `select   tbl_missao.*
                                from tbl_missao
                                    inner join tbl_missao_etapa
                                        on tbl_missao.id = tbl_missao_etapa.id_missao
                        where tbl_missao_etapa.id = ${idEtapa}`

        //executando no banco de dados
        let result = await knexConex.raw(sql)

        //validando retorno
        if(Array.isArray(result)){ //vendo se é um array

            return result[0] //retornando somente o que nós pedimos, sem expecificações da tabela
        //se não for array ele cai aqui
        }else{
            return false
        }
    } catch (error) {
        return false
    }
}

//função para retornar os dados secundarios pelo id da tabela principal
const selectEtapaByIdMissao = async function(idMissao){

    try {
        
        //criando variável sql
        let sql = `select * from tbl_missao_etapa where id.missao = ${idMissao}`

        //executando no banco de dados
        let result = await knexConex.raw(sql)

        //validando retorno
        if(Array.isArray(result)){ //vendo se é um array

            return result[0] //retornando somente o que nós pedimos, sem expecificações da tabela
        //se não for array ele cai aqui
        }else{
            return false
        }
    } catch (error) {
        return false
    }
}

//função para excluir os dados filtrando pelo id da tabela principal, essa função será utilizada no update da tabela principal, pois precisa apagar pra depois inserir os novos dados relacionados
const deleteEtapaByIdMissao = async function(idMissao){

    try {

        let sql = `delete from tbl_missao_etapa where id_missao = ${idMissao};` //apagando pela chave estrangeira da tabela principal, para apagar todos os dados relacionados a ela

        let result = await knexConex.raw(sql)

        if(result){
            return true
        }else{
            return false
        }
        
    } catch (error) {
        return false
    }
}


module.exports = {
    deleteEtapaByIdMissao,
    selectAllMissaoEtapa,
    selectByIdMissaoEtapa,
    selectEtapaByIdMissao,
    selectMissaoByIdEtapa,
    insertMissaoEtapa,
    updateMissaoEtapa,
    deleteMissaoEtapa
}
