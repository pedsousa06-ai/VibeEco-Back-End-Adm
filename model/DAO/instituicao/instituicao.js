/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de instituição
 * Data: 09/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.10.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/* INICIANDO CRUD DA TABELA DE INSTITUICAO */

//inserir dado
const insertInstituicao = async function(instituicao){

    try {

        //criando variável sql
        let sql = 
            `
                insert into tbl_instituicao (
                    nome,
                    descricao
                )
                values(
                    "${instituicao.nome}",
                    "${instituicao.descricao}"
                );
            `

        //executando no banco de dados
        let result = await knexConex.raw(sql) //usa a coneção com banco para executar a variável sql

        //validadndo retorno do banco
        if(result){
            return result[0].insertId //pega o id do item adicionado para retornar, ao invés de retornar só o "true"
        }else{
            return false
        }
        
    } catch (error) {
        console.log(error)
        return false
    }

}

//atualizar dado
const updateInstituicao = async function(instituicao){

    try {

        //criando variável sql
        let sql = 
        `
            update tbl_instituicao set 
                nome 			= "${instituicao.nome}",
                descricao 		= "${instituicao.descricao}"
            where id = ${instituicao.id};
        `

        let result = await knexConex.raw(sql)

        //validando retorno
        if(result){
            return true
        }else{
            return false
        }
        
    } catch (error) {
        return false
    }

}

//retornar todos os dados
const selectAllInstituicao = async function(){

    try {
        
        //criando variável sql
        let sql = `select * from tbl_instituicao order by id desc;`

        //enviando para o banco de dados
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
const selectByIdInstituicao = async function(id){

    try {
        
        let sql = `select * from tbl_instituicao where id = ${id}`

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

//deletar dado pelo id
const deleteInstituicao = async function(id){

    try {
        
        let sql = `delete from tbl_instituicao where id = ${id}`

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

/* EXPORTANDO FUNÇÕES */
module.exports = {
    insertInstituicao,
    updateInstituicao,
    selectAllInstituicao,
    selectByIdInstituicao,
    deleteInstituicao
}