/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de categoria
 * Data: 07/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.10.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/*INICIANDO CRUD DA TABELA DE GENEROS_FILME (TABELA INTERMEDIÁRIA)*/

//função para inserir dados
const insertDesafioCategoria = async function(desafioCategoria){

    try {
        
        let sql = 
            `insert into tbl_desafio_categoria (
                id_desafio,
                id_categoria
            )
            values (
                ${desafioCategoria.id_desafio},
                ${desafioCategoria.id_categoria}
            );`

        let result = await knexConex.raw(sql) 

        if(result)
            return result[0].insertId 
        else
            return false
        
    } catch (error) {
        return false
    }
}

//função para atualizar um dado
const updateDesafioCategoria = async function(desafioCategoria){

    try {

        let sql =   `update tbl_desafio_categoria set 
                        id_desafio      = ${desafioCategoria.id_desafio},
                        id_categoria    = ${desafioCategoria.id_categoria}

                    where id = ${desafioCategoria.id};`

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
const selectAllDesafioCategoria = async function(){

    try {

        let sql = "select * from tbl_desafio_categoria order by id desc;" 

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
const selectByIdDesafioCategoria = async function(id){

    try {
        
        let sql = `select * from tbl_desafio_categoria where id = ${id}`

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
const deleteDesafioCategoria = async function(id){

    try {

        //criando variável sql
        let sql = `delete from tbl_desafio_categoria where id = ${id};`

        console.log(sql)

        //enviando para o banco
        let result = await knexConex.raw(sql)

        //tratando retorno
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

//função para excluir os dados filtrando pelo id da tabela principal, essa função será utilizada no update da tabela principal, pois precisa apagar pra depois inserir os novos dados relacionados
const deleteCategoriaByIdDesafio = async function(idDesafio){

    try {

        let sql = `delete from tbl_desafio_categoria where id_desafio = ${idDesafio};` //apagando pela chave estrangeira da tabela principal, para apagar todos os dados relacionados a ela

        console.log(sql)

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
    insertDesafioCategoria,
    updateDesafioCategoria,
    selectAllDesafioCategoria,
    selectByIdDesafioCategoria,
    deleteDesafioCategoria,
    deleteCategoriaByIdDesafio
}