/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de post_anexo
 * Data: 16/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.11.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/*INICIANDO CRUD DA TABELA DE POST_ANEXO*/

//função para inserir dados
const insertPostAnexo = async function(postAnexo){

    try {
        
        let sql = 
            `insert into tbl_post_anexo (
                id_post,
                id_anexo
            )
            values (
                ${postAnexo.id_post},
                ${postAnexo.id_anexo}
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
const updatePostAnexo = async function(postAnexo){

    try {

        let sql =   `update tbl_post_anexo set 
                        id_post      = ${postAnexo.id_post},
                        id_anexo      = ${postAnexo.id_anexo}
                    where id = ${postAnexo.id};`

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
const selectAllPostAnexo = async function(){

    try {

        let sql = "select * from tbl_post_anexo order by id desc;" 

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
const selectByIdPostAnexo = async function(id){

    try {
        
        let sql = `select * from tbl_post_anexo where id = ${id}`

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
const deletePostAnexo = async function(id){

    try {

        //criando variável sql
        let sql = `delete from tbl_post_anexo where id = ${id};`

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
const selectPostByIdAnexo = async function(idAnexo){

    try {
        
        //criando variável sql
        let sql = `select   tbl_post.*
                        from tbl_post
                            inner join tbl_post_anexo
                                on tbl_post.id = tbl_post_anexo.id_post
                            inner join tbl_anexo
                                on tbl_anexo.id = tbl_post_anexo.id_anexo
                    where tbl_anexo.id = ${idAnexo};`

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
const selectAnexiByIdPost = async function(idPost){

    try {
        
        //criando variável sql
        let sql = `select   tbl_anexo.*
                        from tbl_post
                            inner join tbl_post_anexo
                                on tbl_post.id = tbl_post_anexo.id_post
                            inner join tbl_anexo
                                on tbl_anexo.id = tbl_post_anexo.id_anexo
                    where tbl_post.id = ${idPost};`

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
const deletePostAnexoByIdPost = async function(idPost){

    try {

        let sql = `delete from tbl_post_anexo where id_post = ${idPost};` //apagando pela chave estrangeira da tabela principal, para apagar todos os dados relacionados a ela

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
    insertPostAnexo,
    updatePostAnexo,
    selectAllPostAnexo,
    selectByIdPostAnexo,
    deletePostAnexo,
    selectPostByIdAnexo,
    selectAnexiByIdPost,
    deletePostAnexoByIdPost
}