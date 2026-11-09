/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de usuario_conquista
 * Data: 09/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.10.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/*INICIANDO CRUD DA TABELA INTERMEDIÁRIA*/

//função para inserir dados
const insertUsuarioConquista = async function(usuarioConquista){

    try {
        
        let sql = 
            `insert into tbl_usuario_conquista (
                id_usuario,
                id_conquista,
                data_conquista
            )
            values (
                ${usuarioConquista.id_usuario},
                ${usuarioConquista.id_conquista},
                '${usuarioConquista.data_conquista}'
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
const updateUsuarioConquista = async function(usuarioConquista){

    try {

        let sql =   `update tbl_usuario_conquista set 
                        id_usuario      = ${usuarioConquista.id_usuario}
                        id_conquista    = ${usuarioConquista.id_conquista},
                        data_conquista  = '${usuarioConquista.data_conquista}'
                    where id = ${usuarioConquista.id};`

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
const selectAllUsuarioConquista = async function(){

    try {

        let sql = "select * from tbl_usuario_conquista order by id desc;" 

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
const selectByIdUsuarioConquista = async function(id){

    try {
        
        let sql = `select * from tbl_usuario_conquista where id = ${id}`

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
const deleteUsuarioConquista = async function(id){

    try {

        //criando variável sql
        let sql = `delete from tbl_usuario_conquista where id = ${id};`

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

//função para retornar os dados da tabela principal pelo id da tabela secundaria
const selectUsuarioByIdConquista = async function(idConquista){

    try {
        
        //criando variável sql
        let sql = `select   tbl_usuario.*
                        from tbl_usuario
                            inner join tbl_usuario_conquista
                                on tbl_usuario.id = tbl_usuario_conquista.id_usuario
                            inner join tbl_conquista
                                on tbl_conquista.id = tbl_usuario_conquista.id_conquista
                    where tbl_conquista.id = ${idConquista};`

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
const selectConquistaByIdUsuario = async function(idUsuario){

    try {
        
        //criando variável sql
        let sql = `select   tbl_conquista.*
                        from tbl_usuario
                            inner join tbl_usuario_conquista
                                on tbl_usuario.id = tbl_usuario_conquista.id_usuario
                            inner join tbl_conquista
                                on tbl_conquista.id = tbl_usuario_conquista.id_conquista
                    where tbl_usuario.id = ${idUsuario};`

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
const deleteConquistaByIdUsuario = async function(idUsuario){

    try {

        let sql = `delete from tbl_usuario_conquista where id_usuario = ${idUsuario};` //apagando pela chave estrangeira da tabela principal, para apagar todos os dados relacionados a ela

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
    insertUsuarioConquista,
    updateUsuarioConquista,
    selectAllUsuarioConquista,
    selectByIdUsuarioConquista,
    deleteUsuarioConquista,
    selectUsuarioByIdConquista,
    selectConquistaByIdUsuario,
    deleteConquistaByIdUsuario
}