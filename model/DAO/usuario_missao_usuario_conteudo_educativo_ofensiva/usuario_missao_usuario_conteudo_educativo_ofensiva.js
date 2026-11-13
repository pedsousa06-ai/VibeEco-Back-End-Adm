/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de usuario_missao_usuario_conteudo_educativo_ofensiva
 * Data: 13/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.11.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/*INICIANDO CRUD DA TABELA DE USUARIO_MISSAO (TABELA INTERMEDIÁRIA)*/

//função para inserir dados
const insertUsuarioMissaoUsuarioConteudoEducativoOfensiva = async function(usuarioMissaoUsuarioConteudoEducativoOfensiva){

    try {
        
        let sql = 
            `insert into tbl_usuario_missao_usuario_conteudo_educativo_ofensiva (
                id_usuario_missao,
                id_usuario_conteudo_educativo,
                id_ofensiva
            )
            values (
                ${usuarioMissaoUsuarioConteudoEducativoOfensiva.id_usuario_missao},
                ${usuarioMissaoUsuarioConteudoEducativoOfensiva.id_usuario_conteudo_educativo},
                ${usuarioMissaoUsuarioConteudoEducativoOfensiva.id_ofensiva}
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
const updateUsuarioMissaoUsuarioConteudoEducativoOfensiva = async function(usuarioMissaoUsuarioConteudoEducativoOfensiva){

    try {

        let sql =   `update tbl_usuario_missao_usuario_conteudo_educativo_ofensiva set 
                        id_usuario_missao = ${usuarioMissaoUsuarioConteudoEducativoOfensiva.id_usuario_missao},
                        id_usuario_conteudo_educativo = ${usuarioMissaoUsuarioConteudoEducativoOfensiva.id_usuario_conteudo_educativo},
                        id_ofensiva = ${usuarioMissaoUsuarioConteudoEducativoOfensiva.id_ofensiva}
                    where id = ${usuarioMissaoUsuarioConteudoEducativoOfensiva.id};`

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
const selectAllUsuarioMissaoUsuarioConteudoEducativoOfensiva = async function(){

    try {

        let sql = "select * from tbl_usuario_missao_usuario_conteudo_educativo_ofensiva order by id desc;" 

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
const selectByIdUsuarioMissaoUsuarioConteudoEducativoOfensiva = async function(id){

    try {
        
        let sql = `select * from tbl_usuario_missao_usuario_conteudo_educativo_ofensiva where id = ${id}`

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
const deleteUsuarioMissaoUsuarioConteudoEducativoOfensiva = async function(id){

    try {

        //criando variável sql
        let sql = `delete from tbl_usuario_missao_usuario_conteudo_educativo_ofensiva where id = ${id};`

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
const deleteUsuarioMissaoUsuarioConteudoEducativoOfensivaByIdUsuarioMissao = async function(idUsuarioMissao){

    try {

        let sql = `delete from tbl_usuario_missao_usuario_conteudo_educativo_ofensiva where id_usuario_missao = ${idUsuarioMissao};` //apagando pela chave estrangeira da tabela principal, para apagar todos os dados relacionados a ela

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

//função para excluir os dados filtrando pelo id da tabela principal, essa função será utilizada no update da tabela principal, pois precisa apagar pra depois inserir os novos dados relacionados
const deleteUsuarioMissaoUsuarioConteudoEducativoOfensivaByIdUsuarioConteudoEducativo = async function(idUsuarioConteudoEducativo){

    try {

        let sql = `delete from tbl_usuario_missao_usuario_conteudo_educativo_ofensiva where id_usuario_conteudo_educativo = ${idUsuarioConteudoEducativo};` //apagando pela chave estrangeira da tabela principal, para apagar todos os dados relacionados a ela

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

//função para excluir os dados filtrando pelo id da tabela principal, essa função será utilizada no update da tabela principal, pois precisa apagar pra depois inserir os novos dados relacionados
const deleteUsuarioMissaoUsuarioConteudoEducativoOfensivaByIdOfensiva = async function(idOfensiva){

    try {

        let sql = `delete from tbl_usuario_missao_usuario_conteudo_educativo_ofensiva where id_ofensiva = ${idOfensiva};` //apagando pela chave estrangeira da tabela principal, para apagar todos os dados relacionados a ela

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
    insertUsuarioMissaoUsuarioConteudoEducativoOfensiva,
    updateUsuarioMissaoUsuarioConteudoEducativoOfensiva,
    selectAllUsuarioMissaoUsuarioConteudoEducativoOfensiva,
    selectByIdUsuarioMissaoUsuarioConteudoEducativoOfensiva,
    deleteUsuarioMissaoUsuarioConteudoEducativoOfensiva,
    deleteUsuarioMissaoUsuarioConteudoEducativoOfensivaByIdUsuarioMissao,
    deleteUsuarioMissaoUsuarioConteudoEducativoOfensivaByIdUsuarioConteudoEducativo,
    deleteUsuarioMissaoUsuarioConteudoEducativoOfensivaByIdOfensiva
}