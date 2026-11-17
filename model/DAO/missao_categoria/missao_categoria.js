/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela intermediária missao_categoria, que faz a relação entre as tabelas missão e categoria
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
const insertMissaoCategoria = async function(missaoCategoria){

    try {

        let sql =
            `insert into tbl_missao_categoria (
                id_missao,
                id_categoria
            )
            values (
                ${missaoCategoria.id_missao},
                ${missaoCategoria.id_categoria}
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
const updateMissaoCategoria = async function(missaoCategoria){

    try {

        let sql =   `update tbl_missao_categoria set
                        id_missao      = ${missaoCategoria.id_missao},
                        id_categoria    = ${missaoCategoria.id_categoria}

                    where id = ${missaoCategoria.id};`

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
const selectAllMissaoCategoria = async function(){

    try {

        let sql = "select * from tbl_missao_categoria order by id desc;"

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
const selectByIdMissaoCategoria = async function(id){

    try {

        let sql = `select * from tbl_missao_categoria where id = ${id}`

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
const deleteMissaoCategoria = async function(id){

    try {

        let sql = `delete from tbl_missao_categoria where id = ${id};`

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
const selectMissaoByIdCategoria = async function(idCategoria){

    try {
        
        //criando variável sql
        let sql = `select   tbl_missao.*
                        from tbl_missao
                            inner join tbl_missao_categoria
                                on tbl_missao.id = tbl_missao_categoria.id_missao
                            inner join tbl_categoria
                                on tbl_categoria.id = tbl_missao_categoria.id_categoria
                    where tbl_categoria.id = ${idCategoria};`

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
const selectCategoriaByIdMissao = async function(idMissao){

    try {
        
        //criando variável sql
        let sql = `select   tbl_categoria.*
                        from tbl_missao
                            inner join tbl_missao_categoria
                                on tbl_missao.id = tbl_missao_categoria.id_missao
                            inner join tbl_categoria
                                on tbl_categoria.id = tbl_missao_categoria.id_categoria
                    where tbl_missao.id = ${idMissao};`

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
const deleteCategoriaByIdMissao = async function(idUsuario){

    try {

        let sql = `delete from tbl_missao_categoria where id_usuario = ${idUsuario};` //apagando pela chave estrangeira da tabela principal, para apagar todos os dados relacionados a ela

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
    insertMissaoCategoria,
    updateMissaoCategoria,
    selectAllMissaoCategoria,
    selectByIdMissaoCategoria,
    selectCategoriaByIdMissao,
    selectMissaoByIdCategoria,
    deleteCategoriaByIdMissao,
    deleteMissaoCategoria

}
