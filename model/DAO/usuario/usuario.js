/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de usuario
 * Data: 19/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.10.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/* INICIANDO CRUD DA TABELA DE USUARIO */

//inserir dado
const insertUsuario = async function(usuario){

    try {

        //criando variável sql
        let sql = 
            `
                insert into tbl_usuario (
                    nome,
                    email,
                    senha,
                    foto,
                    total_xp,
                    coins,
                    data_ultimo_acesso,
                    id_escolaridade,
                    id_status,
                    id_instituicao,
                    id_nivel_acesso,
                    id_level

                )
                values(
                    "${usuario.nome}",
                    "${usuario.email}",
                    "${usuario.senha}",
                    "${usuario.foto}",
                    ${usuario.total_xp},
                    ${usuario.coins},
                    "${usuario.data_ultimo_acesso}",
                    ${usuario.id_escolaridade},
                    ${usuario.id_status},
                    ${usuario.id_instituicao},
                    ${usuario.id_nivel_acesso},
                    ${usuario.id_level}
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
const updateUsuario = async function(usuario){

    try {

        //criando variável sql
        let sql = 
        `
            update tbl_usuario set 
                nome 			    = "${usuario.nome}",
                email 			    = "${usuario.email}",
                senha 			    = "${usuario.senha}",
                foto 			    = "${usuario.foto}",
                total_xp 		    = ${usuario.total_xp},
                coins 			    = ${usuario.coins},
                data_ultimo_acesso  = "${usuario.data_ultimo_acesso}",
                id_escolaridade     = ${usuario.id_escolaridade},
                id_status           = ${usuario.id_status},
                id_instituicao      = ${usuario.id_instituicao},
                id_nivel_acesso     = ${usuario.id_nivel_acesso},
                id_level            = ${usuario.id_level}
            where id = ${usuario.id};
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
const selectAllUsuario = async function(){

    try {
        
        //criando variável sql
        let sql = `select * from tbl_usuario order by id desc;`

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
const selectByIdUsuario = async function(id){

    try {
        
        let sql = `select * from tbl_usuario where id = ${id}`

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
const deleteUsuario = async function(id){

    try {
        
        let sql = `delete from tbl_usuario where id = ${id}`

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
    insertUsuario,
    updateUsuario,
    selectAllUsuario,
    selectByIdUsuario,
    deleteUsuario
}